export enum ImageSize {
  SIZE_1K = '1K',
  SIZE_2K = '2K',
  SIZE_4K = '4K'
}

export enum AspectRatio {
  SQUARE = '1:1',
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16',
  PORTRAIT_ALT = '3:4',
  LANDSCAPE_ALT = '4:3'
}

export interface ServiceItem {
  title: string;
  description: string;
  icon: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
  groundingUrls?: string[];
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

// Global declaration for the aistudio object injected in the specific environment
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}
