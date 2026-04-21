'use client';

import { useEffect, useState } from 'react';

const CONSENT_KEY = 'aquadrop_cookie_consent';

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const storedConsent = window.localStorage.getItem(CONSENT_KEY);

    if (!storedConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleChoice = (value: 'accepted' | 'rejected') => {
    window.localStorage.setItem(CONSENT_KEY, value);
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-300 bg-white/95 backdrop-blur">
      <div className="ds-container flex flex-col items-center gap-4 py-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
        <div className="space-y-2">
          <p className="text-sm text-slate-700">
            Ez a weboldal sütiket használ a működéshez és statisztikai célokra. A statisztikai sütik csak az Ön hozzájárulása után töltődnek be.
          </p>
          <a
            className="inline-flex text-sm font-medium text-brand-primary underline-offset-2 transition hover:underline"
            href="/adatvedelmi-tajekoztato"
          >
            Adatkezelési tájékoztató
          </a>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
            onClick={() => handleChoice('rejected')}
            type="button"
          >
            Elutasítom
          </button>
          <button
            className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
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
