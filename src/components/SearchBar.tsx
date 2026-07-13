import { useEffect, useRef, useState } from 'react';
import { searchProducts } from '../lib/api';
import { isIntegrationsEnabled, INTEGRATIONS_EVENT } from '../lib/integrations';
import type { SearchResponse } from '../lib/api';

export default function SearchBar() {
  const [active, setActive] = useState(true);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResponse['results']>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActive(isIntegrationsEnabled());

    const handler = (e: Event) => {
      setActive((e as CustomEvent<{ enabled: boolean }>).detail.enabled);
    };
    document.addEventListener(INTEGRATIONS_EVENT, handler);
    return () => document.removeEventListener(INTEGRATIONS_EVENT, handler);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const res = await searchProducts(value.trim());
      setResults(res);
      setOpen(true);
      setLoading(false);
    }, 300);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setOpen(false);
      (e.target as HTMLInputElement).blur();
    }
  }

  if (!active) {
    return (
      <div className="search-bar search-bar--placeholder" data-walkthrough="search-bar" aria-hidden="true">
        <div className="search-bar__input-wrapper">
          <svg className="search-bar__icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="8.5" cy="8.5" r="5.5" />
            <line x1="13" y1="13" x2="18" y2="18" />
          </svg>
          <input
            type="text"
            className="search-bar__input"
            placeholder="Search products…"
            disabled
            tabIndex={-1}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="search-bar" ref={wrapperRef} data-walkthrough="search-bar">
      <div className="search-bar__input-wrapper">
        <svg className="search-bar__icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="8.5" cy="8.5" r="5.5" />
          <line x1="13" y1="13" x2="18" y2="18" />
        </svg>
        <input
          type="text"
          className="search-bar__input"
          placeholder="Search products…"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          onKeyDown={handleKeyDown}
          aria-label="Search products"
        />
        {loading && <span className="search-bar__spinner" />}
      </div>

      {open && results.length > 0 && (
        <div className="search-bar__dropdown">
          {results.map((item) => (
            <a
              key={`${item.category}-${item.subcategory}-${item.slug}`}
              href={`/${item.category}/${item.subcategory}/${item.slug}`}
              className="search-bar__result"
              onClick={() => setOpen(false)}
            >
              <span className="search-bar__result-name">{item.name}</span>
              <span className="search-bar__result-path">
                {item.category} / {item.subcategory}
              </span>
            </a>
          ))}
        </div>
      )}

      {open && query.trim().length >= 2 && results.length === 0 && !loading && (
        <div className="search-bar__dropdown">
          <div className="search-bar__no-results">No results found</div>
        </div>
      )}
    </div>
  );
}
