
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from "../types";

export const analyzeLibraryIncome = async (transactions: Transaction[]) => {
  // Always use new GoogleGenAI({ apiKey: process.env.API_KEY }) directly before making a call.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const dataSummary = transactions.map(t => ({
    amount: t.amount,
    category: t.category,
    date: t.date,
    branch: t.branch
  }));

  const prompt = `
    Como analista financiero experto en gestión de bibliotecas universitarias, analiza los siguientes datos de ingresos:
    ${JSON.stringify(dataSummary)}

    Proporciona un resumen ejecutivo del desempeño, identifica tendencias clave y ofrece 3 recomendaciones prácticas para optimizar los ingresos o mejorar el servicio.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Resumen ejecutivo del análisis" },
            recommendations: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Lista de recomendaciones estratégicas"
            },
            trend: { 
              type: Type.STRING, 
              enum: ["up", "down", "stable"],
              description: "Tendencia general de los ingresos"
            }
          },
          required: ["summary", "recommendations", "trend"]
        }
      }
    });

    // Directly access .text property (do not call as a method) and trim whitespace.
    const jsonStr = response.text?.trim() || "{}";
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return null;
  }
};
