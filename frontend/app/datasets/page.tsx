import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
  } from "@/components/ui/table"
  import { Button } from "@/components/ui/button"
  import { Upload, FileText, Lock } from "lucide-react"
  import { Dataset } from "@/lib/types"
  
  const datasets: Dataset[] = [
    {
      id: "ds-1",
      name: "support-tickets-2024.jsonl",
      size: "24 MB",
      records: 1500,
      hash: "sha256:8f43...",
      uploadedAt: "2 days ago"
    },
    {
        id: "ds-2",
        name: "medical-qa-pairs.jsonl",
        size: "156 MB",
        records: 8500,
        hash: "sha256:b2c1...",
        uploadedAt: "5 days ago"
      }
  ]
  
  export default function DatasetsPage() {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Datasets</h1>
          <Button>
            <Upload className="mr-2 h-4 w-4" /> Upload Dataset
          </Button>
        </div>
  
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Integrity Hash</TableHead>
                <TableHead className="text-right">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {datasets.map((ds) => (
                <TableRow key={ds.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    {ds.name}
                  </TableCell>
                  <TableCell>{ds.size}</TableCell>
                  <TableCell>{ds.records.toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        {ds.hash}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{ds.uploadedAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }