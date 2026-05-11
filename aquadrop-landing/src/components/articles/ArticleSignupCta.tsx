'use client';

import Link from 'next/link';
import { type FormEvent, useState } from 'react';

type ArticleSignupCtaProps = {
  source?: string;
  title?: string;
  description?: string;
};

type FormState = {
  name: string;
  email: string;
};

const INITIAL_FORM_STATE: FormState = {
  name: '',
  email: ''
};

const DEFAULT_TITLE = 'Kérsz még praktikus mosási tippeket?';
const DEFAULT_DESCRIPTION =
  'Iratkozz fel, és értesítünk az Aquadrop újdonságokról, promóciókról és hasznos mosási útmutatókról.';

export function ArticleSignupCta({
  source,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION
}: ArticleSignupCtaProps) {
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'success' | 'error' | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = formState.name.trim();
    const trimmedEmail = formState.email.trim();

    if (!trimmedName || !trimmedEmail) {
      setStatus('error');
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const trimmedSource = source?.trim();
      const response = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          formType: 'announcement_signup',
          payload: {
            name: trimmedName,
            email: trimmedEmail,
            phone: null,
            consent: true,
            ...(trimmedSource ? { source: trimmedSource } : {})
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Article signup failed with status ${response.status}.`);
      }

      const result = (await response.json()) as { success?: boolean };

      if (!result.success) {
        throw new Error('Article signup returned an unsuccessful response.');
      }

      setFormState(INITIAL_FORM_STATE);
      setStatus('success');
    } catch (error) {
      console.error('[article-signup-submit]', { error, source });
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className="my-10 rounded-[2rem] border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-blue-50 p-5 shadow-[0_20px_60px_rgba(15,118,110,0.10)] md:p-7"
      data-source={source}
    >
      <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">MOSÁSI TIPPEK ÉS ÚJDONSÁGOK</p>
          <p className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950 md:text-3xl">{title}</p>
          <p className="mt-3 text-sm leading-6 text-slate-700 md:text-base">{description}</p>
        </div>

        {status === 'success' ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 text-emerald-950 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-base font-extrabold text-white">
                ✓
              </div>
              <div>
                <p className="text-base font-extrabold">Sikeres feliratkozás</p>
                <p className="mt-2 text-sm leading-6 text-emerald-900">
                  Köszönjük, feliratkoztál az Aquadrop mosási tippjeire. Értesítünk az újdonságokról,
                  promóciókról és hasznos útmutatókról.
                </p>
                <p className="mt-3 text-sm font-semibold text-emerald-800">
                  Addig is böngéssz tovább a kapcsolódó útmutatók között.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form className="space-y-3" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="sr-only" htmlFor={`article-signup-name-${source ?? 'default'}`}>
                Név
              </label>
              <input
                className="w-full rounded-xl border border-cyan-100 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                id={`article-signup-name-${source ?? 'default'}`}
                name="name"
                placeholder="Név"
                required
                type="text"
                value={formState.name}
                onChange={(event) => setFormState((previous) => ({ ...previous, name: event.target.value }))}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="sr-only" htmlFor={`article-signup-email-${source ?? 'default'}`}>
                Email
              </label>
              <input
                className="w-full rounded-xl border border-cyan-100 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                id={`article-signup-email-${source ?? 'default'}`}
                name="email"
                placeholder="Email"
                required
                type="email"
                value={formState.email}
                onChange={(event) => setFormState((previous) => ({ ...previous, email: event.target.value }))}
                disabled={isSubmitting}
              />
            </div>

            <button
              className="inline-flex w-full items-center justify-center rounded-xl bg-cyan-700 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Küldés...' : 'Feliratkozom'}
            </button>

            {status === 'error' ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold leading-5 text-red-700">
                Nem sikerült a feliratkozás. Kérjük, próbáld újra később.
              </p>
            ) : null}

            <p className="text-xs leading-5 text-slate-600">
              A feliratkozással elfogadod az{' '}
              <Link
                className="font-semibold text-cyan-800 underline-offset-4 hover:underline"
                href="/adatvedelmi-tajekoztato"
              >
                adatvédelmi tájékoztatót
              </Link>
              . Bármikor leiratkozhatsz.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
