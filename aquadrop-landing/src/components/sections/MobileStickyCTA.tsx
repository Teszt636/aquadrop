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
    <div className="fixed inset-x-4 bottom-[calc(12px+env(safe-area-inset-bottom))] z-50 md:hidden">
      <div className="rounded-2xl border border-brand-primary/20 bg-white/95 p-3 shadow-[0_10px_30px_rgba(15,23,42,0.18)]">
        <button
          type="button"
          onClick={handleClick}
          className="ds-button-primary h-12 w-full justify-center"
          aria-label="Ugrás az ajándékdoboz igénylőlaphoz"
        >
          Ajándék mosókapszula
        </button>
      </div>
    </div>
  );
}
