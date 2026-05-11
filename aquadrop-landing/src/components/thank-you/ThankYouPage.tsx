import { GoogleReviewCta } from '@/components/GoogleReviewCta';
import { ButtonLink } from '@/components/ui/Button';

type ThankYouPageProps = {
  title: string;
  message: string;
  secondaryMessage?: string;
  showGoogleReviewCta?: boolean;
  actions?: Array<{
    href: string;
    label: string;
    variant?: 'primary' | 'secondary';
  }>;
};

const defaultActions = [
  {
    href: '/',
    label: 'Vissza a főoldalra',
    variant: 'primary' as const
  }
];

export function ThankYouPage({
  title,
  message,
  secondaryMessage,
  showGoogleReviewCta = true,
  actions = defaultActions
}: ThankYouPageProps) {
  return (
    <main className="relative flex min-h-screen items-center overflow-hidden bg-slate-50 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.1),_transparent_55%)]" />
      <div className="pointer-events-none absolute -left-28 top-16 h-72 w-72 rounded-full bg-brand-light/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-brand-primary/10 blur-3xl" />

      <section className="ds-container relative">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-card md:p-12">
          <p className="inline-flex rounded-full border border-brand-primary/20 bg-brand-light/30 px-4 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-brand-primary">
            Aquadrop Expert Pro
          </p>
          <h1 className="mt-6 text-3xl leading-tight md:text-5xl">{title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-700">{message}</p>
          {secondaryMessage ? (
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">{secondaryMessage}</p>
          ) : null}

          {showGoogleReviewCta ? (
            <GoogleReviewCta
              variant="section"
              placement="thank_you"
              className="mx-auto mt-8 max-w-2xl text-left"
              title="Köszönjük az igénylésed – és a bizalmad!"
              description="Mivel az ajándékigényléshez már meglévő Aquadrop Expert Pro vásárlás szükséges, örömmel vesszük, ha pár szóban megírod a tapasztalatodat a Google értékelésben."
              buttonText="Értékelem Google-ben"
            />
          ) : null}

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
            {actions.map((action) => (
              <ButtonLink
                className="w-full px-6 py-3 text-sm sm:w-auto md:text-base"
                href={action.href}
                key={action.href}
                variant={action.variant ?? 'primary'}
              >
                {action.label}
              </ButtonLink>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
