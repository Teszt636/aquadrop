'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  adminTableConfigs,
  formatAdminDate,
  getGiftReceiptDisplayUrl,
  getGiftStatusValue,
  type AdminColumnConfig,
  type AdminTableViewName
} from '@/lib/admin/table-config';

type Row = Record<string, unknown>;
const TABLE_ORDER: AdminTableViewName[] = [
  'announcement_signups',
  'gift_claims',
  'reseller_applications',
  'media_kit_downloads',
  'unsubscribed'
];
const TABLES = TABLE_ORDER.map((key) => ({ key, label: adminTableConfigs[key].label }));

function stringifyValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  return JSON.stringify(value);
}

function normalizeForSearch(value: string): string {
  return value
    .toLocaleLowerCase('hu-HU')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function getRowId(row: Row): string {
  const value = row.id;
  return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
}

function renderCellValue(column: AdminColumnConfig, value: unknown) {
  if (column.type === 'date') {
    return formatAdminDate(value);
  }
  if (column.formatter) {
    return column.formatter(value);
  }
  return stringifyValue(value) || '-';
}

export function AdminDashboard() {
  const [activeTable, setActiveTable] = useState<AdminTableViewName>('announcement_signups');
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

  const activeConfig = adminTableConfigs[activeTable];
  const tableColumns = useMemo(
    () => activeConfig.columns.filter((column) => !column.hiddenInTable),
    [activeConfig.columns]
  );
  const detailColumns = useMemo(
    () => activeConfig.columns.filter((column) => !column.hiddenInDetails),
    [activeConfig.columns]
  );

  const filteredRows = useMemo(() => {
    const needle = normalizeForSearch(query.trim());

    if (!needle) {
      return rows;
    }

    return rows.filter((row) =>
      tableColumns.some((column) => {
        const cellText =
          column.type === 'link'
            ? getGiftReceiptDisplayUrl(row)
              ? 'Blokk megnyitása'
              : 'Nincs blokk'
            : renderCellValue(column, row[column.key]);

        return normalizeForSearch(cellText).includes(needle);
      })
    );
  }, [query, rows, tableColumns]);

  const editableFields = useMemo(
    () => detailColumns.filter((column) => column.editable && selectedRow && column.key in selectedRow),
    [detailColumns, selectedRow]
  );

  function openRow(row: Row) {
    setSelectedRow(row);

    const nextValues: Record<string, string> = {};

    for (const key of Object.keys(row)) {
      nextValues[key] = stringifyValue(row[key]);
    }

    setEditValues(nextValues);
  }

  async function saveRow() {
    if (!selectedRow) {
      return;
    }
    const rowId = getRowId(selectedRow);
    if (!rowId) return;

    const updates = editableFields.reduce<Record<string, string>>((acc, field) => {
      acc[field.key] = editValues[field.key] ?? '';
      return acc;
    }, {});

    const response = await fetch('/api/admin/table', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: activeTable, id: rowId, updates })
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
    const rowId = getRowId(row);
    if (!rowId) {
      return;
    }

    const approved = window.confirm('Biztosan törlöd ezt a rekordot? Ez nem vonható vissza.');

    if (!approved) {
      return;
    }

    const response = await fetch('/api/admin/table', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: activeTable, id: rowId })
    });

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      alert(body.error ?? 'Sikertelen törlés.');
      return;
    }

    if (getRowId(selectedRow ?? {}) === rowId) {
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
            onClick={() => setActiveTable(table.key as AdminTableViewName)}
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
                {tableColumns.map((column) => (
                  <th key={column.key} className="px-3 py-2">
                    {column.label}
                  </th>
                ))}
                <th className="px-3 py-2">Műveletek</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr
                  key={getRowId(row)}
                  className={`border-b border-slate-800 align-top ${
                    activeConfig.newRowHighlight?.(row) ? 'bg-slate-800/60 font-semibold' : ''
                  }`}
                >
                  {tableColumns.map((column) => {
                    const receiptDisplayUrl =
                      column.key === 'receipt_url' ? getGiftReceiptDisplayUrl(row) : null;

                    return (
                      <td key={`${getRowId(row)}-${column.key}`} className="max-w-xs px-3 py-2">
                        {column.type === 'link' ? (
                          receiptDisplayUrl ? (
                            <a
                              href={receiptDisplayUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline decoration-cyan-500 underline-offset-2"
                            >
                              Blokk megnyitása
                            </a>
                          ) : (
                            <span className="line-clamp-3 break-words">Nincs blokk</span>
                          )
                        ) : (
                          <span className="line-clamp-3 break-words">{renderCellValue(column, row[column.key])}</span>
                        )}
                      </td>
                    );
                  })}
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
            <p className="py-6 text-center text-sm text-slate-400">
              {activeConfig.emptyState ?? 'Nincs megjeleníthető rekord.'}
            </p>
          ) : null}
        </div>

        <p className="text-slate-400 text-sm mt-4">
          {query.trim()
            ? `Szűrt találatok: ${filteredRows.length} / ${rows.length} tétel`
            : `Összesen: ${rows.length} tétel`}
        </p>
      </div>

      {selectedRow ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 md:items-center">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-xl border border-slate-700 bg-slate-900 p-4 md:p-6">
            <h2 className="text-lg font-semibold text-white">Rekord részletei</h2>

            <div className="space-y-3">
              {detailColumns.map((column) => {
                const field = column.key;
                const canEdit = editableFields.some((editable) => editable.key === field);
                const value = selectedRow[field];
                const receiptDisplayUrl = field === 'receipt_url' ? getGiftReceiptDisplayUrl(selectedRow) : null;

                return (
                  <label key={field} className="block text-sm text-slate-200">
                    <span className="mb-1 block text-xs uppercase tracking-wide text-slate-400">{column.label}</span>
                    {canEdit ? (
                      column.inputType === 'select' ? (
                        <select
                          value={editValues[field] ?? getGiftStatusValue(selectedRow)}
                          onChange={(event) =>
                            setEditValues((previous) => ({ ...previous, [field]: event.target.value }))
                          }
                          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                        >
                          {(column.options ?? []).map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : column.inputType === 'textarea' ? (
                        <textarea
                          value={editValues[field] ?? ''}
                          onChange={(event) =>
                            setEditValues((previous) => ({ ...previous, [field]: event.target.value }))
                          }
                          className="min-h-24 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                        />
                      ) : (
                        <input
                          value={editValues[field] ?? ''}
                          onChange={(event) =>
                            setEditValues((previous) => ({ ...previous, [field]: event.target.value }))
                          }
                          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                        />
                      )
                    ) : column.type === 'link' ? (
                      receiptDisplayUrl ? (
                        <a
                          href={receiptDisplayUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex rounded-md border border-slate-700 px-3 py-2 text-sm text-cyan-300 hover:bg-slate-800"
                        >
                          Blokk megnyitása
                        </a>
                      ) : (
                        <p className="py-2 text-sm text-slate-400">Nincs blokk</p>
                      )
                    ) : (
                      <textarea
                        readOnly
                        value={renderCellValue(column, value)}
                        className="min-h-20 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-300"
                        disabled
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
