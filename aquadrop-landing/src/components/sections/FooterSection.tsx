const legalLinks = [
  { href: '/adatkezelesi-tajekoztato', label: 'Adatkezelési tájékoztató' },
  { href: '/aszf', label: 'ÁSZF' },
  { href: '/kapcsolat', label: 'Kapcsolat' },
  { href: '/partner', label: 'Viszonteladóknak' }
];

export function FooterSection() {
  return (
    <footer className="border-t border-slate-200 bg-white py-10">
      <div className="ds-container">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <p className="text-lg font-bold text-slate-900">Aquadrop Expert Pro – tisztaság új szinten</p>
            <address className="mt-4 not-italic text-sm leading-7 text-slate-600">
              <p>Email: info@aquadrop.hu</p>
              <p>Telefon: +36 30 123 4567</p>
              <p>Cím: 1117 Budapest, Fehérvári út 120.</p>
            </address>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Jogi információk</p>
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
        </div>
      </div>
    </footer>
  );
}
