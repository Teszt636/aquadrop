import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { GoogleReviewCta } from '@/components/GoogleReviewCta';
import { fetchGiftClaimPublicStatusByToken } from '@/lib/gift/status';

export const metadata: Metadata = {
  title: 'Ajándék igénylési folyamat állapota',
  description: 'Kövesd nyomon az Aquadrop ajándék igénylésed aktuális állapotát biztonságos státusz oldalon.',
  robots: {
    index: false,
    follow: false
  }
};

const STEPS = [
  'Igénylés beérkezett',
  'Blokk ellenőrzése',
  'Jóváhagyva',
  'Csomag előkészítése',
  'Futárnak átadva',
  'Kézbesítve'
] as const;

type ProgressVariant = 'normal' | 'warning' | 'rejected';


const REVIEW_VISIBLE_STATUSES = new Set(['Jóváhagyva', 'Csomagolás alatt', 'Futárnak átadva', 'Kézbesítve', 'Lezárva']);

function getStatusInfo(pipelineStatus: string): { step: number; variant: ProgressVariant; helperText: string } {
  switch (pipelineStatus) {
    case 'Új igénylés':
      return { step: 1, variant: 'normal', helperText: 'Megkaptuk az igénylésedet, hamarosan ellenőrizzük.' };
    case 'Blokk ellenőrzés alatt':
      return { step: 2, variant: 'normal', helperText: 'Igénylésed blokkellenőrzés alatt van, hamarosan visszajelzünk.' };
    case 'Hiánypótlás szükséges':
      return {
        step: 2,
        variant: 'warning',
        helperText:
          'Az ellenőrzés során pontosításra vagy javításra van szükség. Kérjük, figyeld az emailben küldött tájékoztatást.'
      };
    case 'Jóváhagyva':
      return {
        step: 3,
        variant: 'normal',
        helperText: 'Az igénylésed jóváhagyásra került. Az ajándék csomagod előkészítése hamarosan megkezdődik.'
      };
    case 'Csomagolás alatt':
      return { step: 4, variant: 'normal', helperText: 'A csomagodat jelenleg előkészítjük a futárszolgálat részére.' };
    case 'Futárnak átadva':
      return {
        step: 5,
        variant: 'normal',
        helperText: 'Az ajándék csomagod átadásra került a futárszolgálatnak.'
      };
    case 'Kézbesítve':
      return { step: 6, variant: 'normal', helperText: 'A rendszer szerint az ajándék csomagod kézbesítésre került.' };
    case 'Lezárva':
      return { step: 6, variant: 'normal', helperText: 'Az igénylés folyamata lezárult.' };
    case 'Elutasítva':
      return {
        step: 2,
        variant: 'rejected',
        helperText: 'Az igénylés ellenőrzése során olyan eltérést találtunk, ami miatt az ajándék nem küldhető ki.'
      };
    default:
      return { step: 1, variant: 'normal', helperText: 'Megkaptuk az igénylésedet, hamarosan ellenőrizzük.' };
  }
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleString('hu-HU', {
    timeZone: 'Europe/Budapest',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default async function GiftClaimStatusPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const status = await fetchGiftClaimPublicStatusByToken(token);

  if (!status) {
    notFound();
  }

  const statusInfo = getStatusInfo(status.pipeline_status);
  const progressPercentage =
    statusInfo.variant === 'rejected' ? (statusInfo.step / STEPS.length) * 100 : ((statusInfo.step - 1) / (STEPS.length - 1)) * 100;

  const barToneClass =
    statusInfo.variant === 'rejected'
      ? 'bg-rose-500'
      : statusInfo.variant === 'warning'
        ? 'bg-amber-500'
        : 'bg-emerald-500';

  return (
    <main className="min-h-screen bg-gradient-to-b from-cyan-50 via-sky-50 to-white px-4 py-10 sm:px-6">
      <section className="mx-auto w-full max-w-5xl rounded-3xl border border-sky-100 bg-white/90 p-6 shadow-[0_20px_60px_rgba(14,116,144,0.10)] backdrop-blur-sm sm:p-10">
        <p className="inline-flex rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-cyan-700">
          Aquadrop ajándék státusz
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Ajándék igénylési folyamat állapota</h1>

        <div className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Igénylő neve</p>
            <p className="mt-1 text-base font-semibold text-slate-900">{status.name}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Szállítási cím</p>
            <p className="mt-1 text-base font-semibold text-slate-900">{status.shipping_address}</p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-sky-100 bg-white p-5 sm:p-6">
          <div className="relative">
            <div className="h-2 rounded-full bg-slate-200" />
            <div className={`absolute left-0 top-0 h-2 rounded-full transition-all ${barToneClass}`} style={{ width: `${progressPercentage}%` }} />
          </div>

          <ol className="mt-4 grid gap-3 text-xs font-medium text-slate-600 sm:grid-cols-6 sm:gap-2">
            {STEPS.map((label, index) => {
              const stepNumber = index + 1;
              const isActiveOrDone = stepNumber <= statusInfo.step;
              const dotTone =
                statusInfo.variant === 'rejected'
                  ? isActiveOrDone
                    ? 'border-rose-500 bg-rose-500 text-white'
                    : 'border-slate-300 bg-white text-slate-400'
                  : statusInfo.variant === 'warning' && stepNumber === 2
                    ? 'border-amber-500 bg-amber-500 text-white'
                    : isActiveOrDone
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-slate-300 bg-white text-slate-400';

              return (
                <li key={label} className="flex items-center gap-2 sm:flex-col sm:items-start">
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-[11px] ${dotTone}`}>
                    {stepNumber}
                  </span>
                  <span className="leading-snug">{label}</span>
                </li>
              );
            })}
          </ol>

          <div
            className={`mt-6 rounded-xl border px-4 py-3 text-sm ${
              statusInfo.variant === 'rejected'
                ? 'border-rose-200 bg-rose-50 text-rose-700'
                : statusInfo.variant === 'warning'
                  ? 'border-amber-200 bg-amber-50 text-amber-700'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}
          >
            {statusInfo.variant === 'warning' ? 'Hiánypótlás szükséges' : statusInfo.variant === 'rejected' ? 'Az igénylés elutasítva' : status.pipeline_status}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-slate-700">{statusInfo.helperText}</p>

          {(status.courier_name || status.tracking_number || status.tracking_url) && (
            <div className="mt-6 rounded-xl border border-sky-100 bg-sky-50/70 p-4">
              <h2 className="text-sm font-semibold text-sky-900">Szállítási adatok</h2>
              <dl className="mt-3 grid gap-2 text-sm text-slate-700">
                {status.courier_name && (
                  <div className="grid grid-cols-[140px_1fr] gap-2">
                    <dt className="font-medium text-slate-500">Futárszolgálat</dt>
                    <dd>{status.courier_name}</dd>
                  </div>
                )}
                {status.tracking_number && (
                  <div className="grid grid-cols-[140px_1fr] gap-2">
                    <dt className="font-medium text-slate-500">Tracking number</dt>
                    <dd>{status.tracking_number}</dd>
                  </div>
                )}
                {status.tracking_url && (
                  <div className="grid grid-cols-[140px_1fr] gap-2">
                    <dt className="font-medium text-slate-500">Tracking link</dt>
                    <dd>
                      <Link href={status.tracking_url} target="_blank" rel="noopener noreferrer" className="font-medium text-sky-700 underline underline-offset-2">
                        Csomag nyomkövetése
                      </Link>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>


        {REVIEW_VISIBLE_STATUSES.has(status.pipeline_status) && (
          <GoogleReviewCta
            variant="section"
            placement="status_page"
            className="mt-8"
            title="Már használtad az Aquadrop Expert Pro-t?"
            description="Ha elégedett vagy a korábban megvásárolt termékkel, egy rövid Google értékelés sokat segít abban, hogy mások is magabiztosabban válasszanak."
            buttonText="Google értékelést írok"
          />
        )}

        <div className="mt-6 text-xs text-slate-500">
          <p>Létrehozva: {formatDate(status.created_at)}</p>
          <p>Utolsó frissítés: {formatDate(status.updated_at)}</p>
        </div>
      </section>
    </main>
  );
}
