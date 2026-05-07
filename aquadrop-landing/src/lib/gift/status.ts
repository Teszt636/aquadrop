const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const STATUS_PAGE_BASE_URL = 'https://www.aquadrop.hu';

export type PublicGiftStatusPayload = {
  maskedName: string;
  maskedShippingAddress: string;
  pipeline_status: string;
  receipt_check_status: string;
  shipping_status: string;
  tracking_number: string | null;
  courier_name: string | null;
  tracking_url: string | null;
  created_at: string;
  updated_at: string;
};

type GiftStatusRow = {
  full_name: string | null;
  shipping_address: string | null;
  pipeline_status: string | null;
  receipt_check_status: string | null;
  shipping_status: string | null;
  tracking_number: string | null;
  courier_name: string | null;
  tracking_url: string | null;
  created_at: string | null;
  updated_at: string | null;
};

function getServiceRoleHeaders(): HeadersInit {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing.');
  }

  return {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  };
}

function normalizeToken(value: string): string {
  return value.trim();
}

export function maskGiftClaimName(fullName: string | null): string {
  const parts = fullName?.trim().split(/\s+/).filter(Boolean) ?? [];

  if (parts.length < 2) {
    return 'Igénylő';
  }

  return `${parts[0]} ${parts[1].charAt(0)}.`;
}

function stripAddressDetails(value: string): string {
  const detailMarkers = new Set([
    'fszt',
    'fsz',
    'emelet',
    'em',
    'ajtó',
    'ajto',
    'door',
    'floor'
  ]);
  const words = value.trim().split(/\s+/).filter(Boolean);
  const safeWords: string[] = [];

  for (const word of words) {
    const normalizedWord = word.toLowerCase().replace(/[.,;:]/g, '');

    if (/\d/.test(normalizedWord) || detailMarkers.has(normalizedWord)) {
      break;
    }

    safeWords.push(word);
  }

  return safeWords.join(' ').replace(/[,\s]+$/g, '').trim();
}

function maskAddressWithoutCommas(address: string): string {
  const words = address.split(/\s+/).filter(Boolean);
  const streetTypeIndex = words.findIndex((word) => {
    const normalizedWord = word.toLowerCase().replace(/[.,;:]/g, '');
    return [
      'utca',
      'u',
      'út',
      'ut',
      'tér',
      'ter',
      'körút',
      'korut',
      'köz',
      'koz',
      'sor',
      'park',
      'sétány',
      'setany',
      'dűlő',
      'dulo'
    ].includes(normalizedWord);
  });

  if (streetTypeIndex >= 2 && /^\d{4}$/.test(words[0])) {
    return words.slice(0, streetTypeIndex + 1).join(' ');
  }

  return 'Szállítási cím rögzítve';
}

export function maskGiftClaimAddress(address: string | null): string {
  const normalizedAddress = address?.trim().replace(/\s+/g, ' ') ?? '';

  if (!normalizedAddress) {
    return 'Szállítási cím rögzítve';
  }

  const parts = normalizedAddress
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    const location = parts[0];
    const street = stripAddressDetails(parts[1]);

    return street ? `${location}, ${street}` : location;
  }

  return maskAddressWithoutCommas(normalizedAddress);
}

export function buildGiftClaimStatusUrl(statusToken: string): string {
  const token = normalizeToken(statusToken);
  return `${STATUS_PAGE_BASE_URL}/ajandek-igenyles-statusz/${encodeURIComponent(token)}`;
}

export async function fetchGiftClaimPublicStatusByToken(token: string): Promise<PublicGiftStatusPayload | null> {
  if (!SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing.');
  }

  const normalizedToken = normalizeToken(token);
  if (!normalizedToken) {
    return null;
  }

  const query = new URLSearchParams({
    select:
      'full_name,shipping_address,pipeline_status,receipt_check_status,shipping_status,tracking_number,courier_name,tracking_url,created_at,updated_at',
    status_token: `eq.${normalizedToken}`,
    limit: '1'
  });

  const response = await fetch(`${SUPABASE_URL}/rest/v1/gift_claims?${query.toString()}`, {
    method: 'GET',
    headers: getServiceRoleHeaders(),
    cache: 'no-store'
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase select failed (${response.status}): ${errorText}`);
  }

  const rows = (await response.json()) as GiftStatusRow[];
  const row = rows[0];

  if (!row) {
    return null;
  }

  return {
    maskedName: maskGiftClaimName(row.full_name),
    maskedShippingAddress: maskGiftClaimAddress(row.shipping_address),
    pipeline_status: row.pipeline_status?.trim() || 'Új igénylés',
    receipt_check_status: row.receipt_check_status?.trim() || 'Ellenőrzésre vár',
    shipping_status: row.shipping_status?.trim() || 'Nincs előkészítve',
    tracking_number: row.tracking_number?.trim() || null,
    courier_name: row.courier_name?.trim() || null,
    tracking_url: row.tracking_url?.trim() || null,
    created_at: row.created_at ?? new Date(0).toISOString(),
    updated_at: row.updated_at ?? row.created_at ?? new Date(0).toISOString()
  };
}
