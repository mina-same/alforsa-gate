import { getGeminiCompletion } from "@/services/gemini";

/**
 * Interface for AI autocomplete suggestions using Gemini.
 * The warmup function is kept for compatibility but is no longer needed for API-based completion.
 */

export function warmUpAiAutocomplete(): void {
  // No-op for Gemini API
}

export async function getAiCompletion(text: string): Promise<string> {
  // Toggle functionality via .env flag
  const isEnabled = import.meta.env.VITE_ENABLE_AI_AUTOCOMPLETE === "true";
  if (!isEnabled) return "";

  if (text.trim().length < 3) return "";

  return await getGeminiCompletion(text);
}
