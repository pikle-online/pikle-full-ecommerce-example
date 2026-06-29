import type { APIRoute } from 'astro';
import { proxyPost } from '../../lib/api-server';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { categorySlug, filters } = await request.json();
    if (!categorySlug) {
      return new Response(JSON.stringify({ slugs: [] }), { status: 400 });
    }
    const data = await proxyPost(`/v1/filter/${categorySlug}`, { filters });
    return new Response(JSON.stringify(data));
  } catch {
    return new Response(JSON.stringify({ slugs: [] }), { status: 502 });
  }
};
