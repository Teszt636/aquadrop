'use client';

import { type ChangeEvent, type FormEvent, type PointerEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/Button';
import { SectionDescription, SectionEyebrow, SectionHeading } from '@/components/ui/SectionHeading';
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

const ACCEPTED_RECEIPT_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'avif']);

function isAcceptedReceiptFile(file: File): boolean {
  const normalizedMimeType = file.type.trim().toLowerCase();
  const mimeAccepted =
    normalizedMimeType === 'image/jpeg' ||
    normalizedMimeType === 'image/png' ||
    normalizedMimeType === 'image/webp' ||
    normalizedMimeType === 'image/heic' ||
    normalizedMimeType === 'image/heif' ||
    normalizedMimeType === 'image/avif';

  if (mimeAccepted) {
    return true;
  }

  const fileName = file.name.trim().toLowerCase();
  const extension = fileName.includes('.') ? fileName.split('.').pop() ?? '' : '';

  return ACCEPTED_RECEIPT_EXTENSIONS.has(extension);
}

export function GiftSection() {
  const router = useRouter();
  const purchaseDateInputRef = useRef<HTMLInputElement | null>(null);

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

    if (!isAcceptedReceiptFile(file)) {
      setReceiptFile(null);
      setErrorMessage('Kérlek, JPG, PNG, WEBP, HEIC, HEIF vagy AVIF képfájlt tölts fel.');
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

    let hasRedirected = false;

    try {
      setIsSubmitting(true);

      const trimmedFullName = formState.full_name.trim();
      const trimmedEmail = formState.email.trim();
      const trimmedPhone = formState.phone.trim();
      const trimmedShippingAddress = formState.shipping_address.trim();
      const trimmedPurchaseLocation = formState.purchase_location.trim();

      const receiptUpload = await uploadGiftReceipt(receiptFile);
      const response = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          formType: 'gift_claim',
          payload: {
            full_name: trimmedFullName,
            email: trimmedEmail,
            phone: trimmedPhone,
            shipping_address: trimmedShippingAddress,
            purchase_location: trimmedPurchaseLocation,
            purchase_date: formState.purchase_date,
            consent: formState.consent,
            purchase_declaration: formState.purchase_declaration,
            receipt_url: receiptUpload?.publicUrl ?? null,
            receipt_path: receiptUpload?.path ?? null
          }
        })
      });

      if (!response.ok) {
        const responseBody = await response.text();
        console.error('[gift-submit] Submit route returned non-OK response', {
          status: response.status,
          responseBody
        });
        throw new Error(`Submit route returned status ${response.status}. Body: ${responseBody}`);
      }
      const result = (await response.json()) as { success?: boolean };

      if (!result.success) {
        throw new Error('Submit route returned unsuccessful response.');
      }

      hasRedirected = true;
      router.push('/koszonjuk/ajandek');
    } catch (error) {
      console.error(error);
      setErrorMessage('Hiba történt a beküldés során. Kérlek, próbáld újra.');
    } finally {
      if (!hasRedirected) {
        setIsSubmitting(false);
      }
    }
  };

  const handlePurchaseDatePointerDown = (event: PointerEvent<HTMLInputElement>) => {
    if (event.pointerType !== 'mouse') return;
    if (typeof window === 'undefined') return;

    const input = purchaseDateInputRef.current;

    if (!input || !('showPicker' in input)) return;

    event.preventDefault();
    input.showPicker();
  };

  return (
    <section className="py-20">
      <div
        id="gift-form"
        className="ds-floating-panel-strong mx-auto w-full max-w-5xl scroll-mt-8 p-5 sm:px-6 md:scroll-mt-28 md:p-6 lg:scroll-mt-12 lg:p-7"
      >
        <div className="grid items-stretch gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:gap-6">
          <div className="flex h-full flex-col rounded-3xl border border-white/45 bg-white/85 p-6 shadow-[0_25px_70px_rgba(15,23,42,0.12)] backdrop-blur-md md:p-7">
            <div>
              <div className="text-center md:text-left">
                <SectionEyebrow className="inline-flex rounded-full border border-blue-200 bg-blue-100/70 text-center px-3 py-1 text-xs font-medium normal-case tracking-normal text-blue-900">
                  Ajándék kampány
                </SectionEyebrow>
              </div>
              <h2 className="mt-4 text-center text-3xl font-bold tracking-tight text-slate-900 md:text-4xl lg:text-left">
                Ajándék mosókapszula igénylés
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-center text-base leading-6 text-slate-700 lg:mx-0 lg:text-left">
                {
                  'V\u00e1s\u00e1rolj 2 doboz Aquadrop Expert Pro mos\u00f3kapszul\u00e1t valamely viszontelad\u00f3 partner\u00fcnkn\u00e9l, t\u00f6ltsd fel a blokkot, \u00e9s ig\u00e9nyeld az aj\u00e1nd\u00e9k kapszul\u00e1t. Az oldalon k\u00f6zvetlen online v\u00e1s\u00e1rl\u00e1s nem \u00e9rhet\u0151 el.'
                }
              </p>

              <ul className="mt-5 space-y-2.5 text-sm font-medium text-slate-700 md:text-base">
                <li className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <span className="mt-0.5 text-blue-600">✓</span>
                  <span className="leading-snug">
                    {'V\u00e1s\u00e1rolj 2 doboz Aquadrop Expert Pro mos\u00f3kapszul\u00e1t viszontelad\u00f3 partner\u00fcnkn\u00e9l'}
                  </span>
                </li>
                <li className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <span className="mt-0.5 text-blue-600">✓</span>
                  <span className="leading-snug">Töltsd fel a blokk vagy blokkok képeit</span>
                </li>
                <li className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <span className="mt-0.5 text-blue-600">✓</span>
                  <span className="leading-snug">Küldjük az ajándék mosókapszulát</span>
                </li>
              </ul>
            </div>

            <p className="mt-4 md:mt-auto rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 md:text-sm">
              A beküldött adatokat kizárólag a kampány lebonyolításához használjuk fel.
            </p>
          </div>

          <form
            tabIndex={-1}
            aria-label="Ajándék mosókapszula igénylőlap"
            onSubmit={handleSubmit}
            noValidate
            className="relative z-10 w-full overflow-visible rounded-3xl border border-white/45 bg-white/85 p-6 shadow-[0_25px_70px_rgba(15,23,42,0.12)] backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 md:p-7"
          >
            <h3 className="text-xl font-semibold text-slate-900 md:text-2xl">Ajándék mosókapszula igénylőlap</h3>

            <p className="mt-2 text-sm leading-snug text-slate-600">
              {
                'T\u00f6ltsd ki az al\u00e1bbi mez\u0151ket, majd t\u00f6ltsd fel a 2 doboz megv\u00e1s\u00e1rl\u00e1s\u00e1t igazol\u00f3 blokk k\u00e9p\u00e9t az aj\u00e1nd\u00e9k ig\u00e9nyl\u00e9s\u00e9hez.'
              }
            </p>

            <div className="mt-6 grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2 md:gap-x-6 md:gap-y-5">
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
                  className="h-12 w-full max-w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 md:text-base"
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
                  className="h-12 w-full max-w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 md:text-base"
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
                  className="h-12 w-full max-w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 md:text-base"
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
                  className="h-12 w-full max-w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 md:text-base"
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
                  className="h-12 w-full max-w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 md:text-base"
                />
              </label>

              <label className="grid gap-1 text-sm font-semibold text-slate-700" htmlFor="gift-purchase-date">
                Vásárlás dátuma *
                <input
                  id="gift-purchase-date"
                  ref={purchaseDateInputRef}
                  name="purchase_date"
                  type="date"
                  required
                  value={formState.purchase_date ?? ''}
                  max={maxPurchaseDate}
                  onChange={handleChange}
                  onPointerDown={handlePurchaseDatePointerDown}
                  disabled={isSubmitting}
                  className={`gift-date-input h-12 w-full min-w-0 max-w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 md:text-base ${
                    !formState.purchase_date ? 'is-empty' : ''
                  }`}
                />
              </label>

              <div className="grid max-w-full gap-1 text-sm font-semibold text-slate-700">
                <span>Blokk feltöltése *</span>

                <input
                  id="gift-receipt-file"
                  name="receipt_file"
                  type="file"
                  required
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/avif,.jpg,.jpeg,.png,.webp,.heic,.heif,.avif"
                  onChange={handleReceiptChange}
                  disabled={isSubmitting}
                  className="sr-only"
                />

                <label
                  htmlFor="gift-receipt-file"
                  className="group flex h-12 w-full min-w-0 max-w-full cursor-pointer items-center overflow-hidden rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition hover:border-blue-400 hover:bg-slate-50 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 md:text-base"
                >
                  <span className="block w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                    {receiptFile ? receiptFile.name : 'Blokk képének kiválasztása'}
                  </span>
                </label>
              </div>

              <p className="text-xs font-normal leading-tight text-slate-500 md:col-span-2 md:text-sm">
                Ha a 2 termék 2 külön blokkon szerepel, kérjük, a két blokkot egyetlen jól olvasható
                közös képen töltsd fel. Kérjük, ügyelj arra, hogy a vásárlás adatai jól olvashatók
                legyenek.
              </p>

              <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 md:col-span-2">
                <input
                  type="checkbox"
                  name="consent"
                  checked={formState.consent}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm leading-snug text-slate-700">
                  Elolvastam és elfogadom az adatkezelési tájékoztatót.
                </span>
              </label>

              <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 md:col-span-2">
                <input
                  type="checkbox"
                  name="purchase_declaration"
                  checked={formState.purchase_declaration}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm leading-snug text-slate-700">
                  Kijelentem, hogy a megadott adatok valósak.
                </span>
              </label>

              {errorMessage ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 md:col-span-2">
                  {errorMessage}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 md:col-span-2 md:flex-row md:items-center md:justify-between">
                <p className="whitespace-nowrap text-xs lowercase tracking-wide text-slate-500">
                  * kötelező mező
                </p>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 w-full rounded-xl bg-blue-600 px-6 text-white shadow-md hover:bg-blue-700 md:w-auto md:px-8 md:min-w-[17rem]"
                >
                  {isSubmitting ? 'Bek\u00fcld\u00e9s folyamatban...' : 'Felt\u00f6lt\u00f6m a blokkot \u00e9s ig\u00e9nylem az aj\u00e1nd\u00e9kot'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export function GiftConversionSection() {
  return (
    <section id="gift-campaign" className="py-20">
      <div className="ds-container">
        <div className="mx-auto max-w-5xl">
          <div className="relative z-10 mx-auto text-center">
            <SectionEyebrow className="inline-flex rounded-full border border-cyan-300/50 bg-cyan-300/15 px-4 py-1 text-sm font-medium normal-case tracking-normal text-cyan-900">
              Kiemelt ajánlat
            </SectionEyebrow>
            <SectionHeading className="mb-3 mt-3 text-4xl md:text-5xl">
              Vásárolj 2 dobozt – mi adjuk a harmadikat
            </SectionHeading>
            <SectionDescription className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              {
                'V\u00e1s\u00e1rolj 2 doboz Aquadrop Expert Pro mos\u00f3kapszul\u00e1t valamely viszontelad\u00f3 partner\u00fcnkn\u00e9l, t\u00f6ltsd fel a blokkot, \u00e9s ig\u00e9nyeld az aj\u00e1nd\u00e9k kapszul\u00e1t. Az oldalon k\u00f6zvetlen online v\u00e1s\u00e1rl\u00e1s nem \u00e9rhet\u0151 el.'
              }
            </SectionDescription>

            <div className="mt-5 inline-flex rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
              Az ajándék kampány korlátozott ideig érhető el.
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <article className="rounded-2xl bg-white p-6 text-center shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="mb-3 text-3xl">🛒</div>
              <h3 className="text-lg font-semibold text-slate-900">Vásárolj 2 dobozt</h3>
            </article>
            <article className="rounded-2xl bg-white p-6 text-center shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="mb-3 text-3xl">📸</div>
              <h3 className="text-lg font-semibold text-slate-900">Töltsd fel a blokkot</h3>
            </article>
            <article className="rounded-2xl bg-white p-6 text-center shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="mb-3 text-3xl">🎁</div>
              <h3 className="text-lg font-semibold text-slate-900">Kapd meg az ajándékot</h3>
            </article>
          </div>

          <div className="mt-10 text-center">
            <a
              href="#gift-form"
              className="inline-flex rounded-xl bg-blue-600 px-6 py-3 text-white shadow-lg transition hover:scale-105 hover:bg-blue-700"
            >
              {'Felt\u00f6lt\u00f6m a blokkot \u00e9s ig\u00e9nylem az aj\u00e1nd\u00e9kot'}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
