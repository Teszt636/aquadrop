export type AdminBaseTableName =
  | 'announcement_signups'
  | 'gift_claims'
  | 'reseller_applications'
  | 'media_kit_downloads';

export type AdminTableViewName = AdminBaseTableName | 'unsubscribed';

export type AdminColumnType = 'text' | 'date' | 'link' | 'mapped';

export type AdminColumnConfig = {
  key: string;
  label: string;
  type?: AdminColumnType;
  editable?: boolean;
  inputType?: 'text' | 'select' | 'textarea';
  options?: string[];
  hiddenInTable?: boolean;
  hiddenInDetails?: boolean;
  formatter?: (value: unknown) => string;
};

export type AdminTableConfig = {
  label: string;
  sourceTable: AdminBaseTableName;
  columns: AdminColumnConfig[];
  emptyState?: string;
  newRowHighlight?: (row: Record<string, unknown>) => boolean;
};

function normalizeDateValue(value: unknown): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value !== 'string' && typeof value !== 'number') {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

export function formatAdminDate(value: unknown): string {
  const parsed = normalizeDateValue(value);

  if (!parsed) {
    return '-';
  }

  return `${parsed.getFullYear()}.${pad(parsed.getMonth() + 1)}.${pad(parsed.getDate())} ${parsed.getHours()}:${pad(parsed.getMinutes())}`;
}

export function formatDownloadedFile(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) {
    return '-';
  }

  const fileMap: Record<string, string> = {
    '/media-kit/aquadrop-termekszovegek.pdf': 'Termékszövegek',
    '/media-kit/aquadrop-biztonsagi-adatlap.pdf': 'Biztonsági adatlap',
    '/media-kit/aquadrop-marketing-kepek.zip': 'Marketing képek'
  };

  return fileMap[value] ?? '-';
}

export function formatUsageType(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) {
    return '-';
  }

  const usageMap: Record<string, string> = {
    webshop: 'Webshop',
    'offline bolt': 'Offline bolt',
    nagyker: 'Nagyker',
    egyéb: 'Egyéb'
  };

  return usageMap[value] ?? value;
}

export const GIFT_STATUS_OPTIONS = ['Új', 'Feldolgozás alatt', 'Kész', 'Elutasítva'];

export function getGiftStatusValue(row: Record<string, unknown>): string {
  const raw = row.status;
  return typeof raw === 'string' && raw.trim() ? raw : 'Új';
}

function toAbsoluteHttpUrl(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();

  if (!/^https?:\/\//i.test(trimmed)) {
    return null;
  }

  return trimmed;
}

export function getGiftReceiptDisplayUrl(record: Record<string, unknown>): string | null {
  const directReceiptUrl = toAbsoluteHttpUrl(record.receipt_url);

  if (directReceiptUrl) {
    return directReceiptUrl;
  }

  if (typeof record.receipt_path === 'string' && record.receipt_path.trim()) {
    const cleanPath = record.receipt_path
      .trim()
      .replace(/^gift-receipts\//, '')
      .replace(/^\/+/, '');

    if (cleanPath) {
      const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/+$/, '');

      if (baseUrl) {
        return `${baseUrl}/storage/v1/object/public/gift-receipts/${cleanPath}`;
      }
    }
  }

  return toAbsoluteHttpUrl(record.receipt_file_url);
}

export const adminTableConfigs: Record<AdminTableViewName, AdminTableConfig> = {
  announcement_signups: {
    label: 'Feliratkozók',
    sourceTable: 'announcement_signups',
    columns: [
      { key: 'name', label: 'Név' },
      { key: 'email', label: 'Email' },
      { key: 'created_at', label: 'Létrehozva', type: 'date' },
      { key: 'id', label: 'ID', hiddenInTable: true, hiddenInDetails: true }
    ]
  },
  unsubscribed: {
    label: 'Leiratkoztak',
    sourceTable: 'announcement_signups',
    emptyState: 'Még nincs leiratkozott felhasználó.',
    columns: [
      { key: 'name', label: 'Név' },
      { key: 'email', label: 'Email' },
      { key: 'created_at', label: 'Létrehozva', type: 'date' },
      { key: 'id', label: 'ID', hiddenInTable: true, hiddenInDetails: true }
    ]
  },
  gift_claims: {
    label: 'Ajándék igénylések',
    sourceTable: 'gift_claims',
    newRowHighlight: (row) => getGiftStatusValue(row) === 'Új',
    columns: [
      {
        key: 'status',
        label: 'Státusz',
        editable: true,
        inputType: 'select',
        options: GIFT_STATUS_OPTIONS,
        formatter: (value) => (typeof value === 'string' && value.trim() ? value : 'Új')
      },
      { key: 'full_name', label: 'Név', editable: true },
      { key: 'email', label: 'Email', editable: true },
      { key: 'phone', label: 'Telefonszám', editable: true },
      { key: 'shipping_address', label: 'Szállítási cím', editable: true, hiddenInTable: true },
      { key: 'receipt_url', label: 'Blokk', type: 'link', hiddenInTable: true },
      { key: 'purchase_location', label: 'Vásárlás helye', editable: true },
      { key: 'purchase_date', label: 'Vásárlás ideje', editable: true, hiddenInTable: true },
      { key: 'admin_note', label: 'Megjegyzés', editable: true, inputType: 'textarea', hiddenInTable: true },
      { key: 'created_at', label: 'Igénylés ideje', type: 'date' },
      { key: 'id', label: 'ID', hiddenInTable: true, hiddenInDetails: true }
    ]
  },
  reseller_applications: {
    label: 'Viszonteladók',
    sourceTable: 'reseller_applications',
    columns: [
      { key: 'company', label: 'Cégnév', editable: true },
      { key: 'name', label: 'Név', editable: true },
      { key: 'email', label: 'Email', editable: true },
      { key: 'phone', label: 'Telefonszám', editable: true },
      { key: 'website', label: 'Weboldal', editable: true },
      { key: 'sales_channel', label: 'Értékesítési felület', editable: true },
      { key: 'message', label: 'Üzenet', editable: true },
      { key: 'created_at', label: 'Beküldve', type: 'date' },
      { key: 'id', label: 'ID', hiddenInTable: true, hiddenInDetails: true }
    ]
  },
  media_kit_downloads: {
    label: 'Media Kit letöltések',
    sourceTable: 'media_kit_downloads',
    columns: [
      { key: 'name', label: 'Név' },
      { key: 'email', label: 'Email' },
      { key: 'company', label: 'Cégnév' },
      { key: 'usage_type', label: 'Felület', formatter: formatUsageType },
      { key: 'downloaded_file', label: 'Letöltve', type: 'mapped', formatter: formatDownloadedFile },
      { key: 'created_at', label: 'Letöltés ideje', type: 'date' },
      { key: 'id', label: 'ID', hiddenInTable: true, hiddenInDetails: true }
    ]
  }
};
