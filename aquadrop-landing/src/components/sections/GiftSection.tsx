'use client';

import { type ChangeEvent, type FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/Button';
import { insertIntoTable } from '@/lib/supabase';
import { uploadGiftReceipt } from '@/lib/supabase-storage';

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

export function GiftSection() {
  const router = useRouter();
  const [formState, setFormState] = useState<GiftFormState>(INITIAL_FORM_STATE);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = event.target;

    setFormState((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? (event.target as HTMLInputElement).checked : value
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

    const payload = {
      full_name: formState.full_name.trim(),
      email: formState.email.trim(),
      phone: formState.phone.trim(),
      shipping_address: formState.shipping_address.trim(),
      purchase_location: formState.purchase_location.trim(),
      purchase_date: formState.purchase_date,
      consent: formState.consent,
      purchase_declaration: formState.purchase_declaration
    };

    if (
      !payload.full_name ||
      !payload.email ||
      !payload.phone ||
      !payload.shipping_address ||
      !payload.purchase_location ||
      !payload.purchase_date ||
      !payload.consent ||
      !payload.purchase_declaration
    ) {
      setErrorMessage('Kérlek, töltsd ki a kötelező mezőket, és fogadd el a nyilatkozatokat.');

      return;
    }

    if (!receiptFile) {
      setErrorMessage('Kérlek, töltsd fel a blokk képét.');

      return;
    }

    if (!receiptFile.type.startsWith('image/')) {
      setErrorMessage('Kérlek, csak képfájlt tölts fel a blokkhoz.');

      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const receiptFileUrl = await uploadGiftReceipt(receiptFile);

      await insertIntoTable('gift_claims', {
        ...payload,
        receipt_file_url: receiptFileUrl,
        status: 'uj'
      });

      router.push('/koszonjuk/ajandek');
    } catch {
      setErrorMessage('Hiba történt a blokk feltöltése vagy az igénylés elküldése közben. Kérlek, próbáld újra.');
      setIsSubmitting(false);
    }
  };

  return (
    <section className="ds-section bg-white" id="gift-campaign">
      <div className="ds-container">
        <div className="relative overflow-hidden rounded-3xl border-2 border-brand-primary/30 bg-gradient-to-br from-brand-light via-white to-success-green/10 p-8 shadow-card md:p-12">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-success-green/20 blur-3xl" />

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <p className="inline-flex rounded-full border border-brand-primary/30 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-brand-primary">
              Kiemelt ajánlat
            </p>
            <h2 className="mt-4 text-3xl leading-tight md:text-5xl">Vásárolj 2 dobozt – mi adunk egy harmadikat</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-700">
              Vásárolj 2 doboz Aquadrop Expert Pro terméket, töltsd fel a blokkot, és a 3. dobozt mi küldjük ajándékba.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="relative z-10 mx-auto mt-10 max-w-3xl rounded-2xl border border-brand-primary/15 bg-white/85 p-6 shadow-xl backdrop-blur-sm md:p-8"
          >
            <h3 className="text-xl font-semibold text-slate-900">Ajándékdoboz igénylőlap</h3>
            <p className="mt-2 text-sm text-slate-600">
              Töltsd ki az alábbi mezőket magyarul, majd töltsd fel a vásárlási blokk képét.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-semibold text-slate-700" htmlFor="gift-full-name">
                Teljes név *
                <input
                  id="gift-full-name"
                  name="full_name"
                  type="text"
                  required
                  value={formState.full_name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="pl. Kovács Péter"
                  className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-semibold text-slate-700" htmlFor="gift-email">
                E-mail cím *
                <input
                  id="gift-email"
                  name="email"
                  type="email"
                  required
                  value={formState.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="pl. te@pelda.hu"
                  className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-semibold text-slate-700" htmlFor="gift-phone">
                Telefonszám *
                <input
                  id="gift-phone"
                  name="phone"
                  type="tel"
                  required
                  value={formState.phone}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="pl. +36 30 123 4567"
                  className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-semibold text-slate-700" htmlFor="gift-purchase-location">
                Vásárlás helye *
                <input
                  id="gift-purchase-location"
                  name="purchase_location"
                  type="text"
                  required
                  value={formState.purchase_location}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="pl. Tesco, Budapest"
                  className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-semibold text-slate-700 md:col-span-2" htmlFor="gift-shipping-address">
                Szállítási cím *
                <input
                  id="gift-shipping-address"
                  name="shipping_address"
                  type="text"
                  required
                  value={formState.shipping_address}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="pl. 1111 Budapest, Példa utca 1."
                  className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-semibold text-slate-700" htmlFor="gift-purchase-date">
                Vásárlás dátuma *
                <input
                  id="gift-purchase-date"
                  name="purchase_date"
                  type="date"
                  required
                  value={formState.purchase_date}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                />
              </label>

              <div className="grid gap-1.5 text-sm font-semibold text-slate-700">
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
                  className="group flex h-11 w-full cursor-pointer items-center rounded-lg border border-slate-300 bg-white px-3 text-base font-medium text-slate-700 outline-none transition hover:border-brand-primary/60 hover:bg-slate-50 focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/20"
                >
                  <span className="w-full truncate overflow-hidden whitespace-nowrap">
                    {receiptFile ? receiptFile.name : 'Blokk képének kiválasztása'}
                  </span>
                </label>
              </div>
              <p className="text-xs font-normal leading-5 text-slate-500 md:col-span-2">
                Ha a 2 termék 2 külön blokkon szerepel, kérjük, a két blokkot egyetlen jól olvasható közös képen töltsd
                fel. Kérjük, ügyelj arra, hogy a vásárlás adatai jól olvashatók legyenek.
              </p>
            </div>

            <div className="mt-5 space-y-3">
              <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="consent"
                  required
                  checked={formState.consent}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary/30"
                />
                <span>Elolvastam és elfogadom az adatkezelési tájékoztatót.</span>
              </label>

              <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="purchase_declaration"
                  required
                  checked={formState.purchase_declaration}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary/30"
                />
                <span>Kijelentem, hogy a megadott vásárlási adatok valósak.</span>
              </label>
            </div>

            {errorMessage ? <p className="mt-4 text-sm text-red-600">{errorMessage}</p> : null}

            <div className="mt-6 flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-xs text-slate-500">* Kötelező mezők</p>
              <Button type="submit" className="px-8 py-3 text-base" disabled={isSubmitting}>
                {isSubmitting ? 'Küldés...' : 'Ajándék dobozt igényelek'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
