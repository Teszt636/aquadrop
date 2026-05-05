import { TrackedButtonLink } from '@/components/TrackedButtonLink';

export function B2BBridgeSection() {
  return (
    <section className="py-8 md:py-10" id="partner-atvezeto">
      <div className="ds-container">
        <div className="mx-auto max-w-4xl rounded-3xl border border-white/35 bg-white/60 px-5 py-6 shadow-[0_16px_45px_rgba(15,23,42,0.08)] backdrop-blur-sm md:px-8 md:py-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
            <div className="max-w-2xl">
              <h2 className="text-lg font-bold text-slate-900 md:text-xl">Érdekel az Aquadrop Expert Pro partnerprogram?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 md:text-base">
                Ha viszonteladóként vagy beszerzőként érdeklődsz, külön partner oldalunkon minden fontos információt
                megtalálsz.
              </p>
            </div>

            <TrackedButtonLink
              href="/partner"
              variant="secondary"
              className="w-full md:w-auto md:shrink-0"
              eventName="partner_cta_click"
            >
              Partner oldal megnyitása
            </TrackedButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
