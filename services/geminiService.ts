import { GoogleGenAI } from "@google/genai";

// Fix: Use process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIResponse = async (history: { role: 'user' | 'model', text: string }[]) => {
  try {
    const model = 'gemini-3-flash-preview';
    const contents = history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    }));

    // Fix: Send the complete chat history context to generate appropriate responses
    const response = await ai.models.generateContent({
      model,
      contents: contents,
      config: {
        systemInstruction: "You are a helpful and friendly messaging assistant. Keep your responses concise and engaging, like a real person in a chat app.",
      }
    });

    return response.text || "I'm sorry, I couldn't process that.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Something went wrong with my circuits. Try again?";
  }
};