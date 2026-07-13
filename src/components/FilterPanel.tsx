import { useEffect, useState } from 'react';
import { fetchFilteredProducts } from '../lib/api';
import { isIntegrationsEnabled, INTEGRATIONS_EVENT } from '../lib/integrations';

interface Props {
  categorySlug: string;
  availableTags: string[];
  onFilter: (slugs: string[] | null) => void;
}

export default function FilterPanel({ categorySlug, availableTags, onFilter }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(true);

  useEffect(() => {
    setActive(isIntegrationsEnabled());

    const handler = (e: Event) => {
      const enabled = (e as CustomEvent<{ enabled: boolean }>).detail.enabled;
      setActive(enabled);
      if (!enabled) {
        setSelected([]);
        dispatch(null);
      }
    };
    document.addEventListener(INTEGRATIONS_EVENT, handler);
    return () => document.removeEventListener(INTEGRATIONS_EVENT, handler);
  }, []);

  function toggle(tag: string) {
    setSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function dispatch(slugs: string[] | null) {
    onFilter(slugs);
    document.dispatchEvent(new CustomEvent('pikle:filter', { detail: { slugs } }));
  }

  async function apply() {
    if (selected.length === 0) {
      dispatch(null);
      return;
    }
    setLoading(true);
    const slugs = await fetchFilteredProducts(categorySlug, { tags: selected });
    setLoading(false);
    dispatch(slugs);
  }

  function clear() {
    setSelected([]);
    dispatch(null);
  }

  if (!active) {
    return (
      <aside className="filter-panel filter-panel--placeholder" data-walkthrough="filter-panel" aria-hidden="true">
        <div className="filter-panel__header">
          <span className="filter-panel__title">Filter</span>
        </div>
        <div className="filter-panel__tags">
          {availableTags.map((tag) => (
            <button key={tag} className="filter-tag" disabled tabIndex={-1}>
              {tag}
            </button>
          ))}
        </div>
        <button className="btn btn--primary filter-panel__apply" disabled tabIndex={-1}>
          Apply
        </button>
      </aside>
    );
  }

  return (
    <aside className="filter-panel" data-walkthrough="filter-panel">
      <div className="filter-panel__header">
        <span className="filter-panel__title">Filter</span>
        {selected.length > 0 && (
          <button className="filter-panel__clear" onClick={clear}>
            Clear
          </button>
        )}
      </div>
      <div className="filter-panel__tags">
        {availableTags.map((tag) => (
          <button
            key={tag}
            className={`filter-tag ${selected.includes(tag) ? 'filter-tag--active' : ''}`}
            onClick={() => toggle(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      <button
        className="btn btn--primary filter-panel__apply"
        onClick={apply}
        disabled={loading}
      >
        {loading ? 'Filtering…' : 'Apply'}
      </button>
    </aside>
  );
}
