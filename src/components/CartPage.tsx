import { useEffect, useState } from 'react';
import type { Product } from '../lib/types';

interface CartItem {
  slug: string;
  name: string;
  price: number;
  category: string;
  subcategory: string;
  image: string;
  quantity: number;
}

const CART_KEY = 'pikle-cart';

function loadCart(): CartItem[] {
  try {
    return JSON.parse(sessionStorage.getItem(CART_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  sessionStorage.setItem(CART_KEY, JSON.stringify(items));
}

interface Props {
  allProducts: Product[];
}

export default function CartPage({ allProducts }: Props) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [added, setAdded] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('add');
    const category = params.get('category');
    const subcategory = params.get('subcategory');

    let cart = loadCart();

    if (slug && category && subcategory) {
      const product = allProducts.find(
        (p) => p.slug === slug && p.category === category && p.subcategory === subcategory
      );
      if (product) {
        const existing = cart.find((i) => i.slug === slug);
        if (existing) {
          cart = cart.map((i) => i.slug === slug ? { ...i, quantity: i.quantity + 1 } : i);
        } else {
          cart = [...cart, {
            slug: product.slug,
            name: product.name,
            price: product.price,
            category: product.category,
            subcategory: product.subcategory,
            image: product.images[0] ?? '',
            quantity: 1,
          }];
        }
        saveCart(cart);
        setAdded(product.name);
        // Clean the query params from the URL without a page reload
        window.history.replaceState({}, '', '/cart');
      }
    }

    setItems(cart);
  }, []);

  function remove(slug: string) {
    const updated = items.filter((i) => i.slug !== slug);
    setItems(updated);
    saveCart(updated);
  }

  function updateQty(slug: string, delta: number) {
    const updated = items
      .map((i) => i.slug === slug ? { ...i, quantity: i.quantity + delta } : i)
      .filter((i) => i.quantity > 0);
    setItems(updated);
    saveCart(updated);
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="cart-layout">
      <div className="cart-items">
        <h1 className="cart-heading">Your Cart</h1>

        {added && (
          <div className="cart-notice">
            <strong>{added}</strong> added to your cart.
          </div>
        )}

        {items.length === 0 ? (
          <div className="cart-empty">
            <p>Your cart is empty.</p>
            <a href="/" className="btn btn--outline" style={{ marginTop: '16px', display: 'inline-flex' }}>
              Continue shopping
            </a>
          </div>
        ) : (
          <ul className="cart-list">
            {items.map((item) => (
              <li key={item.slug} className="cart-item">
                <div className="cart-item__image">
                  {item.image
                    ? <img src={item.image} alt={item.name} />
                    : <div className="cart-item__image-placeholder">{item.name}</div>
                  }
                </div>
                <div className="cart-item__info">
                  <a
                    href={`/${item.category}/${item.subcategory}/${item.slug}`}
                    className="cart-item__name"
                  >
                    {item.name}
                  </a>
                  <div className="cart-item__price">${item.price}</div>
                  <div className="cart-item__qty">
                    <button className="qty-btn" onClick={() => updateQty(item.slug, -1)}>−</button>
                    <span>{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.slug, 1)}>+</button>
                  </div>
                </div>
                <button className="cart-item__remove" onClick={() => remove(item.slug)} aria-label="Remove">
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {items.length > 0 && (
        <div className="cart-summary">
          <h2 className="cart-summary__heading">Order Summary</h2>
          <div className="cart-summary__lines">
            {items.map((item) => (
              <div key={item.slug} className="cart-summary__line">
                <span>{item.name} × {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="cart-summary__total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button className="btn btn--primary cart-summary__checkout" disabled>
            Checkout — demo only
          </button>
          <a href="/" className="cart-summary__continue">Continue shopping</a>
        </div>
      )}
    </div>
  );
}
