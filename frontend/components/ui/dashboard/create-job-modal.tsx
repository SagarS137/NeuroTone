import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function CreateJobModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg">Start New Job</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Fine-tuning Job</DialogTitle>
          <DialogDescription>
            Configure your base model and training data.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          
          {/* Job Name */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" defaultValue="my-custom-model-v1" className="col-span-3" />
          </div>

          {/* Model Selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="model" className="text-right">
              Model
            </Label>
            <div className="col-span-3">
                <Select>
                <SelectTrigger>
                    <SelectValue placeholder="Select base model" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="llama3-8b">Llama 3 (8B)</SelectItem>
                    <SelectItem value="mistral-7b">Mistral (7B)</SelectItem>
                    <SelectItem value="gpt2">GPT-2 (Small)</SelectItem>
                    <SelectItem value="Gemma-7b">Gemma (7B)</SelectItem>
                </SelectContent>
                </Select>
            </div>
          </div>

          {/* Dataset Upload */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dataset" className="text-right">
              Dataset
            </Label>
            <Input id="dataset" type="file" className="col-span-3" />
          </div>
        </div>
        
        <DialogFooter>
          <Button type="submit">Start Training</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}