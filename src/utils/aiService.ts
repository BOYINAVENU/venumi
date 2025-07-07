// src/utils/aiService.ts
export interface AIResponse {
  content: string;
  tokenSymbol?: string;
  aiConfidence: number;
}

/** Google‑Gemini REST endpoint helper */
const GEMINI_ENDPOINT = (
    model = "gemini-1.5-pro-latest"
) =>
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

/** 👉 the only real‑API call we keep */
export const callGemini = async (
    prompt: string,
    apiKey: string,
    model = "gemini-1.5-pro-latest"
): Promise<AIResponse> => {
  if (!apiKey) throw new Error("Gemini API key is required");

  const res = await fetch(`${GEMINI_ENDPOINT(model)}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    }),
  });

  const json = await res.json();
  const raw = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  return {
    content: raw.trim(),
    aiConfidence: 85,
  };
};

/** fallback if the user hasn’t provided a key */
export const generateMockResponse = (prompt: string): AIResponse => ({
  content: `🛈 Mock answer for “${prompt}” (no Gemini key found).`,
  aiConfidence: 50,
});
