"use client"

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileJson, Terminal } from "lucide-react"
import { TrainingJob } from "@/lib/types"

const jobs: TrainingJob[] = [
  {
    id: "job-123",
    name: "llama3-customer-support-v1",
    status: "completed",
    createdAt: "2024-03-20 14:30",
    duration: "45m",
    config: {
      baseModel: "llama3-8b",
      datasetId: "ds-1",
      datasetHash: "a1b2c3d4",
      gitCommitHash: "fe31a01",
      hyperparameters: { batchSize: 4, learningRate: 2e-4, epochs: 3, loraRank: 16, loraAlpha: 32 }
    },
    metrics: {
      trainingLoss: 0.24,
      validationLoss: 0.31,
      perplexity: 5.2
    }
  },
  {
    id: "job-124",
    name: "mistral-medical-finetune",
    status: "running",
    createdAt: "2024-03-21 09:15",
    duration: "12m",
    config: {
      baseModel: "mistral-7b",
      datasetId: "ds-2",
      datasetHash: "e5f6g7h8",
      gitCommitHash: "fe31a01",
      hyperparameters: { batchSize: 8, learningRate: 1e-4, epochs: 5, loraRank: 8, loraAlpha: 16 }
    }
  }
]

export default function JobsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Training Jobs</h1>
        <Button variant="outline">
            <Terminal className="mr-2 h-4 w-4" /> View Logs
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Base Model</TableHead>
              <TableHead>Val Loss</TableHead>
              <TableHead>Perplexity</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{job.name}</TableCell>
                <TableCell>
                  <Badge 
                    variant={job.status === "completed" ? "default" : "secondary"}
                    className={job.status === "running" ? "animate-pulse" : ""}
                  >
                    {job.status}
                  </Badge>
                </TableCell>
                <TableCell>{job.config.baseModel}</TableCell>
                <TableCell>
                  {job.metrics?.validationLoss ?? "-"}
                </TableCell>
                <TableCell>
                    {job.metrics?.perplexity ?? "-"}
                </TableCell>
                <TableCell>{job.duration}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <FileJson className="mr-2 h-4 w-4" />
                    Config
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}