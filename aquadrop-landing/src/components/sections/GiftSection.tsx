'use client';

import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/Button';
import { SectionDescription, SectionEyebrow, SectionHeading } from '@/components/ui/SectionHeading';
import { insertIntoTable } from '@/lib/supabase';
import { uploadGiftReceipt } from '@/lib/supabase-storage';
import { captureLeadForAutomation } from '@/lib/lead-automation';

type GiftFormState = {
  full_name: string;
  email: string;
  phone: string;
  shipping_address: string;
  purchase_location: string;
  purchase_date: string;
  consent: boolean;
  purchase_declaration: boolean;
};

const INITIAL_FORM_STATE: GiftFormState = {
  full_name: '',
  email: '',
  phone: '',
  shipping_address: '',
  purchase_location: '',
  purchase_date: '',
  consent: false,
  purchase_declaration: false
};

const steps = [
  'Vásárolj 2 doboz Aquadrop Expert Pro mosókapszulát egy viszonteladó partnernél',
  'Töltsd fel a blokkot ezen az oldalon',
  'Ellenőrizzük a vásárlást',
  'Jóváhagyás után megkapod az ajándék terméket'
];

export function GiftSection() {
  const router = useRouter();

  const [formState, setFormState] = useState<GiftFormState>(INITIAL_FORM_STATE);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [maxPurchaseDate, setMaxPurchaseDate] = useState('');

  useEffect(() => {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
      .toISOString()
      .slice(0, 10);

    setMaxPurchaseDate(localDate);
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = event.target;

    setFormState((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? (event.target as HTMLInputElement).checked : value ?? ''
    }));
  };

  const handleReceiptChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setReceiptFile(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setReceiptFile(null);
      setErrorMessage('Kérlek, csak képfájlt tölts fel a blokkhoz.');
      event.target.value = '';
      return;
    }

    setErrorMessage(null);
    setReceiptFile(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    setErrorMessage(null);

    if (!receiptFile) {
      setErrorMessage('Kérlek, töltsd fel a blokk képét.');
      return;
    }

    if (!formState.consent) {
      setErrorMessage('Az adatkezelési tájékoztató elfogadása kötelező.');
      return;
    }

    if (!formState.purchase_declaration) {
      setErrorMessage('A nyilatkozat elfogadása kötelező.');
      return;
    }

    try {
      setIsSubmitting(true);

      const receiptUpload = await uploadGiftReceipt(receiptFile);

      await insertIntoTable('gift_claims', {
        full_name: formState.full_name.trim(),
        email: formState.email.trim(),
        phone: formState.phone.trim(),
        shipping_address: formState.shipping_address.trim(),
        purchase_location: formState.purchase_location.trim(),
        purchase_date: formState.purchase_date,
        consent: formState.consent,
        purchase_declaration: formState.purchase_declaration,
        receipt_url: receiptUpload?.url ?? null,
        receipt_path: receiptUpload?.path ?? null
      });

      captureLeadForAutomation(
        'gift_form_submit',
        {
          source: 'gift_claim',
          email: formState.email.trim()
        },
        {
          lead_type: 'gift_campaign',
          source: 'gift_claim',
          full_name: formState.full_name.trim(),
          email: formState.email.trim(),
          phone: formState.phone.trim(),
          metadata: {
            purchase_location: formState.purchase_location.trim(),
            purchase_date: formState.purchase_date
          }
        }
      );

      setFormState(INITIAL_FORM_STATE);
      setReceiptFile(null);

      router.push('/koszonjuk');
    } catch (error) {
      console.error(error);
      setErrorMessage('Hiba történt a beküldés során. Kérlek, próbáld újra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="gift-campaign" className="ds-section">
      <div className="ds-container">
        <div className="relative rounded-3xl border border-brand-primary/20 bg-[linear-gradient(180deg,#eff6ff_0%,#f8fbff_100%)] px-4 py-8 sm:px-6 sm:py-10 md:px-10 md:py-12">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-brand-primary/20" />

          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <SectionEyebrow>Kiemelt ajánlat</SectionEyebrow>
            <SectionHeading className="mt-3">Vásárolj 2 dobozt – mi adjuk a harmadikat</SectionHeading>
            <SectionDescription className="mx-auto mt-4 max-w-3xl">
              Vásárolj 2 doboz Aquadrop Expert Pro mosókapszulát valamelyik partner üzletben,
              töltsd fel a blokkot, és elküldjük a 3. dobozt ajándékba.
            </SectionDescription>

            <div className="mt-5 inline-flex rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
              Az ajándék kampány korlátozott ideig érhető el.
            </div>
          </div>

          <div className="relative z-10 mx-auto mt-8 max-w-4xl rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:p-5 md:mt-10 md:p-6">
            <h3 className="text-lg font-bold text-slate-900 md:text-xl">Hogyan működik?</h3>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                >
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-brand-primary">
                    {index + 1}. lépés
                  </span>
                  <span className="block leading-6">{step}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              <p>Az oldalon közvetlen vásárlás nem lehetséges.</p>
              <p>Csak partnernél történt vásárlással vehető igénybe a promóció.</p>
              <p>
                A blokk feltöltése önmagában nem jelent automatikus jogosultságot, az igénylést
                ellenőrizzük.
              </p>
            </div>
          </div>

          <form
            id="gift-claim-form"
            tabIndex={-1}
            aria-label="Ajándék mosókapszula igénylőlap"
            onSubmit={handleSubmit}
            noValidate
            className="relative z-10 mx-auto mt-8 max-w-3xl scroll-mt-6 overflow-visible rounded-2xl border border-brand-primary/15 bg-white/85 p-4 shadow-xl backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30 sm:p-5 md:mt-10 md:p-8"
          >
            <h3 className="text-xl font-semibold text-slate-900">Ajándék mosókapszula igénylőlap</h3>

            <p className="mt-2 text-sm leading-tight text-slate-600">
              Töltsd ki az alábbi mezőket, majd töltsd fel a vásárlási blokk képét.
            </p>

            <p className="mt-2 text-xs leading-tight text-slate-500 md:text-sm">
              A beküldött adatokat kizárólag a kampány lebonyolításához használjuk fel.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-x-4 gap-y-3 md:mt-6 md:grid-cols-2 md:gap-x-6 md:gap-y-5">
              <label className="grid gap-1 text-sm font-semibold text-slate-700" htmlFor="gift-full-name">
                Teljes név *
                <input
                  id="gift-full-name"
                  name="full_name"
                  type="text"
                  required
                  value={formState.full_name ?? ''}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="pl. Kovács Péter"
                  className="h-10 w-full max-w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 md:h-11 md:px-4 md:py-3 md:text-base"
                />
              </label>

              <label className="grid gap-1 text-sm font-semibold text-slate-700" htmlFor="gift-email">
                E-mail cím *
                <input
                  id="gift-email"
                  name="email"
                  type="email"
                  required
                  value={formState.email ?? ''}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="pl. te@pelda.hu"
                  className="h-10 w-full max-w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 md:h-11 md:px-4 md:py-3 md:text-base"
                />
              </label>

              <label className="grid gap-1 text-sm font-semibold text-slate-700" htmlFor="gift-phone">
                Telefonszám *
                <input
                  id="gift-phone"
                  name="phone"
                  type="tel"
                  required
                  value={formState.phone ?? ''}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="pl. +36 30 123 4567"
                  className="h-10 w-full max-w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 md:h-11 md:px-4 md:py-3 md:text-base"
                />
              </label>

              <label className="grid gap-1 text-sm font-semibold text-slate-700" htmlFor="gift-purchase-location">
                Vásárlás helye *
                <input
                  id="gift-purchase-location"
                  name="purchase_location"
                  type="text"
                  required
                  value={formState.purchase_location ?? ''}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="pl. Auchan, Kecskemét"
                  className="h-10 w-full max-w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 md:h-11 md:px-4 md:py-3 md:text-base"
                />
              </label>

              <label
                className="grid gap-1 text-sm font-semibold text-slate-700 md:col-span-2"
                htmlFor="gift-shipping-address"
              >
                Szállítási cím *
                <input
                  id="gift-shipping-address"
                  name="shipping_address"
                  type="text"
                  required
                  value={formState.shipping_address ?? ''}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="pl. Budapest, Példa utca 1."
                  className="h-10 w-full max-w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 md:h-11 md:px-4 md:py-3 md:text-base"
                />
              </label>

              <label className="grid gap-1 text-sm font-semibold text-slate-700" htmlFor="gift-purchase-date">
                Vásárlás dátuma *
                <input
                  id="gift-purchase-date"
                  name="purchase_date"
                  type="date"
                  required
                  value={formState.purchase_date ?? ''}
                  max={maxPurchaseDate}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="gift-date-input h-10 w-full min-w-0 max-w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 md:h-11 md:px-4 md:text-base"
                />
              </label>

              <div className="grid max-w-full gap-1 text-sm font-semibold text-slate-700">
                <span>Blokk feltöltése *</span>

                <input
                  id="gift-receipt-file"
                  name="receipt_file"
                  type="file"
                  required
                  accept="image/*"
                  onChange={handleReceiptChange}
                  disabled={isSubmitting}
                  className="sr-only"
                />

                <label
                  htmlFor="gift-receipt-file"
                  className="group flex h-10 w-full max-w-full cursor-pointer items-center rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition hover:border-brand-primary/60 hover:bg-slate-50 focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/20 md:h-11 md:px-4 md:py-3 md:text-base"
                >
                  <span className="w-full truncate overflow-hidden whitespace-nowrap">
                    {receiptFile ? receiptFile.name : 'Blokk képének kiválasztása'}
                  </span>
                </label>

                <p className="mt-1 text-xs font-normal leading-tight text-slate-500 md:text-sm">
                  Ha a 2 termék 2 külön blokkon szerepel, kérjük, a két blokkot egyetlen jól
                  olvasható közös képen töltsd fel. Kérjük, ügyelj arra, hogy a vásárlás adatai jól
                  olvashatók legyenek.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <input
                  type="checkbox"
                  name="consent"
                  checked={formState.consent}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="mt-1 h-5 w-5 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                />
                <span className="text-sm leading-6 text-slate-700">
                  Elolvastam és elfogadom az adatkezelési tájékoztatót.
                </span>
              </label>

              <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <input
                  type="checkbox"
                  name="purchase_declaration"
                  checked={formState.purchase_declaration}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="mt-1 h-5 w-5 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                />
                <span className="text-sm leading-6 text-slate-700">
                  Kijelentem, hogy a megadott adatok valósak, és a vásárlás a promóció feltételeinek
                  megfelelően történt.
                </span>
              </label>
            </div>

            {errorMessage ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            <div className="mt-6">
              <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                {isSubmitting ? 'Beküldés folyamatban...' : 'Ajándék igénylés beküldése'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
