import os
import boto3
from .store import save_job

# ---------------------------------------------------------
# CONFIGURATION
# ---------------------------------------------------------
AMI_ID = "ami-00ca570c1b6d79f36" 

# ---------------------------------------------------------
# HELPER: Generate the Startup Script (Bash)
# ---------------------------------------------------------
def generate_user_data_script(bucket_name, dataset_key, job_id, model_name, aws_access_key, aws_secret_key):
    return f"""#!/bin/bash
    
    # 1. Update & Install Python
    yum update -y
    yum install -y python3-pip git
    
    # 2. Install Dependencies
    pip3 install boto3
    
    # 3. Set Environment Variables
    export S3_BUCKET="{bucket_name}"
    export DATASET_KEY="{dataset_key}"
    export JOB_ID="{job_id}"
    export MODEL_NAME="{model_name}"
    export AWS_DEFAULT_REGION=ap-south-1
    export AWS_ACCESS_KEY_ID={aws_access_key}
    export AWS_SECRET_ACCESS_KEY={aws_secret_key}
    
    # 4. Download the Worker Script
    aws s3 cp s3://{bucket_name}/scripts/train_job.py train_job.py
    
    # 5. Run the Training
    python3 train_job.py > training.log 2>&1
    
    # 6. Upload Logs
    aws s3 cp training.log s3://{bucket_name}/outputs/{job_id}/training.log
    
    # 7. Terminate Instance
    shutdown -h now
    """

# ---------------------------------------------------------
# MAIN FUNCTION: The "Launcher"
# ---------------------------------------------------------
def run_training(dataset_uri: str, model_name: str, job_id: str):
    # Initial Status Save
    job_data = {
        "job_id": job_id,
        "status": "provisioning", 
        "progress": 0, 
        "logs": "Contacting AWS...",
        "dataset": dataset_uri,
        "timestamp": 0 # You can add time.time() if you import time, but 0 is fine for now
    }
    save_job(job_id, job_data)
    
    # Setup S3
    s3 = boto3.client('s3', region_name='ap-south-1')
    bucket_name = os.getenv("S3_BUCKET_NAME")
    dataset_key = dataset_uri.replace(f"s3://{bucket_name}/", "")
    
    try:
        # Upload Worker Script
        s3.upload_file("backend/train_job.py", bucket_name, "scripts/train_job.py")
        
        job_data["logs"] = "Training script uploaded to S3."
        save_job(job_id, job_data)
        
        # Prepare Startup Script
        user_data = generate_user_data_script(
            bucket_name, dataset_key, job_id, model_name,
            os.getenv("AWS_ACCESS_KEY_ID"), os.getenv("AWS_SECRET_ACCESS_KEY")
        )
        
        # Launch Instance
        ec2 = boto3.resource('ec2', region_name='ap-south-1')
        print(f"[{job_id}] 🚀 Launching EC2 Instance ({AMI_ID})...")
        
        instances = ec2.create_instances(
            ImageId=AMI_ID,
            MinCount=1, MaxCount=1,
            InstanceType='t2.micro',
            InstanceInitiatedShutdownBehavior='terminate', # <--- SAVES MONEY
            UserData=user_data,
            TagSpecifications=[{'ResourceType': 'instance', 'Tags': [{'Key': 'Name', 'Value': f'NeuroTune-Worker-{job_id}'}]}]
        )
        
        instance_id = instances[0].id
        
        # Update Status to Running
        job_data["status"] = "running"
        job_data["logs"] = f"EC2 Instance {instance_id} launched! Logs will appear in S3."
        save_job(job_id, job_data)
        
        print(f"[{job_id}] ✅ Instance {instance_id} launched.")
        
    except Exception as e:
        job_data["status"] = "failed"
        job_data["logs"] = str(e)
        save_job(job_id, job_data)
        print(f"[{job_id}] ❌ FAILED: {str(e)}")