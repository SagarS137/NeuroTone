"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Play, UploadCloud, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
// import { useToast } from "@/hooks/use-toast"; // If you have toast, otherwise alert()

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // State for the "Start Training" Modal
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("unsloth/llama-3-8b-bnb-4bit");

  // 1. Fetch Datasets from S3
  const fetchDatasets = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/datasets");
      const data = await res.json();
      setDatasets(data);
    } catch (e) {
      console.error("Failed to load datasets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDatasets(); }, []);

  // 2. Upload Logic
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    try {
      await fetch("http://127.0.0.1:8000/upload-dataset/", {
        method: "POST",
        body: formData,
      });
      await fetchDatasets(); // Refresh list
    } catch (error) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // 3. Delete Logic
  const handleDelete = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete ${filename}?`)) return;
    await fetch(`http://127.0.0.1:8000/datasets/${filename}`, { method: "DELETE" });
    fetchDatasets();
  };

  // 4. Start Training Logic
  const handleStartTraining = async () => {
    if (!selectedDataset) return;
    
    const fullKey = `datasets/${selectedDataset}`; 
    
    try {
        const res = await fetch(`http://127.0.0.1:8000/start-training/?dataset_key=${fullKey}&base_model=${selectedModel}`, {
            method: "POST"
        });
        
        if (res.ok) {
            // SUCCESS!
            // window.alert("Training Started! Redirecting..."); // Optional
            window.location.href = "/jobs"; // Send user to jobs page
        } else {
            // FAILURE
            const errorData = await res.json();
            window.alert(`Failed to start: ${errorData.detail}`);
        }
    } catch (error) {
        console.error(error);
        window.alert("Network error. Check console.");
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Datasets</h1>
        
        {/* HIDDEN FILE INPUT TRIGGERED BY BUTTON */}
        <div className="relative">
            <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                onChange={handleUpload} 
                disabled={uploading}
            />
            <Button disabled={uploading}>
                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <UploadCloud className="mr-2 h-4 w-4" />}
                Upload New Dataset
            </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Uploaded At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {datasets.map((d) => (
              <TableRow key={d.name}>
                <TableCell className="font-medium">{d.name}</TableCell>
                <TableCell>{d.size}</TableCell>
                <TableCell>{d.last_modified}</TableCell>
                <TableCell className="text-right space-x-2">
                  
                  {/* PLAY BUTTON (Start Training) */}
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => setSelectedDataset(d.name)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>

                  {/* DELETE BUTTON */}
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(d.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* THE "QUICK START" DIALOG */}
      <Dialog open={!!selectedDataset} onOpenChange={() => setSelectedDataset(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Fine-Tuning</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-sm text-muted-foreground">
                Dataset: <span className="font-mono text-black font-semibold">{selectedDataset}</span>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Select Base Model</label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="unsloth/llama-3-8b-bnb-4bit">Llama-3 8B (4-bit)</SelectItem>
                        <SelectItem value="unsloth/mistral-7b-v0.3-bnb-4bit">Mistral 7B (4-bit)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedDataset(null)}>Cancel</Button>
            <Button onClick={handleStartTraining}>🚀 Launch Job</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}