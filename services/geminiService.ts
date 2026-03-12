import { GoogleGenAI } from "@google/genai";
import { CartItem } from '../types';

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
};

export const generateReceiptMessage = async (items: CartItem[]): Promise<string> => {
  const ai = getClient();
  if (!ai) return "¡Gracias por su visita! Disfrute su postre.";

  const itemNames = items.map(i => i.name).join(', ');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Escribe una frase corta, divertida y amable (máximo 15 palabras) para poner al final de un ticket de compra de una heladería. 
      El cliente compró: ${itemNames}. 
      Usa un tono alegre. No uses hashtags.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    return response.text?.trim() || "¡Gracias por su visita! Disfrute su postre.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "¡Gracias por su visita! Disfrute su postre.";
  }
};