// Chat types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  messages: { role: string; content: string }[];
  max_tokens?: number;
  temperature?: number;
}

export interface ChatResponse {
  message: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Vision types
export type VisionAnalysisResponse = {
  modelVersion: string;
  captionResult: {
    text: string;
    confidence: number;
  };
  metadata: {
    width: number;
    height: number;
  };
  tagsResult: {
    values: {
      name: string;
      confidence: number;
    }[];
  };
  objectsResult: {
    values: unknown[];
  };
  readResult: {
    blocks: {
      lines: {
        text: string;
        boundingPolygon: {
          x: number;
          y: number;
        }[];
        words: {
          text: string;
          boundingPolygon: {
            x: number;
            y: number;
          }[];
          confidence: number;
        }[];
      }[];
    }[];
  };
};

export interface ImageURLRequest {
  url: string;
}

// Speech types
export interface TTSRequest {
  text: string;
  voice?: string;
}

export interface STTResponse {
  text: string;
  confidence?: number;
  duration?: number;
}

// App types
export interface ApiError {
  message: string;
  status: number;
  detail?: string;
}

export type ServiceStatus = 'idle' | 'loading' | 'success' | 'error';
