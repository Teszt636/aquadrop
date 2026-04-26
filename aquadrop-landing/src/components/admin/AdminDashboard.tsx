'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

const TABLES = [
  { key: 'announcement_signups', label: 'Feliratkozók' },
  { key: 'gift_claims', label: 'Ajándék igénylések' },
  { key: 'reseller_applications', label: 'Viszonteladók' },
  { key: 'media_kit_downloads', label: 'Media Kit letöltések' }
] as const;

type TableKey = (typeof TABLES)[number]['key'];
type Row = Record<string, unknown>;

const BASE_EDIT_FIELDS: Record<TableKey, string[]> = {
  announcement_signups: ['name', 'email', 'phone'],
  gift_claims: [
    'full_name',
    'name',
    'email',
    'phone',
    'shipping_address',
    'purchase_location',
    'purchase_date',
    'receipt_file_url',
    'receipt_url',
    'status',
    'admin_note'
  ],
  reseller_applications: [
    'company_name',
    'company',
    'contact_name',
    'name',
    'email',
    'phone',
    'website',
    'sales_channel',
    'message'
  ],
  media_kit_downloads: ['name', 'email', 'company', 'usage_type', 'downloaded_file']
};

const VISIBLE_FIELDS: Record<TableKey, string[]> = {
  announcement_signups: ['id', 'name', 'email', 'created_at'],
  gift_claims: [
    'id',
    'full_name',
    'name',
    'email',
    'phone',
    'shipping_address',
    'receipt_file_url',
    'receipt_url',
    'created_at'
  ],
  reseller_applications: [
    'id',
    'company_name',
    'company',
    'contact_name',
    'name',
    'email',
    'phone',
    'website',
    'sales_channel',
    'created_at'
  ],
  media_kit_downloads: [
    'id',
    'name',
    'email',
    'company',
    'usage_type',
    'downloaded_file',
    'created_at'
  ]
};

function stringifyValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  return JSON.stringify(value);
}

export function AdminDashboard() {
  const [activeTable, setActiveTable] = useState<TableKey>('announcement_signups');
  const [rows, setRows] = useState<Row[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<Row | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const loadRows = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/table?name=${activeTable}`, { cache: 'no-store' });
      const body = (await response.json()) as { rows?: Row[]; error?: string };

      if (!response.ok) {
        throw new Error(body.error ?? 'Sikertelen adatlekérés.');
      }

      setRows(body.rows ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Sikertelen adatlekérés.');
    } finally {
      setLoading(false);
    }
  }, [activeTable]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const visibleColumns = useMemo(() => {
    const base = VISIBLE_FIELDS[activeTable];
    const dynamic = rows.length > 0 ? Object.keys(rows[0]) : [];

    return [...new Set([...base, ...dynamic])].filter((column) => rows.some((row) => column in row));
  }, [activeTable, rows]);

  const filteredRows = useMemo(() => {
    const needle = query.trim().toLowerCase();

    if (!needle) {
      return rows;
    }

    return rows.filter((row) =>
      Object.values(row).some((value) => stringifyValue(value).toLowerCase().includes(needle))
    );
  }, [query, rows]);

  const editableFields = useMemo(() => {
    if (!selectedRow) {
      return [];
    }

    const tableFields = BASE_EDIT_FIELDS[activeTable];

    return tableFields.filter((field) => field in selectedRow && !['id', 'created_at'].includes(field));
  }, [activeTable, selectedRow]);

  function openRow(row: Row) {
    setSelectedRow(row);

    const nextValues: Record<string, string> = {};

    for (const key of Object.keys(row)) {
      nextValues[key] = stringifyValue(row[key]);
    }

    setEditValues(nextValues);
  }

  async function saveRow() {
    if (!selectedRow || typeof selectedRow.id !== 'string') {
      return;
    }

    const updates = editableFields.reduce<Record<string, string>>((acc, field) => {
      acc[field] = editValues[field] ?? '';
      return acc;
    }, {});

    const response = await fetch('/api/admin/table', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: activeTable, id: selectedRow.id, updates })
    });

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      alert(body.error ?? 'Sikertelen mentés.');
      return;
    }

    await loadRows();
    setSelectedRow(null);
  }

  async function deleteRow(row: Row) {
    if (typeof row.id !== 'string') {
      return;
    }

    const approved = window.confirm('Biztosan törlöd ezt a rekordot? Ez nem vonható vissza.');

    if (!approved) {
      return;
    }

    const response = await fetch('/api/admin/table', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: activeTable, id: row.id })
    });

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      alert(body.error ?? 'Sikertelen törlés.');
      return;
    }

    if (selectedRow?.id === row.id) {
      setSelectedRow(null);
    }

    await loadRows();
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.reload();
  }

  return (
    <section className="space-y-4">
      <header className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl font-semibold text-white md:text-2xl">Aquadrop Admin</h1>
        <div className="flex gap-2">
          <button
            onClick={() => void loadRows()}
            className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-100 transition hover:bg-slate-800"
          >
            Frissítés
          </button>
          <button
            onClick={() => void logout()}
            className="rounded-md bg-rose-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-400"
          >
            Kilépés
          </button>
        </div>
      </header>

      <nav className="grid grid-cols-2 gap-2 md:flex md:flex-wrap">
        {TABLES.map((table) => (
          <button
            key={table.key}
            onClick={() => setActiveTable(table.key)}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${
              activeTable === table.key
                ? 'bg-cyan-500 text-slate-950'
                : 'border border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800'
            }`}
          >
            {table.label}
          </button>
        ))}
      </nav>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Keresés bármely mezőben..."
          className="mb-4 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-cyan-400 transition focus:ring-2"
        />

        {error ? <p className="pb-4 text-sm text-rose-300">{error}</p> : null}
        {loading ? <p className="pb-4 text-sm text-slate-300">Betöltés...</p> : null}

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-200">
            <thead className="bg-slate-800/60 text-xs uppercase tracking-wide text-slate-300">
              <tr>
                {visibleColumns.map((column) => (
                  <th key={column} className="px-3 py-2">
                    {column}
                  </th>
                ))}
                <th className="px-3 py-2">Műveletek</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={String(row.id)} className="border-b border-slate-800 align-top">
                  {visibleColumns.map((column) => (
                    <td key={`${String(row.id)}-${column}`} className="max-w-xs px-3 py-2">
                      <span className="line-clamp-3 break-words">{stringifyValue(row[column]) || '-'}</span>
                    </td>
                  ))}
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => openRow(row)}
                        className="rounded border border-slate-700 px-2 py-1 text-xs hover:bg-slate-800"
                      >
                        Megnyitás
                      </button>
                      <button
                        onClick={() => void deleteRow(row)}
                        className="rounded border border-rose-500/40 px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/15"
                      >
                        Törlés
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && filteredRows.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">Nincs megjeleníthető rekord.</p>
          ) : null}
        </div>
      </div>

      {selectedRow ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 md:items-center">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-xl border border-slate-700 bg-slate-900 p-4 md:p-6">
            <h2 className="text-lg font-semibold text-white">Rekord részletei</h2>
            <p className="mb-4 mt-1 text-xs text-slate-400">ID: {String(selectedRow.id ?? '-')}</p>

            <div className="space-y-3">
              {Object.keys(selectedRow).map((field) => {
                const isReadOnly = field === 'id' || field === 'created_at';
                const canEdit = editableFields.includes(field);

                return (
                  <label key={field} className="block text-sm text-slate-200">
                    <span className="mb-1 block text-xs uppercase tracking-wide text-slate-400">{field}</span>
                    {canEdit ? (
                      <input
                        value={editValues[field] ?? ''}
                        onChange={(event) =>
                          setEditValues((previous) => ({ ...previous, [field]: event.target.value }))
                        }
                        className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                      />
                    ) : (
                      <textarea
                        readOnly
                        value={editValues[field] ?? ''}
                        className="min-h-20 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-300"
                        disabled={isReadOnly}
                      />
                    )}
                  </label>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                onClick={() => setSelectedRow(null)}
                className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
              >
                Mégse
              </button>
              <button
                onClick={() => void saveRow()}
                className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
