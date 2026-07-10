import type { APIRoute } from 'astro';
import { getAllCategories, getAllProducts } from '../lib/categories';

async function hashProduct(content: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(content));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const GET: APIRoute = async () => {
  const categories = await getAllCategories();
  const manifest: Record<string, { url: string; hash: string }[]> = {};

  for (const category of categories) {
    const products = await getAllProducts(category.slug);
    for (const subcategory of category.subcategories) {
      manifest[subcategory.slug] = await Promise.all(
        products
          .filter((product) => product.subcategory === subcategory.slug)
          .map(async (product) => ({
            url: `/${category.slug}/${subcategory.slug}/${product.slug}`,
            hash: await hashProduct(JSON.stringify(product)),
          }))
      );
    }
  }

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};
