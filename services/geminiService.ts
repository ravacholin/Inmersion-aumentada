import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AnalysisResult } from '../types';

const getGenAI = () => {
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) {
    // This case should ideally be handled by the UI before calling the service
    throw new Error("API_KEY environment variable is not set.");
  }
  return new GoogleGenAI({ apiKey: API_KEY });
}

export const analyzeImage = async (base64ImageData: string, targetLanguage: string, customPrompt?: string, mimeType: string = 'image/jpeg'): Promise<AnalysisResult> => {
  const ai = getGenAI();

  const BASE_PROMPT = `
Identify the main object or scene in this image.
Based on the identified object/scene, provide 5 pragmatically correct and culturally relevant Spanish phrases or questions one might use in a real-life context involving it.
For each Spanish phrase, provide a corresponding translation in ${targetLanguage}.
Focus on functional language for different situations (e.g., at a shop, at home, on the street).
`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      objectName: {
        type: Type.STRING,
        description: "Name of the object in English",
      },
      phrases: {
        type: Type.ARRAY,
        description: "An array of Spanish phrases and their translations",
        items: {
          type: Type.OBJECT,
          properties: {
            spanish: {
              type: Type.STRING,
              description: "The Spanish phrase or question.",
            },
            translation: {
              type: Type.STRING,
              description: `The translation of the Spanish phrase in ${targetLanguage}.`,
            },
          },
          required: ['spanish', 'translation'],
        },
      },
    },
    required: ['objectName', 'phrases'],
  };

  try {
    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64ImageData,
      },
    };

    let finalPrompt = BASE_PROMPT;
    if (customPrompt) {
      finalPrompt += `\n\nPlease tailor the phrases specifically for the following context: "${customPrompt}"`;
    }

    const textPart = {
      text: finalPrompt,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);

    if (!result.objectName || !Array.isArray(result.phrases)) {
      throw new Error('Invalid JSON structure from API.');
    }

    return result as AnalysisResult;

  } catch (error) {
    console.error("Error analyzing image with AI:", error);
    if (error instanceof SyntaxError) {
      throw new Error("Failed to parse the response from the AI. The AI may have returned an unexpected format.");
    }
    // Re-throw the original error to allow for specific handling in the UI
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Could not get a valid response from the AI.");
  }
};

export const generateSpeech = async (text: string): Promise<string> => {
  const ai = getGenAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }, // A clear, neutral voice
            },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error("No audio data received from API.");
    }

    return base64Audio;
  } catch (error) {
    console.error("Error generating speech with AI:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Could not generate audio for the phrase.");
  }
};


// Audio Decoding Utilities
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}