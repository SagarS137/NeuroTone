import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Box, Zap, Info } from "lucide-react"

// Data structure for models to keep JSX clean
const availableModels = [
    {
        id: "llama3-8b",
        title: "Llama 3 (8B)",
        company: "Meta AI",
        description: "The latest open-source powerhouse. Excellent performance on complex reasoning, code generation, and general knowledge tasks.",
        type: "base",
        tags: ["Text Generation", "GGUF"],
        params: "8B Parameters • 4-bit Quantized"
    },
    {
        id: "mistral-7b-v0.3",
        title: "Mistral 7B (v0.3)",
        company: "Mistral AI",
        description: "A high-performance, highly efficient model. offers a great balance of speed and accuracy for summarization and classification jobs.",
        type: "base",
        tags: ["Summarization", "Fast"],
        params: "7.3B Parameters • FP16"
    },
    {
        id: "gemma-7b-it",
        title: "Gemma 7B Instruct",
        company: "Google",
        description: "Lightweight open model built from Gemini research. Optimized for efficiency and safer, responsible AI deployments on smaller hardware.",
        type: "base",
        tags: ["Instruction Tuned", "Efficient"],
        params: "7B Parameters • INT8"
    },
    {
        id: "gpt2-small",
        title: "GPT-2 Small",
        company: "OpenAI",
        description: "The classic lightweight model. Ideal for debugging pipelines, testing code flow, and running on very low-resource hardware.",
        type: "base",
        tags: ["Debugging", "CPU Friendly"],
        params: "124M Parameters • FP32"
    }
]


export default function ModelsPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Model Registry</h1>
                <p className="text-muted-foreground">Select a base model to start training, or view your existing fine-tuned models.</p>
            </div>

            {/* Guidance Message Block */}
            <Alert className="bg-muted/50 border-primary/20">
                <Info className="h-4 w-4 text-primary" />
                <AlertTitle>Which model should you choose?</AlertTitle>
                <AlertDescription className="mt-2 text-sm text-muted-foreground">
                    <ul className="list-disc list-inside space-y-1">
                        <li>For <strong>complex reasoning and general tasks</strong>, choose <strong>Llama 3</strong>.</li>
                        <li>For <strong>speed and efficiency</strong> on specialized tasks, choose <strong>Mistral</strong>.</li>
                        <li>For <strong>lightweight or resource-constrained</strong> environments, pick <strong>Gemma</strong>.</li>
                        <li>For <strong>debugging pipelines and CPU-only testing</strong>, use <strong>GPT-2</strong>.</li>
                    </ul>
                </AlertDescription>
            </Alert>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 mt-6">
                {availableModels.map((model) => {
                    const isFinetuned = model.type === "finetuned";
                    const Icon = isFinetuned ? Zap : Box;

                    return (
                        <Card key={model.id} className={isFinetuned ? "border-primary/20 bg-primary/5" : ""}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium truncate pr-2">{model.title}</CardTitle>
                                <Icon className={`h-4 w-4 ${isFinetuned ? "text-primary" : "text-muted-foreground"}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{isFinetuned ? "Fine-Tuned" : "Base Model"}</div>
                                <p className="text-xs font-semibold text-primary mt-1">{model.company}</p>
                                {/* line-clamp-2 ensures description stays within 2 lines */}
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2 h-[40px]">
                                    {model.description}
                                </p>
                                <p className="text-xs text-muted-foreground mt-4 pt-4 border-t">
                                    {model.params}
                                </p>
                                <div className="mt-4 flex gap-2 flex-wrap">
                                    {model.tags.map((tag, index) => (
                                        <Badge key={index} variant={index === 0 && isFinetuned ? "default" : "secondary"}>
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}