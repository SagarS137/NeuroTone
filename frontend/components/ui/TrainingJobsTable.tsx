"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { RefreshCcw } from "lucide-react"; // Icon for refresh
import TrainingStatus from "./TrainingStatus"; 

interface Job {
  job_id: string;
  status: string;
  dataset: string; // or model_name if you saved it
  timestamp: number;
}

export default function TrainingJobsTable() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch jobs
  const fetchJobs = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/jobs");
      const data = await res.json();
      setJobs(data);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Training History</h2>
        <Button variant="outline" size="sm" onClick={fetchJobs}>
          <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dataset / Details</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                  No training jobs found. Start one!
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow key={job.job_id}>
                  <TableCell className="font-mono text-xs">{job.job_id.slice(0, 8)}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        job.status === "completed" ? "default" : 
                        job.status === "failed" ? "destructive" : "secondary"
                      }
                    >
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="truncate max-w-[200px]">
                    {/* We need to make sure we save dataset name in store.py to see it here! */}
                    {job.dataset || "Unknown Dataset"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedJob(job.job_id)}
                    >
                      View Logs
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* THE SIDE SHEET FOR LOGS */}
      <Sheet open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <SheetContent className="min-w-[600px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Job Details</SheetTitle>
            <SheetDescription>
              Viewing live status for Job ID: {selectedJob}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-8">
            {selectedJob && <TrainingStatus jobId={selectedJob} />}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}