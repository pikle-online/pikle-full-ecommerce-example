import type { Category, Product } from './types';

export async function getAllCategories(): Promise<Category[]> {
  const files = import.meta.glob('../data/categories/*.json', { eager: true });
  return Object.values(files) as Category[];
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  const categories = await getAllCategories();
  return categories.find((c) => c.slug === slug);
}

export async function getAllProducts(categorySlug: string): Promise<Product[]> {
  const allFiles = import.meta.glob('../data/products/**/*.json', { eager: true });
  return Object.entries(allFiles)
    .filter(([path]) => path.includes(`/products/${categorySlug}/`))
    .map(([, mod]) => mod as Product);
}

export async function getProductsForSubcategory(
  categorySlug: string,
  subcategorySlug: string
): Promise<Product[]> {
  const allFiles = import.meta.glob('../data/products/**/*.json', { eager: true });
  return Object.entries(allFiles)
    .filter(([path]) => path.includes(`/products/${categorySlug}/${subcategorySlug}/`))
    .map(([, mod]) => mod as Product);
}

export async function getProduct(
  categorySlug: string,
  subcategorySlug: string,
  productSlug: string
): Promise<Product | undefined> {
  const products = await getProductsForSubcategory(categorySlug, subcategorySlug);
  return products.find((p) => p.slug === productSlug);
}
