import { useState } from 'react';
import type { Product, ProductSectionContent } from '../lib/types';

interface Props {
  product: Product;
}

type TabContent =
  | { type: 'overview'; description: string; details: string[] }
  | ProductSectionContent;

interface Tab {
  id: string;
  title: string;
  content: TabContent;
}

export default function ProductSections({ product }: Props) {
  const tabs: Tab[] = [
    {
      id: 'overview',
      title: 'Overview',
      content: { type: 'overview', description: product.description, details: product.details },
    },
    ...(product.sections ?? []).map((s) => ({
      id: s.id,
      title: s.title,
      content: s.content,
    })),
  ];

  const [activeId, setActiveId] = useState(tabs[0].id);
  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];

  return (
    <div className="product-sections">
      <div className="product-sections__tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeId === tab.id}
            className={`product-sections__tab${activeId === tab.id ? ' product-sections__tab--active' : ''}`}
            onClick={() => setActiveId(tab.id)}
          >
            {tab.title}
          </button>
        ))}
      </div>
      <div className="product-sections__panel" role="tabpanel">
        {renderContent(active.content)}
      </div>
    </div>
  );
}

function renderContent(content: TabContent) {
  if (content.type === 'overview') {
    return (
      <>
        <p className="product-sections__text">{content.description}</p>
        {content.details.length > 0 && (
          <ul className="product-sections__list">
            {content.details.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )}
      </>
    );
  }

  if (content.type === 'specs') {
    return (
      <table className="product-sections__specs">
        <tbody>
          {content.rows.map((row) => (
            <tr key={row.label}>
              <th>{row.label}</th>
              <td>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (content.type === 'list') {
    return (
      <ul className="product-sections__list">
        {content.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  }

  if (content.type === 'text') {
    return <p className="product-sections__text">{content.body}</p>;
  }

  return null;
}
