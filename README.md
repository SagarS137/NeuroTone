# Neurotune: The Model Surgeon 🧠

**Neurotune** is a full-stack application designed to streamline the fine-tuning and evaluation of AI models. It features a modern **Next.js frontend** for managing experiments and a **Python backend** for handling training logic and dataset processing. It provides a visual interface for managing datasets, selecting base models (Llama 3, Mistral, Gemma, GPT-2), and monitoring training jobs with full reproducibility.

## 🚧 Status: Active Development
*Current Version: v0.1.0 (Frontend Architecture)*

## ✨ Key Features (Implemented)
- **Model Registry:** Catalog of base models (Llama 3, Mistral 7B, GPT-2) with capability tagging.
- **Job Dashboard:** Real-time tracking of training metrics (Validation Loss, Perplexity).
- **Reproducibility Engine:** Strict tracking of dataset hashes (SHA256) and training configs.
- **Dataset Manager:** Inventory system for JSON/JSONL training data.

## 🛠️ Tech Stack
- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **UI System:** Tailwind CSS, Shadcn/UI, Lucide React
- **Runtime:** Node.js v24 (LTS)

## 🚀 Getting Started
1. Clone the repository.
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
