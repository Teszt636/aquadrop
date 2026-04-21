'use client';

import { type FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/Button';
import { SectionDescription, SectionHeading } from '@/components/ui/SectionHeading';

type FormState = {
  name: string;
  email: string;
  phone: string;
  consent: boolean;
};

const INITIAL_FORM_STATE: FormState = {
  name: '',
  email: '',
  phone: '',
  consent: false
};

export function AnnouncementSection() {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = formState.name.trim();
    const trimmedEmail = formState.email.trim();
    const trimmedPhone = formState.phone.trim();

    if (!trimmedName || !trimmedEmail || !formState.consent) {
      setErrorMessage('Kérlek, töltsd ki a kötelező mezőket és fogadd el az adatkezelést.');

      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
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
            phone: trimmedPhone || null,
            consent: formState.consent
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Submit route returned status ${response.status}`);
      }
      const result = (await response.json()) as { success?: boolean };

      if (!result.success) {
        throw new Error('Submit route returned unsuccessful response.');
      }

      router.push('/koszonjuk/feliratkozas');
    } catch {
      setErrorMessage('Hiba történt a feliratkozás során. Kérlek, próbáld újra.');
      setIsSubmitting(false);
    }
  };

  return (
    <section className="ds-section" id="announcement-signup">
      <div className="ds-container">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-card md:p-12">
          <div className="text-center">
            <SectionHeading>Értesülj elsőként az új Aquadrop Expert Pro ajánlatokról</SectionHeading>
            <SectionDescription className="mx-auto">
              Iratkozz fel, és elsőként értesülsz az újdonságokról, kampányokról és bevezető ajánlatokról.
            </SectionDescription>
          </div>

          <form className="mx-auto mt-8 max-w-xl space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="announcement-name">
                Név
              </label>
              <input
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                id="announcement-name"
                name="name"
                placeholder="Add meg a neved"
                type="text"
                required
                value={formState.name}
                onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="announcement-email">
                E-mail
              </label>
              <input
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                id="announcement-email"
                name="email"
                placeholder="Add meg az e-mail címed"
                type="email"
                required
                value={formState.email}
                onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="announcement-phone">
                Telefonszám (opcionális)
              </label>
              <input
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                id="announcement-phone"
                name="phone"
                placeholder="Add meg a telefonszámod"
                type="tel"
                value={formState.phone}
                onChange={(event) => setFormState((prev) => ({ ...prev, phone: event.target.value }))}
                disabled={isSubmitting}
              />
            </div>

            <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 text-sm text-slate-700">
              <input
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary/30"
                type="checkbox"
                name="consent"
                checked={formState.consent}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    consent: event.target.checked
                  }))
                }
                disabled={isSubmitting}
                required
              />
              <span>Elfogadom az adatkezelési tájékoztatót és hozzájárulok az adataim kezeléséhez.</span>
            </label>

            {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Küldés...' : 'Elsőként szeretnék értesülni'}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
