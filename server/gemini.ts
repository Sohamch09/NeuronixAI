import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateAIResponse(message: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        role: "user",
        parts: [{ text: message }]
      }],
      config: {
        systemInstruction: `You are a helpful AI assistant in a chat application. Provide clear, concise, and helpful responses to user questions. Be friendly and conversational while being informative. Keep responses reasonably sized for a chat interface.`
      }
    });

    return response.text || "I'm sorry, I couldn't generate a response right now. Please try again.";
  } catch (error) {
    console.error("Gemini API error:", error);
    return "I'm experiencing some technical difficulties. Please try again in a moment.";
  }
}