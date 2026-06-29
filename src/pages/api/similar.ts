import type { APIRoute } from 'astro';
import { proxyGet } from '../../lib/api-server';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const category = url.searchParams.get('category');
  const product = url.searchParams.get('product');
  if (!category || !product) {
    return new Response(JSON.stringify({ slugs: [] }), { status: 400 });
  }
  try {
    const data = await proxyGet(`/v1/similar/${category}/${product}`);
    return new Response(JSON.stringify(data));
  } catch {
    return new Response(JSON.stringify({ slugs: [] }), { status: 502 });
  }
};
