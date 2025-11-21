import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini AI
// Note: API Key is expected to be in process.env.API_KEY as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_TEXT = 'gemini-2.5-flash';

export const generateTags = async (noteContent: string): Promise<string[]> => {
  if (!noteContent || noteContent.trim().length < 10) return [];

  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: `Analyze the following note content and generate up to 5 relevant, concise tags (one word each, lowercase). Content: "${noteContent}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });
    
    const jsonStr = response.text;
    if (!jsonStr) return [];
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Tag Generation Error:", error);
    return [];
  }
};

export const summarizeNote = async (noteContent: string): Promise<string> => {
  if (!noteContent) return "";

  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: `Provide a concise summary (max 2 sentences) of the following note: "${noteContent}"`,
    });
    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Gemini Summary Error:", error);
    return "Error generating summary.";
  }
};

export const enhanceContent = async (content: string, instruction: string): Promise<string> => {
  try {
     const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: `Task: ${instruction}. Input Text: "${content}". \n\nReturn only the rewritten text.`,
    });
    return response.text || content;
  } catch (error) {
    console.error("Gemini Enhance Error:", error);
    return content;
  }
}