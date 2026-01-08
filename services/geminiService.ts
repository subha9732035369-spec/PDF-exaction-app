
import { GoogleGenAI, Type } from "@google/genai";
import { Quiz } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateQuizFromPDF = async (pdfBase64: string, fileName: string): Promise<Quiz> => {
  const model = 'gemini-3-pro-preview';
  
  const response = await ai.models.generateContent({
    model: model,
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: pdfBase64
            }
          },
          {
            text: `Extract EVERY question from this PDF. 
            
            DIRECTIONS/CONTEXT RULES:
            - If a set of questions (e.g., Q1-Q5) shares a common text block of "Directions" or "Instructions", you MUST copy that text EXACTLY into the 'context' field for EACH question in that set.
            - Do NOT summarize, solve, or rephrase the DI data or instructions; provide the raw text as it appears.
            
            SECTION RULES:
            - Categorize questions into sections found in the doc (e.g., 'Reasoning', 'Numerical Ability', 'Quantitative Aptitude').
            - If no sections are explicitly mentioned, use 'General'.
            
            BILINGUAL RULES:
            - If the document is bilingual (Hindi & English), preserve both languages in the 'question', 'options', and 'context' fields.
            
            GENERAL:
            - Provide a detailed title.
            - Set 'timeLimitSeconds' based on difficulty (approx 60-90s per question).
            - Ensure EVERY single question is extracted.`
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          timeLimitSeconds: { type: Type.INTEGER },
          sections: { type: Type.ARRAY, items: { type: Type.STRING } },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                question: { type: Type.STRING },
                context: { type: Type.STRING },
                section: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswerIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING }
              },
              required: ["id", "question", "options", "correctAnswerIndex", "explanation"]
            }
          }
        },
        required: ["title", "description", "questions", "timeLimitSeconds", "sections"]
      }
    }
  });

  // Directly access the text property of the response
  const jsonStr = response.text.trim();
  try {
    return JSON.parse(jsonStr) as Quiz;
  } catch (error) {
    console.error("Gemini Response:", jsonStr);
    throw new Error("Failed to extract questions. The PDF structure might be too complex.");
  }
};
