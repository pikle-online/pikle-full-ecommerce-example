import type { APIRoute } from 'astro';
import { proxyPost } from '../../lib/api-server';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { messages } = await request.json();
    if (!messages) {
      return new Response(
        JSON.stringify({ reply: 'No messages provided.' }),
        { status: 400 }
      );
    }
    const data = await proxyPost('/v1/chat', { messages });
    return new Response(JSON.stringify(data));
  } catch {
    return new Response(
      JSON.stringify({ reply: "Sorry, I'm having trouble connecting right now. Please try again." }),
      { status: 502 }
    );
  }
};
