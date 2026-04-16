'use client';

export function MobileStickyCTA() {
  const handleClick = () => {
    const target = document.getElementById('gift-claim-form');

    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    window.setTimeout(() => {
      target.focus({ preventScroll: true });
    }, 500);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-primary/20 bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 shadow-[0_-8px_24px_rgba(15,23,42,0.12)] backdrop-blur md:hidden">
      <button
        type="button"
        onClick={handleClick}
        className="ds-button-primary h-12 w-full justify-center"
        aria-label="Ugrás az ajándékdoboz igénylőlaphoz"
      >
        Kérem a 3. dobozt ajándékba
      </button>
    </div>
  );
}
