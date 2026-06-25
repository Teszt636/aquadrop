'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, Mail, Plus, RefreshCw, Send, Users } from 'lucide-react';

type Contact = {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string;
  is_active: boolean;
  unsubscribed_at: string | null;
  bounced_at: string | null;
  complained_at: string | null;
  suppressed_at: string | null;
  last_email_status: string | null;
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

function statusTone(value: string): string {
  if (['sent', 'delivered'].includes(value)) return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200';
  if (['failed', 'bounced', 'complained', 'suppressed'].includes(value)) return 'border-rose-500/40 bg-rose-500/10 text-rose-200';
  if (value === 'sending') return 'border-amber-500/40 bg-amber-500/10 text-amber-200';
  return 'border-slate-700 bg-slate-900 text-slate-300';
}

function toggleSelection(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
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
      const body = await fetchJson<{ sentCount: number; skippedCount: number }>(`/api/admin/b2b-email/campaigns/${sendCampaign.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmSend: true })
      });
      setMessage(`Küldés kész. Elküldve: ${body.sentCount}, kihagyva: ${body.skippedCount}.`);
      setSendCampaign(null);
      await loadAll();
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'Küldési hiba.');
    } finally {
      setSendingCampaignId(null);
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
                <tr><th className="px-3 py-2">Cég</th><th className="px-3 py-2">Email</th><th className="px-3 py-2">Státusz</th><th className="px-3 py-2">Utolsó email</th></tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id} className="border-t border-slate-800">
                    <td className="px-3 py-2"><span className="font-medium text-white">{contact.company_name}</span><br /><span className="text-xs text-slate-400">{contact.contact_name || '-'}</span></td>
                    <td className="px-3 py-2">{contact.email}</td>
                    <td className="px-3 py-2">{activeContacts.some((item) => item.id === contact.id) ? 'Aktív' : 'Kizárt / leiratkozott'}</td>
                    <td className="px-3 py-2">{contact.last_email_status || '-'}</td>
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
                <p className="mt-3 text-xs text-cyan-200">{group.member_count ?? 0} címzett</p>
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
            {campaigns.map((campaign) => (
              <article key={campaign.id} className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h4 className="font-semibold text-white">{campaign.name}</h4>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className={`rounded-full border px-2 py-1 ${statusTone(campaign.status)}`}>{campaign.status}</span>
                      <span className="rounded-full border border-slate-700 px-2 py-1 text-slate-300">Célzott: {campaign.target_count}</span>
                      <span className="rounded-full border border-slate-700 px-2 py-1 text-slate-300">Sent: {campaign.sent_count}</span>
                      <span className="rounded-full border border-slate-700 px-2 py-1 text-slate-300">Delivered: {campaign.delivered_count}</span>
                      <span className="rounded-full border border-slate-700 px-2 py-1 text-slate-300">Failed: {campaign.failed_count}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => void openPreview(campaign.id)} className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-100 hover:bg-slate-800"><Eye className="h-4 w-4" /> Előnézet</button>
                    <button type="button" onClick={() => setSendCampaign(campaign)} disabled={sendingCampaignId === campaign.id} className="inline-flex items-center gap-2 rounded-md bg-rose-500 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-400 disabled:opacity-60"><Send className="h-4 w-4" /> Küldés</button>
                  </div>
                </div>
              </article>
            ))}
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
            <h3 className="text-lg font-semibold text-white">Végleges kampányküldés</h3>
            <p className="mt-3 text-sm leading-6 text-slate-200">
              Biztosan kiküldöd ezt a kampányt? A rendszer legfeljebb 100 aktív, nem leiratkozott címzettnek küldi ki külön emailként. A küldés naplózásra kerül, és nem vonható vissza.
            </p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => setSendCampaign(null)} className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-100 hover:bg-slate-800">Mégse</button>
              <button type="button" onClick={() => void sendConfirmedCampaign()} disabled={sendingCampaignId === sendCampaign.id} className="rounded-md bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-400 disabled:opacity-60">
                {sendingCampaignId === sendCampaign.id ? 'Küldés...' : 'Igen, kiküldöm'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
