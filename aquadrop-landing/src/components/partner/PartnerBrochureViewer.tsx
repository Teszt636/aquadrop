'use client';

import { useState } from 'react';
import Image from 'next/image';

const brochurePages = [
  {
    src: '/partner-brochure/aquadrop-partner-prospektus-01.webp',
    alt: 'Aquadrop partner prospektus első oldal viszonteladói bemutatóval'
  },
  {
    src: '/partner-brochure/aquadrop-partner-prospektus-02.webp',
    alt: 'Aquadrop partner prospektus második oldal prémium mosókapszula értékesítési érvekkel'
  },
  {
    src: '/partner-brochure/aquadrop-partner-prospektus-03.webp',
    alt: 'Aquadrop partner prospektus harmadik oldal értékesítési támogatással'
  },
  {
    src: '/partner-brochure/aquadrop-partner-prospektus-04.webp',
    alt: 'Aquadrop partner prospektus negyedik oldal viszonteladói információkkal'
  }
] as const;

export function PartnerBrochureViewer() {
  const [currentPage, setCurrentPage] = useState(0);

  const currentBrochurePage = brochurePages[currentPage];

  return (
    <section className="border-t border-white/10 bg-slate-950 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Partner prospektus</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
          Lapozd át az Aquadrop viszonteladói prospektust
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
          Rövid, áttekinthető bemutatóanyag az Aquadrop Expert Pro partnerprogramhoz: termékelőnyök, értékesítési
          érvek és viszonteladói támogatás egy helyen.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.72fr_0.28fr] lg:items-start">
          <div className="rounded-[2rem] border border-cyan-400/20 bg-white/5 p-3 shadow-[0_30px_90px_rgba(8,145,178,0.18)] backdrop-blur">
            <div className="overflow-hidden rounded-[1.5rem] bg-white">
              <Image
                src={currentBrochurePage.src}
                alt={currentBrochurePage.alt}
                width={1600}
                height={2263}
                sizes="(max-width: 768px) 92vw, (max-width: 1200px) 70vw, 760px"
                loading="lazy"
                className="h-auto w-full object-contain"
              />
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-5 shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">Prospektus oldalak</p>
            <p aria-live="polite" className="mt-4 text-3xl font-bold text-white">
              {currentPage + 1} / {brochurePages.length}
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              Lapozd végig a partneranyagot, majd jelentkezz viszonteladónak az oldalon található űrlapon.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => page - 1)}
                disabled={currentPage === 0}
                aria-label="Előző prospektus oldal"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Előző
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((page) => page + 1)}
                disabled={currentPage === brochurePages.length - 1}
                aria-label="Következő prospektus oldal"
                className="inline-flex items-center justify-center rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Következő
              </button>
            </div>

            <a
              href="#reseller-application-form"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              Viszonteladói jelentkezés
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
