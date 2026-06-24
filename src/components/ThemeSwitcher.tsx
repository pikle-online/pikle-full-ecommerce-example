import { useEffect, useState } from 'react';
import type { Theme } from '../lib/types';

interface Props {
  categorySlug: string;
  themes: Theme[];
  defaultThemeId: string;
}

const SESSION_KEY = (slug: string) => `pikle-theme-${slug}`;

export default function ThemeSwitcher({ categorySlug, themes, defaultThemeId }: Props) {
  const [activeId, setActiveId] = useState(defaultThemeId);

  // On mount, restore saved theme from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY(categorySlug));
    const id = saved ?? defaultThemeId;
    applyTheme(id);
    setActiveId(id);
  }, [categorySlug, defaultThemeId]);

  function applyTheme(id: string) {
    const theme = themes.find((t) => t.id === id);
    if (!theme) return;
    const root = document.documentElement;
    for (const [prop, value] of Object.entries(theme.tokens)) {
      root.style.setProperty(prop, value);
    }
    sessionStorage.setItem(SESSION_KEY(categorySlug), id);
  }

  function handleSelect(id: string) {
    setActiveId(id);
    applyTheme(id);
  }

  return (
    <div style={switcher}>
      <span style={label}>Theme</span>
      <div style={buttonGroup}>
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleSelect(theme.id)}
            style={{
              ...pill,
              ...(activeId === theme.id ? pillActive : {}),
            }}
            aria-pressed={activeId === theme.id}
          >
            {theme.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const switcher: React.CSSProperties = {
  position: 'fixed',
  bottom: '24px',
  left: '24px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  background: 'rgba(0,0,0,0.75)',
  backdropFilter: 'blur(8px)',
  borderRadius: '100px',
  padding: '8px 14px',
  zIndex: 999,
};

const label: React.CSSProperties = {
  color: 'rgba(255,255,255,0.6)',
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  whiteSpace: 'nowrap',
};

const buttonGroup: React.CSSProperties = {
  display: 'flex',
  gap: '6px',
};

const pill: React.CSSProperties = {
  padding: '4px 12px',
  borderRadius: '100px',
  border: '1px solid rgba(255,255,255,0.2)',
  background: 'transparent',
  color: 'rgba(255,255,255,0.7)',
  fontSize: '0.8rem',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

const pillActive: React.CSSProperties = {
  background: 'rgba(255,255,255,0.9)',
  color: '#000',
  borderColor: 'transparent',
};
