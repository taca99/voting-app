const BASE = import.meta.env.VITE_AI_BASE || "http://localhost:8081";

export type SuggestResponse = {
  title: string;
  options: [string, string, string] | string[];
  rules: string;
};

export async function suggestBallot(topic: string, language: "sr" | "en" = "sr"): Promise<SuggestResponse> {
  const r = await fetch(`${BASE}/ai/suggest-ballot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, language }),
  });
  if (!r.ok) throw new Error(`AI suggest failed: ${r.status}`);
  return (await r.json()) as SuggestResponse;
}

export type SummaryResponse = { summary: string; key_takeaways: string[] };

export async function summarize(options: string[], counts: number[], turnout?: number): Promise<SummaryResponse> {
  const r = await fetch(`${BASE}/ai/summary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ options, counts, turnout }),
  });
  if (!r.ok) throw new Error(`AI summary failed: ${r.status}`);
  return (await r.json()) as SummaryResponse;
}

export async function rephrase(
  text: string,
  language: "sr" | "en" = "sr",
  style: "neutral" | "formal" | "concise" = "neutral",
  length: "short" | "medium" = "short"
): Promise<string> {
  const r = await fetch(`${BASE}/ai/rephrase`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language, style, length }),
  });
  if (!r.ok) throw new Error(`AI rephrase failed: ${r.status}`);
  const data = await r.json();
  return (data?.text as string) || text;
}

