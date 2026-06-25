'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Eye, Mail, Plus, RefreshCw, Send, Users } from 'lucide-react';
import {
  getB2BCampaignStatusLabel,
  getB2BEmailEventLabel,
  getB2BRecipientStatusLabel,
  type B2BStatusLabel,
  type B2BStatusTone
} from '@/lib/email/b2b-email-status';

type Contact = {
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
};

type Group = {
  id: string;
  name: string;
  description: string | null;
  member_count?: number;
};

type Template = {
  id: string;
  name: string;
  subject: string;
  html_body: string;
  text_body: string | null;
  is_active: boolean;
};

type Campaign = {
  id: string;
  name: string;
  status: string;
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
  created_at: string;
};

type Preview = {
  subject: string;
  html: string;
  text: string;
};

type QueueProcessResponse = {
  mode?: 'single' | 'batch';
  processed_count: number;
  sent_count: number;
  failed_count?: number;
  skipped_count: number;
  next_scheduled_at: string | null;
  queue_finished: boolean;
  message?: string;
};

type EmailHistoryEvent = {
  id: string;
  event_type: string;
  created_at: string;
};

type EmailHistoryItem = {
  id: string;
  source: 'campaign_recipient' | 'send_attempt';
  campaign_id: string | null;
  campaign_name: string | null;
  campaign_recipient_id: string | null;
  email: string;
  subject: string | null;
  status: string;
  last_event_type: string | null;
  resend_email_id: string | null;
  resend_error: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  bounced_at: string | null;
  failed_at: string | null;
  complained_at: string | null;
  created_at: string;
  events: EmailHistoryEvent[];
};

type ContactHistoryResponse = {
  contact: Contact;
  contactGroupIds: string[];
  activeGroups: Group[];
  history: EmailHistoryItem[];
};

type ContactEditFormState = {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  website: string;
  source: string;
  legal_basis: string;
  note: string;
  is_active: boolean;
};

type TabKey = 'contacts' | 'groups' | 'templates' | 'campaigns';

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: 'contacts', label: 'Címzettek' },
  { key: 'groups', label: 'Célcsoportok' },
  { key: 'templates', label: 'Sablonok' },
  { key: 'campaigns', label: 'Kampányok' }
];

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: 'no-store' });
  const body = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(body.error ?? 'Sikertelen művelet.');
  }
  return body;
}

function statusTone(tone: B2BStatusTone): string {
  if (tone === 'emerald') return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200';
  if (tone === 'rose') return 'border-rose-500/40 bg-rose-500/10 text-rose-200';
  if (tone === 'amber') return 'border-amber-500/40 bg-amber-500/10 text-amber-200';
  if (tone === 'cyan') return 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200';
  if (tone === 'violet') return 'border-violet-500/40 bg-violet-500/10 text-violet-200';
  return 'border-slate-700 bg-slate-900 text-slate-300';
}

function StatusBadge({ status }: { status: B2BStatusLabel }) {
  return <span className={`rounded-full border px-2 py-1 text-xs ${statusTone(status.tone)}`}>{status.label}</span>;
}

function toggleSelection(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function formatDateTime(value: string | null): string {
  if (!value) return '-';
  return new Intl.DateTimeFormat('hu-HU', {
    timeZone: 'Europe/Budapest',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(value));
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours} óra ${minutes} perc`;
  if (minutes > 0) return `${minutes} perc ${seconds} mp`;
  return `${seconds} mp`;
}

function buildContactEditForm(contact: Contact): ContactEditFormState {
  return {
    company_name: contact.company_name,
    contact_name: contact.contact_name ?? '',
    email: contact.email,
    phone: contact.phone ?? '',
    website: contact.website ?? '',
    source: contact.source ?? '',
    legal_basis: contact.legal_basis ?? '',
    note: contact.note ?? '',
    is_active: contact.is_active
  };
}

function formatQueueProcessMessage(body: QueueProcessResponse): string {
  if (body.queue_finished) return 'A kampány küldési sora befejeződött.';
  const nextDate = formatDateTime(body.next_scheduled_at);
  if (body.sent_count > 0) return `1 email elküldve. Következő esedékes küldés: ${nextDate}.`;
  if (body.processed_count === 0) return `Még nincs esedékes címzett. Következő küldés: ${nextDate}.`;
  return body.message ?? `Queue feldolgozás kész. Feldolgozva: ${body.processed_count}, elküldve: ${body.sent_count}, kihagyva: ${body.skipped_count}.`;
}

export function B2BEmailAdmin() {
  const [activeTab, setActiveTab] = useState<TabKey>('contacts');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [sendCampaign, setSendCampaign] = useState<Campaign | null>(null);
  const [sendingCampaignId, setSendingCampaignId] = useState<string | null>(null);
  const [queueSettings, setQueueSettings] = useState({ perEmailDelaySeconds: 30, maxEmailsPerProcess: 10 });
  const [contactHistory, setContactHistory] = useState<ContactHistoryResponse | null>(null);
  const [contactHistoryLoading, setContactHistoryLoading] = useState(false);
  const [resendingHistoryId, setResendingHistoryId] = useState<string | null>(null);
  const [contactEditMode, setContactEditMode] = useState(false);
  const [contactEditForm, setContactEditForm] = useState<ContactEditFormState | null>(null);
  const [selectedContactGroupIds, setSelectedContactGroupIds] = useState<string[]>([]);
  const [savingContactDetails, setSavingContactDetails] = useState(false);
  const [savingContactGroups, setSavingContactGroups] = useState(false);
  const [manualScheduledCampaignId, setManualScheduledCampaignId] = useState<string | null>(null);
  const manualScheduledCampaignIdRef = useRef<string | null>(null);
  const manualScheduledIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const manualScheduledInFlightRef = useRef(false);

  const [contactForm, setContactForm] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    website: '',
    source: '',
    legal_basis: '',
    note: '',
    groupIds: [] as string[]
  });
  const [groupForm, setGroupForm] = useState({ name: '', description: '', contactIds: [] as string[] });
  const [templateForm, setTemplateForm] = useState({
    id: '',
    name: '',
    subject: '',
    html_body: '',
    text_body: '',
    is_active: true
  });
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    template_id: '',
    groupIds: [] as string[],
    contactIds: [] as string[]
  });
  const [testEmail, setTestEmail] = useState('');

  const activeContacts = useMemo(
    () => contacts.filter((contact) => contact.is_active && !contact.unsubscribed_at && !contact.bounced_at && !contact.complained_at && !contact.suppressed_at),
    [contacts]
  );

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [contactsBody, groupsBody, templatesBody, campaignsBody] = await Promise.all([
        fetchJson<{ rows: Contact[] }>('/api/admin/b2b-email/contacts'),
        fetchJson<{ rows: Group[] }>('/api/admin/b2b-email/groups'),
        fetchJson<{ rows: Template[] }>('/api/admin/b2b-email/templates'),
        fetchJson<{ rows: Campaign[] }>('/api/admin/b2b-email/campaigns')
      ]);
      setContacts(contactsBody.rows);
      setGroups(groupsBody.rows);
      setTemplates(templatesBody.rows);
      setCampaigns(campaignsBody.rows);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Sikertelen adatlekérés.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    return () => {
      if (manualScheduledIntervalRef.current) {
        clearInterval(manualScheduledIntervalRef.current);
      }
    };
  }, []);

  async function createContact() {
    setMessage(null);
    setError(null);
    try {
      await fetchJson('/api/admin/b2b-email/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });
      setContactForm({ company_name: '', contact_name: '', email: '', phone: '', website: '', source: '', legal_basis: '', note: '', groupIds: [] });
      setMessage('Címzett mentve.');
      await loadAll();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Mentési hiba.');
    }
  }

  async function createGroup() {
    setMessage(null);
    setError(null);
    try {
      await fetchJson('/api/admin/b2b-email/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupForm)
      });
      setGroupForm({ name: '', description: '', contactIds: [] });
      setMessage('Célcsoport mentve.');
      await loadAll();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Mentési hiba.');
    }
  }

  async function saveTemplate() {
    setMessage(null);
    setError(null);
    try {
      await fetchJson('/api/admin/b2b-email/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateForm)
      });
      setTemplateForm({ id: '', name: '', subject: '', html_body: '', text_body: '', is_active: true });
      setMessage('Sablon mentve.');
      await loadAll();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Mentési hiba.');
    }
  }

  async function createCampaign() {
    setMessage(null);
    setError(null);
    try {
      await fetchJson('/api/admin/b2b-email/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignForm)
      });
      setCampaignForm({ name: '', template_id: '', groupIds: [], contactIds: [] });
      setMessage('Kampány létrehozva előnézeti/küldési állapotban.');
      await loadAll();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Mentési hiba.');
    }
  }

  async function openPreview(campaignId: string) {
    setError(null);
    try {
      const body = await fetchJson<Preview>(`/api/admin/b2b-email/campaigns/${campaignId}/preview`);
      setPreview(body);
    } catch (previewError) {
      setError(previewError instanceof Error ? previewError.message : 'Előnézeti hiba.');
    }
  }

  async function sendConfirmedCampaign() {
    if (!sendCampaign) return;
    setSendingCampaignId(sendCampaign.id);
    setError(null);
    setMessage(null);
    try {
      const body = await fetchJson<{
        queued_count: number;
        skipped_count: number;
        first_scheduled_at: string | null;
        last_scheduled_at: string | null;
      }>(`/api/admin/b2b-email/campaigns/${sendCampaign.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmSend: true,
          per_email_delay_seconds: queueSettings.perEmailDelaySeconds,
          max_emails_per_process: queueSettings.maxEmailsPerProcess
        })
      });
      setMessage(
        `Küldési sor elindítva. Sorba állítva: ${body.queued_count}, kihagyva: ${body.skipped_count}. Első: ${formatDateTime(body.first_scheduled_at)}, utolsó: ${formatDateTime(body.last_scheduled_at)}.`
      );
      setSendCampaign(null);
      await loadAll();
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'Küldési hiba.');
    } finally {
      setSendingCampaignId(null);
    }
  }

  async function processCampaignQueue(campaignId: string, mode: 'single' | 'batch' = 'single'): Promise<QueueProcessResponse | null> {
    setError(null);
    setMessage(null);
    setSendingCampaignId(campaignId);
    try {
      const body = await fetchJson<QueueProcessResponse>(
        `/api/admin/b2b-email/campaigns/${campaignId}/process-queue`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode })
        }
      );
      setMessage(formatQueueProcessMessage(body));
      await loadAll();
      return body;
    } catch (processError) {
      setError(processError instanceof Error ? processError.message : 'Queue feldolgozási hiba.');
      return null;
    } finally {
      setSendingCampaignId(null);
    }
  }

  function stopManualScheduledProcessing(showMessage = true) {
    if (manualScheduledIntervalRef.current) {
      clearInterval(manualScheduledIntervalRef.current);
      manualScheduledIntervalRef.current = null;
    }
    manualScheduledCampaignIdRef.current = null;
    manualScheduledInFlightRef.current = false;
    setManualScheduledCampaignId(null);
    if (showMessage) {
      setMessage('Kézi küldés leállítva.');
    }
  }

  function startManualScheduledProcessing(campaign: Campaign) {
    stopManualScheduledProcessing(false);
    const intervalMs = Math.max(30, campaign.per_email_delay_seconds ?? 30) * 1000;
    manualScheduledCampaignIdRef.current = campaign.id;
    setManualScheduledCampaignId(campaign.id);
    setMessage(`Kézi ütemezett küldés elindítva. Egy körben legfeljebb 1 email megy ki, ${Math.round(intervalMs / 1000)} másodpercenként.`);

    const tick = async () => {
      if (manualScheduledInFlightRef.current || manualScheduledCampaignIdRef.current !== campaign.id) return;
      manualScheduledInFlightRef.current = true;
      try {
        const body = await processCampaignQueue(campaign.id, 'single');
        if (body?.queue_finished) {
          stopManualScheduledProcessing(false);
        }
      } finally {
        manualScheduledInFlightRef.current = false;
      }
    };

    void tick();
    manualScheduledIntervalRef.current = setInterval(() => {
      void tick();
    }, intervalMs);
  }

  function openSendModal(campaign: Campaign) {
    setQueueSettings({
      perEmailDelaySeconds: campaign.per_email_delay_seconds ?? 30,
      maxEmailsPerProcess: campaign.max_emails_per_process ?? 10
    });
    setSendCampaign(campaign);
  }

  async function openContactHistory(contactId: string) {
    setError(null);
    setContactHistoryLoading(true);
    try {
      const body = await fetchJson<ContactHistoryResponse>(`/api/admin/b2b-email/contacts/${contactId}/history`);
      setContactHistory(body);
      setContactEditForm(buildContactEditForm(body.contact));
      setSelectedContactGroupIds(body.contactGroupIds);
      setContactEditMode(false);
    } catch (historyError) {
      setError(historyError instanceof Error ? historyError.message : 'Email előzmény lekérdezési hiba.');
    } finally {
      setContactHistoryLoading(false);
    }
  }

  async function saveContactDetails() {
    if (!contactHistory || !contactEditForm) return;
    setError(null);
    setMessage(null);
    setSavingContactDetails(true);
    try {
      const body = await fetchJson<{ contact: Contact; message?: string }>(`/api/admin/b2b-email/contacts/${contactHistory.contact.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactEditForm)
      });
      const updatedHistory = { ...contactHistory, contact: body.contact };
      setContactHistory(updatedHistory);
      setContactEditForm(buildContactEditForm(body.contact));
      setContactEditMode(false);
      setMessage(body.message ?? 'Címzett adatai mentve.');
      await loadAll();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'A címzett mentése nem sikerült.');
    } finally {
      setSavingContactDetails(false);
    }
  }

  async function saveContactGroups() {
    if (!contactHistory) return;
    setError(null);
    setMessage(null);
    setSavingContactGroups(true);
    try {
      const body = await fetchJson<{ contactGroupIds: string[]; activeGroups: Group[]; message?: string }>(
        `/api/admin/b2b-email/contacts/${contactHistory.contact.id}/groups`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ groupIds: selectedContactGroupIds })
        }
      );
      setSelectedContactGroupIds(body.contactGroupIds);
      setContactHistory({ ...contactHistory, contactGroupIds: body.contactGroupIds, activeGroups: body.activeGroups });
      setMessage(body.message ?? 'Célcsoportok mentve.');
      await loadAll();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'A célcsoport-tagság mentése nem sikerült.');
    } finally {
      setSavingContactGroups(false);
    }
  }

  async function resendHistoryItem(item: EmailHistoryItem) {
    if (!contactHistory) return;
    const isBlocked = Boolean(
      contactHistory.contact.unsubscribed_at || contactHistory.contact.complained_at || contactHistory.contact.suppressed_at
    );
    if (isBlocked) {
      setError('Erre a címzettre nem küldhető új email, mert leiratkozott, panaszt tett vagy tiltólistára került.');
      return;
    }

    const bouncedWarning = item.status === 'bounced' ? '\n\nEz az email korábban visszapattant. Csak akkor küldd újra, ha ellenőrizted a címet.' : '';
    if (!window.confirm(`Biztosan újraküldöd ezt az emailt a címzettnek? Az újraküldés külön eseményként naplózásra kerül.${bouncedWarning}`)) {
      return;
    }

    setError(null);
    setMessage(null);
    setResendingHistoryId(item.id);
    try {
      await fetchJson(`/api/admin/b2b-email/contacts/${contactHistory.contact.id}/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmSend: true,
          campaignRecipientId: item.campaign_recipient_id,
          sendAttemptId: item.source === 'send_attempt' ? item.id : undefined
        })
      });
      setMessage('Az email újraküldése naplózva lett.');
      await openContactHistory(contactHistory.contact.id);
      await loadAll();
    } catch (resendError) {
      setError(resendError instanceof Error ? resendError.message : 'Újraküldési hiba.');
    } finally {
      setResendingHistoryId(null);
    }
  }

  async function sendTestEmail(templateId: string) {
    setError(null);
    setMessage(null);
    try {
      await fetchJson('/api/admin/b2b-email/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_id: templateId, to: testEmail, send: true })
      });
      setMessage('Teszt email elküldve.');
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'Tesztküldési hiba.');
    }
  }

  async function deleteB2BEntity(params: {
    endpoint: string;
    confirmText: string;
    fallbackSuccess: string;
    fallbackError: string;
  }) {
    if (!window.confirm(params.confirmText)) return;
    setError(null);
    setMessage(null);
    try {
      const body = await fetchJson<{ message?: string }>(params.endpoint, { method: 'DELETE' });
      setMessage(body.message ?? params.fallbackSuccess);
      await loadAll();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : params.fallbackError);
    }
  }

  return (
    <section className="space-y-4 rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">B2B email kampányok</h2>
          <p className="mt-1 text-sm text-slate-400">Címzettek, célcsoportok, sablonok és Resend kampányküldés adminból.</p>
        </div>
        <button
          type="button"
          onClick={() => void loadAll()}
          className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-100 hover:bg-slate-800"
        >
          <RefreshCw className="h-4 w-4" />
          Frissítés
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${
              activeTab === tab.key ? 'bg-cyan-500 text-slate-950' : 'border border-slate-800 bg-slate-950 text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error ? <p className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p> : null}
      {message ? <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{message}</p> : null}
      {loading ? <p className="text-sm text-slate-400">Betöltés...</p> : null}

      {activeTab === 'contacts' ? (
        <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-950 p-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white"><Plus className="h-4 w-4" /> Új címzett</h3>
            <input value={contactForm.company_name} onChange={(event) => setContactForm((previous) => ({ ...previous, company_name: event.target.value }))} placeholder="Cégnév" className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
            <input value={contactForm.contact_name} onChange={(event) => setContactForm((previous) => ({ ...previous, contact_name: event.target.value }))} placeholder="Kapcsolattartó" className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
            <input value={contactForm.email} onChange={(event) => setContactForm((previous) => ({ ...previous, email: event.target.value }))} placeholder="Email" type="email" className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-1">
              <input value={contactForm.phone} onChange={(event) => setContactForm((previous) => ({ ...previous, phone: event.target.value }))} placeholder="Telefon" className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
              <input value={contactForm.website} onChange={(event) => setContactForm((previous) => ({ ...previous, website: event.target.value }))} placeholder="Weboldal" className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
            </div>
            <input value={contactForm.source} onChange={(event) => setContactForm((previous) => ({ ...previous, source: event.target.value }))} placeholder="Forrás" className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
            <textarea value={contactForm.note} onChange={(event) => setContactForm((previous) => ({ ...previous, note: event.target.value }))} placeholder="Megjegyzés" className="min-h-20 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-slate-400">Csoportok</p>
              <div className="max-h-36 space-y-1 overflow-auto rounded-md border border-slate-800 p-2">
                {groups.map((group) => (
                  <label key={group.id} className="flex items-center gap-2 text-sm text-slate-200">
                    <input type="checkbox" checked={contactForm.groupIds.includes(group.id)} onChange={() => setContactForm((previous) => ({ ...previous, groupIds: toggleSelection(previous.groupIds, group.id) }))} />
                    {group.name}
                  </label>
                ))}
              </div>
            </div>
            <button type="button" onClick={() => void createContact()} className="w-full rounded-md bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400">Címzett mentése</button>
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="min-w-full text-left text-sm text-slate-200">
              <thead className="bg-slate-950 text-xs uppercase tracking-wide text-slate-400">
                <tr><th className="px-3 py-2">Cég</th><th className="px-3 py-2">Email</th><th className="px-3 py-2">Státusz</th><th className="px-3 py-2">Utolsó email</th><th className="px-3 py-2">Művelet</th></tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id} className="border-t border-slate-800">
                    <td className="px-3 py-2"><span className="font-medium text-white">{contact.company_name}</span><br /><span className="text-xs text-slate-400">{contact.contact_name || '-'}</span></td>
                    <td className="px-3 py-2">{contact.email}</td>
                    <td className="px-3 py-2">{activeContacts.some((item) => item.id === contact.id) ? 'Aktív' : 'Kizárt / leiratkozott'}</td>
                    <td className="px-3 py-2"><StatusBadge status={getB2BEmailEventLabel(contact.last_email_status)} /></td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void openContactHistory(contact.id)}
                          className="rounded-md border border-cyan-500/40 px-2 py-1 text-xs text-cyan-200 hover:bg-cyan-500/10"
                        >
                          Részletek
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteB2BEntity({
                            endpoint: `/api/admin/b2b-email/contacts/${contact.id}`,
                            confirmText: 'Biztosan inaktiválod ezt a címzettet? A korábbi kampánynaplók megmaradnak, de a rendszer nem küld neki új B2B kampányt.',
                            fallbackSuccess: 'A címzett inaktiválva lett.',
                            fallbackError: 'A címzett inaktiválása nem sikerült.'
                          })}
                          className="rounded-md border border-rose-500/40 px-2 py-1 text-xs text-rose-200 hover:bg-rose-500/10"
                        >
                          Inaktiválás
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {activeTab === 'groups' ? (
        <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-950 p-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white"><Users className="h-4 w-4" /> Új célcsoport</h3>
            <input value={groupForm.name} onChange={(event) => setGroupForm((previous) => ({ ...previous, name: event.target.value }))} placeholder="Célcsoport neve" className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
            <textarea value={groupForm.description} onChange={(event) => setGroupForm((previous) => ({ ...previous, description: event.target.value }))} placeholder="Leírás" className="min-h-20 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
            <div className="max-h-48 space-y-1 overflow-auto rounded-md border border-slate-800 p-2">
              {contacts.map((contact) => (
                <label key={contact.id} className="flex items-center gap-2 text-sm text-slate-200">
                  <input type="checkbox" checked={groupForm.contactIds.includes(contact.id)} onChange={() => setGroupForm((previous) => ({ ...previous, contactIds: toggleSelection(previous.contactIds, contact.id) }))} />
                  {contact.company_name} · {contact.email}
                </label>
              ))}
            </div>
            <button type="button" onClick={() => void createGroup()} className="w-full rounded-md bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400">Célcsoport mentése</button>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {groups.map((group) => (
              <article key={group.id} className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                <h4 className="font-semibold text-white">{group.name}</h4>
                <p className="mt-1 text-sm text-slate-400">{group.description || '-'}</p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <p className="text-xs text-cyan-200">{group.member_count ?? 0} címzett</p>
                  <button
                    type="button"
                    onClick={() => void deleteB2BEntity({
                      endpoint: `/api/admin/b2b-email/groups/${group.id}`,
                      confirmText: 'Biztosan archiválod ezt a célcsoportot? Új kampányhoz már nem lesz választható, de a korábbi kampányadatok megmaradnak.',
                      fallbackSuccess: 'A célcsoport archiválva lett.',
                      fallbackError: 'A célcsoport archiválása nem sikerült.'
                    })}
                    className="rounded-md border border-rose-500/40 px-2 py-1 text-xs text-rose-200 hover:bg-rose-500/10"
                  >
                    Archiválás
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {activeTab === 'templates' ? (
        <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
          <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-950 p-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white"><Mail className="h-4 w-4" /> Sablon</h3>
            <input value={templateForm.name} onChange={(event) => setTemplateForm((previous) => ({ ...previous, name: event.target.value }))} placeholder="Sablon neve" className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
            <input value={templateForm.subject} onChange={(event) => setTemplateForm((previous) => ({ ...previous, subject: event.target.value }))} placeholder="Tárgy" className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
            <textarea value={templateForm.html_body} onChange={(event) => setTemplateForm((previous) => ({ ...previous, html_body: event.target.value }))} placeholder="HTML törzs" className="min-h-44 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-white" />
            <textarea value={templateForm.text_body} onChange={(event) => setTemplateForm((previous) => ({ ...previous, text_body: event.target.value }))} placeholder="Text verzió" className="min-h-28 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
            <button type="button" onClick={() => void saveTemplate()} className="w-full rounded-md bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400">Sablon mentése</button>
          </div>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input value={testEmail} onChange={(event) => setTestEmail(event.target.value)} placeholder="Teszt email cím" type="email" className="min-w-0 flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" />
            </div>
            {templates.map((template) => (
              <article key={template.id} className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h4 className="font-semibold text-white">{template.name}</h4>
                    <p className="mt-1 text-sm text-slate-300">{template.subject}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => setTemplateForm({ id: template.id, name: template.name, subject: template.subject, html_body: template.html_body, text_body: template.text_body ?? '', is_active: template.is_active })} className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-100 hover:bg-slate-800">Szerkesztés</button>
                    <button type="button" onClick={() => void sendTestEmail(template.id)} className="inline-flex items-center gap-2 rounded-md border border-cyan-500/50 px-3 py-2 text-sm text-cyan-200 hover:bg-cyan-500/10"><Send className="h-4 w-4" /> Teszt</button>
                    <button
                      type="button"
                      onClick={() => void deleteB2BEntity({
                        endpoint: `/api/admin/b2b-email/templates/${template.id}`,
                        confirmText: 'Biztosan archiválod ezt a sablont? Új kampányhoz már nem lesz választható, de a korábbi kampányok nem sérülnek.',
                        fallbackSuccess: 'A sablon archiválva lett.',
                        fallbackError: 'A sablon archiválása nem sikerült.'
                      })}
                      className="rounded-md border border-rose-500/40 px-3 py-2 text-sm text-rose-200 hover:bg-rose-500/10"
                    >
                      Archiválás
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {activeTab === 'campaigns' ? (
        <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
          <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-950 p-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white"><Send className="h-4 w-4" /> Új kampány</h3>
            <input value={campaignForm.name} onChange={(event) => setCampaignForm((previous) => ({ ...previous, name: event.target.value }))} placeholder="Kampány neve" className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
            <select value={campaignForm.template_id} onChange={(event) => setCampaignForm((previous) => ({ ...previous, template_id: event.target.value }))} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white">
              <option value="">Sablon kiválasztása</option>
              {templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
            </select>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
              <div>
                <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">Célcsoportok</p>
                <div className="max-h-36 space-y-1 overflow-auto rounded-md border border-slate-800 p-2">
                  {groups.map((group) => (
                    <label key={group.id} className="flex items-center gap-2 text-sm text-slate-200">
                      <input type="checkbox" checked={campaignForm.groupIds.includes(group.id)} onChange={() => setCampaignForm((previous) => ({ ...previous, groupIds: toggleSelection(previous.groupIds, group.id) }))} />
                      {group.name}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">Konkrét címzettek</p>
                <div className="max-h-36 space-y-1 overflow-auto rounded-md border border-slate-800 p-2">
                  {activeContacts.map((contact) => (
                    <label key={contact.id} className="flex items-center gap-2 text-sm text-slate-200">
                      <input type="checkbox" checked={campaignForm.contactIds.includes(contact.id)} onChange={() => setCampaignForm((previous) => ({ ...previous, contactIds: toggleSelection(previous.contactIds, contact.id) }))} />
                      {contact.company_name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <button type="button" onClick={() => void createCampaign()} className="w-full rounded-md bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400">Kampány létrehozása</button>
          </div>
          <div className="space-y-3">
            {campaigns.map((campaign) => {
              const queueIsActive = ['queued', 'sending'].includes(campaign.status);
              const manualSchedulerRunning = manualScheduledCampaignId === campaign.id;
              return (
                <article key={campaign.id} className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h4 className="font-semibold text-white">{campaign.name}</h4>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <StatusBadge status={getB2BCampaignStatusLabel(campaign.status)} />
                        <span className="rounded-full border border-slate-700 px-2 py-1 text-slate-300">Célzott: {campaign.target_count}</span>
                        <span className="rounded-full border border-slate-700 px-2 py-1 text-slate-300">Elküldve: {campaign.sent_count}</span>
                        <span className="rounded-full border border-slate-700 px-2 py-1 text-slate-300">Kézbesítve: {campaign.delivered_count}</span>
                        <span className="rounded-full border border-slate-700 px-2 py-1 text-slate-300">Sikertelen: {campaign.failed_count}</span>
                      </div>
                      {queueIsActive ? (
                        <p className="mt-3 max-w-2xl rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs leading-5 text-amber-100">
                          A Sor feldolgozása gomb egyszeri manuális feldolgozás. A késleltetett, egymás utáni küldéshez használd a Kézi ütemezett küldés indítása gombot, és hagyd nyitva az admin oldalt.
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => void openPreview(campaign.id)} className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-100 hover:bg-slate-800"><Eye className="h-4 w-4" /> Előnézet</button>
                      {queueIsActive ? (
                        <>
                          <button
                            type="button"
                            onClick={() => void processCampaignQueue(campaign.id, 'single')}
                            disabled={sendingCampaignId === campaign.id}
                            className="inline-flex items-center gap-2 rounded-md border border-cyan-500/50 px-3 py-2 text-sm text-cyan-200 hover:bg-cyan-500/10 disabled:opacity-60"
                          >
                            <RefreshCw className="h-4 w-4" /> Sor feldolgozása egyszer
                          </button>
                          {manualSchedulerRunning ? (
                            <button
                              type="button"
                              onClick={() => stopManualScheduledProcessing()}
                              className="inline-flex items-center gap-2 rounded-md border border-amber-500/50 px-3 py-2 text-sm text-amber-100 hover:bg-amber-500/10"
                            >
                              Kézi küldés leállítása
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => startManualScheduledProcessing(campaign)}
                              disabled={Boolean(manualScheduledCampaignId)}
                              className="inline-flex items-center gap-2 rounded-md border border-emerald-500/50 px-3 py-2 text-sm text-emerald-200 hover:bg-emerald-500/10 disabled:opacity-60"
                            >
                              Kézi ütemezett küldés indítása
                            </button>
                          )}
                        </>
                      ) : null}
                      <button type="button" onClick={() => openSendModal(campaign)} disabled={sendingCampaignId === campaign.id || queueIsActive} className="inline-flex items-center gap-2 rounded-md bg-rose-500 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-400 disabled:opacity-60"><Send className="h-4 w-4" /> Queue indítása</button>
                      <button
                        type="button"
                        onClick={() => void deleteB2BEntity({
                          endpoint: `/api/admin/b2b-email/campaigns/${campaign.id}`,
                          confirmText: `Biztosan archiválod ezt a kampányt? A kampány eltűnik az aktív listából, de a küldési napló megmarad.${['queued', 'sending'].includes(campaign.status) ? ' A még el nem küldött címzettek skipped státuszba kerülnek.' : ''}`,
                          fallbackSuccess: 'A kampány archiválva lett.',
                          fallbackError: 'A kampány archiválása nem sikerült.'
                        })}
                        className="inline-flex items-center gap-2 rounded-md border border-rose-500/40 px-3 py-2 text-sm text-rose-200 hover:bg-rose-500/10"
                      >
                        Archiválás / törlés
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ) : null}

      {preview ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-lg border border-slate-700 bg-slate-900 p-5">
            <h3 className="text-lg font-semibold text-white">Kampány előnézet</h3>
            <p className="mt-2 text-sm text-slate-300">{preview.subject}</p>
            <iframe title="B2B email preview" srcDoc={preview.html} className="mt-4 h-96 w-full rounded-md border border-slate-700 bg-white" />
            <pre className="mt-4 whitespace-pre-wrap rounded-md border border-slate-800 bg-slate-950 p-3 text-xs text-slate-300">{preview.text}</pre>
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={() => setPreview(null)} className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400">Bezárás</button>
            </div>
          </div>
        </div>
      ) : null}

      {sendCampaign ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-xl rounded-lg border border-rose-500/40 bg-slate-900 p-5">
            <h3 className="text-lg font-semibold text-white">Küldési sor indítása</h3>
            {(() => {
              const recipientCount = sendCampaign.target_count;
              const delay = queueSettings.perEmailDelaySeconds;
              const first = new Date();
              const last = new Date(first.getTime() + Math.max(0, recipientCount - 1) * delay * 1000);
              const totalSeconds = Math.max(0, recipientCount - 1) * delay;
              return (
                <div className="mt-4 grid gap-3 rounded-md border border-slate-800 bg-slate-950 p-3 text-sm text-slate-200">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label>
                      <span className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Emailenkénti késleltetés (mp)</span>
                      <input
                        type="number"
                        min={0}
                        max={3600}
                        value={queueSettings.perEmailDelaySeconds}
                        onChange={(event) => setQueueSettings((previous) => ({ ...previous, perEmailDelaySeconds: Number(event.target.value) }))}
                        className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                      />
                    </label>
                    <label>
                      <span className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Max email / feldolgozás</span>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={queueSettings.maxEmailsPerProcess}
                        onChange={(event) => setQueueSettings((previous) => ({ ...previous, maxEmailsPerProcess: Number(event.target.value) }))}
                        className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                      />
                    </label>
                  </div>
                  <div className="grid gap-2 text-xs text-slate-300 sm:grid-cols-2">
                    <span>Címzettek száma: {recipientCount}</span>
                    <span>Becsült teljes idő: {formatDuration(totalSeconds)}</span>
                    <span>Első küldés várható ideje: {formatDateTime(first.toISOString())}</span>
                    <span>Utolsó küldés várható ideje: {formatDateTime(last.toISOString())}</span>
                  </div>
                </div>
              );
            })()}
            <p className="mt-3 text-sm leading-6 text-slate-200">
              Biztosan elindítod a kampány küldési sorát? A rendszer nem egyszerre küldi ki a leveleket, hanem címzettenként késleltetve, külön emailként. A küldés naplózásra kerül, és a visszapattanásokat / sikertelen kézbesítéseket külön státuszként menti.
            </p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => setSendCampaign(null)} className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-100 hover:bg-slate-800">Mégse</button>
              <button type="button" onClick={() => void sendConfirmedCampaign()} disabled={sendingCampaignId === sendCampaign.id} className="rounded-md bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-400 disabled:opacity-60">
                {sendingCampaignId === sendCampaign.id ? 'Sor indítása...' : 'Igen, elindítom'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {contactHistory || contactHistoryLoading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-auto rounded-lg border border-slate-700 bg-slate-900 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Címzett részletei</h3>
                {contactHistoryLoading ? <p className="mt-2 text-sm text-slate-400">Előzmények betöltése...</p> : null}
              </div>
              <button type="button" onClick={() => setContactHistory(null)} className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-100 hover:bg-slate-800">
                Bezárás
              </button>
            </div>

            {contactHistory ? (
              <>
                <section className="mt-4 rounded-md border border-slate-800 bg-slate-950 p-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h4 className="font-semibold text-white">Alapadatok</h4>
                    <div className="flex flex-wrap gap-2">
                      {contactEditMode ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setContactEditForm(buildContactEditForm(contactHistory.contact));
                              setContactEditMode(false);
                            }}
                            className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-100 hover:bg-slate-800"
                          >
                            Mégse
                          </button>
                          <button
                            type="button"
                            onClick={() => void saveContactDetails()}
                            disabled={savingContactDetails}
                            className="rounded-md bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-60"
                          >
                            {savingContactDetails ? 'Mentés...' : 'Mentés'}
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setContactEditMode(true)}
                          className="rounded-md border border-cyan-500/40 px-3 py-2 text-sm text-cyan-200 hover:bg-cyan-500/10"
                        >
                          Szerkesztés
                        </button>
                      )}
                    </div>
                  </div>

                  {contactEditMode && contactEditForm ? (
                    <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
                      <label>
                        <span className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Cégnév</span>
                        <input value={contactEditForm.company_name} onChange={(event) => setContactEditForm((previous) => previous ? { ...previous, company_name: event.target.value } : previous)} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white" />
                      </label>
                      <label>
                        <span className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Kapcsolattartó neve</span>
                        <input value={contactEditForm.contact_name} onChange={(event) => setContactEditForm((previous) => previous ? { ...previous, contact_name: event.target.value } : previous)} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white" />
                      </label>
                      <label>
                        <span className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Email</span>
                        <input type="email" value={contactEditForm.email} onChange={(event) => setContactEditForm((previous) => previous ? { ...previous, email: event.target.value } : previous)} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white" />
                      </label>
                      <label>
                        <span className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Telefon</span>
                        <input value={contactEditForm.phone} onChange={(event) => setContactEditForm((previous) => previous ? { ...previous, phone: event.target.value } : previous)} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white" />
                      </label>
                      <label>
                        <span className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Weboldal</span>
                        <input value={contactEditForm.website} onChange={(event) => setContactEditForm((previous) => previous ? { ...previous, website: event.target.value } : previous)} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white" />
                      </label>
                      <label>
                        <span className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Forrás</span>
                        <input value={contactEditForm.source} onChange={(event) => setContactEditForm((previous) => previous ? { ...previous, source: event.target.value } : previous)} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white" />
                      </label>
                      <label>
                        <span className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Jogalap</span>
                        <input value={contactEditForm.legal_basis} onChange={(event) => setContactEditForm((previous) => previous ? { ...previous, legal_basis: event.target.value } : previous)} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white" />
                      </label>
                      <label className="flex items-center gap-2 self-end rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-slate-200">
                        <input
                          type="checkbox"
                          checked={contactEditForm.is_active}
                          disabled={Boolean((contactHistory.contact.unsubscribed_at || contactHistory.contact.complained_at || contactHistory.contact.suppressed_at) && !contactHistory.contact.is_active)}
                          onChange={(event) => setContactEditForm((previous) => previous ? { ...previous, is_active: event.target.checked } : previous)}
                        />
                        Aktív címzett
                      </label>
                      <label className="md:col-span-2">
                        <span className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Megjegyzés</span>
                        <textarea value={contactEditForm.note} onChange={(event) => setContactEditForm((previous) => previous ? { ...previous, note: event.target.value } : previous)} className="min-h-20 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white" />
                      </label>
                      {contactHistory.contact.unsubscribed_at || contactHistory.contact.complained_at || contactHistory.contact.suppressed_at ? (
                        <p className="md:col-span-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
                          Ez a címzett leiratkozott, panaszt tett vagy tiltólistára került. Nem aktiválható újra egyszerű szerkesztéssel.
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <div className="mt-3 grid gap-3 text-sm text-slate-200 md:grid-cols-2">
                      <div><span className="text-slate-400">Cégnév:</span> {contactHistory.contact.company_name}</div>
                      <div><span className="text-slate-400">Kapcsolattartó:</span> {contactHistory.contact.contact_name || '-'}</div>
                      <div><span className="text-slate-400">Email:</span> {contactHistory.contact.email}</div>
                      <div><span className="text-slate-400">Telefon:</span> {contactHistory.contact.phone || '-'}</div>
                      <div><span className="text-slate-400">Weboldal:</span> {contactHistory.contact.website || '-'}</div>
                      <div><span className="text-slate-400">Forrás:</span> {contactHistory.contact.source || '-'}</div>
                      <div><span className="text-slate-400">Jogalap:</span> {contactHistory.contact.legal_basis || '-'}</div>
                      <div><span className="text-slate-400">Aktív státusz:</span> {contactHistory.contact.is_active ? 'Aktív' : 'Inaktív'}</div>
                      <div className="md:col-span-2"><span className="text-slate-400">Megjegyzés:</span> {contactHistory.contact.note || '-'}</div>
                    </div>
                  )}
                </section>

                <section className="mt-4 rounded-md border border-slate-800 bg-slate-950 p-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h4 className="font-semibold text-white">Célcsoport-tagság</h4>
                    <button
                      type="button"
                      onClick={() => void saveContactGroups()}
                      disabled={savingContactGroups}
                      className="rounded-md border border-cyan-500/40 px-3 py-2 text-sm text-cyan-200 hover:bg-cyan-500/10 disabled:opacity-60"
                    >
                      {savingContactGroups ? 'Mentés...' : 'Célcsoportok mentése'}
                    </button>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {contactHistory.activeGroups.map((group) => (
                      <label key={group.id} className="flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200">
                        <input
                          type="checkbox"
                          checked={selectedContactGroupIds.includes(group.id)}
                          onChange={() => setSelectedContactGroupIds((previous) => toggleSelection(previous, group.id))}
                        />
                        {group.name}
                      </label>
                    ))}
                    {contactHistory.activeGroups.length === 0 ? <p className="text-sm text-slate-400">Nincs aktív célcsoport.</p> : null}
                  </div>
                </section>

                <section className="mt-4 rounded-md border border-slate-800 bg-slate-950 p-3">
                  <h4 className="font-semibold text-white">Email állapot</h4>
                  <div className="mt-3 grid gap-3 text-sm text-slate-200 md:grid-cols-2">
                    <div className="flex items-center gap-2"><span className="text-slate-400">Utolsó email státusz:</span> <StatusBadge status={getB2BEmailEventLabel(contactHistory.contact.last_email_status)} /></div>
                    <div><span className="text-slate-400">Utolsó email esemény:</span> {formatDateTime(contactHistory.contact.last_email_event_at)}</div>
                    <div><span className="text-slate-400">Leiratkozott:</span> {contactHistory.contact.unsubscribed_at ? formatDateTime(contactHistory.contact.unsubscribed_at) : 'nem'}</div>
                    <div><span className="text-slate-400">Visszapattant:</span> {contactHistory.contact.bounced_at ? formatDateTime(contactHistory.contact.bounced_at) : 'nem'}</div>
                    <div><span className="text-slate-400">Panaszos:</span> {contactHistory.contact.complained_at ? formatDateTime(contactHistory.contact.complained_at) : 'nem'}</div>
                    <div><span className="text-slate-400">Tiltólistás:</span> {contactHistory.contact.suppressed_at ? formatDateTime(contactHistory.contact.suppressed_at) : 'nem'}</div>
                  </div>
                </section>

                <div className="mt-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h4 className="font-semibold text-white">Kiküldött emailek</h4>
                      <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-400">
                        A megnyitás mérése csak akkor látható, ha a Resend tracking és a webhook esemény engedélyezve van. Egyes levelezők adatvédelmi okokból pontatlanul mérhetik.
                      </p>
                    </div>
                    {contactHistory.contact.unsubscribed_at || contactHistory.contact.complained_at || contactHistory.contact.suppressed_at ? (
                      <p className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                        Erre a címzettre nem küldhető új email, mert leiratkozott, panaszt tett vagy tiltólistára került.
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-3 space-y-3">
                    {contactHistory.history.length === 0 ? (
                      <p className="rounded-md border border-slate-800 bg-slate-950 p-3 text-sm text-slate-400">Még nincs kiküldött email ehhez a címzetthez.</p>
                    ) : null}
                    {contactHistory.history.map((item) => {
                      const displayStatus = item.clicked_at
                        ? getB2BEmailEventLabel('email.clicked')
                        : item.opened_at
                          ? getB2BEmailEventLabel('email.opened')
                          : getB2BRecipientStatusLabel(item.status);
                      const resendBlocked = Boolean(
                        contactHistory.contact.unsubscribed_at || contactHistory.contact.complained_at || contactHistory.contact.suppressed_at
                      );
                      return (
                        <article key={`${item.source}-${item.id}`} className="rounded-md border border-slate-800 bg-slate-950 p-3">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0 space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <StatusBadge status={displayStatus} />
                                <span className="text-xs text-slate-400">{item.source === 'send_attempt' ? 'Manuális újraküldés' : 'Kampányküldés'}</span>
                              </div>
                              <div>
                                <p className="font-medium text-white">{item.campaign_name || 'Ismeretlen kampány'}</p>
                                <p className="text-sm text-slate-300">{item.subject || '-'}</p>
                                <p className="text-xs text-slate-500">{item.email}</p>
                              </div>
                              <div className="grid gap-1 text-xs text-slate-300 sm:grid-cols-2 lg:grid-cols-3">
                                <span>Elküldve: {formatDateTime(item.sent_at)}</span>
                                <span>Kézbesítve: {formatDateTime(item.delivered_at)}</span>
                                <span>Megnyitotta: {item.opened_at ? formatDateTime(item.opened_at) : 'nincs adat'}</span>
                                <span>Kattintott: {item.clicked_at ? formatDateTime(item.clicked_at) : 'nincs adat'}</span>
                                <span>Utolsó esemény: {getB2BEmailEventLabel(item.last_event_type).label}</span>
                                <span>Resend ID: {item.resend_email_id || '-'}</span>
                              </div>
                              {item.resend_error ? <p className="rounded-md border border-rose-500/30 bg-rose-500/10 p-2 text-xs text-rose-200">{item.resend_error}</p> : null}
                              {item.status === 'bounced' ? (
                                <p className="text-xs text-amber-200">Ez az email korábban visszapattant. Csak ellenőrzött címre küldd újra.</p>
                              ) : null}
                            </div>
                            <button
                              type="button"
                              onClick={() => void resendHistoryItem(item)}
                              disabled={resendBlocked || resendingHistoryId === item.id}
                              className="inline-flex items-center justify-center gap-2 rounded-md border border-cyan-500/50 px-3 py-2 text-sm text-cyan-200 hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Send className="h-4 w-4" />
                              {resendingHistoryId === item.id ? 'Újraküldés...' : 'Újraküldés'}
                            </button>
                          </div>

                          {item.events.length > 0 ? (
                            <div className="mt-3 border-t border-slate-800 pt-3">
                              <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Resend események</p>
                              <div className="flex flex-wrap gap-2">
                                {item.events.slice(0, 8).map((event) => (
                                  <span key={event.id} className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300">
                                    {getB2BEmailEventLabel(event.event_type).label} · {formatDateTime(event.created_at)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </article>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
