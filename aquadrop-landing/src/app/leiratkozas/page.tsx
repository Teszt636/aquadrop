import { patchContact } from '@/lib/admin/b2b-email-store';
import { verifyUnsubscribeSignature } from '@/lib/email/b2b-campaigns';

type PageProps = {
  searchParams: Promise<{ contact?: string; sig?: string }>;
};

export default async function UnsubscribePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const contactId = params.contact?.trim() ?? '';
  const signature = params.sig?.trim() ?? '';
  const isValid = verifyUnsubscribeSignature(contactId, signature);
  let success = false;

  if (isValid) {
    const now = new Date().toISOString();
    await patchContact(contactId, {
      unsubscribed_at: now,
      is_active: false,
      last_email_status: 'unsubscribed',
      last_email_event_at: now
    });
    success = true;
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-slate-100">
      <section className="mx-auto max-w-xl rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <p className="text-sm uppercase tracking-wide text-cyan-300">Aquadrop Expert Pro</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">Leiratkozás</h1>
        {success ? (
          <p className="mt-4 text-base leading-7 text-slate-200">
            Rögzítettük, hogy a továbbiakban nem küldünk Önnek beszerzési együttműködéssel kapcsolatos megkeresést.
          </p>
        ) : (
          <p className="mt-4 text-base leading-7 text-rose-200">
            A leiratkozási hivatkozás érvénytelen vagy hiányos. Kérjük, használja az emailben kapott eredeti linket.
          </p>
        )}
      </section>
    </main>
  );
}
