// A curated shortlist of strong, popular Ollama models.
// `tag` is exactly what Ollama expects (and what `ollama pull <tag>` uses).
// Live models from your server (/api/models) are merged in on top of this.

export const CURATED_MODELS = [
  {
    tag: "llama3.2",
    name: "Llama 3.2",
    by: "Meta",
    size: "3B",
    blurb: "Fast, friendly all-rounder. Great default for chat.",
    tags: ["chat", "fast"],
  },
  {
    tag: "llama3.3",
    name: "Llama 3.3",
    by: "Meta",
    size: "70B",
    blurb: "Flagship reasoning + writing. Needs a beefy host.",
    tags: ["chat", "reasoning", "heavy"],
  },
  {
    tag: "qwen2.5",
    name: "Qwen 2.5",
    by: "Alibaba",
    size: "7B",
    blurb: "Excellent reasoning and multilingual range.",
    tags: ["chat", "reasoning", "multilingual"],
  },
  {
    tag: "qwen2.5-coder",
    name: "Qwen 2.5 Coder",
    by: "Alibaba",
    size: "7B",
    blurb: "Specialist for code, refactors and explanations.",
    tags: ["code"],
  },
  {
    tag: "deepseek-r1",
    name: "DeepSeek R1",
    by: "DeepSeek",
    size: "7B",
    blurb: "Step-by-step reasoning, shows its working.",
    tags: ["reasoning"],
  },
  {
    tag: "gemma2",
    name: "Gemma 2",
    by: "Google",
    size: "9B",
    blurb: "Crisp, well-behaved, strong at summaries.",
    tags: ["chat", "writing"],
  },
  {
    tag: "mistral",
    name: "Mistral",
    by: "Mistral AI",
    size: "7B",
    blurb: "Lean and quick with a sharp instruction sense.",
    tags: ["chat", "fast"],
  },
  {
    tag: "mistral-nemo",
    name: "Mistral Nemo",
    by: "Mistral AI",
    size: "12B",
    blurb: "Bigger context, great for longer documents.",
    tags: ["chat", "longcontext"],
  },
  {
    tag: "phi3.5",
    name: "Phi 3.5",
    by: "Microsoft",
    size: "3.8B",
    blurb: "Tiny but mighty — runs almost anywhere.",
    tags: ["fast", "tiny"],
  },
  {
    tag: "llava",
    name: "LLaVA",
    by: "Open source",
    size: "7B",
    blurb: "Multimodal model with broad general knowledge.",
    tags: ["vision"],
  },
];

export const DEFAULT_MODEL = "llama3.2";
