// A new key intentionally requires fresh consent before GA4 is introduced.
// Older banner choices did not control any third-party analytics scripts.
export const CONSENT_KEY = 'myhelper_cookie_consent_v2';
export const CONSENT_UPDATED_EVENT = 'myhelper:consent-updated';

export interface ConsentState {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

export function readConsent(): ConsentState | null {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as Partial<ConsentState>;
    if (typeof parsed.analytics !== 'boolean' || typeof parsed.marketing !== 'boolean') {
      return null;
    }

    return {
      necessary: true,
      analytics: parsed.analytics,
      marketing: parsed.marketing,
      timestamp: typeof parsed.timestamp === 'string' ? parsed.timestamp : '',
    };
  } catch {
    return null;
  }
}

export function saveConsent(consent: ConsentState) {
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  window.dispatchEvent(
    new CustomEvent<ConsentState>(CONSENT_UPDATED_EVENT, { detail: consent }),
  );
}
