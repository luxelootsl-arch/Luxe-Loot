import { GoogleGenAI, Modality } from "@google/genai";
import { ImageSize, AspectRatio } from "../types";

// Standard client for most operations
const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Consultant (Search & Thinking) ---

export const askConsultant = async (
  prompt: string,
  mode: 'search' | 'thinking'
) => {
  const ai = getClient();
  
  if (mode === 'thinking') {
    // Complex Text Tasks: 'gemini-3-pro-preview' with Thinking
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 } // Max for 3 Pro
        // Do not set maxOutputTokens per instructions
      }
    });
    return {
      text: response.text,
      groundingChunks: []
    };
  } else {
    // Search Grounding: 'gemini-2.5-flash'
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    return {
      text: response.text,
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  }
};

// --- Image Generation (Pro) ---

export const generateProImage = async (
  prompt: string,
  size: ImageSize,
  aspectRatio: AspectRatio
) => {
  // Check for API Key selection (Required for Veo/High-Res Img)
  if (window.aistudio && window.aistudio.openSelectKey) {
     const hasKey = await window.aistudio.hasSelectedApiKey();
     if (!hasKey) {
        await window.aistudio.openSelectKey();
     }
  }

  // Always create new instance after key selection possibilities
  const ai = getClient(); 

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        imageSize: size,
        aspectRatio: aspectRatio
      }
    }
  });

  // Extract image
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};

// --- Image Editing (Flash) ---

export const editImage = async (
  base64Image: string,
  prompt: string,
  mimeType: string = 'image/jpeg'
) => {
  const ai = getClient();
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType
          }
        },
        { text: prompt }
      ]
    }
  });

  // Extract image
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null; // Might return text if editing failed or model chatted back
};

// --- Video Generation (Veo) ---

export const generateVeoVideo = async (
  prompt: string,
  aspectRatio: '16:9' | '9:16',
  resolution: '720p' | '1080p'
) => {
  // Mandatory Key Check for Veo
  if (window.aistudio && window.aistudio.openSelectKey) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
       await window.aistudio.openSelectKey();
    }
 }

 const ai = getClient();

 let operation = await ai.models.generateVideos({
   model: 'veo-3.1-fast-generate-preview',
   prompt: prompt,
   config: {
     numberOfVideos: 1,
     resolution: resolution,
     aspectRatio: aspectRatio
   }
 });

 // Polling loop
 while (!operation.done) {
   await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
   operation = await ai.operations.getVideosOperation({operation: operation});
 }

 const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
 if (!videoUri) throw new Error("Video generation failed or returned no URI");

 // Fetch the video content using the URI and API Key
 const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
 if (!response.ok) throw new Error("Failed to download video content");
 
 const blob = await response.blob();
 return URL.createObjectURL(blob);
};

// --- Text to Speech ---

export const generateSpeech = async (text: string) => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64Audio;
};