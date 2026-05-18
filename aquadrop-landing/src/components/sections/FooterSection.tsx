import Link from 'next/link';

const legalLinks = [
  { href: '/adatvedelmi-tajekoztato', label: 'Adatvédelmi tájékoztató' },
  { href: '/suti-tajekoztato', label: 'Süti tájékoztató' }
];

const knowledgeGroups = [
  {
    title: 'ALAPOK',
    links: [
      { href: '/mosokapszula-hasznalata', label: 'Mosókapszula használata' },
      { href: '/mosokapszula-adagolas', label: 'Mosókapszula adagolás' },
      { href: '/mosokapszula-dobba-vagy-adagoloba', label: 'Mosókapszula dobba vagy adagolóba' },
      { href: '/mosokapszula-nem-oldodik-fel', label: 'Miért nem oldódik fel a mosókapszula?' }
    ]
  },
  {
    title: 'ÖSSZEHASONLÍTÁS',
    links: [{ href: '/mosokapszula-vagy-folyekony-mososzer', label: 'Mosókapszula vagy folyékony mosószer' }]
  },
  {
    title: 'ENERGIATAKARÉKOSSÁG',
    links: [
      { href: '/mosokapszula-20-fokon', label: 'Mosókapszula 20 fokon' },
      { href: '/energiatakarekos-mosas', label: 'Energiatakarékos mosás' },
      { href: '/mosasi-koltseg-kalkulator', label: 'Mos\u00e1si k\u00f6lts\u00e9g kalkul\u00e1tor' }
    ]
  }
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
              <p className="font-semibold text-slate-400">hello@aquadrop.hu</p>
              <p className="font-semibold text-slate-400">+36 21 201 0808</p>

              <div className="mt-4 hidden md:block">
                <p className="font-semibold text-slate-100">Magyarországi forgalmazó:</p>
                <p className="font-semibold text-slate-400">Aquadrop Hungary Kft</p>
                <p className="font-semibold text-slate-400">6781 Domaszék, Béke utca 16/B</p>
                <p className="font-semibold text-slate-400">32864883-2-06</p>
              </div>
            </address>
          </div>

          <div className="md:text-center">
            <p className="text-sm font-semibold text-slate-100 md:uppercase md:tracking-wide md:text-slate-100">Linkek</p>
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

              <div className="pt-2">
                <p className="text-xs text-slate-400">Elégedett vagy?</p>
                <Link
                  href="https://g.page/r/CT2R_at_xJV6EAE/review"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-xs font-medium text-slate-400 transition-colors hover:text-slate-100 hover:underline"
                >
                  Írj egy Google értékelést
                </Link>
              </div>
            </div>
          </div>

          <div className="md:text-center">
            <p className="text-sm font-semibold text-slate-100 md:uppercase md:tracking-wide md:text-slate-100">
              Mosókapszula tudástár
            </p>
            <div className="mt-4 text-sm leading-7 text-slate-200">
              {knowledgeGroups.map((group, index) => (
                <div className={index === 0 ? '' : 'mt-4'} key={group.title}>
                  <p className="text-xs font-semibold tracking-wide text-slate-300">{group.title}</p>
                  <ul className="mt-2 space-y-2">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <Link className="font-medium text-slate-200 transition-colors hover:text-cyan-300" href={link.href}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <address className="mt-4 not-italic text-sm leading-7 text-slate-200 md:hidden">
              <p className="font-semibold text-slate-100">Magyarországi forgalmazó:</p>
              <p className="font-semibold text-slate-400">Aquadrop Hungary Kft</p>
              <p className="font-semibold text-slate-400">6781 Domaszék, Béke utca 16/B</p>
              <p className="font-semibold text-slate-400">32864883-2-06</p>
            </address>
          </div>
        </div>
        <p className="mt-10 border-t border-slate-700/70 pt-5 text-center text-xs font-medium text-slate-400">
          Aquadrop Expert Pro információk ellenőrizve: 2026. május
        </p>
      </div>
    </footer>
  );
}
