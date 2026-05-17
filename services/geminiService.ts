
import { GoogleGenAI } from "@google/genai";

/**
 * Service to interact with the Gemini 3 Pro model for Deriv-specific trading assistance.
 * Uses the latest @google/genai SDK patterns.
 */
export const askDerivAssistant = async (prompt: string, history: { role: 'user' | 'assistant', content: string }[]) => {
  try {
    // Correct initialization: using named parameter apiKey with process.env.API_KEY directly.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Correct method: using ai.models.generateContent directly with model name and content.
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview', // Updated to 3.1 as per guidelines for complex tasks
      contents: [
        ...history.map(h => ({ 
          role: h.role === 'user' ? 'user' : 'model', 
          parts: [{ text: h.content }] 
        })),
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: `You are the Bynex Trader AI Analyst, a specialized expert in high-frequency binary options trading on the Deriv platform.
        
        Knowledge Base & Context:
        - You have access to the Deriv AI Hub (https://developers.deriv.com/ai-hub/) and the latest Deriv API documentation.
        - Core API: https://developers.deriv.com/docs/intro/api-overview/
        - Authentication & OAuth: https://developers.deriv.com/docs/intro/authentication/
        - Trading Operations: https://developers.deriv.com/docs/trading/
        - Market Data: https://developers.deriv.com/docs/data/
        
        Capabilities:
        - Analyze Volatility Indices (10, 25, 50, 75, 100).
        - Explain contract types: Rise/Fall, Higher/Lower, Touch/No Touch, Digits.
        - Advise on risk management (Martingale, D'Alembert, fixed stake).
        - Help with Deriv WebSocket API integration using the latest schemas.
        
        Style:
        - Be professional, sharp, and concise.
        - Use bold text for key insights.
        - Avoid generic financial advice; focus on binary options mechanics.
        - When providing code snippets, follow the latest Deriv API patterns.`,
        temperature: 0.7,
      },
    });

    // Correct property access: .text is a getter, not a method.
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Technical difficulty in the AI sector. Please try again.";
  }
};
