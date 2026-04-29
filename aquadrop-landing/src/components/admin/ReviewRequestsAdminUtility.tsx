'use client';

import { FormEvent, useEffect, useState } from 'react';

type DryRunItem = {
  id: string;
  full_name: string | null;
  email: string | null;
  pipeline_status: string | null;
  delivered_at: string | null;
};

type DryRunResponse = {
  dryRun: boolean;
  daysAfterDelivery: number;
  eligibleCount: number;
  items: DryRunItem[];
};

export function ReviewRequestsAdminUtility() {
  const [daysAfterDelivery, setDaysAfterDelivery] = useState(3);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [data, setData] = useState<DryRunResponse | null>(null);

  const loadDryRun = async (days = daysAfterDelivery) => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/gift/send-review-requests?dryRun=true&daysAfterDelivery=${days}`, { method: 'GET' });
      const json = (await response.json()) as DryRunResponse & { error?: string };

      if (!response.ok) {
        throw new Error(json.error ?? 'Nem sikerült lekérni a dry-run adatokat.');
      }

      setData(json);
    } catch (fetchError) {
      setData(null);
      setError(fetchError instanceof Error ? fetchError.message : 'Ismeretlen hiba történt.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDryRun(3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await loadDryRun(daysAfterDelivery);
  };

  const handleSendLive = async () => {
    const confirmed = window.confirm('Biztosan kiküldöd a Google értékelés kérő emaileket a listában szereplő ügyfeleknek?');
    if (!confirmed) return;

    setSending(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/admin/gift/send-review-requests?send=true&dryRun=false&daysAfterDelivery=${daysAfterDelivery}`,
        { method: 'POST' }
      );
      const json = (await response.json()) as { sentCount?: number; failedCount?: number; error?: string };

      if (!response.ok) {
        throw new Error(json.error ?? 'Nem sikerült kiküldeni az emaileket.');
      }

      setMessage(`Éles küldés kész. Sikeres: ${json.sentCount ?? 0}, sikertelen: ${json.failedCount ?? 0}.`);
      await loadDryRun(daysAfterDelivery);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'Ismeretlen hiba történt küldés közben.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="rounded-xl bg-white p-4 text-slate-900 shadow-sm md:p-6">
      <h1 className="text-xl font-semibold">Review request admin utility</h1>

      <form className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleRefresh}>
        <label className="flex flex-col gap-1 text-sm">
          Days after delivery
          <input
            className="w-40 rounded-md border border-slate-300 px-3 py-2"
            min={0}
            type="number"
            value={daysAfterDelivery}
            onChange={(event) => setDaysAfterDelivery(Number.parseInt(event.target.value || '0', 10))}
          />
        </label>

        <button
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
          disabled={loading || sending}
          type="submit"
        >
          {loading ? 'Frissítés...' : 'Dry run frissítése'}
        </button>

        <button
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-red-300"
          disabled={loading || sending}
          type="button"
          onClick={handleSendLive}
        >
          {sending ? 'Küldés...' : 'Éles review email küldés'}
        </button>
      </form>

      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}

      <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
        <p><span className="font-medium">dryRun:</span> {String(data?.dryRun ?? true)}</p>
        <p><span className="font-medium">daysAfterDelivery:</span> {data?.daysAfterDelivery ?? daysAfterDelivery}</p>
        <p><span className="font-medium">eligibleCount:</span> {data?.eligibleCount ?? 0}</p>
      </div>

      <div className="mt-4 overflow-x-auto rounded-md border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 font-medium">Név</th>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">pipeline_status</th>
              <th className="px-3 py-2 font-medium">delivered_at</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {data?.items?.length ? (
              data.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-3 py-2">{item.full_name ?? '-'}</td>
                  <td className="px-3 py-2">{item.email ?? '-'}</td>
                  <td className="px-3 py-2">{item.pipeline_status ?? '-'}</td>
                  <td className="px-3 py-2">{item.delivered_at ?? '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={4}>Nincs megjeleníthető elem.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
