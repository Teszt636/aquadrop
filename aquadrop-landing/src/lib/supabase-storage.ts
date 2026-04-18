import { supabaseConfig } from '@/lib/supabase';

const RECEIPT_UPLOAD_BUCKET = 'gift-receipts';

function sanitizeFileName(fileName: string): string {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildReceiptObjectPath(fileName: string): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const safeName = sanitizeFileName(fileName || 'receipt-image');

  return `gift-claims/${year}/${month}/${crypto.randomUUID()}-${safeName}`;
}

function createStorageAuthHeaders(contentType: string): HeadersInit {
  return {
    apikey: supabaseConfig.anonKey,
    Authorization: `Bearer ${supabaseConfig.anonKey}`,
    'Content-Type': contentType,
    'x-upsert': 'false'
  };
}

export type GiftReceiptUploadResult = {
  path: string;
  publicUrl: string;
};

export async function uploadGiftReceipt(file: File): Promise<GiftReceiptUploadResult> {
  const objectPath = buildReceiptObjectPath(file.name);
  const uploadUrl = `${supabaseConfig.storageUrl}/object/${RECEIPT_UPLOAD_BUCKET}/${objectPath}`;

  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: createStorageAuthHeaders(file.type || 'application/octet-stream'),
    body: file
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    throw new Error(`Receipt upload failed (${uploadResponse.status}): ${errorText}`);
  }

  return {
    path: objectPath,
    publicUrl: `${supabaseConfig.storageUrl}/object/public/${RECEIPT_UPLOAD_BUCKET}/${objectPath}`
  };
}

export const storageBuckets = {
  receiptUploads: RECEIPT_UPLOAD_BUCKET
} as const;
