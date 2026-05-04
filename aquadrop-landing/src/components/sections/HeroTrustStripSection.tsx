import { Droplets, ShieldCheck, Sparkles } from 'lucide-react';

const trustItems = [
  {
    icon: Sparkles,
    text: '4 az 1-ben prémium mosókapszula'
  },
  {
    icon: Droplets,
    text: 'Mikrokapszulás technológia'
  },
  {
    icon: ShieldCheck,
    text: 'Hatékony mosás alacsony hőfokon is'
  }
];

export function HeroTrustStripSection() {
  return (
    <section className="-mt-2 pb-2 sm:pb-4">
      <div className="ds-container">
        <div className="grid gap-2 rounded-2xl border border-white/55 bg-white/65 px-3 py-3 shadow-[0_10px_28px_rgba(15,23,42,0.08)] backdrop-blur-md sm:grid-cols-3 sm:gap-3 sm:px-4 sm:py-3">
          {trustItems.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center justify-center gap-2 text-center sm:border-r sm:border-slate-200/80 sm:last:border-r-0"
            >
              <Icon className="h-4 w-4 shrink-0 text-cyan-700" aria-hidden="true" />
              <p className="text-xs font-medium leading-5 text-slate-700 sm:text-sm">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
