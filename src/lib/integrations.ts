export const INTEGRATIONS_EVENT = 'pikle:integrations';
export const INTEGRATIONS_KEY = 'pikle-integrations-enabled';

export function isIntegrationsEnabled(): boolean {
  try {
    return sessionStorage.getItem(INTEGRATIONS_KEY) !== 'false';
  } catch {
    return true;
  }
}

export function setIntegrationsEnabled(enabled: boolean) {
  try {
    sessionStorage.setItem(INTEGRATIONS_KEY, String(enabled));
  } catch {
    // ignore
  }
  document.dispatchEvent(
    new CustomEvent(INTEGRATIONS_EVENT, { detail: { enabled } })
  );
}
