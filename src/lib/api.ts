import axios from 'axios';

export interface SimilarProductsResponse {
  slugs: string[];
}

export interface FilterResponse {
  slugs: string[];
}

export interface SearchResponse {
  results: { slug: string; category: string; subcategory: string; name: string; score: number }[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  reply: string;
  products?: { slug: string; category: string; subcategory: string; name: string }[];
}

export async function fetchSimilarProducts(
  categorySlug: string,
  productSlug: string
): Promise<string[]> {
  try {
    const { data } = await axios.get<SimilarProductsResponse>('/api/similar', {
      params: { category: categorySlug, product: productSlug },
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
  try {
    const { data } = await axios.post<FilterResponse>('/api/filter', {
      categorySlug,
      filters,
    });
    return data.slugs;
  } catch {
    return [];
  }
}

export async function searchProducts(query: string): Promise<SearchResponse['results']> {
  try {
    const { data } = await axios.post<SearchResponse>('/api/search', { query });
    return data.results;
  } catch {
    return [];
  }
}

export async function chatWithAssistant(
  messages: ChatMessage[]
): Promise<ChatResponse> {
  try {
    const { data } = await axios.post<ChatResponse>('/api/chat', { messages });
    return data;
  } catch {
    return { reply: "Sorry, I'm having trouble connecting right now. Please try again." };
  }
}
