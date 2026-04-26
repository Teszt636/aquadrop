'use client';

import { FormEvent, useState } from 'react';

export function AdminLogin() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? 'Sikertelen bejelentkezés.');
      }

      window.location.reload();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Sikertelen bejelentkezés.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto mt-20 w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl md:p-8">
      <h1 className="text-2xl font-semibold text-white">Aquadrop Admin</h1>
      <p className="mt-2 text-sm text-slate-300">Add meg az admin jelszót a belépéshez.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-slate-200" htmlFor="admin-password">
          Jelszó
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-cyan-400 transition focus:ring-2"
          required
        />

        {error ? <p className="text-sm text-rose-300">{error}</p> : null}

        <button
          type="submit"
          className="w-full rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={loading}
        >
          {loading ? 'Belépés...' : 'Belépés'}
        </button>
      </form>
    </section>
  );
}
