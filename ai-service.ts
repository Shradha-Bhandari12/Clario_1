
import { GoogleGenAI, Modality } from "@google/genai";

export class AIService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateReply(messages: any[], systemInstruction: string) {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: messages.map(m => ({
          role: m.role === 'model' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }]
        }
      });
      return response;
    } catch (error: any) {
      console.error("Clario AI Error:", error);
      throw new Error(error.message || "Bhai, connection error aa gaya! Network check kar lo.");
    }
  }

  async textToSpeech(text: string, voiceName: string) {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });
      return response;
    } catch (error: any) {
      console.error("Clario TTS Error:", error);
      return null;
    }
  }

  connectLive(config: any, callbacks: any) {
    try {
      return this.ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config,
        callbacks
      });
    } catch (error: any) {
      console.error("Clario Live Error:", error);
      throw error;
    }
  }
}

export const aiService = new AIService();
