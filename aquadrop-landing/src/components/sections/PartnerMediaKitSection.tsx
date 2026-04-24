import { Download, FileCheck2, Image as ImageIcon, ScrollText } from 'lucide-react';

const MEDIA_KIT_ITEMS = [
  {
    title: 'Marketing képek',
    description: 'Webshophoz, közösségi médiához és hirdetésekhez használható Aquadrop kreatívok.',
    points: ['Webshop bannerek', 'Social media képek', 'Termékelőnyöket bemutató kreatívok'],
    cta: 'Marketing anyagok letöltése',
    href: '/media-kit/aquadrop-marketing-kepek.zip',
    icon: ImageIcon,
    accentClassName: 'border-cyan-200/25 bg-cyan-200/[0.07]'
  },
  {
    title: 'Termékszövegek',
    description:
      'Rövid és hosszabb termékleírások, amelyeket viszonteladói webshopban vagy termékoldalon lehet használni.',
    points: ['Rövid termékleírás', 'Hosszú SEO termékleírás', 'Fő előnyök és bullet pointok'],
    cta: 'Termékszövegek letöltése',
    href: '/media-kit/aquadrop-termekszovegek.pdf',
    icon: ScrollText,
    accentClassName: 'border-blue-200/25 bg-blue-200/[0.06]'
  },
  {
    title: 'Biztonsági adatlap',
    description: 'Kötelező dokumentum a termék forgalmazásához és biztonságos kezeléséhez.',
    points: ['MSDS / biztonsági adatlap', 'Használati információk', 'Forgalmazáshoz szükséges alapdokumentum'],
    cta: 'Biztonsági adatlap letöltése',
    href: '/media-kit/aquadrop-biztonsagi-adatlap.pdf',
    icon: FileCheck2,
    accentClassName: 'border-teal-100/35 bg-teal-100/[0.09]'
  }
] as const;

export function PartnerMediaKitSection() {
  return (
    <section className="border-t border-white/10 bg-slate-950/90 px-5 py-14 sm:px-6 md:px-10 md:py-20">
      <div className="mx-auto w-full max-w-6xl">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-semibold text-white md:text-4xl">Értékesítést támogató anyagok viszonteladóknak</h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-200 md:text-base">
            Minden, amire szükséged lehet az Aquadrop Expert Pro értékesítéséhez: letölthető képek, termékleírások és
            kötelező dokumentumok egy helyen.
          </p>
        </div>

        <div className="mt-8 grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
          {MEDIA_KIT_ITEMS.map(({ title, description, points, cta, href, icon: Icon, accentClassName }) => (
            <article
              key={title}
              className="flex h-full flex-col rounded-3xl border border-white/15 bg-white/[0.06] p-6 shadow-[0_20px_34px_-30px_rgba(8,47,73,0.74)] backdrop-blur-xl"
            >
              <div className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-slate-100 ${accentClassName}`}>
                <Icon className="h-4 w-4 text-cyan-200" />
                <span>{title}</span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-200">{description}</p>

              <ul className="mt-4 space-y-2 text-sm text-slate-100">
                {points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/90" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              <a
                href={href}
                download
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-cyan-200/30 bg-cyan-300/15 px-4 text-sm font-semibold text-cyan-100 transition hover:border-cyan-100/45 hover:bg-cyan-300/25"
              >
                <Download className="h-4 w-4" />
                {cta}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
