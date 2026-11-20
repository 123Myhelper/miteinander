'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  CONSENT_UPDATED_EVENT,
  readConsent,
  type ConsentState,
} from '@/lib/cookie-consent';

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const SCRIPT_ID = 'myhelper-google-analytics';
const TRACKED_PATHS = new Set([
  '/',
  '/agb',
  '/alltagsbegleitung-finden',
  '/alltagsbegleitung-oder-pflegedienst',
  '/datenschutz',
  '/en/alltagsbegleitung-finden',
  '/en/alltagsbegleitung-oder-pflegedienst',
  '/faq',
  '/fr/alltagsbegleitung-finden',
  '/fr/alltagsbegleitung-oder-pflegedienst',
  '/impressum',
]);
let analyticsInitialized = false;

type ConsentMode = {
  ad_storage: 'denied';
  ad_user_data: 'denied';
  ad_personalization: 'denied';
  analytics_storage: 'granted' | 'denied';
};

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
  }
}

function updateGoogleConsent(analyticsStorage: ConsentMode['analytics_storage']) {
  window.gtag?.('consent', 'update', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: analyticsStorage,
  } satisfies ConsentMode);
}

function setAnalyticsCollectionEnabled(enabled: boolean) {
  if (!MEASUREMENT_ID) return;

  (window as unknown as Record<string, boolean>)[`ga-disable-${MEASUREMENT_ID}`] = !enabled;
}

function clearAnalyticsCookies() {
  const cookieNames = document.cookie
    .split(';')
    .map((cookie) => cookie.trim().split('=')[0])
    .filter((name) => /^_(?:ga|gid|gat)(?:_|$)/.test(name));

  const hostname = window.location.hostname;
  const domains = [hostname, `.${hostname}`, hostname.replace(/^www\./, '')];

  for (const name of cookieNames) {
    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; Path=/; Domain=${domain}; SameSite=Lax`;
    }
  }
}

function enableGoogleAnalytics() {
  if (!MEASUREMENT_ID) return false;

  setAnalyticsCollectionEnabled(true);
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = window.gtag ?? ((...args: unknown[]) => window.dataLayer?.push(args));

  if (!analyticsInitialized) {
    window.gtag('js', new Date());
    window.gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'granted',
    } satisfies ConsentMode);
    window.gtag('config', MEASUREMENT_ID, {
      allow_ad_personalization_signals: false,
      allow_google_signals: false,
      send_page_view: false,
    });
    analyticsInitialized = true;
  } else {
    updateGoogleConsent('granted');
  }

  if (!document.getElementById(SCRIPT_ID)) {
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
    document.head.append(script);
  }

  return true;
}

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const applyConsent = (consent: ConsentState | null) => {
      if (consent?.analytics && TRACKED_PATHS.has(pathname) && enableGoogleAnalytics()) {
        setEnabled(true);
        return;
      }

      setAnalyticsCollectionEnabled(false);
      updateGoogleConsent('denied');
      clearAnalyticsCookies();
      setEnabled(false);
    };

    applyConsent(readConsent());

    const handleConsentUpdate = (event: Event) => {
      applyConsent((event as CustomEvent<ConsentState>).detail);
    };

    window.addEventListener(CONSENT_UPDATED_EVENT, handleConsentUpdate);
    return () => window.removeEventListener(CONSENT_UPDATED_EVENT, handleConsentUpdate);
  }, [pathname]);

  useEffect(() => {
    if (!enabled || !MEASUREMENT_ID || !window.gtag) return;

    window.gtag('event', 'page_view', {
      page_location: `${window.location.origin}${pathname}`,
      page_path: pathname,
      page_title: document.title,
    });
  }, [enabled, pathname]);

  return null;
}
