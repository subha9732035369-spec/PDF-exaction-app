
import { GoogleGenAI, Type } from "@google/genai";
import { Quiz } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

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
            text: `Analyze the provided PDF document and extract exactly 10 high-quality multiple-choice questions (MCQs). 
            If the PDF contains questions and answers already, convert them to this format. 
            If it contains text content, generate meaningful questions based on the key concepts.
            
            Each question must have:
            - A clear question string.
            - Exactly 4 options.
            - A correct answer index (0-3).
            - A brief explanation of why the answer is correct.
            
            Generate a creative title and description for the quiz based on the PDF content.`
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
          timeLimitSeconds: { 
            type: Type.INTEGER, 
            description: "Suggested time limit for the entire quiz in seconds (approx 60s per question)."
          },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                question: { type: Type.STRING },
                options: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING } 
                },
                correctAnswerIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING }
              },
              required: ["id", "question", "options", "correctAnswerIndex", "explanation"]
            }
          }
        },
        required: ["title", "description", "questions", "timeLimitSeconds"]
      }
    }
  });

  const jsonStr = response.text.trim();
  try {
    const quizData = JSON.parse(jsonStr) as Quiz;
    return quizData;
  } catch (error) {
    console.error("Failed to parse JSON response from Gemini", error);
    throw new Error("Failed to generate quiz data properly. Please try again.");
  }
};
