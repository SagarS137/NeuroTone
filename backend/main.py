import shutil
import os
import uuid
from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException
from .trainer import run_training 

app = FastAPI(title="NeuroTune API - MVP")

# 1. Setup Directories
# We create these folders on startup so we don't get "File Not Found" errors later.
os.makedirs("datasets", exist_ok=True)
os.makedirs("outputs", exist_ok=True)

@app.get("/")
def health_check():
    """Simple ping to see if server is alive."""
    return {"status": "active", "version": "mvp-v1"}

# 2. File Upload Endpoint
@app.post("/upload-dataset/")
async def upload_dataset(file: UploadFile = File(...)):
    """
    Accepts a file, saves it to disk, and returns the filepath.
    """
    # Generate a safe filename to avoid conflicts (e.g. data_v1.json)
    file_location = f"datasets/{file.filename}"
    
    # Write the file chunk-by-chunk (Memory Safe)
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {
        "message": "Dataset uploaded successfully", 
        "path": file_location,
        "filename": file.filename
    }

# 3. Training Trigger Endpoint
@app.post("/start-training/")
async def start_training(
    dataset_name: str,
    background_tasks: BackgroundTasks, # <--- The Magic
    base_model: str = "unsloth/llama-3-8b-bnb-4bit"
):
    """
    Starts the training job in the background and returns IMMEDIATELY.
    """
    # Validation: Does the file exist?
    dataset_path = f"datasets/{dataset_name}"
    if not os.path.exists(dataset_path):
        raise HTTPException(status_code=404, detail="Dataset not found. Upload it first!")

    # Generate a unique Job ID (so we can track it later)
    job_id = str(uuid.uuid4())[:8] # e.g., "a1b2c3d4"

    # CRITICAL: add_task allows the API to return a response to the user
    # WHILE the heavy 'run_training' function continues running in the background.
    background_tasks.add_task(run_training, dataset_path, base_model, job_id)

    return {
        "status": "Job Queued", 
        "job_id": job_id, 
        "dataset": dataset_name
    }