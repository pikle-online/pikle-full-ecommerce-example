import axios from 'axios';

const BASE_URL = import.meta.env.PUBLIC_PIKLE_API_URL ?? 'https://api.pikle.io';
const API_KEY = import.meta.env.PUBLIC_PIKLE_API_KEY ?? '';
const API_SECRET = import.meta.env.PUBLIC_PIKLE_API_SECRET ?? '';

async function signRequest(method: string, path: string, timestamp: string): Promise<string> {
  const message = `${method.toUpperCase()}\n${path}\n${timestamp}`;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(API_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function authHeaders(method: string, path: string) {
  const timestamp = Date.now().toString();
  const signature = await signRequest(method, path, timestamp);
  return {
    'X-Api-Key': API_KEY,
    'X-Timestamp': timestamp,
    'X-Signature': signature,
  };
}

export interface SimilarProductsResponse {
  slugs: string[];
}

export interface FilterResponse {
  slugs: string[];
}

export async function fetchSimilarProducts(
  categorySlug: string,
  productSlug: string
): Promise<string[]> {
  const path = `/v1/similar/${categorySlug}/${productSlug}`;
  try {
    const { data } = await axios.get<SimilarProductsResponse>(`${BASE_URL}${path}`, {
      headers: await authHeaders('GET', path),
    });
    return data.slugs;
  } catch {
    return [];
  }
}

export async function fetchFilteredProducts(
  categorySlug: string,
  filters: Record<string, string[]>
): Promise<string[]> {
  const path = `/v1/filter/${categorySlug}`;
  try {
    const { data } = await axios.post<FilterResponse>(
      `${BASE_URL}${path}`,
      { filters },
      { headers: await authHeaders('POST', path) }
    );
    return data.slugs;
  } catch {
    return [];
  }
}

export interface SearchResponse {
  results: { slug: string; category: string; subcategory: string; name: string; score: number }[];
}

export async function searchProducts(query: string): Promise<SearchResponse['results']> {
  const path = `/v1/search`;
  try {
    const { data } = await axios.post<SearchResponse>(
      `${BASE_URL}${path}`,
      { query },
      { headers: await authHeaders('POST', path) }
    );
    return data.results;
  } catch {
    return [];
  }
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  reply: string;
  products?: { slug: string; category: string; subcategory: string; name: string }[];
}

export async function chatWithAssistant(
  messages: ChatMessage[]
): Promise<ChatResponse> {
  const path = `/v1/chat`;
  try {
    const { data } = await axios.post<ChatResponse>(
      `${BASE_URL}${path}`,
      { messages },
      { headers: await authHeaders('POST', path) }
    );
    return data;
  } catch {
    return { reply: 'Sorry, I\'m having trouble connecting right now. Please try again.' };
  }
}
