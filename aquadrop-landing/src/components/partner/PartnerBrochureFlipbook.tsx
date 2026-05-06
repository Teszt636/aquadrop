'use client';

import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const brochurePages = [
  {
    src: '/partner-brochure/aquadrop-partner-prospektus-01.webp',
    alt: 'Aquadrop partner prospektus borítóoldal viszonteladói bemutatóval'
  },
  {
    src: '/partner-brochure/aquadrop-partner-prospektus-02.webp',
    alt: 'Aquadrop partner prospektus második oldal értékesítési érvekkel'
  },
  {
    src: '/partner-brochure/aquadrop-partner-prospektus-03.webp',
    alt: 'Aquadrop partner prospektus harmadik oldal partneri támogatással'
  },
  {
    src: '/partner-brochure/aquadrop-partner-prospektus-04.webp',
    alt: 'Aquadrop partner prospektus hátlap viszonteladói információkkal'
  }
] as const;

const desktopStates = [
  { label: '1 / 4', title: 'Borító' },
  { label: '2–3 / 4', title: 'Kinyitott prospektus' },
  { label: '4 / 4', title: 'Hátlap' }
] as const;

function PageImage({
  page,
  priority = false,
  sizes,
  className = ''
}: {
  page: (typeof brochurePages)[number];
  priority?: boolean;
  sizes: string;
  className?: string;
}) {
  return (
    <Image
      src={page.src}
      alt={page.alt}
      width={1600}
      height={2263}
      priority={priority}
      loading={priority ? undefined : 'lazy'}
      sizes={sizes}
      className={`h-full w-full object-contain ${className}`}
    />
  );
}

export function PartnerBrochureFlipbook() {
  const [desktopState, setDesktopState] = useState(0);
  const [mobilePage, setMobilePage] = useState(0);
  const mobileTrackRef = useRef<HTMLDivElement>(null);
  const scrollEndRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (scrollEndRef.current) {
        clearTimeout(scrollEndRef.current);
      }
    };
  }, []);

  const goToDesktopState = useCallback((nextState: number) => {
    setDesktopState(Math.min(Math.max(nextState, 0), desktopStates.length - 1));
  }, []);

  const goToMobilePage = useCallback((nextPage: number) => {
    const clampedPage = Math.min(Math.max(nextPage, 0), brochurePages.length - 1);
    const track = mobileTrackRef.current;

    setMobilePage(clampedPage);
    track?.scrollTo({
      left: clampedPage * track.clientWidth,
      behavior: 'smooth'
    });
  }, []);

  const syncMobilePage = useCallback(() => {
    const track = mobileTrackRef.current;

    if (!track) {
      return;
    }

    if (scrollEndRef.current) {
      clearTimeout(scrollEndRef.current);
    }

    scrollEndRef.current = setTimeout(() => {
      const nextPage = Math.round(track.scrollLeft / Math.max(track.clientWidth, 1));
      setMobilePage(Math.min(Math.max(nextPage, 0), brochurePages.length - 1));
    }, 80);
  }, []);

  return (
    <section className="relative overflow-hidden border-t border-white/10 bg-slate-950 px-4 py-16 sm:px-6 md:py-20 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(34,211,238,0.16),transparent_34%),radial-gradient(circle_at_86%_14%,rgba(59,130,246,0.14),transparent_32%),linear-gradient(180deg,rgba(15,23,42,0),rgba(8,13,28,0.62))]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Partner prospektus</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Lapozd át az Aquadrop viszonteladói prospektust
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Nézd meg az értékesítést támogató, rövid partneranyagot prémium, oldalon belüli prospektusnézetben.
          </p>
        </div>

        <div className="mt-9 overflow-hidden rounded-[1.75rem] border border-cyan-300/20 bg-slate-900/80 p-4 shadow-[0_30px_100px_-44px_rgba(8,145,178,0.75)] backdrop-blur-xl sm:p-5 md:mt-10 md:rounded-[2rem] md:p-8">
          <div className="hidden md:block">
            <div className="mx-auto max-w-5xl">
              <div className="relative min-h-[600px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(125,211,252,0.18),transparent_34%),linear-gradient(135deg,rgba(2,6,23,0.92),rgba(15,23,42,0.74))] p-8 shadow-inner [perspective:1800px] lg:min-h-[720px]">
                <div
                  className={`absolute inset-8 flex items-center justify-center transition duration-700 ease-out ${
                    desktopState === 0
                      ? 'translate-x-0 opacity-100'
                      : '-translate-x-[12%] [transform:rotateY(-18deg)_scale(0.92)] opacity-0'
                  }`}
                  aria-hidden={desktopState !== 0}
                >
                  <div className="relative aspect-[1600/2263] h-full max-h-[650px] overflow-hidden rounded-r-[1rem] rounded-l-sm border border-white/20 bg-white shadow-[26px_28px_70px_-30px_rgba(0,0,0,0.85)] ring-1 ring-cyan-100/10 lg:max-h-[820px]">
                    <div className="absolute inset-y-0 left-0 z-10 w-3 bg-gradient-to-r from-slate-950/35 to-transparent" />
                    <PageImage page={brochurePages[0]} priority sizes="(min-width: 1024px) 36rem, 46vw" />
                  </div>
                </div>

                <div
                  className={`absolute inset-8 flex items-center justify-center transition duration-700 ease-out ${
                    desktopState === 1
                      ? 'translate-y-0 [transform:rotateX(0deg)_scale(1)] opacity-100'
                      : desktopState === 0
                        ? 'translate-y-3 [transform:rotateX(5deg)_scale(0.94)] opacity-0'
                        : '-translate-x-[8%] [transform:rotateY(-10deg)_scale(0.95)] opacity-0'
                  }`}
                  aria-hidden={desktopState !== 1}
                >
                  <div className="relative grid max-h-[650px] w-full max-w-4xl grid-cols-2 overflow-hidden rounded-[1.1rem] border border-white/20 bg-white shadow-[0_34px_90px_-34px_rgba(0,0,0,0.9)] ring-1 ring-cyan-100/10 lg:max-h-[820px]">
                    <div className="relative aspect-[1600/2263] overflow-hidden border-r border-slate-200 bg-white">
                      <PageImage page={brochurePages[1]} sizes="(min-width: 1024px) 32rem, 42vw" />
                    </div>
                    <div className="relative aspect-[1600/2263] overflow-hidden bg-white">
                      <PageImage page={brochurePages[2]} sizes="(min-width: 1024px) 32rem, 42vw" />
                    </div>
                    <div className="pointer-events-none absolute inset-y-0 left-1/2 w-10 -translate-x-1/2 bg-gradient-to-r from-slate-950/18 via-slate-900/8 to-white/30" />
                    <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-slate-950/25" />
                  </div>
                </div>

                <div
                  className={`absolute inset-8 flex items-center justify-center transition duration-700 ease-out ${
                    desktopState === 2
                      ? 'translate-x-0 [transform:rotateY(0deg)_scale(1)] opacity-100'
                      : 'translate-x-[12%] [transform:rotateY(16deg)_scale(0.92)] opacity-0'
                  }`}
                  aria-hidden={desktopState !== 2}
                >
                  <div className="relative aspect-[1600/2263] h-full max-h-[650px] overflow-hidden rounded-l-[1rem] rounded-r-sm border border-white/20 bg-white shadow-[-26px_28px_70px_-30px_rgba(0,0,0,0.85)] ring-1 ring-cyan-100/10 lg:max-h-[820px]">
                    <div className="absolute inset-y-0 right-0 z-10 w-3 bg-gradient-to-l from-slate-950/35 to-transparent" />
                    <PageImage page={brochurePages[3]} sizes="(min-width: 1024px) 36rem, 46vw" />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => goToDesktopState(desktopState - 1)}
                  disabled={desktopState === 0}
                  aria-label="Előző prospektus állapot"
                  className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  Előző
                </button>

                <div className="min-w-0 text-center">
                  <p aria-live="polite" className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
                    {desktopStates[desktopState].title}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-white">{desktopStates[desktopState].label}</p>
                  <div className="mt-3 flex justify-center gap-2" aria-hidden="true">
                    {desktopStates.map((state, index) => (
                      <span
                        key={state.label}
                        className={`h-1.5 rounded-full transition-all ${
                          index === desktopState ? 'w-8 bg-cyan-300' : 'w-2 bg-white/25'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => goToDesktopState(desktopState + 1)}
                  disabled={desktopState === desktopStates.length - 1}
                  aria-label="Következő prospektus állapot"
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-cyan-300 px-4 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Következő
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          <div className="md:hidden">
            <div
              ref={mobileTrackRef}
              onScroll={syncMobilePage}
              className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-1 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              aria-label="Aquadrop partner prospektus mobil lapozó"
            >
              {brochurePages.map((page, index) => (
                <div key={page.src} className="min-w-full snap-center">
                  <div className="overflow-hidden rounded-2xl border border-white/15 bg-white shadow-[0_24px_54px_-28px_rgba(0,0,0,0.85)]">
                    <PageImage
                      page={page}
                      priority={index === 0}
                      sizes="(max-width: 767px) calc(100vw - 3rem), 100vw"
                      className="select-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => goToMobilePage(mobilePage - 1)}
                disabled={mobilePage === 0}
                aria-label="Előző prospektus oldal"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>

              <div className="text-center">
                <p aria-live="polite" className="text-sm font-semibold text-white">
                  {mobilePage + 1} / {brochurePages.length}
                </p>
                <div className="mt-2 flex justify-center gap-2" aria-hidden="true">
                  {brochurePages.map((page, index) => (
                    <span
                      key={page.src}
                      className={`h-1.5 rounded-full transition-all ${
                        index === mobilePage ? 'w-7 bg-cyan-300' : 'w-2 bg-white/25'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => goToMobilePage(mobilePage + 1)}
                disabled={mobilePage === brochurePages.length - 1}
                aria-label="Következő prospektus oldal"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-300 text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
