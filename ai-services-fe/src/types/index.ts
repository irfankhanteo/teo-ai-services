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

export interface Voice {
  name: string;
  locale: string;
  short_name: string;
  gender: string;
  local_name: string;
}

export interface VoicesResponse {
  voices: Voice[];
}

export interface TranslationResponse {
  text: string;
  translations: Record<string, string>;
  audio: string;  // Base64-encoded audio
}

// Language types
export interface LanguageRequest {
  text: string;
  language?: string;
  sentence_count?: number;
}

export interface SentimentSentence {
  text: string;
  sentiment: string;
  confidence_scores: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

export interface SentimentResponse {
  sentiment: string;
  confidence_scores: {
    positive: number;
    negative: number;
    neutral: number;
  };
  sentences: SentimentSentence[];
}

export interface KeyPhrasesResponse {
  key_phrases: string[];
}

export interface Entity {
  text: string;
  category: string;
  subcategory?: string;
  confidence_score: number;
  offset: number;
  length: number;
}

export interface EntitiesResponse {
  entities: Entity[];
}

export interface PIIEntity {
  text: string;
  category: string;
  subcategory?: string;
  confidence_score: number;
  offset: number;
  length: number;
}

export interface PIIResponse {
  pii_entities: PIIEntity[];
}

export interface SummarySentence {
  text: string;
  rank_score: number;
  offset: number;
  length: number;
}

export interface SummaryResponse {
  summary: SummarySentence[];
}

// App types
export interface ApiError {
  message: string;
  status: number;
  detail?: string;
}

// ML types
export interface MLScoreRequest {
  data: {
    Area: number;
    Bedrooms: number;
    Property_Type: string;
    City: string;
    "Distance_to_City_Center (km)": number;
    "Age_of_House (years)": number;
    "Floors/Stories": number;
    Condition: string;
  };
}

export interface MLScoreResponse {
  result: {
    Results: {
      WebServiceOutput0: Array<{
        Area: number;
        Bedrooms: number;
        Property_Type: string;
        City: string;
        "Distance_to_City_Center (km)": number;
        "Age_of_House (years)": number;
        "Floors/Stories": number;
        Condition: string;
        Price: number;
        "Scored Labels": number;
      }>;
    };
  };
}

export type ServiceStatus = 'idle' | 'loading' | 'success' | 'error';
