const legalLinks = [
  { href: '/adatkezelesi-tajekoztato', label: 'Adatkezelési tájékoztató' },
  { href: '/aszf', label: 'ÁSZF' },
  { href: '/kapcsolat', label: 'Kapcsolat' }
];

export function FooterSection() {
  return (
    <footer className="border-t border-slate-200 bg-white py-10">
      <div className="ds-container">
        <div className="grid gap-10 text-center md:grid-cols-3 md:text-left">
          <div>
            <p className="text-lg font-bold text-slate-900">Aquadrop Expert Pro – tisztaság új szinten</p>
            <address className="mt-4 not-italic text-sm leading-7 text-slate-600">
              <p className="font-semibold text-slate-800">Ügyfélszolgálat:</p>
              <p>hello@aquadrop.hu</p>
              <p>+36 21 201 0808</p>

              <p className="mt-4 font-semibold text-slate-800">Magyarországi forgalmazó:</p>
              <p>Aquadrop Hungary Kft</p>
              <p>6781 Domaszék, Béke utca 16/B</p>
              <p>32864883-2-06</p>
            </address>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Jogi linkek</p>
            <ul className="mt-4 space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <a className="text-sm font-medium text-slate-700 hover:text-brand-primary" href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Partner link</p>
            <a
              className="mt-4 inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
              href="/partner"
            >
              Viszonteladóknak
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
