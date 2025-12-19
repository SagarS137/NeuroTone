"use client";

import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TrainingStatusProps {
  jobId: string;
}

export default function TrainingStatus({ jobId }: TrainingStatusProps) {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // The Polling Logic
  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/job/${jobId}`);
        const data = await res.json();
        setStatus(data);

        // Stop polling if complete or failed
        if (data.status === "completed" || data.status === "failed") {
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Polling error:", error);
      } finally {
        setLoading(false);
      }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [jobId]);

  if (loading && !status) return <div>Connecting to Neural Network...</div>;

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Training Job: {jobId}</CardTitle>
        <Badge variant={status?.status === "completed" ? "default" : "secondary"}>
          {status?.status?.toUpperCase() || "CONNECTING"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{status?.progress || 0}%</span>
          </div>
          <Progress value={status?.progress || 0} className="h-2" />
        </div>

        {/* Live Terminal Logs */}
        <div className="bg-black text-green-400 p-4 rounded-md font-mono text-xs h-32 overflow-y-auto border border-gray-800 shadow-inner">
          <p className="opacity-50 mb-2">// Live Training Logs via S3 Relay</p>
          <p>{status?.logs || "Waiting for instance logs..."}</p>
        </div>

      </CardContent>
    </Card>
  );
}