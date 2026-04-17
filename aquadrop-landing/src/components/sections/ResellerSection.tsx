'use client';

import { type FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import { captureLeadForAutomation } from '@/lib/lead-automation';
import { insertIntoTable } from '@/lib/supabase';

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
    const trimmedEmail = formState.email.trim();
    const trimmedPhone = formState.phone.trim();
    const trimmedWebsite = formState.website.trim();
    const trimmedMessage = formState.message.trim();

    if (
      !trimmedCompanyName ||
      !trimmedContactName ||
      !trimmedEmail ||
      !trimmedPhone ||
      !formState.sales_channel
    ) {
      setErrorMessage('Kérlek, töltsd ki az összes kötelező mezőt.');

      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await insertIntoTable('reseller_applications', {
        company_name: trimmedCompanyName,
        contact_name: trimmedContactName,
        email: trimmedEmail,
        phone: trimmedPhone,
        website: trimmedWebsite || null,
        sales_channel: formState.sales_channel,
        message: trimmedMessage || null
      });

      captureLeadForAutomation(
        'partner_form_submit',
        {
          form_id: 'reseller-application-form',
          sales_channel: formState.sales_channel
        },
        {
          lead_type: 'reseller_application',
          email: trimmedEmail,
          phone: trimmedPhone,
          full_name: trimmedContactName,
          source: 'partner_page_reseller_form',
          metadata: {
            company_name: trimmedCompanyName,
            sales_channel: formState.sales_channel
          }
        }
      );
      router.push('/koszonjuk/viszontelado');
    } catch {
      setErrorMessage('Hiba történt a jelentkezés elküldése közben. Kérlek, próbáld újra.');
      setIsSubmitting(false);
    }
  };

  return (
    <form
      id="reseller-application-form"
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-white/15 bg-white/10 p-6 shadow-2xl shadow-cyan-900/20 backdrop-blur"
    >
      <div className="grid gap-4">
        <label className="grid gap-1.5 text-sm font-medium text-slate-100" htmlFor="reseller-company-name">
          cégnév
          <input
            id="reseller-company-name"
            type="text"
            name="company_name"
            required
            value={formState.company_name}
            onChange={(event) => setFormState((previous) => ({ ...previous, company_name: event.target.value }))}
            disabled={isSubmitting}
            className="h-11 rounded-lg border border-white/15 bg-slate-900/65 px-3 text-base text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-cyan-300"
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-slate-100" htmlFor="reseller-contact-name">
          név
          <input
            id="reseller-contact-name"
            type="text"
            name="contact_name"
            required
            value={formState.contact_name}
            onChange={(event) => setFormState((previous) => ({ ...previous, contact_name: event.target.value }))}
            disabled={isSubmitting}
            className="h-11 rounded-lg border border-white/15 bg-slate-900/65 px-3 text-base text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-cyan-300"
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-slate-100" htmlFor="reseller-email">
          email
          <input
            id="reseller-email"
            type="email"
            name="email"
            required
            value={formState.email}
            onChange={(event) => setFormState((previous) => ({ ...previous, email: event.target.value }))}
            disabled={isSubmitting}
            className="h-11 rounded-lg border border-white/15 bg-slate-900/65 px-3 text-base text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-cyan-300"
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-slate-100" htmlFor="reseller-phone">
          telefon
          <input
            id="reseller-phone"
            type="tel"
            name="phone"
            required
            value={formState.phone}
            onChange={(event) => setFormState((previous) => ({ ...previous, phone: event.target.value }))}
            disabled={isSubmitting}
            className="h-11 rounded-lg border border-white/15 bg-slate-900/65 px-3 text-base text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-cyan-300"
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-slate-100" htmlFor="reseller-website">
          weboldal (opcionális)
          <input
            id="reseller-website"
            type="url"
            name="website"
            value={formState.website}
            onChange={(event) => setFormState((previous) => ({ ...previous, website: event.target.value }))}
            disabled={isSubmitting}
            className="h-11 rounded-lg border border-white/15 bg-slate-900/65 px-3 text-base text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-cyan-300"
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-slate-100" htmlFor="reseller-sales-channel">
          értékesítési csatorna
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
            className="h-11 rounded-lg border border-white/15 bg-slate-900/65 px-3 text-base text-slate-100 outline-none transition focus:border-cyan-300"
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
          üzenet (opcionális)
          <textarea
            id="reseller-message"
            name="message"
            rows={4}
            value={formState.message}
            onChange={(event) => setFormState((previous) => ({ ...previous, message: event.target.value }))}
            disabled={isSubmitting}
            className="rounded-lg border border-white/15 bg-slate-900/65 px-3 py-2 text-base text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-cyan-300"
          />
        </label>

        {errorMessage ? <p className="text-sm text-red-200">{errorMessage}</p> : null}

        <p className="text-sm text-cyan-100">2 munkanapon belül felvesszük veled a kapcsolatot.</p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 inline-flex h-12 items-center justify-center rounded-lg bg-cyan-400 px-6 text-base font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-cyan-200"
        >
          {isSubmitting ? 'Küldés...' : 'Partnerként jelentkezem'}
        </button>

        <p className="text-sm text-slate-300">A jelentkezés nem jár kötelezettséggel.</p>
      </div>
    </form>
  );
}
