import { ChatRequest, ChatResponse, VisionAnalysisResponse, STTResponse, LanguageRequest, SentimentResponse, KeyPhrasesResponse } from '@/types';

// Use relative URLs so requests go through the Next.js rewrite proxy, avoiding CORS.
const API_BASE = '';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

function getHeaders(contentType?: string): HeadersInit {
  const headers: Record<string, string> = {};
  if (API_KEY) headers['X-API-Key'] = API_KEY;
  if (contentType) headers['Content-Type'] = contentType;
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || error.message || `API Error: ${response.status}`);
  }
  return response.json();
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE}/api/chat/query`, {
    method: 'POST',
    headers: getHeaders('application/json'),
    body: JSON.stringify(request),
  });
  return handleResponse<ChatResponse>(response);
}

export async function analyzeImageByUrl(url: string): Promise<VisionAnalysisResponse> {
  const response = await fetch(`${API_BASE}/api/vision/analyze/url/`, {
    method: 'POST',
    headers: getHeaders('application/json'),
    body: JSON.stringify({ url }),
  });
  return handleResponse<VisionAnalysisResponse>(response);
}

export async function analyzeImageByUpload(file: File): Promise<VisionAnalysisResponse> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_BASE}/api/vision/analyze/upload/`, {
    method: 'POST',
    headers: getHeaders(),
    body: formData,
  });
  return handleResponse<VisionAnalysisResponse>(response);
}

export async function textToSpeech(text: string, voice?: string): Promise<Blob> {
  const response = await fetch(`${API_BASE}/api/speech/tts/`, {
    method: 'POST',
    headers: getHeaders('application/json'),
    body: JSON.stringify({ text, voice }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || `TTS Error: ${response.status}`);
  }
  return response.blob();
}

export async function speechToText(audioFile: Blob): Promise<STTResponse> {
  const formData = new FormData();
  formData.append('file', audioFile, 'recording.wav');
  const response = await fetch(`${API_BASE}/api/speech/stt/`, {
    method: 'POST',
    headers: getHeaders(),
    body: formData,
  });
  return handleResponse<STTResponse>(response);
}

export async function analyzeSentiment(request: LanguageRequest): Promise<SentimentResponse> {
  const response = await fetch(`${API_BASE}/api/language/sentiment`, {
    method: 'POST',
    headers: getHeaders('application/json'),
    body: JSON.stringify(request),
  });
  return handleResponse<SentimentResponse>(response);
}

export async function extractKeyPhrases(request: LanguageRequest): Promise<KeyPhrasesResponse> {
  const response = await fetch(`${API_BASE}/api/language/keyphrases`, {
    method: 'POST',
    headers: getHeaders('application/json'),
    body: JSON.stringify(request),
  });
  return handleResponse<KeyPhrasesResponse>(response);
}
