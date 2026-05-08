'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  adminTableConfigs,
  formatAdminDate,
  formatAdminDateShort,
  GIFT_PIPELINE_STATUS_OPTIONS,
  GIFT_RECEIPT_CHECK_STATUS_OPTIONS,
  GIFT_SHIPPING_STATUS_OPTIONS,
  getGiftReceiptDisplayUrl,
  getGiftStatusValue,
  RESELLER_PIPELINE_OPTIONS,
  type AdminColumnConfig,
  type AdminTableViewName
} from '@/lib/admin/table-config';
import { type AdminSessionUser } from '@/lib/admin/constants';
import {
  buildUtcIsoFromBudapestParts,
  getBudapestDateKey,
  getBudapestDateTimeParts
} from '@/lib/datetime/budapest';

type Row = Record<string, unknown>;
type AdminUser = { id: string; name: string; email: string };
type ResellerActivityLog = {
  id: string;
  created_at: string;
  changed_by_name: string | null;
  changed_by_email: string | null;
  change_summary: string | null;
};
type GiftActivityLog = {
  id: string;
  created_at: string;
  changed_by_name: string | null;
  changed_by_email: string | null;
  change_summary: string | null;
};
type ActivityState = {
  loading: boolean;
  error: string | null;
  logs: ResellerActivityLog[];
};
const TABLE_ORDER: AdminTableViewName[] = [
  'announcement_signups',
  'unsubscribed',
  'media_kit_downloads',
  'gift_claims',
  'reseller_applications',
  'admin_users'
];
const CRM_EDITABLE_TABLES: AdminTableViewName[] = ['reseller_applications', 'gift_claims'];
const GIFT_CLOSED_PIPELINE_STATUSES = new Set(['Elutasítva', 'Lezárva', 'Kézbesítve']);
const CRM_GIFT_CLAIMS_EDITABLE_FIELDS = new Set([
  'status',
  'admin_note',
  'shipping_address',
  'purchase_location',
  'purchase_date'
]);
type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'crm_user';
  is_active: boolean;
};
type IndexNowSkippedUrl = {
  url: string;
  reason?: string | null;
};
type IndexNowResult = {
  success: boolean;
  dryRun?: boolean;
  submitted?: string[];
  skipped?: IndexNowSkippedUrl[];
  indexNowStatus?: number | null;
  submittedCount?: number;
  skippedCount?: number;
  error?: string;
  message?: string;
};
type IndexNowSubmitMode = 'dryRun' | 'submit';

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

function normalizeNextActionParts(value: unknown): { date: string; hour: string; minute: string } {
  if (!value) {
    return { date: '', hour: '', minute: '' };
  }

  const parts = getBudapestDateTimeParts(stringifyValue(value));
  if (!parts.date) {
    return { date: '', hour: '', minute: '' };
  }

  const minutes = [0, 15, 30, 45];
  const currentMinute = Number(parts.minute);
  const roundedMinute = minutes.reduce((previous, current) =>
    Math.abs(current - currentMinute) < Math.abs(previous - currentMinute) ? current : previous
  );

  return {
    date: parts.date,
    hour: parts.hour,
    minute: `${roundedMinute}`.padStart(2, '0')
  };
}

function combineNextActionAt(date: string, hour: string, minute: string): string | null {
  if (!date) return null;

  const normalizedHour = hour || '10';
  const normalizedMinute = minute || '00';
  const hourNumber = Number(normalizedHour);
  const minuteNumber = Number(normalizedMinute);
  const allowedMinuteValues = new Set([0, 15, 30, 45]);

  if (!Number.isInteger(hourNumber) || hourNumber < 6 || hourNumber > 20) {
    return null;
  }
  if (!Number.isInteger(minuteNumber) || !allowedMinuteValues.has(minuteNumber)) {
    return null;
  }

  try {
    return buildUtcIsoFromBudapestParts(date, normalizedHour, normalizedMinute);
  } catch {
    return null;
  }
}

function formatNextActionSummary(value: unknown): string {
  const parts = normalizeNextActionParts(value);
  if (!parts.date) {
    return 'Időpont kiválasztása';
  }
  const [year, month, day] = parts.date.split('-');
  return `${year}.${month}.${day} ${parts.hour || '10'}:${parts.minute || '00'}`;
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
  const nowDateKey = getBudapestDateKey(new Date().toISOString());
  const valueDateKey = getBudapestDateKey(parsed.toISOString());
  if (!nowDateKey || !valueDateKey) return 'none';
  if (valueDateKey < nowDateKey) return 'overdue';
  if (valueDateKey === nowDateKey) return 'today';
  return 'future';
}

export function AdminDashboard({ sessionUser }: { sessionUser: AdminSessionUser }) {
  const isAdmin = sessionUser.role === 'admin';
  const nextActionHourOptions = useMemo(
    () => Array.from({ length: 15 }, (_, index) => `${index + 6}`.padStart(2, '0')),
    []
  );
  const nextActionMinuteOptions = useMemo(() => ['00', '15', '30', '45'], []);
  const [activeTable, setActiveTable] = useState<AdminTableViewName>(
    'announcement_signups'
  );
  const [rows, setRows] = useState<Row[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<Row | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [rowEdits, setRowEdits] = useState<Record<string, Record<string, unknown>>>({});
  const [rowSaveState, setRowSaveState] = useState<Record<string, { status: 'idle' | 'saving' | 'saved' | 'error'; message: string | null }>>({});
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [expandedHistoryRows, setExpandedHistoryRows] = useState<Record<string, boolean>>({});
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [giftReceiptFilter, setGiftReceiptFilter] = useState<string>('all');
  const [giftShippingFilter, setGiftShippingFilter] = useState<string>('all');
  const [hotLeadFilter, setHotLeadFilter] = useState<string>('all');
  const [assignedFilter, setAssignedFilter] = useState<string>('all');
  const [nextActionFilter, setNextActionFilter] = useState<string>('all');
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [indexNowResult, setIndexNowResult] = useState<IndexNowResult | null>(null);
  const [indexNowLoadingMode, setIndexNowLoadingMode] = useState<IndexNowSubmitMode | null>(null);
  const [activityByRowId, setActivityByRowId] = useState<Record<string, ActivityState>>({});
  const [nextActionEditors, setNextActionEditors] = useState<
    Record<string, { isOpen: boolean; date: string; hour: string; minute: string }>
  >({});
  const [giftNotificationStateByRowId, setGiftNotificationStateByRowId] = useState<
    Record<string, { status: 'idle' | 'pending' | 'info' | 'error'; message: string | null }>
  >({});
  const [giftNotificationModal, setGiftNotificationModal] = useState<{
    rowId: string;
    missingConditions: string[];
  } | null>(null);
  const rowSaveStateTimersRef = useRef<Record<string, number>>({});
  const rowSaveQueueRef = useRef<Record<string, Promise<boolean>>>({});
  const expandedHistoryRowsRef = useRef<Record<string, boolean>>({});
  const TABLES = useMemo(
    () => {
      const visible: AdminTableViewName[] =
        sessionUser.role === 'crm_user'
          ? TABLE_ORDER.filter((table) => table !== 'admin_users')
          : TABLE_ORDER;
      return visible
        .filter((key) => !(key === 'admin_users' && sessionUser.role !== 'admin'))
        .map((key) => ({ key, label: adminTableConfigs[key].label }));
    },
    [sessionUser.role]
  );

  const loadRows = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const endpoint = activeTable === 'admin_users' ? '/api/admin/users' : `/api/admin/table?name=${activeTable}`;
      const response = await fetch(endpoint, { cache: 'no-store' });
      const body = (await response.json()) as { rows?: Row[]; adminUsers?: AdminUser[]; error?: string };

      if (!response.ok) {
        throw new Error(body.error ?? 'Sikertelen adatlekérés.');
      }

      const nextRows = body.rows ?? [];
      setRows(nextRows);
      setAdminUsers(body.adminUsers ?? []);
      if (activeTable === 'admin_users') {
        setManagedUsers(nextRows as ManagedUser[]);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Sikertelen adatlekérés.');
    } finally {
      setLoading(false);
    }
  }, [activeTable]);

  const fetchActivityLogs = useCallback(async (table: 'reseller_applications' | 'gift_claims', rowId: string) => {
    if (!rowId) {
      return;
    }

    setActivityByRowId((previous) => ({
      ...previous,
      [rowId]: {
        loading: true,
        error: null,
        logs: previous[rowId]?.logs ?? []
      }
    }));

    try {
      const endpoint =
        table === 'reseller_applications'
          ? `/api/admin/reseller-activity?resellerId=${encodeURIComponent(rowId)}`
          : `/api/admin/gift-activity?giftClaimId=${encodeURIComponent(rowId)}`;
      const response = await fetch(endpoint, {
        cache: 'no-store'
      });
      const body = (await response.json()) as { rows?: Array<ResellerActivityLog | GiftActivityLog>; error?: string };
      if (!response.ok) {
        throw new Error(body.error ?? 'Sikertelen előzmény lekérdezés.');
      }
      const nextLogs = [...(body.rows ?? [])].sort(
        (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
      );

      setActivityByRowId((previous) => ({
        ...previous,
        [rowId]: {
          loading: false,
          error: null,
          logs: nextLogs
        }
      }));
    } catch (activityError) {
      setActivityByRowId((previous) => ({
        ...previous,
        [rowId]: {
          loading: false,
          error: activityError instanceof Error ? activityError.message : 'Sikertelen előzmény lekérdezés.',
          logs: previous[rowId]?.logs ?? []
        }
      }));
    }
  }, []);

  const getChangedByPayload = useCallback(
    () => ({
      changed_by_user_id: sessionUser.id,
      changed_by_name: sessionUser.name,
      changed_by_email: sessionUser.email
    }),
    [sessionUser.email, sessionUser.id, sessionUser.name]
  );

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  useEffect(() => {
    if (!TABLES.some((table) => table.key === activeTable)) {
      setActiveTable(TABLES[0]?.key ?? 'reseller_applications');
    }
  }, [TABLES, activeTable]);

  useEffect(() => {
    expandedHistoryRowsRef.current = expandedHistoryRows;
  }, [expandedHistoryRows]);

  const activeConfig = adminTableConfigs[activeTable];
  const isResellerTable = activeTable === 'reseller_applications';
  const isGiftClaimsTable = activeTable === 'gift_claims';
  const canModifyActiveTable = isAdmin || CRM_EDITABLE_TABLES.includes(activeTable);
  const canDeleteInTable = isAdmin;
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

  const getResellerDraftValue = useCallback(
    (row: Row, key: string): unknown => {
      const rowId = getRowId(row);
      if (rowId && rowEdits[rowId] && key in rowEdits[rowId]) {
        return rowEdits[rowId][key];
      }
      return row[key];
    },
    [rowEdits]
  );

  const giftSearchRows = useMemo(() => {
    if (!isGiftClaimsTable) {
      return filteredRows;
    }

    const needle = normalizeForSearch(query.trim());
    const giftRows = needle
      ? rows.filter((row) =>
          ['full_name', 'email', 'phone', 'shipping_address', 'purchase_location', 'tracking_number'].some((key) =>
            normalizeForSearch(stringifyValue(row[key])).includes(needle)
          )
        )
      : rows;

    const filtered = giftRows.filter((row) => {
      const pipelineStatus = stringifyValue(getResellerDraftValue(row, 'pipeline_status')).trim() || 'Új igénylés';
      const receiptStatus = stringifyValue(getResellerDraftValue(row, 'receipt_check_status')).trim() || 'Ellenőrzésre vár';
      const shippingStatus = stringifyValue(getResellerDraftValue(row, 'shipping_status')).trim() || 'Nincs előkészítve';
      const assignedTo = stringifyValue(getResellerDraftValue(row, 'assigned_to')).trim() || 'nincs';
      const nextActionKind = getNextActionState(getResellerDraftValue(row, 'next_action_at'));

      if (statusFilter !== 'all' && statusFilter !== pipelineStatus) return false;
      if (giftReceiptFilter !== 'all' && giftReceiptFilter !== receiptStatus) return false;
      if (giftShippingFilter !== 'all' && giftShippingFilter !== shippingStatus) return false;
      if (assignedFilter !== 'all' && assignedFilter !== assignedTo) return false;
      if (nextActionFilter !== 'all' && nextActionFilter !== nextActionKind) return false;
      return true;
    });

    return [...filtered].sort((left, right) => {
      const leftStatus = stringifyValue(left.pipeline_status).trim() || 'Új igénylés';
      const rightStatus = stringifyValue(right.pipeline_status).trim() || 'Új igénylés';
      const leftIsClosed = GIFT_CLOSED_PIPELINE_STATUSES.has(leftStatus);
      const rightIsClosed = GIFT_CLOSED_PIPELINE_STATUSES.has(rightStatus);
      if (leftIsClosed !== rightIsClosed) {
        return leftIsClosed ? 1 : -1;
      }

      const leftValue = stringifyValue(left.next_action_at).trim();
      const rightValue = stringifyValue(right.next_action_at).trim();
      if (!leftValue && !rightValue) return 0;
      if (!leftValue) return 1;
      if (!rightValue) return -1;
      return new Date(leftValue).getTime() - new Date(rightValue).getTime();
    });
  }, [
    assignedFilter,
    filteredRows,
    giftReceiptFilter,
    giftShippingFilter,
    isGiftClaimsTable,
    nextActionFilter,
    query,
    rows,
    statusFilter,
    getResellerDraftValue
  ]);

  const editableFields = useMemo(
    () =>
      canModifyActiveTable
        ? detailColumns.filter((column) => {
            if (!column.editable || !selectedRow || !(column.key in selectedRow)) {
              return false;
            }
            if (isAdmin) {
              return true;
            }
            if (activeTable === 'gift_claims') {
              return CRM_GIFT_CLAIMS_EDITABLE_FIELDS.has(column.key);
            }
            return activeTable === 'reseller_applications';
          })
        : [],
    [activeTable, canModifyActiveTable, detailColumns, isAdmin, selectedRow]
  );

  function openRow(row: Row) {
    setSelectedRow(row);

    const nextValues: Record<string, string> = {};

    for (const key of Object.keys(row)) {
      nextValues[key] = stringifyValue(row[key]);
    }

    setEditValues(nextValues);
  }

  function setResellerDraftValue(rowId: string, key: string, value: unknown) {
    setRowEdits((previous) => ({
      ...previous,
      [rowId]: { ...(previous[rowId] ?? {}), [key]: value }
    }));
  }

  function commitResellerUpdates(rowId: string, updates: Record<string, unknown>) {
    setRowEdits((previous) => {
      const current = previous[rowId] ?? {};
      return {
        ...previous,
        [rowId]: { ...current, ...updates }
      };
    });
  }

  function clearSavedStateLater(rowId: string) {
    if (rowSaveStateTimersRef.current[rowId]) {
      window.clearTimeout(rowSaveStateTimersRef.current[rowId]);
    }
    rowSaveStateTimersRef.current[rowId] = window.setTimeout(() => {
      setRowSaveState((previous) => ({
        ...previous,
        [rowId]: { status: 'idle', message: null }
      }));
    }, 1500);
  }

  function openNextActionEditor(rowId: string, row: Row) {
    const nextActionDraft = getResellerDraftValue(row, 'next_action_at') ?? getResellerDraftValue(row, 'next_action_date');
    const parts = normalizeNextActionParts(nextActionDraft);
    setNextActionEditors((previous) => ({
      ...previous,
      [rowId]: {
        isOpen: true,
        date: parts.date,
        hour: parts.hour,
        minute: parts.minute
      }
    }));
  }

  function closeNextActionEditor(rowId: string) {
    const editor = nextActionEditors[rowId];
    if (!editor) return;
    setNextActionEditors((previous) => ({
      ...previous,
      [rowId]: { ...editor, isOpen: false }
    }));
  }

  function updateNextActionDraft(rowId: string, update: Partial<{ date: string; hour: string; minute: string }>) {
    const current = nextActionEditors[rowId] ?? { isOpen: true, date: '', hour: '', minute: '' };
    const nextEditor = { ...current, ...update };
    if (nextEditor.date && !nextEditor.hour) {
      nextEditor.hour = '10';
    }
    if (nextEditor.date && !nextEditor.minute) {
      nextEditor.minute = '00';
    }
    setNextActionEditors((previous) => ({
      ...previous,
      [rowId]: nextEditor
    }));
  }

  const persistResellerUpdates = useCallback(
    (rowId: string, updates: Record<string, unknown>) => {
      if (!rowId || Object.keys(updates).length === 0) {
        return Promise.resolve(false);
      }

      const runSave = async () => {
        let didSucceed = false;
        setRowSaveState((previous) => ({
          ...previous,
          [rowId]: { status: 'saving', message: 'Mentés...' }
        }));

        const response = await fetch('/api/admin/table', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ table: activeTable, id: rowId, updates, ...getChangedByPayload() })
        });
        const body = (await response.json()) as {
          success?: boolean;
          error?: string;
          newActivityLogs?: ResellerActivityLog[];
        };

        if (!response.ok) {
          setRowSaveState((previous) => ({
            ...previous,
            [rowId]: { status: 'error', message: body.error ?? 'Hiba a mentéskor' }
          }));
          return false;
        }
        if (!body.success) {
          setRowSaveState((previous) => ({
            ...previous,
            [rowId]: { status: 'error', message: body.error ?? 'Sikertelen mentés.' }
          }));
          return false;
        }

        setRowSaveState((previous) => ({
          ...previous,
          [rowId]: { status: 'saved', message: 'Mentve' }
        }));
        didSucceed = true;
        clearSavedStateLater(rowId);
        if (expandedHistoryRowsRef.current[rowId]) {
          if (Array.isArray(body.newActivityLogs)) {
            const nextLogs = [...body.newActivityLogs].sort(
              (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
            );
            setActivityByRowId((previous) => ({
              ...previous,
              [rowId]: {
                loading: false,
                error: null,
                logs: nextLogs
              }
            }));
          } else {
            if (activeTable === 'reseller_applications' || activeTable === 'gift_claims') {
              await fetchActivityLogs(activeTable, rowId);
            }
          }
        }
        return didSucceed;
      };

      const queued = (rowSaveQueueRef.current[rowId] ?? Promise.resolve()).then(runSave, runSave);
      rowSaveQueueRef.current[rowId] = queued;
      return queued;
    },
    [activeTable, fetchActivityLogs, getChangedByPayload]
  );

  async function saveNextActionDraft(rowId: string) {
    const editor = nextActionEditors[rowId];
    if (!editor) {
      return;
    }
    if (!editor.date || !editor.hour || !editor.minute) {
      setRowSaveState((previous) => ({
        ...previous,
        [rowId]: { status: 'error', message: 'Válassz dátumot, órát és percet.' }
      }));
      return;
    }

    const nextActionAt = combineNextActionAt(editor.date, editor.hour, editor.minute);
    if (!nextActionAt) {
      setRowSaveState((previous) => ({
        ...previous,
        [rowId]: { status: 'error', message: 'Érvénytelen időpont. Válassz 06:00–20:45 közötti, 15 perces időt.' }
      }));
      return;
    }

    commitResellerUpdates(rowId, { next_action_at: nextActionAt });
    const didSave = await persistResellerUpdates(rowId, { next_action_at: nextActionAt });
    if (!didSave) {
      return;
    }
    closeNextActionEditor(rowId);
  }

  async function sendGiftNotification(rowId: string) {
    setGiftNotificationStateByRowId((previous) => ({
      ...previous,
      [rowId]: { status: 'pending', message: null }
    }));

    try {
      const response = await fetch('/api/admin/gift/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giftClaimId: rowId, ...getChangedByPayload() })
      });

      const body = (await response.json()) as {
        success?: boolean;
        notificationType?: 'hianypotlas' | 'jovahagyas' | 'szallitas' | 'elutasitas';
        resendAttempted?: boolean;
        resendResponse?: { id?: string } | null;
        resendError?: string | null;
        error?: string;
        missingConditions?: string[];
      };

      if (!response.ok || !body.success) {
        const missing = Array.isArray(body.missingConditions) ? body.missingConditions : [];
        if (missing.length > 0) {
          setGiftNotificationModal({ rowId, missingConditions: missing });
        }
        const message = body.resendError
          ? `Email küldési hiba: ${body.resendError}`
          : body.error ?? 'Sikertelen email küldés.';
        setGiftNotificationStateByRowId((previous) => ({
          ...previous,
          [rowId]: { status: 'error', message }
        }));
        return;
      }

      const typeLabelMap: Record<NonNullable<typeof body.notificationType>, string> = {
        hianypotlas: 'Hiánypótlás',
        jovahagyas: 'Jóváhagyás',
        szallitas: 'Szállítás',
        elutasitas: 'Elutasítás'
      };
      const resendId = body.resendResponse?.id;
      const attemptedLabel = body.resendAttempted ? 'true' : 'false';

      setGiftNotificationStateByRowId((previous) => ({
        ...previous,
        [rowId]: {
          status: 'info',
          message: resendId
            ? `Email elküldve. Resend ID: ${resendId} (resendAttempted=${attemptedLabel})`
            : `Értesítő elküldve: ${typeLabelMap[body.notificationType ?? 'jovahagyas']} (resendAttempted=${attemptedLabel})`
        }
      }));
    } catch {
      setGiftNotificationStateByRowId((previous) => ({
        ...previous,
        [rowId]: { status: 'error', message: 'Sikertelen email küldés.' }
      }));
    }
  }

  function getGiftNotificationMissingConditionLabel(condition: string): string {
    const normalized = condition.trim();
    const labels: Record<string, string> = {
      'pipeline_status legyen az alábbiak egyike: Hiánypótlás szükséges, Jóváhagyva, Futárnak átadva, Elutasítva':
        'A státusz legyen: Hiánypótlás szükséges / Jóváhagyva / Futárnak átadva / Elutasítva',
      'receipt_check_status legyen "Nem olvasható" vagy "Nem megfelelő termék"':
        'A blokk állapota legyen: Nem olvasható vagy Nem megfelelő termék',
      'receipt_check_note nem lehet üres': 'Az ellenőrzési megjegyzés legyen kitöltve',
      'receipt_check_status legyen "Érvényes blokk"': 'A blokk állapota legyen: Érvényes blokk',
      'courier_name nem lehet üres': 'A futárszolgálat neve legyen kitöltve',
      'tracking_number nem lehet üres': 'A tracking szám legyen kitöltve',
      'receipt_check_status legyen "Duplikált blokk gyanú" vagy "Elutasítva"':
        'A blokk állapota legyen: Duplikált blokk gyanú vagy Elutasítva',
      'email nem lehet üres': 'Az email cím legyen kitöltve'
    };
    return labels[normalized] ?? normalized;
  }

  async function saveRow() {
    if (!canModifyActiveTable) {
      return;
    }
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
      body: JSON.stringify({ table: activeTable, id: rowId, updates, ...getChangedByPayload() })
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
    if (!canDeleteInTable) {
      return;
    }
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

  async function createCrmUser() {
    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        is_active: true
      })
    });
    const body = (await response.json()) as { error?: string };
    if (!response.ok) {
      alert(body.error ?? 'Sikertelen felhasználó létrehozás.');
      return;
    }
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    await loadRows();
  }

  async function updateManagedUser(
    userId: string,
    updates: Partial<{ name: string; email: string; is_active: boolean; password: string }>
  ) {
    const response = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, ...updates })
    });
    const body = (await response.json()) as { error?: string };
    if (!response.ok) {
      alert(body.error ?? 'Sikertelen felhasználó frissítés.');
      return;
    }
    await loadRows();
  }

  async function submitIndexNow(mode: IndexNowSubmitMode) {
    const dryRun = mode === 'dryRun';

    if (!dryRun) {
      const approved = window.confirm('Biztosan beküldöd az összes publikus sitemap URL-t IndexNow-ra?');
      if (!approved) {
        return;
      }
    }

    setIndexNowLoadingMode(mode);
    setIndexNowResult(null);

    try {
      const response = await fetch('/api/admin/indexnow-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preset: 'sitemap',
          dryRun
        })
      });
      const body = (await response.json()) as IndexNowResult;

      if (!response.ok || body.success === false) {
        const message =
          body.error?.includes('INDEXNOW_KEY')
            ? 'Hiányzik az INDEXNOW_KEY környezeti változó.'
            : body.error ?? body.message ?? 'Ismeretlen IndexNow hiba.';
        setIndexNowResult({ ...body, success: false, error: message });
        return;
      }

      setIndexNowResult(body);
    } catch (submitError) {
      setIndexNowResult({
        success: false,
        error: submitError instanceof Error ? submitError.message : 'Ismeretlen IndexNow hiba.'
      });
    } finally {
      setIndexNowLoadingMode(null);
    }
  }

  useEffect(() => {
    return () => {
      Object.values(rowSaveStateTimersRef.current).forEach((timerId) => window.clearTimeout(timerId));
      rowSaveStateTimersRef.current = {};
      rowSaveQueueRef.current = {};
    };
  }, []);

  return (
    <section className="space-y-4">
      <header className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl font-semibold text-white md:text-2xl">Aquadrop Admin</h1>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-300">
            Belépve: {sessionUser.name} ({sessionUser.email}) · {sessionUser.role}
          </span>
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
        {activeTable === 'admin_users' ? (
          <div className="space-y-4">
            <div className="grid gap-2 rounded-lg border border-slate-800 bg-slate-950/60 p-3 md:grid-cols-4">
              <input
                value={newUserName}
                onChange={(event) => setNewUserName(event.target.value)}
                placeholder="Név"
                className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
              <input
                value={newUserEmail}
                onChange={(event) => setNewUserEmail(event.target.value)}
                placeholder="Email"
                type="email"
                className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
              <input
                value={newUserPassword}
                onChange={(event) => setNewUserPassword(event.target.value)}
                placeholder="Kezdő jelszó (opcionális)"
                type="password"
                className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
              <button
                onClick={() => void createCrmUser()}
                className="rounded bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
              >
                Kezelő hozzáadása
              </button>
            </div>

            <div className="space-y-2">
              {managedUsers.map((user) => (
                <div key={user.id} className="grid gap-2 rounded-lg border border-slate-800 bg-slate-950/60 p-3 md:grid-cols-5">
                  <input
                    defaultValue={user.name}
                    onBlur={(event) => void updateManagedUser(user.id, { name: event.target.value })}
                    className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                  />
                  <input
                    defaultValue={user.email}
                    onBlur={(event) => void updateManagedUser(user.id, { email: event.target.value })}
                    className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                  />
                  <input
                    placeholder="Új jelszó"
                    type="password"
                    onBlur={(event) =>
                      event.target.value ? void updateManagedUser(user.id, { password: event.target.value }) : undefined
                    }
                    className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                  />
                  <button
                    onClick={() => void updateManagedUser(user.id, { is_active: !user.is_active })}
                    className={`rounded px-3 py-2 text-sm ${user.is_active ? 'bg-emerald-700 text-white' : 'bg-slate-700 text-slate-100'}`}
                  >
                    {user.is_active ? 'Aktív' : 'Inaktív'}
                  </button>
                  <div className="rounded border border-slate-700 px-3 py-2 text-sm text-slate-300">{user.role}</div>
                </div>
              ))}
            </div>

            {isAdmin ? (
              <div className="space-y-4 rounded-lg border border-cyan-900/70 bg-slate-950/60 p-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-white">IndexNow beküldés</h2>
                  <p className="max-w-3xl text-sm leading-6 text-slate-300">
                    Az IndexNow segítségével jelezheted a Bing és más támogatott keresők felé, hogy az Aquadrop
                    publikus SEO oldalai frissültek.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => void submitIndexNow('dryRun')}
                    disabled={indexNowLoadingMode !== null}
                    className="rounded-md border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {indexNowLoadingMode === 'dryRun' ? 'Feldolgozás...' : 'URL-ek ellenőrzése küldés nélkül'}
                  </button>
                  <button
                    onClick={() => void submitIndexNow('submit')}
                    disabled={indexNowLoadingMode !== null}
                    className="rounded-md bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {indexNowLoadingMode === 'submit' ? 'Feldolgozás...' : 'Beküldés IndexNow-ra'}
                  </button>
                </div>

                {indexNowResult ? (
                  <div
                    className={`space-y-3 rounded-lg border p-3 text-sm ${
                      indexNowResult.success
                        ? 'border-emerald-800 bg-emerald-950/30 text-emerald-100'
                        : 'border-rose-800 bg-rose-950/30 text-rose-100'
                    }`}
                  >
                    {indexNowResult.success ? (
                      indexNowResult.dryRun ? (
                        <div className="grid gap-2 md:grid-cols-3">
                          <div>
                            <div className="text-xs text-slate-300">Ellenőrzött URL-ek száma</div>
                            <div className="text-lg font-semibold">
                              {(indexNowResult.submittedCount ?? indexNowResult.submitted?.length ?? 0) +
                                (indexNowResult.skippedCount ?? indexNowResult.skipped?.length ?? 0)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-300">Beküldésre alkalmas URL-ek száma</div>
                            <div className="text-lg font-semibold">
                              {indexNowResult.submittedCount ?? indexNowResult.submitted?.length ?? 0}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-300">Kihagyott URL-ek száma</div>
                            <div className="text-lg font-semibold">
                              {indexNowResult.skippedCount ?? indexNowResult.skipped?.length ?? 0}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="font-semibold">IndexNow beküldés sikeres</p>
                          <p>indexNowStatus: {indexNowResult.indexNowStatus ?? 'nincs'}</p>
                          <p>submittedCount: {indexNowResult.submittedCount ?? indexNowResult.submitted?.length ?? 0}</p>
                          <p>skippedCount: {indexNowResult.skippedCount ?? indexNowResult.skipped?.length ?? 0}</p>
                        </div>
                      )
                    ) : (
                      <div className="space-y-1">
                        <p className="font-semibold">IndexNow hiba</p>
                        <p>{indexNowResult.error ?? indexNowResult.message ?? 'Ismeretlen hiba.'}</p>
                      </div>
                    )}

                    <details className="rounded-md border border-slate-800 bg-slate-950/70 p-3 text-slate-100">
                      <summary className="cursor-pointer font-semibold">Beküldött URL-ek megjelenítése</summary>
                      <div className="mt-3 grid gap-4 lg:grid-cols-2">
                        <div>
                          <h3 className="mb-2 text-sm font-semibold">Submitted URL-ek</h3>
                          {indexNowResult.submitted?.length ? (
                            <ul className="max-h-64 space-y-1 overflow-auto text-xs text-slate-300">
                              {indexNowResult.submitted.map((url) => (
                                <li key={url} className="break-all rounded border border-slate-800 bg-slate-900 px-2 py-1">
                                  {url}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-slate-400">Nincs submitted URL.</p>
                          )}
                        </div>
                        <div>
                          <h3 className="mb-2 text-sm font-semibold">Skipped URL-ek</h3>
                          {indexNowResult.skipped?.length ? (
                            <ul className="max-h-64 space-y-1 overflow-auto text-xs text-slate-300">
                              {indexNowResult.skipped.map((item, index) => (
                                <li
                                  key={`${item.url}-${item.reason ?? 'unknown'}-${index}`}
                                  className="break-all rounded border border-slate-800 bg-slate-900 px-2 py-1"
                                >
                                  {item.url}
                                  {item.reason ? <span className="text-slate-400"> · {item.reason}</span> : null}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-slate-400">Nincs skipped URL.</p>
                          )}
                        </div>
                      </div>
                    </details>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : isResellerTable ? (
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
        ) : isGiftClaimsTable ? (
          <div className="mb-4 grid gap-2 md:grid-cols-3 lg:grid-cols-6">
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white">
              <option value="all">Pipeline: mind</option>
              {GIFT_PIPELINE_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <select value={giftReceiptFilter} onChange={(event) => setGiftReceiptFilter(event.target.value)} className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white">
              <option value="all">Blokk: mind</option>
              {GIFT_RECEIPT_CHECK_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <select value={giftShippingFilter} onChange={(event) => setGiftShippingFilter(event.target.value)} className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white">
              <option value="all">Szállítás: mind</option>
              {GIFT_SHIPPING_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <select value={assignedFilter} onChange={(event) => setAssignedFilter(event.target.value)} className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white">
              <option value="all">Felelős: mind</option>
              <option value="nincs">Nincs felelős</option>
              {adminUsers.map((user) => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            <select value={nextActionFilter} onChange={(event) => setNextActionFilter(event.target.value)} className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white">
              <option value="all">Teendő: mind</option>
              <option value="overdue">Lejárt</option>
              <option value="today">Ma</option>
              <option value="future">Jövőbeni</option>
              <option value="none">Nincs</option>
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
              const nextActionDescriptionDisplay =
                nextActionDescription ||
                (pipelineStatus === 'Új lead'
                  ? 'A mai napon ellenőrizd a jelentkezőt és vedd fel vele a kapcsolatot a viszonteladói értékesítéssel kapcsolatban.'
                  : 'Nincs leírás.');
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
                      <p className="whitespace-pre-wrap break-words text-sm text-slate-100">{nextActionDescriptionDisplay}</p>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-slate-800 pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        const willExpand = !expandedRows[rowId];
                        setExpandedRows((previous) => ({ ...previous, [rowId]: willExpand }));
                      }}
                      className="text-sm text-cyan-300 hover:text-cyan-200"
                    >
                      {isExpanded ? 'Részletek elrejtése ▲' : 'Részletek szerkesztése ▼'}
                    </button>

                    {isExpanded ? (
                      <div className="mt-3 space-y-3">
                        <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-3 rounded-lg border border-slate-800/80 bg-slate-900/70 p-3">
                          <div className="grid gap-2 sm:grid-cols-2">
                            <label className="text-xs text-slate-300">
                              <span className="mb-1 block uppercase tracking-wide text-slate-500">Státuszváltás</span>
                              <select
                                value={stringifyValue(getResellerDraftValue(row, 'pipeline_status')) || 'Új lead'}
                                onChange={(event) => {
                                  const updates = {
                                    pipeline_status: event.target.value,
                                    next_action_description: ''
                                  };
                                  commitResellerUpdates(rowId, updates);
                                  void persistResellerUpdates(rowId, updates);
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
                              <span className="mb-1 block uppercase tracking-wide text-slate-500">Hot lead</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updates = { is_hot_lead: !isHot };
                                  commitResellerUpdates(rowId, updates);
                                  void persistResellerUpdates(rowId, updates);
                                }}
                                className={`w-full rounded-md border px-3 py-2 text-sm font-semibold ${isHot ? 'border-rose-500/70 bg-rose-900/40 text-rose-200' : 'border-slate-700 bg-slate-900 text-slate-200'}`}
                              >
                                {isHot ? '🔥 HOT' : 'Nem HOT'}
                              </button>
                            </label>
                          </div>
                          <p className="text-xs text-slate-400">Utolsó kapcsolat: {lastContactValue ? formatAdminDate(lastContactValue) : 'Nincs rögzítve'}</p>
                          <p className="text-xs text-slate-400">Előző kapcsolat: {previousContactValue ? formatAdminDate(previousContactValue) : 'Nincs rögzítve'}</p>
                          <button
                            type="button"
                            onClick={() => {
                              const currentLast = getResellerDraftValue(row, 'last_contacted_at');
                              const updates: Record<string, unknown> = {
                                last_contacted_at: new Date().toISOString()
                              };
                              if (currentLast) {
                                updates.previous_contacted_at = stringifyValue(currentLast);
                              }
                              commitResellerUpdates(rowId, updates);
                              void persistResellerUpdates(rowId, updates);
                            }}
                            className="w-full rounded-md border border-cyan-500/40 px-3 py-2 text-sm text-cyan-300 hover:bg-cyan-500/10"
                          >
                            Kapcsolatfelvétel rögzítése
                          </button>
                        </div>
                        <div className="space-y-3 rounded-lg border border-slate-800/80 bg-slate-900/70 p-3">
                          <label className="text-xs text-slate-300">
                            <span className="mb-1 block uppercase tracking-wide text-slate-500">Felelős</span>
                            <select
                              value={assignedUserId}
                              onChange={(event) => {
                                const updates = { assigned_to: event.target.value || null };
                                commitResellerUpdates(rowId, updates);
                                void persistResellerUpdates(rowId, updates);
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
                          <div className="text-xs text-slate-300">
                            <span className="mb-1 block uppercase tracking-wide text-slate-500">Következő teendő időpontja</span>
                            <div className={`relative rounded-md border p-2 ${nextActionTone}`}>
                              <button
                                type="button"
                                onClick={() => {
                                  if (nextActionEditors[rowId]?.isOpen) {
                                    closeNextActionEditor(rowId);
                                    return;
                                  }
                                  openNextActionEditor(rowId, row);
                                }}
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-left text-sm font-medium text-white hover:border-cyan-500/60"
                              >
                                {formatNextActionSummary(nextActionDraft)}
                              </button>
                              {nextActionEditors[rowId]?.isOpen ? (
                                <div className="mt-2 space-y-3 rounded-xl border border-slate-700 bg-slate-950/95 p-3 shadow-xl">
                                  <input
                                    type="date"
                                    value={nextActionEditors[rowId]?.date ?? ''}
                                    onChange={(event) => {
                                      updateNextActionDraft(rowId, { date: event.target.value });
                                    }}
                                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                                  />
                                  <div>
                                    <p className="mb-2 text-[11px] uppercase tracking-wide text-slate-400">Óra</p>
                                    <div className="grid grid-cols-5 gap-2">
                                      {nextActionHourOptions.map((hour) => {
                                        const isActive = (nextActionEditors[rowId]?.hour ?? '') === hour;
                                        return (
                                          <button
                                            key={hour}
                                            type="button"
                                            onClick={() => updateNextActionDraft(rowId, { hour })}
                                            className={`rounded-full px-2 py-2 text-sm font-semibold transition ${isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-200 hover:bg-slate-800'}`}
                                          >
                                            {hour}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                  <div>
                                    <p className="mb-2 text-[11px] uppercase tracking-wide text-slate-400">Perc</p>
                                    <div className="grid grid-cols-4 gap-2">
                                      {nextActionMinuteOptions.map((minute) => {
                                        const isActive = (nextActionEditors[rowId]?.minute ?? '') === minute;
                                        return (
                                          <button
                                            key={minute}
                                            type="button"
                                            onClick={() => updateNextActionDraft(rowId, { minute })}
                                            className={`rounded-full px-3 py-2 text-sm font-semibold transition ${isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-200 hover:bg-slate-800'}`}
                                          >
                                            {minute}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                  {(() => {
                                    const editor = nextActionEditors[rowId];
                                    if (!editor) return null;
                                    const draftIso = combineNextActionAt(editor.date, editor.hour, editor.minute);
                                    const persistedValue = stringifyValue(getResellerDraftValue(row, 'next_action_at')).trim();
                                    const hasUnsavedChanges = Boolean(
                                      editor.date || editor.hour || editor.minute
                                    ) && (draftIso ?? '') !== persistedValue;
                                    return hasUnsavedChanges ? (
                                      <p className="text-[11px] text-amber-300/90">Nem mentett módosítás</p>
                                    ) : null;
                                  })()}
                                  <div className="flex justify-end">
                                    <button
                                      type="button"
                                      onClick={() => void saveNextActionDraft(rowId)}
                                      className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
                                    >
                                      Kész
                                    </button>
                                  </div>
                                </div>
                              ) : null}
                              <div className="mt-1 text-[11px] text-slate-400">Választható idő: 06:00–20:45, 15 perces lépés.</div>
                            </div>
                          </div>
                          <label className="text-xs text-slate-300">
                            <span className="mb-1 block uppercase tracking-wide text-slate-500">Következő teendő leírása</span>
                            <textarea
                              value={stringifyValue(getResellerDraftValue(row, 'next_action_description'))}
                              onChange={(event) => {
                                setResellerDraftValue(rowId, 'next_action_description', event.target.value);
                              }}
                              onBlur={() => {
                                void persistResellerUpdates(rowId, {
                                  next_action_description: stringifyValue(getResellerDraftValue(row, 'next_action_description'))
                                });
                              }}
                              className="min-h-24 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                            />
                          </label>
                        </div>
                        </div>
                        <section className="border-t border-slate-800 pt-3">
                          <button
                            type="button"
                            onClick={() => {
                              const willExpandHistory = !expandedHistoryRows[rowId];
                              setExpandedHistoryRows((previous) => ({ ...previous, [rowId]: willExpandHistory }));
                              const activityState = activityByRowId[rowId];
                              const isAlreadyLoaded = Boolean(
                                activityState && !activityState.loading && !activityState.error
                              );
                              if (willExpandHistory && !isAlreadyLoaded) {
                                void fetchActivityLogs('reseller_applications', rowId);
                              }
                            }}
                            className="text-xs font-medium text-slate-400 hover:text-slate-200"
                          >
                            {expandedHistoryRows[rowId] ? 'Előzmények elrejtése ▲' : 'Előzmények megnyitása ▼'}
                          </button>
                          {expandedHistoryRows[rowId] ? (
                            <div className="mt-3 rounded-lg border border-slate-800/80 bg-slate-900/70 p-3">
                              <h4 className="mb-3 text-sm font-semibold text-white">Előzmények</h4>
                              {activityByRowId[rowId]?.loading ? (
                                <p className="text-xs text-slate-400">Előzmények betöltése...</p>
                              ) : activityByRowId[rowId]?.error ? (
                                <p className="text-xs text-rose-300">{activityByRowId[rowId]?.error}</p>
                              ) : (activityByRowId[rowId]?.logs?.length ?? 0) === 0 ? (
                                <p className="text-xs text-slate-400">Még nincs rögzített módosítás.</p>
                              ) : (
                                <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
                                  {(activityByRowId[rowId]?.logs ?? []).map((log) => {
                                    const timestamp = formatAdminDate(log.created_at);
                                    const actor = log.changed_by_name?.trim() || log.changed_by_email?.trim() || 'Ismeretlen kezelő';
                                    const actorEmail = log.changed_by_email?.trim();
                                    return (
                                      <li key={log.id} className="rounded-md border border-slate-800 bg-slate-950/60 p-2 text-xs text-slate-200">
                                        <span className="font-medium text-slate-100">{timestamp}</span>
                                        <span className="text-slate-400"> – </span>
                                        <span className="font-medium text-slate-100">{actor}</span>
                                        {actorEmail ? <span className="text-slate-400"> ({actorEmail})</span> : null}
                                        <span className="text-slate-400"> – </span>
                                        <span className="text-slate-300">{log.change_summary || 'Módosítás történt.'}</span>
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                            </div>
                          ) : null}
                        </section>
                      </div>
                    ) : null}
                    {rowSaveState[rowId]?.status && rowSaveState[rowId]?.status !== 'idle' ? (
                      <p
                        className={`mt-2 text-right text-xs ${
                          rowSaveState[rowId]?.status === 'error'
                            ? 'text-rose-300'
                            : rowSaveState[rowId]?.status === 'saved'
                              ? 'text-emerald-300'
                              : 'text-slate-300'
                        }`}
                      >
                        {rowSaveState[rowId]?.status === 'error' ? 'Hiba a mentéskor' : rowSaveState[rowId]?.message}
                      </p>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : isGiftClaimsTable ? (
          <div className="space-y-4">
            {giftSearchRows.map((row) => {
              const rowId = getRowId(row);
              const isExpanded = Boolean(expandedRows[rowId]);
              const receiptUrl = getGiftReceiptDisplayUrl(row);
              const email = stringifyValue(getResellerDraftValue(row, 'email')).trim();
              const phone = stringifyValue(getResellerDraftValue(row, 'phone')).trim();
              const assignedUserId = stringifyValue(getResellerDraftValue(row, 'assigned_to')).trim();
              const assignedTo =
                adminUsers.find((user) => user.id === assignedUserId)?.name ||
                (assignedUserId ? 'Ismeretlen felhasználó' : 'Nincs felelős');
              const nextActionDraft = getResellerDraftValue(row, 'next_action_at');
              const nextActionState = getNextActionState(nextActionDraft);
              const nextActionLabel = nextActionDraft ? formatAdminDate(nextActionDraft) : 'Nincs rögzítve';
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
                      <p className="text-lg font-semibold text-white">{stringifyValue(getResellerDraftValue(row, 'full_name')) || 'Névtelen igénylő'}</p>
                      <div className="space-y-1 text-xs text-slate-300">
                        <p>📍 <span className="text-slate-100">{stringifyValue(getResellerDraftValue(row, 'shipping_address')) || '-'}</span></p>
                        <p>🛒 <span className="text-slate-100">{stringifyValue(getResellerDraftValue(row, 'purchase_location')) || '-'}</span></p>
                        <p>📅 <span className="text-slate-100">{formatAdminDateShort(getResellerDraftValue(row, 'purchase_date'))}</span></p>
                        <p>⏱️ <span className="text-slate-100">{formatAdminDate(getResellerDraftValue(row, 'created_at'))}</span></p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {email ? (
                          <a href={`mailto:${email}`} className="rounded border border-cyan-500/40 px-2 py-1 text-cyan-300 hover:bg-cyan-500/10">
                            ✉️ {email}
                          </a>
                        ) : (
                          <span className="text-slate-500">Nincs email</span>
                        )}
                        {phone ? (
                          <a href={`tel:${phone}`} className="rounded border border-cyan-500/40 px-2 py-1 text-cyan-300 hover:bg-cyan-500/10">
                            📞 {phone}
                          </a>
                        ) : (
                          <span className="text-slate-500">Nincs telefonszám</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${getPipelineBadgeTone(getResellerDraftValue(row, 'pipeline_status') || 'Új igénylés')}`}>{stringifyValue(getResellerDraftValue(row, 'pipeline_status')) || 'Új igénylés'}</span>
                        <span className="rounded-full border border-amber-700/70 bg-amber-900/40 px-2 py-1 text-xs font-medium text-amber-200">{stringifyValue(getResellerDraftValue(row, 'receipt_check_status')) || 'Ellenőrzésre vár'}</span>
                        <span className="rounded-full border border-emerald-700/70 bg-emerald-900/40 px-2 py-1 text-xs font-medium text-emerald-200">{stringifyValue(getResellerDraftValue(row, 'shipping_status')) || 'Nincs előkészítve'}</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-sm font-semibold text-white">Következő teendő</p>
                      <p className="text-xs text-slate-300">
                        Felelős: <span className="font-medium text-white">{assignedTo}</span>
                      </p>
                      <p className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-slate-400">Határidő:</span>
                        <span className={`font-medium ${nextActionDeadlineTone}`}>{nextActionLabel}</span>
                        <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${nextActionDeadlineBadgeTone}`}>{nextActionDeadlineStatus}</span>
                      </p>
                      <p className="text-xs text-slate-400">Teendő leírása:</p>
                      <p className="whitespace-pre-wrap break-words text-sm text-slate-100">{stringifyValue(getResellerDraftValue(row, 'next_action_description')) || 'Nincs megadva.'}</p>
                      {receiptUrl ? (
                        <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className="inline-flex rounded border border-cyan-500/40 px-2 py-1 text-xs text-cyan-300 hover:bg-cyan-500/10">
                          Blokk megnyitása
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500">Nincs blokk</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 border-t border-slate-800 pt-3">
                    <button type="button" onClick={() => setExpandedRows((prev) => ({ ...prev, [rowId]: !prev[rowId] }))} className="text-sm text-cyan-300 hover:text-cyan-200">
                      {isExpanded ? 'Részletek elrejtése ▲' : 'Részletek szerkesztése ▼'}
                    </button>
                    {isExpanded ? (
                      <div className="mt-3 space-y-3">
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="space-y-2 rounded-lg border border-slate-800/80 bg-slate-900/70 p-3">
                            <div className="grid gap-3 md:grid-cols-2">
                              <label className="space-y-1 text-xs text-slate-300">
                                <span className="block uppercase tracking-wide text-slate-500">Státusz</span>
                                <select value={stringifyValue(getResellerDraftValue(row, 'pipeline_status')) || 'Új igénylés'} onChange={(event) => { const updates = { pipeline_status: event.target.value }; commitResellerUpdates(rowId, updates); void persistResellerUpdates(rowId, updates); }} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white">{GIFT_PIPELINE_STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</select>
                              </label>
                              <label className="space-y-1 text-xs text-slate-300">
                                <span className="block uppercase tracking-wide text-slate-500">Blokk</span>
                                <select value={stringifyValue(getResellerDraftValue(row, 'receipt_check_status')) || 'Ellenőrzésre vár'} onChange={(event) => { const updates = { receipt_check_status: event.target.value }; commitResellerUpdates(rowId, updates); void persistResellerUpdates(rowId, updates); }} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white">{GIFT_RECEIPT_CHECK_STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</select>
                              </label>
                            </div>
                            <div className="pt-1">
                              <h4 className="text-sm font-semibold text-white">Szállítási adatok</h4>
                              <div className="mt-2 space-y-2">
                                <input value={stringifyValue(getResellerDraftValue(row, 'full_name'))} onChange={(event) => setResellerDraftValue(rowId, 'full_name', event.target.value)} onBlur={() => { const draftValue = stringifyValue(getResellerDraftValue(row, 'full_name')); const persistedValue = stringifyValue(row.full_name); if (draftValue === persistedValue) return; void persistResellerUpdates(rowId, { full_name: draftValue }); }} placeholder="Név" className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
                                <input value={stringifyValue(getResellerDraftValue(row, 'shipping_address'))} onChange={(event) => setResellerDraftValue(rowId, 'shipping_address', event.target.value)} onBlur={() => { const draftValue = stringifyValue(getResellerDraftValue(row, 'shipping_address')); const persistedValue = stringifyValue(row.shipping_address); if (draftValue === persistedValue) return; void persistResellerUpdates(rowId, { shipping_address: draftValue }); }} placeholder="Szállítási cím" className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
                                <input value={stringifyValue(getResellerDraftValue(row, 'phone'))} onChange={(event) => setResellerDraftValue(rowId, 'phone', event.target.value)} onBlur={() => { const draftValue = stringifyValue(getResellerDraftValue(row, 'phone')); const persistedValue = stringifyValue(row.phone); if (draftValue === persistedValue) return; void persistResellerUpdates(rowId, { phone: draftValue }); }} placeholder="Telefonszám" className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
                              </div>
                            </div>
                            <div className="pt-1">
                              <h4 className="mb-2 text-sm font-semibold text-white">Ellenőrzési megjegyzés</h4>
                              <textarea value={stringifyValue(getResellerDraftValue(row, 'receipt_check_note'))} onChange={(event) => setResellerDraftValue(rowId, 'receipt_check_note', event.target.value)} onBlur={() => { const draftValue = stringifyValue(getResellerDraftValue(row, 'receipt_check_note')); const persistedValue = stringifyValue(row.receipt_check_note); if (draftValue === persistedValue) return; void persistResellerUpdates(rowId, { receipt_check_note: draftValue }); }} placeholder="Ellenőrzési megjegyzés" className="min-h-20 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
                            </div>
                          </div>
                          <div className="space-y-2 rounded-lg border border-slate-800/80 bg-slate-900/70 p-3">
                            <label className="text-xs text-slate-300">
                              <span className="mb-1 block uppercase tracking-wide text-slate-500">Felelős</span>
                              <select value={assignedUserId} onChange={(event) => { const updates = { assigned_to: event.target.value || null }; commitResellerUpdates(rowId, updates); void persistResellerUpdates(rowId, updates); }} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"><option value="">Nincs felelős</option>{adminUsers.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select>
                            </label>
                            <div className="text-xs text-slate-300">
                              <span className="mb-1 block uppercase tracking-wide text-slate-500">Következő teendő időpontja</span>
                              <div className={`relative rounded-md border p-2 ${nextActionTone}`}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (nextActionEditors[rowId]?.isOpen) {
                                      closeNextActionEditor(rowId);
                                      return;
                                    }
                                    openNextActionEditor(rowId, row);
                                  }}
                                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-left text-sm font-medium text-white hover:border-cyan-500/60"
                                >
                                  {formatNextActionSummary(nextActionDraft)}
                                </button>
                                {nextActionEditors[rowId]?.isOpen ? (
                                  <div className="mt-2 space-y-3 rounded-xl border border-slate-700 bg-slate-950/95 p-3 shadow-xl">
                                    <input
                                      type="date"
                                      value={nextActionEditors[rowId]?.date ?? ''}
                                      onChange={(event) => {
                                        updateNextActionDraft(rowId, { date: event.target.value });
                                      }}
                                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                                    />
                                    <div>
                                      <p className="mb-2 text-[11px] uppercase tracking-wide text-slate-400">Óra</p>
                                      <div className="grid grid-cols-5 gap-2">
                                        {nextActionHourOptions.map((hour) => {
                                          const isActive = (nextActionEditors[rowId]?.hour ?? '') === hour;
                                          return (
                                            <button
                                              key={hour}
                                              type="button"
                                              onClick={() => updateNextActionDraft(rowId, { hour })}
                                              className={`rounded-full px-2 py-2 text-sm font-semibold transition ${isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-200 hover:bg-slate-800'}`}
                                            >
                                              {hour}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                    <div>
                                      <p className="mb-2 text-[11px] uppercase tracking-wide text-slate-400">Perc</p>
                                      <div className="grid grid-cols-4 gap-2">
                                        {nextActionMinuteOptions.map((minute) => {
                                          const isActive = (nextActionEditors[rowId]?.minute ?? '') === minute;
                                          return (
                                            <button
                                              key={minute}
                                              type="button"
                                              onClick={() => updateNextActionDraft(rowId, { minute })}
                                              className={`rounded-full px-3 py-2 text-sm font-semibold transition ${isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-200 hover:bg-slate-800'}`}
                                            >
                                              {minute}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                    {(() => {
                                      const editor = nextActionEditors[rowId];
                                      if (!editor) return null;
                                      const draftIso = combineNextActionAt(editor.date, editor.hour, editor.minute);
                                      const persistedValue = stringifyValue(getResellerDraftValue(row, 'next_action_at')).trim();
                                      const hasUnsavedChanges = Boolean(
                                        editor.date || editor.hour || editor.minute
                                      ) && (draftIso ?? '') !== persistedValue;
                                      return hasUnsavedChanges ? (
                                        <p className="text-[11px] text-amber-300/90">Nem mentett módosítás</p>
                                      ) : null;
                                    })()}
                                    <div className="flex justify-end">
                                      <button
                                        type="button"
                                        onClick={() => void saveNextActionDraft(rowId)}
                                        className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
                                      >
                                        Kész
                                      </button>
                                    </div>
                                  </div>
                                ) : null}
                                <div className="mt-1 text-[11px] text-slate-400">Választható idő: 06:00–20:45, 15 perces lépés.</div>
                              </div>
                            </div>
                            <label className="text-xs text-slate-300">
                              <span className="mb-1 block uppercase tracking-wide text-slate-500">Következő teendő leírása</span>
                              <textarea value={stringifyValue(getResellerDraftValue(row, 'next_action_description'))} onChange={(event) => setResellerDraftValue(rowId, 'next_action_description', event.target.value)} onBlur={() => void persistResellerUpdates(rowId, { next_action_description: stringifyValue(getResellerDraftValue(row, 'next_action_description')) })} placeholder="Következő teendő" className="min-h-24 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
                            </label>
                            <div className="grid gap-3 md:grid-cols-2">
                              <input value={stringifyValue(getResellerDraftValue(row, 'courier_name'))} onChange={(event) => setResellerDraftValue(rowId, 'courier_name', event.target.value)} onBlur={() => { const draftValue = stringifyValue(getResellerDraftValue(row, 'courier_name')); const persistedValue = stringifyValue(row.courier_name); if (draftValue === persistedValue) return; void persistResellerUpdates(rowId, { courier_name: draftValue }); }} placeholder="Futárszolgálat neve" className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
                              <input value={stringifyValue(getResellerDraftValue(row, 'tracking_number'))} onChange={(event) => setResellerDraftValue(rowId, 'tracking_number', event.target.value)} onBlur={() => { const draftValue = stringifyValue(getResellerDraftValue(row, 'tracking_number')); const persistedValue = stringifyValue(row.tracking_number); if (draftValue === persistedValue) return; void persistResellerUpdates(rowId, { tracking_number: draftValue }); }} placeholder="Tracking number" className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
                            </div>
                            <div className="flex justify-center">
                              {(() => {
                                const isSending = giftNotificationStateByRowId[rowId]?.status === 'pending';
                                return (
                                  <button
                                    type="button"
                                    onClick={() => void sendGiftNotification(rowId)}
                                    disabled={isSending}
                                    className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-500/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {isSending ? 'Küldés...' : 'Értesítő küldése'}
                                  </button>
                                );
                              })()}
                            </div>
                            {giftNotificationStateByRowId[rowId]?.message ? (
                              <p className="mt-2 text-center text-xs text-slate-400">{giftNotificationStateByRowId[rowId]?.message}</p>
                            ) : null}
                          </div>
                        </div>
                        <section className="border-t border-slate-800 pt-3">
                          <button type="button" onClick={() => { const willExpandHistory = !expandedHistoryRows[rowId]; setExpandedHistoryRows((previous) => ({ ...previous, [rowId]: willExpandHistory })); if (willExpandHistory) void fetchActivityLogs('gift_claims', rowId); }} className="text-xs font-medium text-slate-400 hover:text-slate-200">{expandedHistoryRows[rowId] ? 'Előzmények elrejtése ▲' : 'Előzmények megnyitása ▼'}</button>
                          {expandedHistoryRows[rowId] ? (
                            <div className="mt-3 rounded-lg border border-slate-800/80 bg-slate-900/70 p-3">
                              {(activityByRowId[rowId]?.logs ?? []).length === 0 ? <p className="text-xs text-slate-400">Még nincs rögzített módosítás.</p> : <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">{(activityByRowId[rowId]?.logs ?? []).map((log) => <li key={log.id} className="rounded-md border border-slate-800 bg-slate-950/60 p-2 text-xs text-slate-200">{formatAdminDate(log.created_at)} – {log.change_summary || 'Módosítás történt.'}</li>)}</ul>}
                            </div>
                          ) : null}
                        </section>
                      </div>
                    ) : null}
                    {rowSaveState[rowId]?.status && rowSaveState[rowId]?.status !== 'idle' ? (
                      <p
                        className={`mt-2 text-right text-xs ${rowSaveState[rowId]?.status === 'error' ? 'text-rose-300' : rowSaveState[rowId]?.status === 'saved' ? 'text-emerald-300' : 'text-slate-300'}`}
                      >
                        {rowSaveState[rowId]?.status === 'error' ? 'Hiba a mentéskor' : rowSaveState[rowId]?.message}
                      </p>
                    ) : null}
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
                        {canDeleteInTable ? (
                          <button
                            onClick={() => void deleteRow(row)}
                            className="rounded border border-rose-500/40 px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/15"
                          >
                            Törlés
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && (isResellerTable ? resellerSearchRows : isGiftClaimsTable ? giftSearchRows : filteredRows).length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            {activeConfig.emptyState ?? 'Nincs megjeleníthető rekord.'}
          </p>
        ) : null}

        <p className="text-slate-400 text-sm mt-4">
          {query.trim()
            ? `Szűrt találatok: ${(isResellerTable ? resellerSearchRows : isGiftClaimsTable ? giftSearchRows : filteredRows).length} / ${rows.length} tétel`
            : `Összesen: ${rows.length} tétel`}
        </p>
      </div>

      {giftNotificationModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="w-full max-w-xl rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
            <h2 className="text-lg font-semibold text-white">Az értesítő nem küldhető</h2>
            <p className="mt-2 text-sm text-slate-300">
              A jelenlegi állapot alapján még nem teljesülnek az email küldés feltételei.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-200">
              {giftNotificationModal.missingConditions.map((condition) => (
                <li key={`${giftNotificationModal.rowId}-${condition}`}>{getGiftNotificationMissingConditionLabel(condition)}</li>
              ))}
            </ul>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setGiftNotificationModal(null)}
                className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
              >
                Rendben
              </button>
            </div>
          </div>
        </div>
      ) : null}
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
              {canModifyActiveTable ? (
                <button
                  onClick={() => void saveRow()}
                  className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
                >
                  Mentés
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
