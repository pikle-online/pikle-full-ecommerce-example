export interface ThemeTokens {
  '--color-bg': string;
  '--color-surface': string;
  '--color-primary': string;
  '--color-accent': string;
  '--color-text': string;
  '--color-text-muted': string;
  '--color-border': string;
  '--color-header-bg'?: string;
  '--color-header-text'?: string;
  '--color-surface-text'?: string;
  '--color-search-bg'?: string;
  '--color-search-text'?: string;
  '--font-heading': string;
  '--font-body': string;
  '--radius': string;
  '--spacing-section': string;
}

export interface Theme {
  id: string;
  label: string;
  tokens: ThemeTokens;
}

export interface Subcategory {
  slug: string;
  name: string;
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  subcategories: Subcategory[];
  themes: Theme[];
  defaultTheme: string;
}

export type ProductSectionContent =
  | { type: 'text'; body: string }
  | { type: 'list'; items: string[] }
  | { type: 'specs'; rows: { label: string; value: string }[] };

export interface ProductSection {
  id: string;
  title: string;
  content: ProductSectionContent;
}

export interface Product {
  slug: string;
  name: string;
  price: number;
  category: string;
  subcategory: string;
  description: string;
  tags: string[];
  images: string[];
  details: string[];
  sections?: ProductSection[];
}
