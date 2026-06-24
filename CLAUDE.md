This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an example ecommerce website which demonstrates the different product discovery services provided by Pikle ecommerce and different integration options.

The project structure is such that it can have different catalog areas that each have their own style and themes. This is to allow for demonstrating different product types such as fashion and technology each of which may have very different product page layouts.

The goal is for breadth and flexibility rather than depth.

We need to be able to easily add new categories of products with 10s of items.

There should be no database. This is an example site and everything is generated from JSON files.

## Tech Stack

- **Astro** (static site generator) — zero JS by default, React islands for interactive components
- **React** — used only for interactive islands (ThemeSwitcher, IntegrationSwitcher, FilterPanel, SimilarProducts, CartPage)
- **TypeScript** — throughout
- **axios** — for Pikle API calls
- **Web Crypto API** (`crypto.subtle`) — for HMAC request signing (works in both browser and Node 20+; Node's `crypto` module is not used as it doesn't bundle for the browser)

Run with `npm run dev`. Build with `npm run build`.

## Project Structure

```
src/
  data/
    categories/          ← one JSON file per top-level category (fashion.json, tech.json)
    products/
      fashion/
        womens/          ← one JSON file per product
        mens/
        children/
        shoes/
      tech/
        laptops/
        monitors/
        headphones/
        keyboards/
        workspace/
  layouts/
    BaseLayout.astro     ← HTML shell, site nav, JS SDK script tag (commented), IntegrationSwitcher, SearchBar, ChatAssistant
    CategoryLayout.astro ← applies category theme tokens, subcategory nav, ThemeSwitcher
  pages/
    index.astro                              ← homepage with category cards
    [category]/index.astro                   ← category overview with subcategory cards
    [category]/[subcategory]/index.astro     ← product listing with FilterPanel
    [category]/[subcategory]/[slug].astro    ← product detail with SimilarProducts
    cart.astro                               ← fake cart page (no checkout)
  components/
    ProductCard.astro        ← static Astro component
    ThemeSwitcher.tsx        ← React island, bottom-right, per-category themes
    IntegrationSwitcher.tsx  ← React island, bottom-left, global integrations on/off
    FilterPanel.tsx          ← React island, Pikle filter API integration
    SimilarProducts.tsx      ← React island, Pikle similar products API integration
    SearchBar.tsx            ← React island, Pikle catalog search in header
    ChatAssistant.tsx        ← React island, Pikle AI assistant floating chat
    CartPage.tsx             ← React island, sessionStorage cart state
  lib/
    types.ts           ← shared TypeScript interfaces
    categories.ts      ← data loading helpers (uses import.meta.glob)
    api.ts             ← Pikle API client (axios + HMAC signing)
    integrations.ts    ← shared integration toggle state and event constants
  styles/
    global.css         ← all CSS, uses custom properties for theming
```

## URL Structure

```
/                                     homepage
/[category]                           category overview (e.g. /fashion, /tech)
/[category]/[subcategory]             product listing (e.g. /tech/headphones)
/[category]/[subcategory]/[slug]      product detail
/cart?add=[slug]&category=[cat]&subcategory=[subcat]   add to cart
/cart                                 cart page
```

## Two-level Category System

- **Top-level category** (`fashion`, `tech`) — owns themes, layout, and subcategory list. Defined in `src/data/categories/<slug>.json`.
- **Subcategory** (`womens`, `mens`, `headphones`, etc.) — owns the product listing page. Listed in the category JSON under `subcategories`. Products live in `src/data/products/<category>/<subcategory>/`.

## Adding Content

### Add a new top-level category
1. Create `src/data/categories/<slug>.json` with `slug`, `name`, `description`, `subcategories`, `themes`, and `defaultTheme`.
2. Create `src/data/products/<slug>/` directory with subcategory subdirectories.
3. No code changes needed — pages are generated automatically.

### Add a new subcategory
1. Add an entry to the `subcategories` array in the category JSON.
2. Create `src/data/products/<category>/<subcategory>/` directory.
3. No code changes needed.

### Add a new product
1. Create a JSON file in `src/data/products/<category>/<subcategory>/<slug>.json`.
2. Required fields: `slug`, `name`, `price`, `category`, `subcategory`, `description`, `tags`, `images`, `details`.
3. No code changes needed.

### Edit or add a theme
Themes live in the category JSON under `themes`. Each theme has an `id`, `label`, and `tokens` object containing CSS custom properties. The `defaultTheme` field sets which theme loads first.

## Theming

All visual styling is driven by CSS custom properties defined in `src/styles/global.css`. Themes in the category JSON map directly to these properties. The `ThemeSwitcher` React island applies them to `document.documentElement` at runtime and persists the choice to `sessionStorage` keyed by category slug.

## Integration Points

### JS SDK
A commented `<script>` tag in `BaseLayout.astro` is the placeholder for the Pikle JS SDK site-wide embed. Uncomment and set `PUBLIC_PIKLE_SDK_KEY` in `.env` to activate.

### Pikle API (axios + HMAC)
`src/lib/api.ts` handles authenticated requests. Credentials come from env vars (`PUBLIC_PIKLE_API_KEY`, `PUBLIC_PIKLE_API_SECRET`, `PUBLIC_PIKLE_API_URL`). Four functions are implemented:
- `fetchSimilarProducts(categorySlug, productSlug)` — used by `SimilarProducts` island on product detail pages
- `fetchFilteredProducts(categorySlug, filters)` — used by `FilterPanel` island on product listing pages
- `searchProducts(query)` — used by `SearchBar` island in the site header
- `chatWithAssistant(messages)` — used by `ChatAssistant` island (floating chat widget)

All return graceful fallbacks on error so pages degrade safely.

### Integration markers
Pages use `data-pikle-*` attributes to mark integration points for the SDK:
- `data-pikle-product-index` on the product grid
- `data-pikle-product` and `data-pikle-category` on product detail wrappers

### Integration Switcher
A global on/off toggle (bottom-left of every page) lets you demonstrate the site with and without Pikle integrations active. State is stored in `sessionStorage` under `pikle-integrations-enabled` and communicated via a `pikle:integrations` CustomEvent. `FilterPanel`, `SimilarProducts`, `SearchBar`, and `ChatAssistant` all listen for this event and hide themselves when integrations are off. The catalog grid also collapses to full-width when the filter panel hides.

### Cart integration
Add-to-cart URL: `/cart?add=<slug>&category=<cat>&subcategory=<subcat>`. The cart page reads these params on load, adds the item to a `sessionStorage` cart, then clears the params from the URL. Cart state persists across page navigations within the session. No checkout functionality — demo only.

## Terminology

- Use **ecommerce** (no hyphen, no camelCase) consistently throughout.
- Use **Cart** / **Add to Cart** (not Bag).

## Environment Variables

Copy `.env.example` to `.env` and fill in credentials:

```
PUBLIC_PIKLE_API_KEY=
PUBLIC_PIKLE_API_SECRET=
PUBLIC_PIKLE_API_URL=https://api.pikle.io
PUBLIC_PIKLE_SDK_KEY=
```

All variables use the `PUBLIC_` prefix because API calls are made from the client bundle (this is a static site with no server runtime). For production use, API calls should be proxied through a server to keep secrets private.

## Deployment

The site builds to a static `dist/` folder. Deploy to any static host (Netlify, Vercel, GitHub Pages, S3). No server runtime required.

`npm run build` — production build  
`npm run preview` — preview the production build locally
