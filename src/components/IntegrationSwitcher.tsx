import { useEffect, useState } from 'react';
import { isIntegrationsEnabled, setIntegrationsEnabled, INTEGRATIONS_EVENT } from '../lib/integrations';

export default function IntegrationSwitcher() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(isIntegrationsEnabled());

    const handler = (e: Event) => {
      setEnabled((e as CustomEvent<{ enabled: boolean }>).detail.enabled);
    };
    document.addEventListener(INTEGRATIONS_EVENT, handler);
    return () => document.removeEventListener(INTEGRATIONS_EVENT, handler);
  }, []);

  function toggle() {
    setIntegrationsEnabled(!enabled);
  }

  return (
    <div style={wrapper}>
      <span style={label}>Pikle integrations</span>
      <button
        onClick={toggle}
        style={{ ...track, ...(enabled ? trackOn : trackOff) }}
        role="switch"
        aria-checked={enabled}
        aria-label="Toggle Pikle integrations"
      >
        <span style={{ ...thumb, ...(enabled ? thumbOn : thumbOff) }} />
      </button>
      <span style={{ ...statusLabel, color: enabled ? '#4ade80' : 'rgba(255,255,255,0.4)' }}>
        {enabled ? 'On' : 'Off'}
      </span>
    </div>
  );
}

const wrapper: React.CSSProperties = {
  position: 'fixed',
  bottom: '68px',
  left: '24px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  background: 'rgba(0,0,0,0.75)',
  backdropFilter: 'blur(8px)',
  borderRadius: '100px',
  padding: '8px 14px',
  zIndex: 1002,
};

const label: React.CSSProperties = {
  color: 'rgba(255,255,255,0.6)',
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  whiteSpace: 'nowrap',
};

const statusLabel: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  width: '20px',
  transition: 'color 0.3s',
};

const track: React.CSSProperties = {
  position: 'relative',
  width: '36px',
  height: '20px',
  borderRadius: '100px',
  border: 'none',
  cursor: 'pointer',
  transition: 'background 0.3s',
  flexShrink: 0,
};

const trackOn: React.CSSProperties = {
  background: '#4ade80',
};

const trackOff: React.CSSProperties = {
  background: 'rgba(255,255,255,0.2)',
};

const thumb: React.CSSProperties = {
  position: 'absolute',
  top: '2px',
  width: '16px',
  height: '16px',
  borderRadius: '50%',
  background: '#fff',
  transition: 'left 0.2s',
};

const thumbOn: React.CSSProperties = {
  left: '18px',
};

const thumbOff: React.CSSProperties = {
  left: '2px',
};
