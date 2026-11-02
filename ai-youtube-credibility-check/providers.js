// Shared by background, content script and options page.
// kind: "anthropic" | "gemini" | "openai" (OpenAI-compatible chat completions)
const PROVIDERS = {
  anthropic: { name: "Claude (Anthropic)", kind: "anthropic", model: "claude-haiku-5-5", keyUrl: "https://console.anthropic.com/settings/keys", hint: "sk-ant-..." },
  openai:    { name: "ChatGPT (OpenAI)",   kind: "openai", base: "https://api.openai.com/v1", model: "gpt-4.1-mini", keyUrl: "https://platform.openai.com/api-keys", hint: "sk-...", maxTokensParam: "max_completion_tokens", jsonMode: true },
  gemini:    { name: "Gemini (Google)",    kind: "gemini", model: "gemini-2.5-flash", keyUrl: "https://aistudio.google.com/apikey", hint: "AIza..." },
  grok:      { name: "Grok (xAI)",         kind: "openai", base: "https://api.x.ai/v1", model: "grok-4.3", keyUrl: "https://console.x.ai", hint: "xai-...", jsonMode: true },
  meta:      { name: "Muse Spark (Meta AI)", kind: "openai", base: "https://api.meta.ai/v1", model: "muse-spark-1.1", keyUrl: "https://dev.meta.ai", hint: "API key (US preview)" },
  mistral:   { name: "Mistral (Le Chat)",  kind: "openai", base: "https://api.mistral.ai/v1", model: "mistral-small-latest", keyUrl: "https://console.mistral.ai/api-keys", hint: "API key", jsonMode: true },
  custom:    { name: "Other (OpenAI-compatible: Groq, OpenRouter, Ollama...)", kind: "openai", model: "", keyUrl: "", hint: "API key (any value for Ollama)" },
};

// USD per 1M tokens: [input, output]. `hi` applies when the prompt is longer than `at` tokens.
// Claude, Grok, OpenAI, Gemini and Mistral figures read from the providers' pricing pages on 2 Nov 2026
// (Mistral lists "Mistral Small 4"; the -latest alias mapping is unconfirmed). Muse Spark is the launch price
// as reported by news sites. Prices change, so costs are shown as approximate. Users can override in Options.
const PRICES = {
  "claude-haiku-5-5":  { lo: [0.10, 0.50], hi: [0.50, 2.50], at: 100000 },
  "claude-sonnet-5-5": { lo: [2, 10] },
  "claude-opus-5-5":   { lo: [4, 20] },
  "claude-fable-5-1":  { lo: [10, 50] },
  "grok-4.3":          { lo: [1.25, 2.5], hi: [2.5, 5], at: 200000 },
  "grok-4.5":          { lo: [2, 6], hi: [4, 12], at: 200000 },
  "grok-4.6":          { lo: [2, 6], hi: [4, 12], at: 200000 },
  "grok-4.7":          { lo: [2, 6], hi: [4, 12], at: 200000 },
  "muse-spark-1.1":    { lo: [1.25, 4.25] },
  "gpt-4.1-mini":      { lo: [0.40, 1.60] },
  "gpt-4.1-nano":      { lo: [0.10, 0.40] },
  "gpt-4o-mini":       { lo: [0.15, 0.60] }, // deprecated by OpenAI
  "gemini-2.5-flash":  { lo: [0.30, 2.50] },
  "mistral-small-latest": { lo: [0.15, 0.60] },
};

function costOf(model, tokensIn, tokensOut, s) {
  let p;
  if (s && s.priceIn !== "" && s.priceOut !== "" && s.priceIn != null && s.priceOut != null) {
    p = [Number(s.priceIn), Number(s.priceOut)];
  } else {
    const e = PRICES[model];
    if (!e) return null;
    p = e.hi && tokensIn > e.at ? e.hi : e.lo;
  }
  if (p.some(Number.isNaN)) return null;
  return (tokensIn * p[0] + tokensOut * p[1]) / 1e6;
}

function fmtCost(c) {
  if (c == null) return "cost unknown (set prices in Options)";
  return c < 0.01 ? `≈ $${c.toFixed(4)}` : `≈ $${c.toFixed(3)}`;
}

async function loadSettings() {
  let s = await chrome.storage.local.get(["provider", "apiKey", "model", "baseUrl", "priceIn", "priceOut"]);
  if (!s.apiKey) {
    // migrate from v0.1 (Claude key saved in sync storage)
    const old = await chrome.storage.sync.get(["apiKey", "model"]);
    if (old.apiKey) s = { provider: "anthropic", apiKey: old.apiKey, model: old.model || "" };
  }
  return { provider: s.provider || "anthropic", apiKey: s.apiKey || "", model: s.model || "", baseUrl: s.baseUrl || "",
    priceIn: s.priceIn ?? "", priceOut: s.priceOut ?? "" };
}
