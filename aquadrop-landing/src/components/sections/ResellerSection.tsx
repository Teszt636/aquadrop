"use client";

import type { FormEvent } from 'react';

const channelOptions = ['bolt', 'webshop', 'nagyker'] as const;

export function ResellerSection() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <section id="resellers" className="bg-slate-950 py-20 text-slate-100">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-start">
          <div className="space-y-6">
            <p className="inline-flex rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-1 text-sm font-medium text-cyan-200">
              Partner program
            </p>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Viszonteladóknak / Beszerzőknek
            </h2>
            <div className="space-y-3 text-lg text-slate-300">
              <p>Szeretnéd árulni az Aquadrop termékeket?</p>
              <p>Korlátozott számú partnerrel dolgozunk.</p>
            </div>

            <ul className="grid gap-3 pt-2 text-slate-200 sm:grid-cols-2">
              <li className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">magas árrés</li>
              <li className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">növekvő márka</li>
              <li className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">marketing támogatás</li>
              <li className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">stabil ellátás</li>
            </ul>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-900/20 backdrop-blur"
          >
            <div className="grid gap-4">
              <label className="grid gap-1.5 text-sm font-medium text-slate-200">
                cégnév
                <input
                  type="text"
                  name="company"
                  required
                  className="h-11 rounded-lg border border-white/15 bg-slate-900/70 px-3 text-base text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-cyan-300"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-medium text-slate-200">
                név
                <input
                  type="text"
                  name="name"
                  required
                  className="h-11 rounded-lg border border-white/15 bg-slate-900/70 px-3 text-base text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-cyan-300"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-medium text-slate-200">
                email
                <input
                  type="email"
                  name="email"
                  required
                  className="h-11 rounded-lg border border-white/15 bg-slate-900/70 px-3 text-base text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-cyan-300"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-medium text-slate-200">
                telefon
                <input
                  type="tel"
                  name="phone"
                  required
                  className="h-11 rounded-lg border border-white/15 bg-slate-900/70 px-3 text-base text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-cyan-300"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-medium text-slate-200">
                csatorna
                <select
                  name="channel"
                  required
                  defaultValue=""
                  className="h-11 rounded-lg border border-white/15 bg-slate-900/70 px-3 text-base text-slate-100 outline-none transition focus:border-cyan-300"
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

              <button
                type="submit"
                className="mt-2 inline-flex h-12 items-center justify-center rounded-lg bg-cyan-400 px-6 text-base font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Viszonteladó szeretnék lenni
              </button>
              <p className="text-sm text-slate-400">Nem minden jelentkezést fogadunk el.</p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
