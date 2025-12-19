"use client"

import { useState, useEffect } from "react"
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCcw, Terminal } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import TrainingStatus from "@/components/ui/TrainingStatus"

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // 1. Fetch Real Data from Backend
  const fetchJobs = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/jobs")
      const data = await res.json()
      setJobs(data)
    } catch (error) {
      console.error("Failed to fetch jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  // Initial Fetch
  useEffect(() => {
    fetchJobs()
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Training Jobs</h1>
        <Button variant="outline" onClick={fetchJobs}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh List
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dataset Info</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                        No active jobs. Go to Dashboard to start one!
                    </TableCell>
                </TableRow>
            ) : (
                jobs.map((job) => (
                <TableRow key={job.job_id}>
                    <TableCell className="font-mono">{job.job_id.slice(0, 8)}</TableCell>
                    <TableCell>
                    <Badge 
                        variant={job.status === "completed" ? "default" : job.status === "failed" ? "destructive" : "secondary"}
                        className={job.status === "running" ? "animate-pulse" : ""}
                    >
                        {job.status}
                    </Badge>
                    </TableCell>
                    <TableCell className="truncate max-w-[300px] text-xs text-muted-foreground">
                        {job.dataset || "Unknown Dataset"}
                    </TableCell>
                    <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedJob(job.job_id)}>
                        <Terminal className="mr-2 h-4 w-4" />
                        View Logs
                    </Button>
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* The Slide-Out Drawer for Logs */}
      <Sheet open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <SheetContent className="min-w-[600px]">
            <SheetHeader>
                <SheetTitle>Live Training Logs</SheetTitle>
                <SheetDescription>Job ID: {selectedJob}</SheetDescription>
            </SheetHeader>
            <div className="mt-6">
                {selectedJob && <TrainingStatus jobId={selectedJob} />}
            </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}