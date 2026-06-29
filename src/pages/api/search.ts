import type { APIRoute } from 'astro';
import { proxyPost } from '../../lib/api-server';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { query } = await request.json();
    if (!query) {
      return new Response(JSON.stringify({ results: [] }), { status: 400 });
    }
    const data = await proxyPost('/v1/search', { query });
    return new Response(JSON.stringify(data));
  } catch {
    return new Response(JSON.stringify({ results: [] }), { status: 502 });
  }
};
