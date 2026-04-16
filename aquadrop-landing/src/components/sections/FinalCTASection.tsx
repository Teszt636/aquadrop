import { ButtonLink } from '@/components/ui/Button';
import { SectionDescription, SectionHeading } from '@/components/ui/SectionHeading';

export function FinalCTASection() {
  return (
    <section className="ds-section bg-slate-50" id="final-cta">
      <div className="ds-container">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white px-6 py-8 text-center shadow-card md:px-10 md:py-10">
          <SectionHeading>Mi a következő lépés?</SectionHeading>
          <SectionDescription className="mx-auto mt-3 max-w-2xl">
            Válaszd azt az utat, amely most a leginkább érdekel.
          </SectionDescription>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <ButtonLink href="#gift-campaign" className="w-full justify-center">
              Kérem az ajándék dobozt
            </ButtonLink>
            <ButtonLink href="#announcement-signup" variant="secondary" className="w-full justify-center">
              Értesítést kérek
            </ButtonLink>
            <ButtonLink href="/partner" variant="secondary" className="w-full justify-center">
              Partner oldal
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
