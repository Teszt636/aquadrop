'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  adminTableConfigs,
  formatAdminDate,
  getGiftReceiptDisplayUrl,
  getGiftStatusValue,
  RESELLER_PIPELINE_OPTIONS,
  type AdminColumnConfig,
  type AdminTableViewName
} from '@/lib/admin/table-config';

type Row = Record<string, unknown>;
type AdminUser = { id: string; name: string; email: string };
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
  if (column.type === 'boolean') {
    return value ? 'Igen' : 'Nem';
  }
  return stringifyValue(value) || '-';
}

function normalizeDatetimeLocalInputValue(value: unknown): string {
  if (!value) {
    return '';
  }

  const parsed = new Date(stringifyValue(value));
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  const yyyy = parsed.getFullYear();
  const mm = `${parsed.getMonth() + 1}`.padStart(2, '0');
  const dd = `${parsed.getDate()}`.padStart(2, '0');
  const hh = `${parsed.getHours()}`.padStart(2, '0');
  const mi = `${parsed.getMinutes()}`.padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function normalizeNextActionParts(value: unknown): { date: string; hour: string; minute: string } {
  if (!value) {
    return { date: '', hour: '', minute: '' };
  }

  const parsed = new Date(stringifyValue(value));
  if (Number.isNaN(parsed.getTime())) {
    return { date: '', hour: '', minute: '' };
  }

  const yyyy = parsed.getFullYear();
  const mm = `${parsed.getMonth() + 1}`.padStart(2, '0');
  const dd = `${parsed.getDate()}`.padStart(2, '0');
  const hh = `${parsed.getHours()}`.padStart(2, '0');
  const minutes = [0, 15, 30, 45];
  const roundedMinute = minutes.reduce((previous, current) =>
    Math.abs(current - parsed.getMinutes()) < Math.abs(previous - parsed.getMinutes()) ? current : previous
  );

  return {
    date: `${yyyy}-${mm}-${dd}`,
    hour: hh,
    minute: `${roundedMinute}`.padStart(2, '0')
  };
}

function combineNextActionAt(date: string, hour: string, minute: string): string | null {
  if (!date) return null;

  const normalizedHour = hour || '10';
  const normalizedMinute = minute || '00';
  return `${date}T${normalizedHour}:${normalizedMinute}:00`;
}

function toWebsiteHref(value: unknown): string | null {
  const raw = stringifyValue(value).trim();
  if (!raw) {
    return null;
  }
  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }
  return `https://${raw}`;
}

function getLeadScoreTone(value: unknown): string {
  const score = Number(value);
  if (!Number.isFinite(score)) return 'text-slate-300 bg-slate-800';
  if (score >= 60) return 'text-rose-200 bg-rose-900/40 border border-rose-700/60';
  if (score >= 40) return 'text-amber-200 bg-amber-900/40 border border-amber-700/60';
  return 'text-cyan-200 bg-cyan-900/40 border border-cyan-700/60';
}

function getPipelineBadgeTone(statusValue: unknown): string {
  const status = stringifyValue(statusValue);
  if (status === 'Partner lett') return 'bg-emerald-900/50 text-emerald-200 border border-emerald-700/70';
  if (status === 'Elutasítva') return 'bg-slate-800 text-slate-300 border border-slate-600';
  return 'bg-indigo-900/40 text-indigo-200 border border-indigo-700/70';
}

function getNextActionState(value: unknown): 'none' | 'overdue' | 'today' | 'future' {
  const raw = stringifyValue(value).trim();
  if (!raw) return 'none';

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return 'none';
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const valueStart = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()).getTime();
  if (valueStart < todayStart) return 'overdue';
  if (valueStart === todayStart) return 'today';
  return 'future';
}

export function AdminDashboard() {
  const [activeTable, setActiveTable] = useState<AdminTableViewName>('announcement_signups');
  const [rows, setRows] = useState<Row[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<Row | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [rowEdits, setRowEdits] = useState<Record<string, Record<string, unknown>>>({});
  const [savingRowId, setSavingRowId] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [hotLeadFilter, setHotLeadFilter] = useState<string>('all');
  const [assignedFilter, setAssignedFilter] = useState<string>('all');
  const [nextActionFilter, setNextActionFilter] = useState<string>('all');
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const rowSaveTimersRef = useRef<Record<string, number>>({});

  const loadRows = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/table?name=${activeTable}`, { cache: 'no-store' });
      const body = (await response.json()) as { rows?: Row[]; adminUsers?: AdminUser[]; error?: string };

      if (!response.ok) {
        throw new Error(body.error ?? 'Sikertelen adatlekérés.');
      }

      setRows(body.rows ?? []);
      setAdminUsers(body.adminUsers ?? []);
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
  const isResellerTable = activeTable === 'reseller_applications';
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

  const resellerSearchRows = useMemo(() => {
    if (!isResellerTable) {
      return filteredRows;
    }

    const needle = normalizeForSearch(query.trim());
    const resellerRows = needle
      ? rows.filter((row) =>
          ['company_name', 'contact_name', 'email', 'phone', 'website', 'message'].some((key) =>
            normalizeForSearch(stringifyValue(row[key])).includes(needle)
          )
        )
      : rows;

    return resellerRows.filter((row) => {
      const status = stringifyValue(row.pipeline_status) || 'Új lead';
      const isHotLead = Boolean(row.is_hot_lead);
      const assignedTo = stringifyValue(row.assigned_to).trim() || 'nincs';
      const nextActionRaw = stringifyValue(row.next_action_at || row.next_action_date).trim();
      const nextActionDate = nextActionRaw ? new Date(nextActionRaw) : null;
      const nextActionKind = !nextActionDate || Number.isNaN(nextActionDate.getTime())
        ? 'none'
        : getNextActionState(nextActionDate.toISOString());

      if (statusFilter !== 'all' && statusFilter !== status) return false;
      if (hotLeadFilter === 'hot' && !isHotLead) return false;
      if (hotLeadFilter === 'not-hot' && isHotLead) return false;
      if (assignedFilter !== 'all' && assignedFilter !== assignedTo) return false;
      if (nextActionFilter !== 'all' && nextActionFilter !== nextActionKind) return false;
      return true;
    });
  }, [assignedFilter, filteredRows, hotLeadFilter, isResellerTable, nextActionFilter, query, rows, statusFilter]);

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

  function getResellerDraftValue(row: Row, key: string): unknown {
    const rowId = getRowId(row);
    if (rowId && rowEdits[rowId] && key in rowEdits[rowId]) {
      return rowEdits[rowId][key];
    }
    return row[key];
  }

  function setResellerDraftValue(rowId: string, key: string, value: unknown) {
    setRowEdits((previous) => ({
      ...previous,
      [rowId]: { ...(previous[rowId] ?? {}), [key]: value }
    }));
  }

  const saveResellerRow = useCallback(async (rowId: string) => {
    const updates = rowEdits[rowId];

    if (!updates || Object.keys(updates).length === 0) {
      return;
    }

    setSavingRowId(rowId);
    const response = await fetch('/api/admin/table', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: activeTable, id: rowId, updates })
    });

    setSavingRowId(null);
    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      alert(body.error ?? 'Sikertelen mentés.');
      return;
    }

    setRowEdits((previous) => {
      const next = { ...previous };
      delete next[rowId];
      return next;
    });
    await loadRows();
  }, [activeTable, loadRows, rowEdits]);

  function scheduleResellerAutoSave(rowId: string) {
    if (rowSaveTimersRef.current[rowId]) {
      window.clearTimeout(rowSaveTimersRef.current[rowId]);
    }
    rowSaveTimersRef.current[rowId] = window.setTimeout(() => {
      void saveResellerRow(rowId);
    }, 450);
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

  useEffect(() => {
    return () => {
      Object.values(rowSaveTimersRef.current).forEach((timerId) => window.clearTimeout(timerId));
      rowSaveTimersRef.current = {};
    };
  }, []);

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
        {isResellerTable ? (
          <div className="mb-4 grid gap-2 md:grid-cols-4">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            >
              <option value="all">Minden státusz</option>
              {RESELLER_PIPELINE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select
              value={hotLeadFilter}
              onChange={(event) => setHotLeadFilter(event.target.value)}
              className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            >
              <option value="all">Hot lead: mind</option>
              <option value="hot">Csak hot lead</option>
              <option value="not-hot">Nem hot lead</option>
            </select>
            <select
              value={assignedFilter}
              onChange={(event) => setAssignedFilter(event.target.value)}
              className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            >
              <option value="all">Felelős: mind</option>
              <option value="nincs">Nincs felelős</option>
              {adminUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            <select
              value={nextActionFilter}
              onChange={(event) => setNextActionFilter(event.target.value)}
              className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            >
              <option value="all">Teendő: mind</option>
              <option value="overdue">Lejárt</option>
              <option value="today">Ma esedékes</option>
              <option value="future">Jövőbeni</option>
              <option value="none">Nincs dátum</option>
            </select>
          </div>
        ) : null}

        {error ? <p className="pb-4 text-sm text-rose-300">{error}</p> : null}
        {loading ? <p className="pb-4 text-sm text-slate-300">Betöltés...</p> : null}

        {isResellerTable ? (
          <div className="space-y-4">
            {resellerSearchRows.map((row) => {
              const rowId = getRowId(row);
              const nextActionDraft = getResellerDraftValue(row, 'next_action_at') ?? getResellerDraftValue(row, 'next_action_date');
              const nextActionParts = normalizeNextActionParts(nextActionDraft);
              const nextActionState = getNextActionState(nextActionDraft);
              const lastContactValue = getResellerDraftValue(row, 'last_contacted_at');
              const email = stringifyValue(getResellerDraftValue(row, 'email'));
              const phone = stringifyValue(getResellerDraftValue(row, 'phone'));
              const websiteRaw = getResellerDraftValue(row, 'website');
              const websiteHref = toWebsiteHref(websiteRaw);
              const pipelineStatus = getResellerDraftValue(row, 'pipeline_status') ?? 'Új lead';
              const leadScore = getResellerDraftValue(row, 'lead_score') ?? 0;
              const isHot = Boolean(getResellerDraftValue(row, 'is_hot_lead'));
              const assignedUserId = stringifyValue(getResellerDraftValue(row, 'assigned_to')).trim();
              const assignedTo =
                adminUsers.find((user) => user.id === assignedUserId)?.name ||
                (assignedUserId ? 'Ismeretlen felhasználó' : 'Nincs felelős');
              const nextActionLabel = nextActionDraft ? formatAdminDate(nextActionDraft) : 'Nincs rögzítve';
              const nextActionDescription = stringifyValue(getResellerDraftValue(row, 'next_action_description'));
              const previousContactValue = getResellerDraftValue(row, 'previous_contacted_at');
              const isExpanded = Boolean(expandedRows[rowId]);
              const nextActionDeadlineTone =
                nextActionState === 'overdue'
                  ? 'text-rose-300'
                  : nextActionState === 'today'
                    ? 'text-amber-300'
                    : nextActionState === 'none'
                      ? 'text-slate-400'
                      : 'text-slate-200';
              const nextActionDeadlineBadgeTone =
                nextActionState === 'overdue'
                  ? 'border-rose-500/60 bg-rose-950/30 text-rose-300'
                  : nextActionState === 'today'
                    ? 'border-amber-500/60 bg-amber-950/30 text-amber-300'
                    : nextActionState === 'none'
                      ? 'border-slate-600 bg-slate-900 text-slate-400'
                      : 'border-slate-600 bg-slate-900 text-slate-300';
              const nextActionDeadlineStatus =
                nextActionState === 'overdue'
                  ? 'Lejárt'
                  : nextActionState === 'today'
                    ? 'Ma'
                    : nextActionState === 'none'
                      ? 'Nincs dátum'
                      : 'Jövőbeni';
              const nextActionTone =
                nextActionState === 'overdue'
                  ? 'border-rose-500/70 bg-rose-950/40 text-rose-200'
                  : nextActionState === 'today'
                    ? 'border-amber-500/70 bg-amber-950/30 text-amber-200'
                    : 'border-slate-700 bg-slate-900 text-slate-200';

              return (
                <article key={rowId} className="rounded-xl border border-slate-700 bg-slate-950/70 p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-white">{stringifyValue(getResellerDraftValue(row, 'company_name')) || 'Névtelen cég'}</p>
                      <p className="text-sm text-slate-200">Kapcsolattartó: {stringifyValue(getResellerDraftValue(row, 'contact_name')) || '-'}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${getPipelineBadgeTone(pipelineStatus)}`}>{stringifyValue(pipelineStatus)}</span>
                        {isHot ? <span className="rounded-full border border-rose-500/70 bg-rose-900/40 px-2 py-1 text-xs font-semibold text-rose-200">🔥 HOT</span> : null}
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${getLeadScoreTone(leadScore)}`}>Lead score: {stringifyValue(leadScore) || '0'}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {phone ? (
                          <a href={`tel:${phone}`} className="rounded border border-cyan-500/40 px-2 py-1 text-cyan-300 hover:bg-cyan-500/10">
                            📞 {phone}
                          </a>
                        ) : (
                          <span className="text-slate-500">Nincs telefonszám</span>
                        )}
                        {email ? (
                          <a href={`mailto:${email}`} className="rounded border border-cyan-500/40 px-2 py-1 text-cyan-300 hover:bg-cyan-500/10">
                            ✉️ {email}
                          </a>
                        ) : (
                          <span className="text-slate-500">Nincs email</span>
                        )}
                        {websiteHref ? (
                          <a href={websiteHref} target="_blank" rel="noopener noreferrer" className="rounded border border-cyan-500/40 px-2 py-1 text-cyan-300 hover:bg-cyan-500/10">
                            🌐 Weboldal
                          </a>
                        ) : null}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <p className="text-sm font-semibold text-white">Következő teendő</p>
                      <p className="text-xs text-slate-300">
                        Felelős: <span className="font-medium text-white">{assignedTo || 'Nincs felelős'}</span>
                      </p>
                      <p className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-slate-400">Határidő:</span>
                        <span className={`font-medium ${nextActionDeadlineTone}`}>{nextActionLabel}</span>
                        <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${nextActionDeadlineBadgeTone}`}>{nextActionDeadlineStatus}</span>
                      </p>
                      <p className="text-xs text-slate-400">Teendő leírása:</p>
                      <p className="whitespace-pre-wrap break-words text-sm text-slate-100">{nextActionDescription || 'Nincs leírás.'}</p>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-slate-800 pt-3">
                    <button
                      type="button"
                      onClick={() => setExpandedRows((previous) => ({ ...previous, [rowId]: !previous[rowId] }))}
                      className="text-sm text-cyan-300 hover:text-cyan-200"
                    >
                      {isExpanded ? 'Részletek elrejtése ▲' : 'Részletek szerkesztése ▼'}
                    </button>

                    {isExpanded ? (
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-xs">
                            <span className={`rounded-full px-2 py-1 font-semibold ${getLeadScoreTone(leadScore)}`}>Lead score: {stringifyValue(leadScore) || '0'}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setResellerDraftValue(rowId, 'is_hot_lead', !isHot);
                                scheduleResellerAutoSave(rowId);
                              }}
                              className={`rounded-full border px-2 py-1 text-xs font-semibold ${isHot ? 'border-rose-500/70 bg-rose-900/40 text-rose-200' : 'border-slate-600 bg-slate-900 text-slate-300'}`}
                            >
                              {isHot ? '🔥 HOT' : 'Nem HOT'}
                            </button>
                          </div>
                          <label className="text-xs text-slate-300">
                            <span className="mb-1 block uppercase tracking-wide text-slate-500">Kapcsolatfelvétel rögzítése</span>
                            <button
                              type="button"
                              onClick={() => {
                                const currentLast = getResellerDraftValue(row, 'last_contacted_at');
                                if (currentLast) {
                                  setResellerDraftValue(rowId, 'previous_contacted_at', stringifyValue(currentLast));
                                }
                                setResellerDraftValue(rowId, 'last_contacted_at', new Date().toISOString());
                                scheduleResellerAutoSave(rowId);
                              }}
                              className="w-full rounded-md border border-cyan-500/40 px-3 py-2 text-sm text-cyan-300 hover:bg-cyan-500/10"
                            >
                              Kapcsolatfelvétel most
                            </button>
                          </label>
                          <p className="text-xs text-slate-400">Utolsó kapcsolat: {lastContactValue ? formatAdminDate(lastContactValue) : 'Nincs rögzítve'}</p>
                          <p className="text-xs text-slate-400">Előző kapcsolat: {previousContactValue ? formatAdminDate(previousContactValue) : 'Nincs rögzítve'}</p>
                        </div>
                        <div className="space-y-3">
                          <label className="text-xs text-slate-300">
                            <span className="mb-1 block uppercase tracking-wide text-slate-500">Státusz</span>
                            <select
                              value={stringifyValue(getResellerDraftValue(row, 'pipeline_status')) || 'Új lead'}
                              onChange={(event) => {
                                setResellerDraftValue(rowId, 'pipeline_status', event.target.value);
                                setResellerDraftValue(rowId, 'next_action_description', '');
                                scheduleResellerAutoSave(rowId);
                              }}
                              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                            >
                              {RESELLER_PIPELINE_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="text-xs text-slate-300">
                            <span className="mb-1 block uppercase tracking-wide text-slate-500">Felelős</span>
                            <select
                              value={assignedUserId}
                              onChange={(event) => {
                                setResellerDraftValue(rowId, 'assigned_to', event.target.value || null);
                                scheduleResellerAutoSave(rowId);
                              }}
                              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                            >
                              <option value="">Nincs felelős</option>
                              {adminUsers.map((user) => (
                                <option key={user.id} value={user.id}>
                                  {user.name}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="text-xs text-slate-300">
                            <span className="mb-1 block uppercase tracking-wide text-slate-500">Lead score</span>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={stringifyValue(getResellerDraftValue(row, 'lead_score'))}
                              onChange={(event) => {
                                setResellerDraftValue(rowId, 'lead_score', event.target.value);
                                scheduleResellerAutoSave(rowId);
                              }}
                              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                            />
                          </label>
                        </div>
                        <div className="text-xs text-slate-300">
                          <span className="mb-1 block uppercase tracking-wide text-slate-500">Következő teendő időpontja</span>
                          <div className={`rounded-md border p-2 ${nextActionTone}`}>
                            <input
                              type="date"
                              value={nextActionParts.date}
                              onChange={(event) => {
                                setResellerDraftValue(rowId, 'next_action_at', combineNextActionAt(event.target.value, '10', '00'));
                                scheduleResellerAutoSave(rowId);
                              }}
                              className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white"
                            />
                          </div>
                        </div>
                        <label className="text-xs text-slate-300 md:col-span-2">
                          <span className="mb-1 block uppercase tracking-wide text-slate-500">Következő teendő leírása</span>
                          <textarea
                            value={stringifyValue(getResellerDraftValue(row, 'next_action_description'))}
                            onChange={(event) => {
                              setResellerDraftValue(rowId, 'next_action_description', event.target.value);
                              scheduleResellerAutoSave(rowId);
                            }}
                            className="min-h-24 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                          />
                        </label>
                        <div className="text-xs text-slate-300">
                          <span className="mb-1 block uppercase tracking-wide text-slate-500">Utolsó kapcsolat</span>
                          <input
                            type="datetime-local"
                            value={normalizeDatetimeLocalInputValue(lastContactValue)}
                            onChange={(event) => {
                              if (lastContactValue) {
                                setResellerDraftValue(rowId, 'previous_contacted_at', stringifyValue(lastContactValue));
                              }
                              setResellerDraftValue(rowId, 'last_contacted_at', event.target.value || null);
                              scheduleResellerAutoSave(rowId);
                            }}
                            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                          />
                          <p className="mt-1 text-[11px] text-slate-400">{lastContactValue ? formatAdminDate(lastContactValue) : 'Nincs rögzítve'}</p>
                        </div>
                      </div>
                    ) : null}
                    {savingRowId === rowId ? <p className="mt-2 text-xs text-emerald-300">Automatikus mentés…</p> : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
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
                    className={`border-b border-slate-800 align-top ${activeConfig.newRowHighlight?.(row) ? 'bg-slate-800/60 font-semibold' : ''}`}
                  >
                    {tableColumns.map((column) => {
                      const receiptDisplayUrl = column.key === 'receipt_url' ? getGiftReceiptDisplayUrl(row) : null;
                      return (
                        <td key={`${getRowId(row)}-${column.key}`} className="max-w-xs px-3 py-2">
                          {column.type === 'link' ? (
                            receiptDisplayUrl ? (
                              <a href={receiptDisplayUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-cyan-500 underline-offset-2">
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
                        <button onClick={() => openRow(row)} className="rounded border border-slate-700 px-2 py-1 text-xs hover:bg-slate-800">
                          Megnyitás
                        </button>
                        <button onClick={() => void deleteRow(row)} className="rounded border border-rose-500/40 px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/15">
                          Törlés
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && (isResellerTable ? resellerSearchRows : filteredRows).length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            {activeConfig.emptyState ?? 'Nincs megjeleníthető rekord.'}
          </p>
        ) : null}

        <p className="text-slate-400 text-sm mt-4">
          {query.trim()
            ? `Szűrt találatok: ${(isResellerTable ? resellerSearchRows : filteredRows).length} / ${rows.length} tétel`
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
                      ) : column.inputType === 'checkbox' ? (
                        <input
                          type="checkbox"
                          checked={editValues[field] === 'true'}
                          onChange={(event) =>
                            setEditValues((previous) => ({
                              ...previous,
                              [field]: event.target.checked ? 'true' : 'false'
                            }))
                          }
                          className="h-4 w-4"
                        />
                      ) : (
                        <input
                          type={column.inputType === 'number' ? 'number' : column.inputType ?? 'text'}
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
