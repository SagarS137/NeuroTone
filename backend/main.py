import os
import uuid
import json
import boto3
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from botocore.exceptions import ClientError
from .trainer import run_training
from .store import job_store, get_all_jobs

load_dotenv()

app = FastAPI(title="NeuroTune API - Cloud Version")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow your Frontend
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (POST, GET, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Setup AWS Connection to create S3 client
s3_client = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION")
)

BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

# Setup Directories
# We create these folders on startup so we don't get "File Not Found" errors later.
# os.makedirs("datasets", exist_ok=True)
os.makedirs("outputs", exist_ok=True)

@app.get("/")
def health_check():
    """Simple ping to see if server is alive."""
    return {"status": "active", "mode": "cloud-connected"}

# File Upload Endpoint
@app.post("/upload-dataset/")
async def upload_dataset(file: UploadFile = File(...)):
    """
    Uploads a file directly to AWS S3 instead of local disk.
    """
    # Create a unique name so files don't overwrite each other
    # e.g., "datasets/a1b2-mydata.json"
    s3_key = f"datasets/{uuid.uuid4().hex[:4]}-{file.filename}"

    try:
        # The Upload Logic
        # upload_fileobj: Streams the file data directly to S3.
        # file.file: The actual file object coming from the frontend.
        # BUCKET_NAME: Where it goes.
        # s3_key: The filename it will have inside the bucket.
        s3_client.upload_fileobj(file.file, BUCKET_NAME, s3_key)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"S3 Upload Failed: {str(e)}")

    return {
        "message": "Uploaded to S3",
        "s3_path": f"s3://{BUCKET_NAME}/{s3_key}",
        "filename": file.filename
    }

@app.get("/datasets")
def list_datasets():
    """List all datasets stored in S3."""
    try:
        response = s3_client.list_objects_v2(Bucket=BUCKET_NAME, Prefix="datasets/")
        files = []
        if 'Contents' in response:
            for obj in response['Contents']:
                files.append({
                    "name": obj['Key'].replace("datasets/", ""),
                    "size": f"{obj['Size'] / 1024:.1f} KB",
                    "last_modified": obj['LastModified'].strftime("%Y-%m-%d %H:%M:%S")
                })
        return files
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/datasets/{filename}")
def delete_dataset(filename: str):
    """Delete a dataset from S3."""
    try:
        s3_client.delete_object(Bucket=BUCKET_NAME, Key=f"datasets/{filename}")
        return {"message": "Deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Training Trigger Endpoint
@app.post("/start-training/")
async def start_training(
    dataset_key: str,  # The S3 filename (e.g., "datasets/9211-Mock test series.txt")
    background_tasks: BackgroundTasks,
    base_model: str = "unsloth/llama-3-8b-bnb-4bit"
):
    """
    Checks S3 for the file, then triggers the background training job.
    """
    # Validation: Check if file exists in S3
    try:
        s3_client.head_object(Bucket=BUCKET_NAME, Key=dataset_key)
    except Exception:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_key}' not found in bucket '{BUCKET_NAME}'")

    # Generate Job ID
    job_id = str(uuid.uuid4())[:8]

    # Construct S3 URI
    dataset_s3_uri = f"s3://{BUCKET_NAME}/{dataset_key}"

    # Trigger Background Task
    background_tasks.add_task(run_training, dataset_s3_uri, base_model, job_id)

    return {
        "status": "Job Queued",
        "job_id": job_id,
        "dataset_s3_uri": dataset_s3_uri
    }


@app.get("/job/{job_id}")
def get_job_status(job_id: str):
    """
    Fetches the real-time status from S3 (written by the worker).
    """
    try:
        # Try to fetch the status.json file from S3
        response = s3_client.get_object(
            Bucket=BUCKET_NAME,
            Key=f"outputs/{job_id}/status.json"
        )
        status_data = json.loads(response['Body'].read().decode('utf-8'))
        return status_data
        
    except s3_client.exceptions.NoSuchKey:
        # This happens if the instance hasn't started writing yet
        # We check our local store as a fallback for the "Provisioning" phase
        local_status = job_store.get(job_id)
        if local_status:
            return local_status
        else:
            return {"status": "initializing", "progress": 0, "logs": "Waiting for instance to report..."}
            
    except Exception as e:
        print(f"Error fetching status: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/jobs")
def list_jobs():
    """Returns the history of all training jobs."""
    return get_all_jobs()