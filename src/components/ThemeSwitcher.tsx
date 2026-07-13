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
    <select
      className="theme-switcher-select"
      value={activeId}
      onChange={(e) => handleSelect(e.target.value)}
      aria-label="Theme"
    >
      {themes.map((theme) => (
        <option key={theme.id} value={theme.id}>
          {theme.label}
        </option>
      ))}
    </select>
  );
}
