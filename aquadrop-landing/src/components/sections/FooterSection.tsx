import Link from 'next/link';

const legalLinks = [
  { href: '/adatvedelmi-tajekoztato', label: 'Adatvédelmi tájékoztató' },
  { href: '/suti-tajekoztato', label: 'Süti tájékoztató' }
];

const knowledgeLinks = [
  { href: '/mosokapszula-hasznalata', label: 'Mosókapszula használata' },
  { href: '/mosokapszula-nem-oldodik-fel', label: 'Miért nem oldódik fel a mosókapszula?' },
  { href: '/mosokapszula-vagy-folyekony-mososzer', label: 'Mosókapszula vagy folyékony mosószer' }
];

export function FooterSection() {
  return (
    <footer className="border-t border-slate-700/70 bg-slate-900 py-10 text-slate-200">
      <div className="ds-container">
        <p className="mb-8 text-center text-lg font-bold text-slate-100 md:hidden">Aquadrop Expert Pro Capsules</p>
        <div className="grid gap-10 text-center md:grid-cols-3 md:text-left">
          <div>
            <p className="hidden text-lg font-bold text-slate-100 md:block">Aquadrop Expert Pro Capsules</p>
            <address className="mt-4 not-italic text-sm leading-7 text-slate-200">
              <p className="font-semibold text-slate-100">Ügyfélszolgálat:</p>
              <p>hello@aquadrop.hu</p>
              <p>+36 21 201 0808</p>

              <div className="mt-4 hidden md:block">
                <p className="font-semibold text-slate-100">Magyarországi forgalmazó:</p>
                <p>Aquadrop Hungary Kft</p>
                <p>6781 Domaszék, Béke utca 16/B</p>
                <p>32864883-2-06</p>
              </div>
            </address>
          </div>

          <div className="md:text-center">
            <p className="text-sm font-semibold text-slate-100 md:uppercase md:tracking-wide md:text-slate-100">Jogi linkek</p>
            <div className="mt-4 space-y-4">
              <Link
                className="inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-100 transition-colors hover:border-cyan-300 hover:text-cyan-300"
                href="/partner"
              >
                Viszonteladóknak
              </Link>
              <ul className="space-y-2 text-sm leading-7 text-slate-200">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link className="font-medium text-slate-200 transition-colors hover:text-cyan-300" href={link.href}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="md:text-center">
            <p className="text-sm font-semibold text-slate-100 md:uppercase md:tracking-wide md:text-slate-100">
              Mosókapszula tudástár
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Hasznos tudnivalók a mosókapszulák használatáról és a helyes választásról.
            </p>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-200">
              {knowledgeLinks.map((link) => (
                <li key={link.href}>
                  <Link className="font-medium text-slate-200 transition-colors hover:text-cyan-300" href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <address className="mt-4 not-italic text-sm leading-7 text-slate-200 md:hidden">
              <p className="font-semibold text-slate-100">Magyarországi forgalmazó:</p>
              <p>Aquadrop Hungary Kft</p>
              <p>6781 Domaszék, Béke utca 16/B</p>
              <p>32864883-2-06</p>
            </address>
          </div>
        </div>
      </div>
    </footer>
  );
}
