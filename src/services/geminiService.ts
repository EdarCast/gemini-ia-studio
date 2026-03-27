import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface Idea {
  id: number;
  title: string;
  description: string;
  importance: "Alta" | "Media" | "Baja";
  status: "Nueva" | "En progreso" | "Completada";
  category: string;
  notes: string;
  improvements: string;
}

export async function suggestImprovements(idea: Partial<Idea>): Promise<string> {
  if (!idea.title || !idea.description) return "";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analiza la siguiente idea y sugiere 3 mejoras accionables o puntos a considerar para hacerla más sólida. Sé directo y breve.
      Título: ${idea.title}
      Descripción: ${idea.description}`,
      config: {
        systemInstruction: "Eres un experto en estrategia y productividad. Tus sugerencias deben ser breves, directas y altamente accionables.",
      }
    });
    return response.text || "No se pudieron generar sugerencias.";
  } catch (error) {
    console.error("Error generating improvements:", error);
    return "Error al conectar con la IA.";
  }
}

export async function detectSimilarities(newIdea: Partial<Idea>, existingIdeas: Idea[]): Promise<number[]> {
  if (existingIdeas.length === 0) return [];

  const ideasContext = existingIdeas.map(i => `ID: ${i.id}, Título: ${i.title}`).join("\n");
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Compara esta nueva idea con las existentes. Si hay alguna que sea muy similar o que deba fusionarse, devuelve solo los IDs de las ideas existentes separados por comas. Si no hay similitudes claras, devuelve "None".
      Nueva Idea: ${newIdea.title} - ${newIdea.description}
      Ideas Existentes:
      ${ideasContext}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            similarIds: {
              type: Type.ARRAY,
              items: { type: Type.INTEGER },
              description: "IDs de ideas similares"
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text);
    return result.similarIds || [];
  } catch (error) {
    console.error("Error detecting similarities:", error);
    return [];
  }
}
