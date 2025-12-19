# This is a simple in-memory database.
# In a real production app, we would use Redis or SQL here.
import json
import os

DB_FILE = "jobs_db.json"

def load_jobs():
    """Loads jobs from the local JSON file."""
    if not os.path.exists(DB_FILE):
        return {}
    try:
        with open(DB_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return {}

def save_job(job_id, data):
    """Saves or updates a single job."""
    jobs = load_jobs()
    jobs[job_id] = data
    with open(DB_FILE, "w") as f:
        json.dump(jobs, f, indent=4)

def get_all_jobs():
    """Returns a list of all jobs."""
    jobs = load_jobs()
    # Convert dict to list and sort by timestamp (newest first)
    job_list = [
        {"job_id": k, **v} for k, v in jobs.items()
    ]
    # Sort by timestamp (descending) if available, else by ID
    job_list.sort(key=lambda x: x.get("timestamp", 0), reverse=True)
    return job_list

# Initialize the in-memory cache
job_store = load_jobs()