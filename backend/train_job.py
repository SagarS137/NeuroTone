import os
import sys
import boto3
import json
import time
import traceback

# ---------------------------------------------------------
# HELPER: Report Status to S3
# ---------------------------------------------------------
def update_status(s3_client, bucket, job_id, status, progress, logs):
    """
    Writes a status file to S3 so the frontend can read it.
    Path: s3://{bucket}/outputs/{job_id}/status.json
    """
    status_data = {
        "job_id": job_id,
        "status": status,      # "running", "completed", "failed"
        "progress": progress,  # 0 to 100
        "logs": logs,
        "timestamp": time.time()
    }
    
    # Save locally first
    with open("status.json", "w") as f:
        f.write(json.dumps(status_data))
    
    # Upload to S3 (This overwrites the previous status file)
    try:
        s3_client.upload_file("status.json", bucket, f"outputs/{job_id}/status.json")
    except Exception as e:
        print(f"Failed to update status in S3: {e}")

# ---------------------------------------------------------
# MAIN TRAINING JOB
# ---------------------------------------------------------
def train():
    # 1. Parse Arguments
    s3_bucket = os.environ.get("S3_BUCKET")
    dataset_key = os.environ.get("DATASET_KEY")
    job_id = os.environ.get("JOB_ID")
    
    s3 = boto3.client('s3', region_name='ap-south-1')
    
    try:
        # REPORT: Starting
        print(f"Starting Job {job_id}")
        update_status(s3, s3_bucket, job_id, "starting", 0, "Instance initialized. Installing dependencies...")
        
        # 2. Download Dataset
        print(f"Downloading {dataset_key}")
        update_status(s3, s3_bucket, job_id, "running", 10, f"Downloading dataset: {dataset_key}")
        
        local_data_path = "dataset.file" # We'll rename it properly if needed
        s3.download_file(s3_bucket, dataset_key, local_data_path)
        
        # 3. Training Loop (Simulated for now)
        print("Starting Training Loop...")
        update_status(s3, s3_bucket, job_id, "running", 20, "Dataset loaded. Starting fine-tuning...")
        
        total_epochs = 10
        for i in range(total_epochs):
            time.sleep(2) # Simulate work (2 seconds per epoch)
            progress = 20 + int((i+1) / total_epochs * 70) # Calculate progress from 20% to 90%
            
            log_msg = f"Training Epoch {i+1}/{total_epochs} - Loss: {0.9 - (i*0.05):.4f}"
            print(log_msg)
            # REPORT: Progress Update
            update_status(s3, s3_bucket, job_id, "running", progress, log_msg)
            
        # 4. Success!
        print("Training Complete.")
        update_status(s3, s3_bucket, job_id, "completed", 100, "Training finished successfully!")
        
    except Exception as e:
        # CRITICAL: If it crashes, report the error to S3!
        error_msg = str(e)
        full_traceback = traceback.format_exc()
        print(f"CRASH: {full_traceback}")
        
        # REPORT: Failure
        update_status(s3, s3_bucket, job_id, "failed", 0, f"Error: {error_msg}")
        sys.exit(1) # Make sure the script exits with error

if __name__ == "__main__":
    train()