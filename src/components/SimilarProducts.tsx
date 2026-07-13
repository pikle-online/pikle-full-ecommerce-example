import { useEffect, useState } from 'react';
import { fetchSimilarProducts } from '../lib/api';
import { isIntegrationsEnabled, INTEGRATIONS_EVENT } from '../lib/integrations';
import type { Product } from '../lib/types';

interface Props {
  categorySlug: string;
  productSlug: string;
  allProducts: Product[];
}

export default function SimilarProducts({ categorySlug, productSlug, allProducts }: Props) {
  const [similar, setSimilar] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const enabled = isIntegrationsEnabled();
    setActive(enabled);

    if (enabled) {
      fetchSimilarProducts(categorySlug, productSlug).then((slugs) => {
        if (slugs.length > 0) {
          const matched = slugs
            .map((s) => allProducts.find((p) => p.slug === s))
            .filter(Boolean) as Product[];
          setSimilar(matched.slice(0, 4));
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }

    const handler = (e: Event) => {
      setActive((e as CustomEvent<{ enabled: boolean }>).detail.enabled);
    };
    document.addEventListener(INTEGRATIONS_EVENT, handler);
    return () => document.removeEventListener(INTEGRATIONS_EVENT, handler);
  }, [categorySlug, productSlug]);

  if (!active) {
    return (
      <section className="similar-products similar-products--placeholder" aria-hidden="true">
        <div className="skeleton-bar skeleton-bar--heading" />
        <div className="product-grid">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="product-card">
              <div className="product-card__image skeleton-shimmer" />
              <div className="product-card__body">
                <div className="skeleton-bar skeleton-bar--name" />
                <div className="skeleton-bar skeleton-bar--price" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="similar-products">
      <h2 className="similar-products__heading">Similar Products</h2>
      {loading && <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Loading similar products…</p>}
      {!loading && similar.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No similar products found.</p>
      )}
      <div className="product-grid">
        {similar.map((product) => (
          <div key={product.slug} className="product-card">
            <a
              href={`/${product.category}/${product.subcategory}/${product.slug}`}
              className="product-card__link"
            >
              <div className="product-card__image">
                {product.images[0] ? (
                  <img src={product.images[0]} alt={product.name} loading="lazy" />
                ) : (
                  <div className="product-card__image-placeholder">{product.name}</div>
                )}
              </div>
              <div className="product-card__body">
                <div className="product-card__name">{product.name}</div>
                <div className="product-card__price">${product.price}</div>
              </div>
            </a>
            <div
              className="pikle-compare-button"
              data-href={`/${product.category}/${product.subcategory}/${product.slug}`}
              data-cart-url={`/cart?add=${product.slug}&category=${product.category}&subcategory=${product.subcategory}`}
              data-cart-method="navigate"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
