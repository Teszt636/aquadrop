
import { formatBudapestDateTime } from '@/lib/datetime/budapest';

export type AdminBaseTableName =
  | 'announcement_signups'
  | 'gift_claims'
  | 'reseller_applications'
  | 'media_kit_downloads'
  | 'admin_users';

export type AdminTableViewName = AdminBaseTableName | 'unsubscribed';

export type AdminColumnType = 'text' | 'date' | 'link' | 'mapped' | 'badge' | 'boolean';

export type AdminColumnConfig = {
  key: string;
  label: string;
  type?: AdminColumnType;
  editable?: boolean;
  inputType?: 'text' | 'select' | 'textarea' | 'date' | 'datetime-local' | 'number' | 'checkbox';
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

export function formatAdminDate(value: unknown): string {
  const parsed = normalizeDateValue(value);

  if (!parsed) {
    return '-';
  }

  return formatBudapestDateTime(parsed.toISOString());
}

export function formatAdminDateShort(value: unknown): string {
  const parsed = normalizeDateValue(value);

  if (!parsed) {
    return '-';
  }

  return formatBudapestDateTime(parsed.toISOString()).slice(0, 10);
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
export const GIFT_PIPELINE_STATUS_OPTIONS = [
  'Új igénylés',
  'Blokk ellenőrzés alatt',
  'Hiánypótlás szükséges',
  'Jóváhagyva',
  'Csomagolás alatt',
  'Futárnak átadva',
  'Kézbesítve',
  'Elutasítva',
  'Lezárva'
];
export const GIFT_RECEIPT_CHECK_STATUS_OPTIONS = [
  'Ellenőrzésre vár',
  'Érvényes blokk',
  'Nem olvasható',
  'Nem megfelelő termék',
  'Duplikált blokk gyanú',
  'Elutasítva'
];
export const GIFT_SHIPPING_STATUS_OPTIONS = [
  'Nincs előkészítve',
  'Csomagolásra vár',
  'Csomagolva',
  'Futárnak átadva',
  'Kézbesítve',
  'Sikertelen kézbesítés'
];
export const GIFT_AI_CHECK_STATUS_OPTIONS = [
  'Nincs ellenőrizve',
  'Ellenőrzés alatt',
  'Elfogadva',
  'Gyanús',
  'Hibás',
  'Kézi ellenőrzés szükséges'
];
export const RESELLER_PIPELINE_OPTIONS = [
  'Új lead',
  'Felhívandó',
  'Tárgyalásban',
  'Mintát küldeni',
  'Szerződés előtt',
  'Partner lett',
  'Elutasítva'
];

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
        key: 'pipeline_status',
        label: 'Pipeline státusz',
        editable: true,
        inputType: 'select',
        type: 'badge',
        options: GIFT_PIPELINE_STATUS_OPTIONS
      },
      {
        key: 'receipt_check_status',
        label: 'Blokk státusz',
        editable: true,
        inputType: 'select',
        type: 'badge',
        options: GIFT_RECEIPT_CHECK_STATUS_OPTIONS
      },
      {
        key: 'shipping_status',
        label: 'Szállítás státusz',
        editable: true,
        inputType: 'select',
        type: 'badge',
        options: GIFT_SHIPPING_STATUS_OPTIONS
      },
      { key: 'assigned_to', label: 'Felelős', editable: true, hiddenInTable: true },
      { key: 'next_action_at', label: 'Határidő', editable: true, inputType: 'datetime-local', type: 'date' },
      {
        key: 'next_action_description',
        label: 'Következő teendő',
        editable: true,
        inputType: 'textarea',
        hiddenInTable: true
      },
      { key: 'last_contacted_at', label: 'Utolsó kapcsolat', editable: true, inputType: 'datetime-local', type: 'date', hiddenInTable: true },
      { key: 'previous_contacted_at', label: 'Előző kapcsolat', type: 'date', hiddenInTable: true },
      { key: 'receipt_is_valid', label: 'Blokk érvényes', editable: true, inputType: 'select', options: ['Nincs megadva', 'Igen', 'Nem'], hiddenInTable: true },
      { key: 'purchase_eligible', label: 'Jogosult vásárlás', editable: true, inputType: 'select', options: ['Nincs megadva', 'Igen', 'Nem'], hiddenInTable: true },
      { key: 'receipt_check_note', label: 'Ellenőrzési megjegyzés', editable: true, inputType: 'textarea', hiddenInTable: true },
      { key: 'courier_name', label: 'Futárszolgálat', editable: true, hiddenInTable: true },
      { key: 'tracking_number', label: 'Tracking number', editable: true },
      { key: 'tracking_url', label: 'Tracking URL', editable: true, hiddenInTable: true },
      { key: 'shipped_at', label: 'Feladva', editable: true, inputType: 'datetime-local', type: 'date', hiddenInTable: true },
      { key: 'delivered_at', label: 'Kézbesítve', editable: true, inputType: 'datetime-local', type: 'date', hiddenInTable: true },
      { key: 'ai_check_status', label: 'AI ellenőrzés', editable: true, inputType: 'select', options: GIFT_AI_CHECK_STATUS_OPTIONS, hiddenInTable: true },
      { key: 'ai_confidence', label: 'AI confidence', editable: true, inputType: 'number', hiddenInTable: true },
      {
        key: 'status',
        label: 'Státusz',
        editable: true,
        inputType: 'select',
        options: GIFT_STATUS_OPTIONS,
        formatter: (value) => (typeof value === 'string' && value.trim() ? value : 'Új'),
        hiddenInTable: true
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
      {
        key: 'pipeline_status',
        label: 'Státusz',
        editable: true,
        inputType: 'select',
        type: 'badge',
        options: RESELLER_PIPELINE_OPTIONS
      },
      { key: 'lead_score', label: 'Lead score', editable: true, inputType: 'number' },
      { key: 'is_hot_lead', label: 'Hot lead', editable: true, inputType: 'checkbox', type: 'boolean' },
      { key: 'company_name', label: 'Cégnév', editable: true },
      { key: 'contact_name', label: 'Kapcsolattartó', editable: true },
      { key: 'email', label: 'Email', editable: true },
      { key: 'phone', label: 'Telefonszám', editable: true },
      { key: 'website', label: 'Weboldal', editable: true },
      { key: 'sales_channel', label: 'Értékesítési felület', editable: true },
      { key: 'assigned_to', label: 'Felelős', editable: true },
      {
        key: 'next_action_at',
        label: 'Következő teendő',
        editable: true,
        type: 'date',
        inputType: 'datetime-local'
      },
      { key: 'next_action_date', label: 'Korábbi teendő dátum', type: 'date', hiddenInTable: true },
      {
        key: 'last_contacted_at',
        label: 'Utolsó kapcsolat',
        editable: true,
        type: 'date',
        inputType: 'datetime-local'
      },
      { key: 'previous_contacted_at', label: 'Előző kapcsolat', type: 'date', hiddenInTable: true },
      { key: 'created_at', label: 'Beküldve', type: 'date' },
      {
        key: 'next_action_description',
        label: 'Következő teendő leírása',
        editable: true,
        inputType: 'textarea',
        hiddenInTable: true
      },
      { key: 'message', label: 'Üzenet', editable: true, hiddenInTable: true },
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
  },
  admin_users: {
    label: 'Felhasználók',
    sourceTable: 'admin_users',
    columns: [
      { key: 'name', label: 'Név', editable: true },
      { key: 'email', label: 'Email', editable: true },
      { key: 'role', label: 'Jogosultság' },
      { key: 'is_active', label: 'Aktív', type: 'boolean', editable: true, inputType: 'checkbox' },
      { key: 'created_at', label: 'Létrehozva', type: 'date' },
      { key: 'updated_at', label: 'Módosítva', type: 'date' },
      { key: 'id', label: 'ID', hiddenInTable: true, hiddenInDetails: true }
    ]
  }
};
