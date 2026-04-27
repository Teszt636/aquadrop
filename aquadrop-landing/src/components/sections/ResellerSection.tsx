'use client';

import { type FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

const channelOptions = ['bolt', 'webshop', 'nagyker'] as const;

type SalesChannel = (typeof channelOptions)[number];

type FormState = {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  website: string;
  sales_channel: SalesChannel | '';
  message: string;
};

const INITIAL_FORM_STATE: FormState = {
  company_name: '',
  contact_name: '',
  email: '',
  phone: '',
  website: '',
  sales_channel: '',
  message: ''
};

export function ResellerSection() {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedCompanyName = formState.company_name.trim();
    const trimmedContactName = formState.contact_name.trim();
    const normalizedEmail = formState.email.trim().toLowerCase();
    const trimmedPhone = formState.phone.trim();
    const trimmedWebsite = formState.website.trim();
    const trimmedMessage = formState.message.trim();

    if (
      !trimmedCompanyName ||
      !trimmedContactName ||
      !normalizedEmail ||
      !trimmedPhone ||
      !formState.sales_channel
    ) {
      setErrorMessage('Kérlek, töltsd ki az összes kötelező mezőt.');

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
          formType: 'reseller_application',
          payload: {
            company_name: trimmedCompanyName,
            contact_name: trimmedContactName,
            email: normalizedEmail,
            phone: trimmedPhone,
            website: trimmedWebsite || null,
            sales_channel: formState.sales_channel,
            message: trimmedMessage || null
          }
        })
      });

      if (!response.ok) {
        const responseBody = await response.text();
        console.error('[reseller-submit] Submit route returned non-OK response', {
          status: response.status,
          responseBody
        });
        throw new Error(`Submit route returned status ${response.status}. Body: ${responseBody}`);
      }
      const result = (await response.json()) as { success?: boolean };

      if (!result.success) {
        throw new Error('Submit route returned unsuccessful response.');
      }

      router.push('/koszonjuk/viszontelado');
    } catch (error) {
      console.error('[reseller-submit]', error);
      setErrorMessage('Hiba történt a jelentkezés elküldése közben. Kérlek, próbáld újra.');
      setIsSubmitting(false);
    }
  };

  return (
    <form
      id="reseller-application-form"
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-cyan-200/25 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950/85 p-6 shadow-[0_24px_52px_-42px_rgba(8,145,178,0.5)] backdrop-blur-md lg:flex lg:h-full lg:flex-col"
    >
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-cyan-200/90">Kapcsolatfelvételi űrlap</p>

      <div className="grid gap-4 lg:grid-cols-1">
        <label className="grid gap-1.5 text-sm font-medium text-slate-100" htmlFor="reseller-company-name">
          Cégnév
          <input
            id="reseller-company-name"
            type="text"
            name="company_name"
            required
            value={formState.company_name}
            onChange={(event) => setFormState((previous) => ({ ...previous, company_name: event.target.value }))}
            disabled={isSubmitting}
            className="h-11 rounded-xl border border-white/20 bg-slate-950/70 px-3 text-base text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/40"
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-slate-100" htmlFor="reseller-contact-name">
          Név
          <input
            id="reseller-contact-name"
            type="text"
            name="contact_name"
            required
            value={formState.contact_name}
            onChange={(event) => setFormState((previous) => ({ ...previous, contact_name: event.target.value }))}
            disabled={isSubmitting}
            className="h-11 rounded-xl border border-white/20 bg-slate-950/70 px-3 text-base text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/40"
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-slate-100" htmlFor="reseller-email">
          Email
          <input
            id="reseller-email"
            type="email"
            name="email"
            required
            value={formState.email}
            onChange={(event) => setFormState((previous) => ({ ...previous, email: event.target.value }))}
            disabled={isSubmitting}
            className="h-11 rounded-xl border border-white/20 bg-slate-950/70 px-3 text-base text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/40"
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-slate-100" htmlFor="reseller-phone">
          Telefon
          <input
            id="reseller-phone"
            type="tel"
            name="phone"
            required
            value={formState.phone}
            onChange={(event) => setFormState((previous) => ({ ...previous, phone: event.target.value }))}
            disabled={isSubmitting}
            className="h-11 rounded-xl border border-white/20 bg-slate-950/70 px-3 text-base text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/40"
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-slate-100" htmlFor="reseller-website">
          Weboldal (opcionális)
          <input
            id="reseller-website"
            type="url"
            name="website"
            value={formState.website}
            onChange={(event) => setFormState((previous) => ({ ...previous, website: event.target.value }))}
            disabled={isSubmitting}
            className="h-11 rounded-xl border border-white/20 bg-slate-950/70 px-3 text-base text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/40"
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-slate-100" htmlFor="reseller-sales-channel">
          Értékesítési csatorna
          <select
            id="reseller-sales-channel"
            name="sales_channel"
            required
            value={formState.sales_channel}
            onChange={(event) =>
              setFormState((previous) => ({
                ...previous,
                sales_channel: event.target.value as SalesChannel | ''
              }))
            }
            disabled={isSubmitting}
            className="h-11 rounded-xl border border-white/20 bg-slate-950/70 px-3 text-base text-slate-100 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/40"
          >
            <option value="" disabled>
              Válassz csatornát
            </option>
            {channelOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-slate-100" htmlFor="reseller-message">
          Üzenet (opcionális)
          <textarea
            id="reseller-message"
            name="message"
            rows={4}
            value={formState.message}
            onChange={(event) => setFormState((previous) => ({ ...previous, message: event.target.value }))}
            disabled={isSubmitting}
            className="rounded-xl border border-white/20 bg-slate-950/70 px-3 py-2 text-base text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/40"
          />
        </label>

        {errorMessage ? <p className="text-sm text-red-200">{errorMessage}</p> : null}

        <p className="text-sm text-cyan-100">2 munkanapon belül felvesszük veled a kapcsolatot.</p>
      </div>

      <div className="mt-5 grid gap-3 lg:mt-auto">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-300 via-cyan-400 to-sky-400 px-6 text-base font-semibold text-slate-950 shadow-[0_10px_20px_-14px_rgba(34,211,238,0.72)] transition hover:from-cyan-200 hover:via-cyan-300 hover:to-sky-300 disabled:cursor-not-allowed disabled:from-cyan-200 disabled:to-cyan-200"
        >
          {isSubmitting ? 'Küldés...' : 'Partnerként jelentkezem'}
        </button>

        <p className="text-sm text-slate-300">A jelentkezés nem jár kötelezettséggel.</p>
      </div>
    </form>
  );
}
