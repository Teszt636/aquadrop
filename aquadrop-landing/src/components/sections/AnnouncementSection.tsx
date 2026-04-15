'use client';

import { Button } from '@/components/ui/Button';

export function AnnouncementSection() {
  return (
    <section className="ds-section bg-slate-50">
      <div className="ds-container">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-card md:p-12">
          <div className="text-center">
            <h2 className="text-3xl leading-tight md:text-4xl">Hamarosan valami teljesen új érkezik</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-700">
              Az Aquadrop nem csak egy termékben gondolkodik. Iratkozz fel, és elsőként értesülsz.
            </p>
          </div>

          <form className="mx-auto mt-8 max-w-xl space-y-4" onSubmit={(event) => event.preventDefault()}>
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
              />
            </div>

            <Button className="w-full">Elsőként szeretnék értesülni</Button>
          </form>
        </div>
      </div>
    </section>
  );
}
