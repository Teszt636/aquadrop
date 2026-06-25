import { getSupabaseAdminHeaders, getSupabaseAdminRestUrl } from '@/lib/admin/supabase-admin';
import { normalizeEmail, sanitizeEmailAddress } from '@/lib/email/b2b-campaigns';

export type B2BContact = {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string;
  phone: string | null;
  website: string | null;
  source: string | null;
  legal_basis: string | null;
  note: string | null;
  is_active: boolean;
  unsubscribed_at: string | null;
  bounced_at: string | null;
  complained_at: string | null;
  suppressed_at: string | null;
  last_email_status: string | null;
  last_email_event_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type B2BGroup = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type B2BTemplate = {
  id: string;
  name: string;
  subject: string;
  preheader: string | null;
  html_body: string;
  text_body: string | null;
  cta_label: string | null;
  cta_url: string | null;
  is_active: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type B2BCampaign = {
  id: string;
  name: string;
  template_id: string | null;
  status: 'draft' | 'ready' | 'queued' | 'sending' | 'sent' | 'partial_failed' | 'failed' | 'cancelled';
  subject_snapshot: string | null;
  html_snapshot: string | null;
  text_snapshot: string | null;
  sending_mode: 'queued';
  per_email_delay_seconds: number;
  max_emails_per_process: number;
  scheduled_start_at: string | null;
  queue_started_at: string | null;
  queue_finished_at: string | null;
  target_count: number;
  sent_count: number;
  delivered_count: number;
  bounced_count: number;
  failed_count: number;
  complained_count: number;
  suppressed_count: number;
  created_by_email: string | null;
  sent_at: string | null;
  archived_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type B2BCampaignRecipient = {
  id: string;
  campaign_id: string;
  contact_id: string | null;
  email: string;
  company_name: string | null;
  contact_name: string | null;
  status: 'pending' | 'queued' | 'processing' | 'sent' | 'delivered' | 'bounced' | 'failed' | 'complained' | 'suppressed' | 'skipped';
  resend_email_id: string | null;
  resend_error: string | null;
  last_event_type: string | null;
  last_event_at: string | null;
  scheduled_at: string | null;
  queued_at: string | null;
  processing_started_at: string | null;
  attempt_count: number;
  next_attempt_at: string | null;
  locked_at: string | null;
  locked_by: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  bounced_at: string | null;
  failed_at: string | null;
  complained_at: string | null;
  created_at: string;
};

export type B2BEmailSendAttempt = {
  id: string;
  campaign_id: string | null;
  campaign_recipient_id: string | null;
  contact_id: string | null;
  email: string;
  attempt_type: 'initial' | 'manual_resend';
  status: B2BCampaignRecipient['status'];
  resend_email_id: string | null;
  resend_error: string | null;
  subject_snapshot: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  bounced_at: string | null;
  failed_at: string | null;
  complained_at: string | null;
  last_event_type: string | null;
  last_event_at: string | null;
  created_by_email: string | null;
  created_at: string;
};

export type B2BEmailEvent = {
  id: string;
  svix_id: string | null;
  resend_email_id: string | null;
  event_type: string;
  recipient_email: string | null;
  campaign_recipient_id: string | null;
  payload: Record<string, unknown>;
  created_at: string;
};

type JsonRow = Record<string, unknown>;
const TERMINAL_RECIPIENT_STATUSES = ['sent', 'delivered', 'bounced', 'failed', 'complained', 'suppressed', 'skipped'];

function restUrl(table: string, query?: URLSearchParams): string {
  const base = `${getSupabaseAdminRestUrl()}/${table}`;
  const queryString = query?.toString();
  return queryString ? `${base}?${queryString}` : base;
}

function cleanText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function cleanIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(
      value
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .map((item) => item.trim())
    )
  ];
}

export async function b2bSelect<T>(table: string, query: URLSearchParams): Promise<T[]> {
  const response = await fetch(restUrl(table, query), {
    method: 'GET',
    headers: getSupabaseAdminHeaders(),
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Supabase select failed for ${table}: ${response.status} ${await response.text()}`);
  }

  return (await response.json()) as T[];
}

export async function b2bInsert<T>(table: string, rows: JsonRow[], onConflict?: string): Promise<T[]> {
  if (rows.length === 0) return [];
  const query = new URLSearchParams();
  if (onConflict) query.set('on_conflict', onConflict);
  const prefer = onConflict ? 'resolution=merge-duplicates,return=representation' : 'return=representation';

  const response = await fetch(restUrl(table, query), {
    method: 'POST',
    headers: getSupabaseAdminHeaders({ Prefer: prefer }),
    body: JSON.stringify(rows)
  });

  if (!response.ok) {
    throw new Error(`Supabase insert failed for ${table}: ${response.status} ${await response.text()}`);
  }

  return (await response.json()) as T[];
}

export async function b2bPatch<T>(table: string, query: URLSearchParams, updates: JsonRow): Promise<T[]> {
  const response = await fetch(restUrl(table, query), {
    method: 'PATCH',
    headers: getSupabaseAdminHeaders({ Prefer: 'return=representation' }),
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    throw new Error(`Supabase patch failed for ${table}: ${response.status} ${await response.text()}`);
  }

  return (await response.json()) as T[];
}

export async function b2bDelete(table: string, query: URLSearchParams): Promise<void> {
  const response = await fetch(restUrl(table, query), {
    method: 'DELETE',
    headers: getSupabaseAdminHeaders()
  });

  if (!response.ok) {
    throw new Error(`Supabase delete failed for ${table}: ${response.status} ${await response.text()}`);
  }
}

export async function listContacts(): Promise<B2BContact[]> {
  return b2bSelect<B2BContact>(
    'b2b_email_contacts',
    new URLSearchParams({
      select: '*',
      deleted_at: 'is.null',
      order: 'updated_at.desc.nullslast,created_at.desc',
      limit: '500'
    })
  );
}

export async function createContact(input: JsonRow): Promise<B2BContact> {
  const row = {
    company_name: cleanText(input.company_name) ?? '',
    contact_name: cleanText(input.contact_name),
    email: sanitizeEmailAddress(input.email),
    phone: cleanText(input.phone),
    website: cleanText(input.website),
    source: cleanText(input.source),
    legal_basis: cleanText(input.legal_basis),
    note: cleanText(input.note),
    is_active: typeof input.is_active === 'boolean' ? input.is_active : true
  };

  if (!row.company_name) {
    throw new Error('A cégnév kötelező.');
  }

  const [created] = await b2bInsert<B2BContact>('b2b_email_contacts', [row]);
  return created;
}

async function emailExistsOnOtherActiveContact(email: string, contactId: string): Promise<boolean> {
  const rows = await b2bSelect<Pick<B2BContact, 'id'>>(
    'b2b_email_contacts',
    new URLSearchParams({
      select: 'id',
      email: `ilike.${email}`,
      is_active: 'eq.true',
      deleted_at: 'is.null',
      limit: '2'
    })
  );
  return rows.some((row) => row.id !== contactId);
}

export async function updateContactDetails(id: string, input: JsonRow): Promise<B2BContact> {
  const existing = await fetchContactById(id);
  if (!existing || existing.deleted_at) {
    throw new Error('A címzett nem található.');
  }

  const companyName = cleanText(input.company_name);
  const email = sanitizeEmailAddress(input.email);
  const requestedActive = typeof input.is_active === 'boolean' ? input.is_active : existing.is_active;
  if (!companyName) {
    throw new Error('A cégnév kötelező.');
  }
  if (requestedActive && (existing.unsubscribed_at || existing.complained_at || existing.suppressed_at)) {
    throw new Error('Ez a címzett leiratkozott, panaszt tett vagy tiltólistára került. Nem aktiválható újra egyszerű szerkesztéssel.');
  }
  if (await emailExistsOnOtherActiveContact(email, id)) {
    throw new Error('Ez az email cím már szerepel egy másik címzettnél.');
  }

  let updated: B2BContact | null = null;
  try {
    updated = await patchContact(id, {
      company_name: companyName,
      contact_name: cleanText(input.contact_name),
      email,
      phone: cleanText(input.phone),
      website: cleanText(input.website),
      source: cleanText(input.source),
      legal_basis: cleanText(input.legal_basis),
      note: cleanText(input.note),
      is_active: requestedActive,
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('b2b_email_contacts_lower_email_idx') || message.includes('duplicate key')) {
      throw new Error('Ez az email cím már szerepel egy másik címzettnél.');
    }
    throw error;
  }

  if (!updated) {
    throw new Error('A címzett mentése nem sikerült.');
  }
  return updated;
}

export async function listGroups(): Promise<Array<B2BGroup & { member_count?: number }>> {
  const groups = await b2bSelect<B2BGroup>(
    'b2b_email_groups',
    new URLSearchParams({
      select: '*',
      is_active: 'eq.true',
      deleted_at: 'is.null',
      order: 'name.asc',
      limit: '300'
    })
  );
  const members = await b2bSelect<{ group_id: string }>(
    'b2b_email_group_members',
    new URLSearchParams({ select: 'group_id', limit: '5000' })
  );
  const counts = members.reduce<Record<string, number>>((accumulator, member) => {
    accumulator[member.group_id] = (accumulator[member.group_id] ?? 0) + 1;
    return accumulator;
  }, {});
  return groups.map((group) => ({ ...group, member_count: counts[group.id] ?? 0 }));
}

export async function listActiveGroups(): Promise<B2BGroup[]> {
  return b2bSelect<B2BGroup>(
    'b2b_email_groups',
    new URLSearchParams({
      select: '*',
      is_active: 'eq.true',
      deleted_at: 'is.null',
      order: 'name.asc',
      limit: '300'
    })
  );
}

export async function createGroup(input: JsonRow): Promise<B2BGroup> {
  const name = cleanText(input.name);
  if (!name) {
    throw new Error('A célcsoport neve kötelező.');
  }

  const [created] = await b2bInsert<B2BGroup>('b2b_email_groups', [{ name, description: cleanText(input.description) }]);
  return created;
}

export async function addContactsToGroups(contactIdsInput: unknown, groupIdsInput: unknown): Promise<void> {
  const contactIds = cleanIds(contactIdsInput);
  const groupIds = cleanIds(groupIdsInput);
  if (contactIds.length === 0 || groupIds.length === 0) return;

  const rows = groupIds.flatMap((groupId) => contactIds.map((contactId) => ({ group_id: groupId, contact_id: contactId })));
  await b2bInsert('b2b_email_group_members', rows, 'group_id,contact_id');
}

export async function listContactGroupIds(contactId: string): Promise<string[]> {
  const rows = await b2bSelect<{ group_id: string }>(
    'b2b_email_group_members',
    new URLSearchParams({ select: 'group_id', contact_id: `eq.${contactId}`, limit: '500' })
  );
  return [...new Set(rows.map((row) => row.group_id).filter(Boolean))];
}

export async function syncContactGroupMembership(contactId: string, groupIdsInput: unknown): Promise<string[]> {
  const contact = await fetchContactById(contactId);
  if (!contact || contact.deleted_at) {
    throw new Error('A címzett nem található.');
  }

  const requestedGroupIds = cleanIds(groupIdsInput);
  const activeGroups = await listActiveGroups();
  const activeGroupIds = new Set(activeGroups.map((group) => group.id));
  const invalidGroupIds = requestedGroupIds.filter((groupId) => !activeGroupIds.has(groupId));
  if (invalidGroupIds.length > 0) {
    throw new Error('Csak aktív, nem törölt célcsoport választható.');
  }

  const currentGroupIds = await listContactGroupIds(contactId);
  const nextGroupIds = [...new Set(requestedGroupIds)];
  const toRemove = currentGroupIds.filter((groupId) => !nextGroupIds.includes(groupId));
  const toAdd = nextGroupIds.filter((groupId) => !currentGroupIds.includes(groupId));

  if (toRemove.length > 0) {
    await b2bDelete(
      'b2b_email_group_members',
      new URLSearchParams({
        contact_id: `eq.${contactId}`,
        group_id: `in.(${toRemove.join(',')})`
      })
    );
  }

  if (toAdd.length > 0) {
    await b2bInsert(
      'b2b_email_group_members',
      toAdd.map((groupId) => ({ group_id: groupId, contact_id: contactId })),
      'group_id,contact_id'
    );
  }

  return nextGroupIds;
}

export async function listTemplates(): Promise<B2BTemplate[]> {
  return b2bSelect<B2BTemplate>(
    'b2b_email_templates',
    new URLSearchParams({
      select: '*',
      is_active: 'eq.true',
      deleted_at: 'is.null',
      order: 'updated_at.desc.nullslast,created_at.desc',
      limit: '300'
    })
  );
}

export async function saveTemplate(input: JsonRow): Promise<B2BTemplate> {
  const row = {
    name: cleanText(input.name) ?? '',
    subject: cleanText(input.subject) ?? '',
    preheader: cleanText(input.preheader),
    html_body: cleanText(input.html_body) ?? '',
    text_body: cleanText(input.text_body),
    cta_label: cleanText(input.cta_label),
    cta_url: cleanText(input.cta_url),
    is_active: typeof input.is_active === 'boolean' ? input.is_active : true
  };

  if (!row.name || !row.subject || !row.html_body) {
    throw new Error('A sablon neve, tárgya és HTML törzse kötelező.');
  }

  const id = cleanText(input.id);
  if (id) {
    const query = new URLSearchParams({ id: `eq.${id}` });
    const [updated] = await b2bPatch<B2BTemplate>('b2b_email_templates', query, row);
    return updated;
  }

  const [created] = await b2bInsert<B2BTemplate>('b2b_email_templates', [row]);
  return created;
}

export async function listCampaigns(): Promise<B2BCampaign[]> {
  return b2bSelect<B2BCampaign>(
    'b2b_email_campaigns',
    new URLSearchParams({ select: '*', deleted_at: 'is.null', order: 'created_at.desc', limit: '300' })
  );
}

export async function fetchTemplateById(id: string): Promise<B2BTemplate | null> {
  const rows = await b2bSelect<B2BTemplate>(
    'b2b_email_templates',
    new URLSearchParams({ select: '*', id: `eq.${id}`, limit: '1' })
  );
  return rows[0] ?? null;
}

export async function fetchCampaignById(id: string): Promise<B2BCampaign | null> {
  const rows = await b2bSelect<B2BCampaign>(
    'b2b_email_campaigns',
    new URLSearchParams({ select: '*', id: `eq.${id}`, limit: '1' })
  );
  return rows[0] ?? null;
}

export async function fetchContactById(id: string): Promise<B2BContact | null> {
  const rows = await b2bSelect<B2BContact>(
    'b2b_email_contacts',
    new URLSearchParams({ select: '*', id: `eq.${id}`, limit: '1' })
  );
  return rows[0] ?? null;
}

export async function fetchCampaignRecipientById(id: string): Promise<B2BCampaignRecipient | null> {
  const rows = await b2bSelect<B2BCampaignRecipient>(
    'b2b_email_campaign_recipients',
    new URLSearchParams({ select: '*', id: `eq.${id}`, limit: '1' })
  );
  return rows[0] ?? null;
}

export async function fetchCampaignsByIds(ids: string[]): Promise<B2BCampaign[]> {
  if (ids.length === 0) return [];
  return b2bSelect<B2BCampaign>(
    'b2b_email_campaigns',
    new URLSearchParams({ select: '*', id: `in.(${[...new Set(ids)].join(',')})`, limit: '500' })
  );
}

async function fetchContactsByIds(ids: string[]): Promise<B2BContact[]> {
  if (ids.length === 0) return [];
  return b2bSelect<B2BContact>(
    'b2b_email_contacts',
    new URLSearchParams({
      select: '*',
      id: `in.(${ids.join(',')})`,
      deleted_at: 'is.null',
      limit: '500'
    })
  );
}

async function fetchContactIdsByGroupIds(groupIds: string[]): Promise<string[]> {
  if (groupIds.length === 0) return [];
  const activeGroups = await b2bSelect<{ id: string }>(
    'b2b_email_groups',
    new URLSearchParams({
      select: 'id',
      id: `in.(${groupIds.join(',')})`,
      is_active: 'eq.true',
      deleted_at: 'is.null',
      limit: '500'
    })
  );
  const activeGroupIds = activeGroups.map((group) => group.id);
  if (activeGroupIds.length === 0) return [];
  const rows = await b2bSelect<{ contact_id: string }>(
    'b2b_email_group_members',
    new URLSearchParams({ select: 'contact_id', group_id: `in.(${activeGroupIds.join(',')})`, limit: '5000' })
  );
  return [...new Set(rows.map((row) => row.contact_id).filter(Boolean))];
}

export async function resolveTargetContacts(groupIdsInput: unknown, contactIdsInput: unknown): Promise<B2BContact[]> {
  const groupIds = cleanIds(groupIdsInput);
  const contactIds = cleanIds(contactIdsInput);
  const memberContactIds = await fetchContactIdsByGroupIds(groupIds);
  const ids = [...new Set([...contactIds, ...memberContactIds])];
  if (ids.length === 0) return [];

  const contacts = await fetchContactsByIds(ids);
  const byEmail = new Map<string, B2BContact>();
  contacts.forEach((contact) => {
    const email = normalizeEmail(contact.email);
    if (email && !byEmail.has(email)) {
      byEmail.set(email, contact);
    }
  });
  return [...byEmail.values()];
}

export async function createCampaign(input: JsonRow, createdByEmail: string | null): Promise<B2BCampaign> {
  const name = cleanText(input.name);
  const templateId = cleanText(input.template_id);
  if (!name || !templateId) {
    throw new Error('A kampány neve és sablonja kötelező.');
  }

  const template = await fetchTemplateById(templateId);
  if (!template || !template.is_active || template.deleted_at) {
    throw new Error('A kiválasztott sablon nem található.');
  }

  const contacts = await resolveTargetContacts(input.groupIds, input.contactIds);
  const [campaign] = await b2bInsert<B2BCampaign>('b2b_email_campaigns', [
    {
      name,
      template_id: template.id,
      status: 'ready',
      subject_snapshot: template.subject,
      html_snapshot: template.html_body,
      text_snapshot: template.text_body,
      target_count: contacts.length,
      created_by_email: createdByEmail
    }
  ]);

  try {
    await b2bInsert<B2BCampaignRecipient>(
      'b2b_email_campaign_recipients',
      contacts.map((contact) => ({
        campaign_id: campaign.id,
        contact_id: contact.id,
        email: normalizeEmail(contact.email),
        company_name: contact.company_name,
        contact_name: contact.contact_name,
        status: 'pending'
      })),
      'campaign_id,email'
    );
  } catch (error) {
    console.error('[b2b-email] campaign recipient upsert failed', {
      campaignId: campaign.id,
      contactCount: contacts.length,
      error
    });
    throw new Error(
      'A kampány címzettjeit nem sikerült létrehozni. Valószínűleg adatbázis egyediségi beállítás hiányzik vagy duplikált címzett szerepel a kampányban.'
    );
  }

  return campaign;
}

export async function listCampaignRecipients(campaignId: string): Promise<B2BCampaignRecipient[]> {
  return b2bSelect<B2BCampaignRecipient>(
    'b2b_email_campaign_recipients',
    new URLSearchParams({ select: '*', campaign_id: `eq.${campaignId}`, order: 'created_at.asc', limit: '1000' })
  );
}

export async function listContactCampaignRecipients(contactId: string): Promise<B2BCampaignRecipient[]> {
  return b2bSelect<B2BCampaignRecipient>(
    'b2b_email_campaign_recipients',
    new URLSearchParams({ select: '*', contact_id: `eq.${contactId}`, order: 'created_at.desc', limit: '500' })
  );
}

export async function listQueueableCampaignRecipients(campaignId: string): Promise<B2BCampaignRecipient[]> {
  return b2bSelect<B2BCampaignRecipient>(
    'b2b_email_campaign_recipients',
    new URLSearchParams({
      select: '*',
      campaign_id: `eq.${campaignId}`,
      status: 'in.(pending,queued)',
      order: 'created_at.asc',
      limit: '1000'
    })
  );
}

export async function listDueQueuedCampaignRecipients(campaignId: string, nowIso: string, limit: number): Promise<B2BCampaignRecipient[]> {
  return b2bSelect<B2BCampaignRecipient>(
    'b2b_email_campaign_recipients',
    new URLSearchParams({
      select: '*',
      campaign_id: `eq.${campaignId}`,
      status: 'eq.queued',
      scheduled_at: `lte.${nowIso}`,
      order: 'scheduled_at.asc',
      limit: String(limit)
    })
  );
}

export async function patchCampaign(id: string, updates: JsonRow): Promise<B2BCampaign | null> {
  const rows = await b2bPatch<B2BCampaign>('b2b_email_campaigns', new URLSearchParams({ id: `eq.${id}` }), updates);
  return rows[0] ?? null;
}

export async function archiveContact(id: string): Promise<B2BContact | null> {
  return patchContact(id, {
    is_active: false,
    deleted_at: new Date().toISOString()
  });
}

export async function archiveGroup(id: string): Promise<B2BGroup | null> {
  const rows = await b2bPatch<B2BGroup>('b2b_email_groups', new URLSearchParams({ id: `eq.${id}` }), {
    is_active: false,
    deleted_at: new Date().toISOString()
  });
  return rows[0] ?? null;
}

export async function archiveTemplate(id: string): Promise<B2BTemplate | null> {
  const rows = await b2bPatch<B2BTemplate>('b2b_email_templates', new URLSearchParams({ id: `eq.${id}` }), {
    is_active: false,
    deleted_at: new Date().toISOString()
  });
  return rows[0] ?? null;
}

export async function archiveCampaign(id: string): Promise<B2BCampaign | null> {
  const now = new Date().toISOString();
  const campaign = await patchCampaign(id, {
    archived_at: now,
    deleted_at: now
  });

  if (campaign && ['queued', 'sending'].includes(campaign.status)) {
    await b2bPatch<B2BCampaignRecipient>(
      'b2b_email_campaign_recipients',
      new URLSearchParams({
        campaign_id: `eq.${id}`,
        status: 'in.(pending,queued)'
      }),
      {
        status: 'skipped',
        last_event_type: 'campaign_archived',
        last_event_at: now,
        locked_at: null,
        locked_by: null
      }
    );
    await updateCampaignAggregates(id);
  }

  return campaign;
}

export async function patchCampaignRecipient(id: string, updates: JsonRow): Promise<B2BCampaignRecipient | null> {
  const rows = await b2bPatch<B2BCampaignRecipient>(
    'b2b_email_campaign_recipients',
    new URLSearchParams({ id: `eq.${id}` }),
    updates
  );
  return rows[0] ?? null;
}

export async function patchContact(id: string, updates: JsonRow): Promise<B2BContact | null> {
  const rows = await b2bPatch<B2BContact>('b2b_email_contacts', new URLSearchParams({ id: `eq.${id}` }), updates);
  return rows[0] ?? null;
}

export async function fetchRecipientByResendEmailId(resendEmailId: string): Promise<B2BCampaignRecipient | null> {
  const rows = await b2bSelect<B2BCampaignRecipient>(
    'b2b_email_campaign_recipients',
    new URLSearchParams({ select: '*', resend_email_id: `eq.${resendEmailId}`, limit: '1' })
  );
  return rows[0] ?? null;
}

export async function listContactSendAttempts(contactId: string): Promise<B2BEmailSendAttempt[]> {
  return b2bSelect<B2BEmailSendAttempt>(
    'b2b_email_send_attempts',
    new URLSearchParams({ select: '*', contact_id: `eq.${contactId}`, order: 'created_at.desc', limit: '500' })
  );
}

export async function fetchSendAttemptById(id: string): Promise<B2BEmailSendAttempt | null> {
  const rows = await b2bSelect<B2BEmailSendAttempt>(
    'b2b_email_send_attempts',
    new URLSearchParams({ select: '*', id: `eq.${id}`, limit: '1' })
  );
  return rows[0] ?? null;
}

export async function fetchSendAttemptByResendEmailId(resendEmailId: string): Promise<B2BEmailSendAttempt | null> {
  const rows = await b2bSelect<B2BEmailSendAttempt>(
    'b2b_email_send_attempts',
    new URLSearchParams({ select: '*', resend_email_id: `eq.${resendEmailId}`, limit: '1' })
  );
  return rows[0] ?? null;
}

export async function insertSendAttempt(row: JsonRow): Promise<B2BEmailSendAttempt> {
  const [created] = await b2bInsert<B2BEmailSendAttempt>('b2b_email_send_attempts', [row]);
  return created;
}

export async function patchSendAttempt(id: string, updates: JsonRow): Promise<B2BEmailSendAttempt | null> {
  const rows = await b2bPatch<B2BEmailSendAttempt>(
    'b2b_email_send_attempts',
    new URLSearchParams({ id: `eq.${id}` }),
    updates
  );
  return rows[0] ?? null;
}

export async function listEventsByResendEmailIds(resendEmailIds: string[]): Promise<B2BEmailEvent[]> {
  const ids = [...new Set(resendEmailIds.filter(Boolean))];
  if (ids.length === 0) return [];
  return b2bSelect<B2BEmailEvent>(
    'b2b_email_events',
    new URLSearchParams({
      select: '*',
      resend_email_id: `in.(${ids.join(',')})`,
      order: 'created_at.desc',
      limit: '1000'
    })
  );
}

export async function eventExists(svixId: string): Promise<boolean> {
  const rows = await b2bSelect<{ id: string }>(
    'b2b_email_events',
    new URLSearchParams({ select: 'id', svix_id: `eq.${svixId}`, limit: '1' })
  );
  return rows.length > 0;
}

export async function insertEvent(row: JsonRow): Promise<void> {
  await b2bInsert('b2b_email_events', [row], 'svix_id');
}

export async function updateCampaignAggregates(campaignId: string): Promise<void> {
  const recipients = await listCampaignRecipients(campaignId);
  const count = (status: B2BCampaignRecipient['status']) => recipients.filter((recipient) => recipient.status === status).length;
  const sentLike = recipients.filter((recipient) =>
    ['sent', 'delivered', 'bounced', 'failed', 'complained'].includes(recipient.status)
  ).length;
  await patchCampaign(campaignId, {
    target_count: recipients.length,
    sent_count: sentLike,
    delivered_count: count('delivered'),
    bounced_count: count('bounced'),
    failed_count: count('failed'),
    complained_count: count('complained'),
    suppressed_count: count('suppressed')
  });
}

export async function finishCampaignIfQueueDrained(campaignId: string): Promise<B2BCampaign | null> {
  const recipients = await listCampaignRecipients(campaignId);
  const hasOpenQueue = recipients.some((recipient) => ['queued', 'processing', 'pending'].includes(recipient.status));
  if (hasOpenQueue) {
    return null;
  }

  const failedCount = recipients.filter((recipient) => ['failed', 'bounced', 'complained', 'suppressed'].includes(recipient.status)).length;
  const sentCount = recipients.filter((recipient) => ['sent', 'delivered'].includes(recipient.status)).length;
  const skippedCount = recipients.filter((recipient) => recipient.status === 'skipped').length;
  const nextStatus = sentCount > 0 && failedCount === 0 ? 'sent' : sentCount > 0 ? 'partial_failed' : skippedCount > 0 ? 'failed' : 'failed';

  return patchCampaign(campaignId, {
    status: nextStatus,
    queue_finished_at: new Date().toISOString()
  });
}

export function isSuppressedContact(contact: Pick<B2BContact, 'is_active' | 'deleted_at' | 'unsubscribed_at' | 'bounced_at' | 'complained_at' | 'suppressed_at'>): boolean {
  return !contact.is_active || Boolean(contact.deleted_at || contact.unsubscribed_at || contact.bounced_at || contact.complained_at || contact.suppressed_at);
}

export function isTerminalRecipientStatus(status: B2BCampaignRecipient['status']): boolean {
  return TERMINAL_RECIPIENT_STATUSES.includes(status);
}
