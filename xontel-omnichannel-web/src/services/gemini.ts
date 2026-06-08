import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// We explicitly use "v1" because some environments default to "v1beta" where this model might not be mapped correctly.
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export async function getGeminiCompletion(text: string): Promise<string> {
  if (!genAI) {
    console.warn("Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
    return "";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    
    const prompt = `You are a professional autocomplete assistant for an omnichannel chat platform (WhatsApp, Facebook, etc.). 
The user is a support agent typing a response to a customer.
Complete the current sentence in a natural, polite, and helpful way. 
- Keep the completion very short (max 1-5 words).
- Match the language of the input (English or Arabic).
- Only return the completion text, nothing else. 
- If you cannot provide a high-quality completion, return an empty string.

Current text from the agent: "${text}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const completion = response.text().trim();
    
    return completion;
  } catch (error) {
    console.error("Gemini Autocomplete Error:", error);
    return "";
  }
}
