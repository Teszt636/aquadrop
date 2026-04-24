'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { insertIntoTable } from '@/lib/supabase';
import { trackEvent } from '@/lib/tracking';

type UsageType = 'webshop' | 'offline bolt' | 'nagyker' | 'egyéb';
type SubmitStatus = 'form' | 'loading' | 'success';

type MediaKitDownloadModalProps = {
  isOpen: boolean;
  fileUrl: string | null;
  onClose: () => void;
  onDownloadStart: (fileUrl: string) => void;
};

type FormState = {
  name: string;
  email: string;
  company: string;
  usageType: UsageType;
};

const DEFAULT_FORM_STATE: FormState = {
  name: '',
  email: '',
  company: '',
  usageType: 'webshop'
};

const SESSION_STORAGE_KEY = 'aquadrop_media_kit_user';
const DOWNLOAD_DELAY_MS = 1200;

export function MediaKitDownloadModal({ isOpen, fileUrl, onClose, onDownloadStart }: MediaKitDownloadModalProps) {
  const [formState, setFormState] = useState<FormState>(DEFAULT_FORM_STATE);
  const [status, setStatus] = useState<SubmitStatus>('form');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasTriggeredDownload, setHasTriggeredDownload] = useState(false);
  const downloadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isSubmitting = status === 'loading';

  const isDisabled = useMemo(
    () =>
      isSubmitting ||
      !formState.name.trim() ||
      !formState.email.trim() ||
      !formState.usageType,
    [formState.email, formState.name, formState.usageType, isSubmitting]
  );

  useEffect(() => {
    return () => {
      if (downloadTimeoutRef.current) {
        clearTimeout(downloadTimeoutRef.current);
      }
    };
  }, []);

  function resetModalState() {
    setFormState(DEFAULT_FORM_STATE);
    setStatus('form');
    setSubmitError(null);
    setHasTriggeredDownload(false);

    if (downloadTimeoutRef.current) {
      clearTimeout(downloadTimeoutRef.current);
      downloadTimeoutRef.current = null;
    }
  }

  function handleClose() {
    resetModalState();
    onClose();
  }

  function triggerDownload(downloadUrl: string) {
    if (hasTriggeredDownload) {
      return;
    }

    onDownloadStart(downloadUrl);
    setHasTriggeredDownload(true);
  }

  if (!isOpen) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!fileUrl || isSubmitting) {
      return;
    }

    setSubmitError(null);
    setStatus('loading');

    try {
      await insertIntoTable('media_kit_downloads', {
        name: formState.name.trim(),
        email: formState.email.trim().toLowerCase(),
        company: formState.company.trim() || null,
        usage_type: formState.usageType
      });

      localStorage.setItem(SESSION_STORAGE_KEY, 'true');

      trackEvent('media_kit_lead_submit', {
        usage_type: formState.usageType
      });

      setStatus('success');

      downloadTimeoutRef.current = setTimeout(() => {
        triggerDownload(fileUrl);
      }, DOWNLOAD_DELAY_MS);
    } catch (error) {
      console.error('[media-kit-download-submit]', error);
      setSubmitError('Nem sikerült elküldeni az adatokat. Kérlek próbáld újra.');
      setStatus('form');
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-slate-900 p-6 shadow-2xl sm:p-8">
        {status === 'success' ? (
          <div className="flex flex-col items-center text-center">
            <h3 className="text-xl font-semibold text-white md:text-2xl">Köszönjük!</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">Indítjuk a letöltést...</p>
            <div className="mt-6 h-8 w-8 animate-spin rounded-full border-2 border-cyan-200/25 border-t-cyan-200" />

            <button
              type="button"
              className="mt-6 h-11 rounded-xl border border-cyan-200/30 bg-cyan-300/15 px-4 text-sm font-semibold text-cyan-100 transition hover:border-cyan-100/45 hover:bg-cyan-300/25 disabled:opacity-60"
              onClick={() => {
                if (fileUrl) {
                  triggerDownload(fileUrl);
                }
              }}
              disabled={!fileUrl || hasTriggeredDownload}
            >
              Ha nem indul el, kattints ide
            </button>

            <button
              type="button"
              className="mt-2 h-11 rounded-xl border border-white/20 px-4 text-sm font-medium text-slate-200 transition hover:bg-white/10"
              onClick={handleClose}
            >
              Bezárás
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-semibold text-white md:text-2xl">Letöltés előtt egy gyors kérdés</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">
              Az anyagok fejlesztése érdekében szeretnénk tudni, hogyan használod fel.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="block text-sm text-slate-100">
                Név *
                <input
                  type="text"
                  value={formState.name}
                  onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                  className="media-kit-modal-field mt-1 h-11 w-full rounded-xl border border-white/20 bg-white/5 px-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-200/60 focus:outline-none"
                  required
                />
              </label>

              <label className="block text-sm text-slate-100">
                E-mail *
                <input
                  type="email"
                  value={formState.email}
                  onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
                  className="media-kit-modal-field mt-1 h-11 w-full rounded-xl border border-white/20 bg-white/5 px-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-200/60 focus:outline-none"
                  required
                />
              </label>

              <label className="block text-sm text-slate-100">
                Cég
                <input
                  type="text"
                  value={formState.company}
                  onChange={(event) => setFormState((prev) => ({ ...prev, company: event.target.value }))}
                  className="media-kit-modal-field mt-1 h-11 w-full rounded-xl border border-white/20 bg-white/5 px-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-200/60 focus:outline-none"
                />
              </label>

              <label className="block text-sm text-slate-100">
                Felhasználás típusa *
                <select
                  value={formState.usageType}
                  onChange={(event) => setFormState((prev) => ({ ...prev, usageType: event.target.value as UsageType }))}
                  className="media-kit-modal-field mt-1 h-11 w-full rounded-xl border border-white/20 bg-slate-900 px-3 text-sm text-white focus:border-cyan-200/60 focus:outline-none"
                  required
                >
                  <option value="webshop">webshop</option>
                  <option value="offline bolt">offline bolt</option>
                  <option value="nagyker">nagyker</option>
                  <option value="egyéb">egyéb</option>
                </select>
              </label>

              {submitError ? <p className="text-sm text-rose-300">{submitError}</p> : null}

              <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  className="h-11 rounded-xl border border-white/20 px-4 text-sm font-medium text-slate-200 transition hover:bg-white/10"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Mégse
                </button>
                <button
                  type="submit"
                  className="h-11 rounded-xl border border-cyan-200/30 bg-cyan-300/15 px-4 text-sm font-semibold text-cyan-100 transition hover:border-cyan-100/45 hover:bg-cyan-300/25 disabled:opacity-60"
                  disabled={isDisabled}
                >
                  {isSubmitting ? 'Mentés...' : 'Letöltés indítása'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export { SESSION_STORAGE_KEY as mediaKitStorageKey };
