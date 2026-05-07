'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CONSENT_KEY, type ConsentChoice } from '@/lib/consent';

function updateGoogleConsent(choice: ConsentChoice) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }

  const deniedState = {
    ad_storage: 'denied',
    analytics_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  } as const;

  if (choice === 'accepted') {
    window.gtag('consent', 'update', {
      ad_storage: 'granted',
      analytics_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted'
    });
    return;
  }

  window.gtag('consent', 'update', deniedState);
}

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const storedConsent = window.localStorage.getItem(CONSENT_KEY) as ConsentChoice | null;

    if (!storedConsent) {
      setIsVisible(true);
      return;
    }

    updateGoogleConsent(storedConsent);
  }, []);

  const handleChoice = (value: ConsentChoice) => {
    window.localStorage.setItem(CONSENT_KEY, value);
    updateGoogleConsent(value);
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-[0_30px_90px_-30px_rgba(15,23,42,0.65)] md:p-8 md:text-left">
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-slate-700 md:text-base">
            Ez a weboldal sütiket használ a működéshez és statisztikai célokra. A statisztikai sütik csak az Ön hozzájárulása után töltődnek be.
          </p>
          <div className="flex flex-col gap-2 text-sm font-medium text-brand-primary sm:flex-row sm:items-center sm:gap-4">
            <Link className="inline-flex underline-offset-2 transition hover:underline" href="/adatvedelmi-tajekoztato">
              Adatvédelmi tájékoztató
            </Link>
            <Link className="inline-flex underline-offset-2 transition hover:underline" href="/suti-tajekoztato">
              Süti tájékoztató
            </Link>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
            onClick={() => handleChoice('rejected')}
            type="button"
          >
            Elutasítom
          </button>
          <button
            className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            onClick={() => handleChoice('accepted')}
            type="button"
          >
            Elfogadom
          </button>
        </div>
      </div>
    </div>
  );
}
