'use client';

import Link from 'next/link';

import { trackEvent } from '@/lib/tracking';

const GOOGLE_REVIEW_URL = 'https://g.page/r/CT2R_at_xJV6EAE/review';

type GoogleReviewPlacement = 'thank_you' | 'status_page' | 'social_proof';

type GoogleReviewCtaProps = {
  variant?: 'section' | 'compact' | 'email-style';
  className?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  placement?: GoogleReviewPlacement;
};

const DEFAULT_TITLE = 'Már kipróbáltad az Aquadrop Expert Pro-t?';
const DEFAULT_DESCRIPTION =
  'Ha elégedett vagy a mosási élménnyel, egy rövid Google értékeléssel rengeteget segítesz nekünk és más vásárlóknak is.';
const DEFAULT_BUTTON_TEXT = 'Google értékelést írok';

const variantClasses: Record<NonNullable<GoogleReviewCtaProps['variant']>, string> = {
  section:
    'rounded-2xl border border-cyan-100 bg-gradient-to-br from-white to-cyan-50/70 p-5 text-center sm:p-6',
  compact: 'rounded-2xl border border-sky-100 bg-white/90 p-4 text-center sm:p-5',
  'email-style': 'rounded-2xl border border-cyan-100 bg-cyan-50/50 p-4 text-left sm:p-5'
};

function cn(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function GoogleReviewCta({
  variant = 'section',
  className,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  buttonText = DEFAULT_BUTTON_TEXT,
  placement
}: GoogleReviewCtaProps) {
  const isEmailStyle = variant === 'email-style';

  const handleClick = () => {
    if (!placement) {
      return;
    }

    trackEvent('google_review_cta_click', { placement });
  };

  return (
    <section className={cn(variantClasses[variant], className)}>
      <h2
        className={cn(
          'text-lg font-semibold leading-snug text-slate-900 sm:text-xl',
          !isEmailStyle && 'mx-auto max-w-2xl'
        )}
      >
        {title}
      </h2>
      <p
        className={cn(
          'mt-2 text-sm leading-6 text-slate-700 sm:text-base',
          !isEmailStyle && 'mx-auto max-w-3xl'
        )}
      >
        {description}
      </p>

      <div className={cn('mt-4', !isEmailStyle && 'mx-auto flex justify-center')}>
        <Link
          href={GOOGLE_REVIEW_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className={cn(
            'inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-cyan-600 hover:to-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500',
            isEmailStyle ? 'mt-1' : 'w-full sm:w-auto'
          )}
        >
          {buttonText}
        </Link>
      </div>
    </section>
  );
}

export { GOOGLE_REVIEW_URL };
