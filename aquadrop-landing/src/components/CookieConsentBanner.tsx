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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-[0_30px_90px_-30px_rgba(15,23,42,0.65)] md:p-8 md:text-left">
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-slate-700 md:text-base">
            Ez a weboldal sütiket használ a működéshez és statisztikai célokra. A statisztikai sütik csak az Ön hozzájárulása után töltődnek be.
          </p>
          <a
            className="inline-flex text-sm font-medium text-brand-primary underline-offset-2 transition hover:underline"
            href="/adatvedelmi-tajekoztato"
          >
            Adatkezelési tájékoztató
          </a>
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
