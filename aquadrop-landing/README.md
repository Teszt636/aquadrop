# Aquadrop Landing

Aquadrop Landing is a Next.js landing page and lead capture app for the Aquadrop brand. It currently focuses on:

- collecting newsletter signups,
- collecting reseller applications,
- collecting gift campaign claims with receipt upload,
- storing everything in Supabase.

> Note: OCR-based receipt validation and the Aquadrop Care system are **planned for later phases** and are not part of the current implementation.

## 1) Project purpose

The project is designed as a practical campaign site where users can:

- submit contact details for product/news updates,
- apply as reseller partners,
- claim a gift campaign after purchasing products and uploading a receipt image.

All submissions are sent directly from the frontend to Supabase (Postgres + Storage).

## 2) Tech stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **UI:** React 18 + Tailwind CSS 3
- **Backend services:** Supabase (Postgres REST API + Storage)
- **Package manager/scripts:** npm

## 3) Required environment variables

Create an `.env.local` file in `aquadrop-landing/` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
RESEND_API_KEY=<your-resend-api-key>
ADMIN_EMAIL=admin@aquadrop.hu
ADMIN_NOTIFICATION_EMAIL=admin@aquadrop.hu
SITE_URL=https://www.aquadrop.hu
ADMIN_PASSWORD=<strong-admin-password>
```

`NEXT_PUBLIC_*` variables are public client variables.  
`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, and `ADMIN_PASSWORD` are **server-only** secrets; never expose them in client code.

## 4) How to run locally

From the `aquadrop-landing` folder:

```bash
npm install
npm run dev
```

Then open: [http://localhost:3000](http://localhost:3000)

Optional checks:

```bash
npm run lint
npm run build
npm run start
```

## 5) How to connect Supabase

1. Create a Supabase project.
2. In Supabase, go to **Project Settings → API**.
3. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Add these values to `.env.local`.
5. Restart `npm run dev`.

The app uses the REST endpoints (`/rest/v1`) for table inserts and Storage (`/storage/v1`) for receipt file uploads.

### Supabase Data API grants

When creating a new table in the `public` schema, add explicit grants for the roles that need Data API access. If a Next.js API route uses the table through `/rest/v1` with `SUPABASE_SERVICE_ROLE_KEY`, grant the required table privileges to `service_role`. Only grant `anon` or `authenticated` access when client-side Supabase access is intentionally required. RLS is still a separate required security layer and must be designed for each table.

## 6) How to create the database tables

1. Open your Supabase dashboard.
2. Go to **SQL Editor**.
3. Open `supabase/schema.sql` from this repo.
4. Paste and run the SQL.

This creates:

- `announcement_signups`
- `gift_claims`
- `reseller_applications`
- `media_kit_downloads`

If your `gift_claims` table was created earlier and does not yet include the admin note field, run:

```sql
alter table public.gift_claims
add column if not exists admin_note text;
```

If your `announcement_signups` table was created earlier and does not yet include article signup source tracking,
run this in the Supabase SQL Editor:

```sql
alter table public.announcement_signups
add column if not exists source text;
```

The optional `source` field shows which page or component generated the signup, for example:
`article:mosokapszula-20-fokon`.

### Storage bucket (required for receipt upload)

Create a bucket named:

- `gift-receipts`

The app uploads files under paths like:

- `gift-claims/<year>/<month>/<uuid>-<sanitized-file-name>`

For the current client-side upload flow, make sure bucket and policies allow upload + read for the use case you want to support.

## 7) How receipt upload works

Receipt upload is handled in the gift form flow:

1. User selects a file (`accept="image/*"`).
2. Client validates it is an image.
3. App uploads the file to Supabase Storage bucket `gift-receipts`.
4. App receives/builds a public file URL.
5. App inserts a row into `gift_claims` with that `receipt_file_url`.

If upload or insert fails, the user sees a validation/error message and submission stops.

## 8) Admin dashboard (/admin)

A simple password-protected admin interface is available at `/admin`.

Authentication flow:

- If there is no valid admin session cookie, `/admin` shows a login screen.
- Login is validated on `POST /api/admin/login` using `ADMIN_PASSWORD` server-side only.
- On success, server sets `aquadrop_admin_session` cookie (`httpOnly`, `sameSite=lax`, `secure` in production, `maxAge=8h`).
- Logout is handled with `POST /api/admin/logout` and clears the admin cookie.

Admin data operations:

- `GET /api/admin/table?name=<table>` lists allowed table rows.
- `PATCH /api/admin/table` updates editable fields by `id`.
- `DELETE /api/admin/table` removes a row by `id` after confirmation in UI.
- All admin API routes require a valid admin session and enforce a strict table whitelist:
  - `announcement_signups`
  - `gift_claims`
  - `reseller_applications`
  - `media_kit_downloads`

The admin UI includes tabs, search, detail view, edit mode, delete confirmation, refresh, and date-desc sorting behavior.

## 9) B2B email campaign admin

The admin dashboard includes a **B2B email kampányok** tab for managing B2B contacts, target groups, email templates, and campaigns. Campaign creation stores a template snapshot and the selected recipients in Supabase; it does not send email by itself.

Campaign queue startup is handled by `POST /api/admin/b2b-email/campaigns/[id]/send` and requires:

- a valid admin session with role `admin`,
- request body `confirmSend: true`,
- at most 100 active, non-unsubscribed, non-bounced, non-complained, non-suppressed recipients.

This endpoint does **not** send all emails immediately. It calculates `scheduled_at` for every eligible `b2b_email_campaign_recipients` row, sets the recipient status to `queued`, stores `queued_at`, and updates the campaign to queued sending mode. `per_email_delay_seconds` controls the spacing between recipients, and `max_emails_per_process` controls how many due recipients one processing call may send.

The `queued` status means the recipient is waiting in the database-backed sending queue. A queued recipient is only eligible for sending when `scheduled_at <= now()`.

Queue processing is handled by `POST /api/admin/b2b-email/campaigns/[id]/process-queue`:

- requires admin session,
- selects only due `queued` recipients for that campaign,
- skips contacts that became unsubscribed, bounced, complained, or suppressed,
- processes at most `campaign.max_emails_per_process` rows,
- temporarily marks rows as `processing`,
- sends each due recipient as a separate Resend batch email object,
- stores the Resend email id and recipient status,
- updates campaign aggregate counters and finishes the campaign as `sent` or `partial_failed` when no queued/processing rows remain.

The queue can be processed manually from the admin campaign card with the **Sor feldolgozása** button. The same endpoint can also be called later from Vercel Cron, for example every minute, to drain due campaign recipients without requiring a browser session workflow. This repository change does not add automatic Cron processing; campaign queue startup and queue processing remain manual admin actions unless a separate Cron configuration is added later.

The module intentionally does not use `setTimeout`, long `await sleep`, or any long-running wait inside a Vercel Function. Serverless functions should finish quickly; the delay lives in the database as `scheduled_at`, and repeated short process calls pick up the rows whose scheduled time has arrived.

The app stores the original Resend email id on `b2b_email_campaign_recipients` and updates campaign counters from webhook events. Manual individual resends are stored separately in `b2b_email_send_attempts`, so a resend does not overwrite the original `resend_email_id` or the original delivery history.

The contact detail view in the admin shows a merged email history from:

- original `b2b_email_campaign_recipients` rows,
- manual resend rows in `b2b_email_send_attempts`,
- related `b2b_email_events` webhook records.

Use `GET /api/admin/b2b-email/contacts/[id]/history` to fetch that merged history. Use `POST /api/admin/b2b-email/contacts/[id]/resend` with `confirmSend: true` and either `campaignRecipientId` or `sendAttemptId` for one-off direct resend. Resends are logged as `attempt_type = manual_resend` and are sent immediately to that single contact without creating a new campaign or starting the queue.

Required server-side environment variables:

```bash
RESEND_API_KEY=<your-resend-api-key>
RESEND_FROM_EMAIL="Aquadrop Expert Pro <hello@aquadrop.hu>"
RESEND_WEBHOOK_SECRET=<your-resend-webhook-secret>
SITE_URL=https://www.aquadrop.hu
```

Configure this webhook URL in the Resend dashboard:

```text
https://www.aquadrop.hu/api/webhooks/resend-events
```

Select these Resend events for the webhook:

- `email.sent`
- `email.delivered`
- `email.bounced`
- `email.failed`
- `email.delivery_delayed`
- `email.complained`
- `email.suppressed`
- optionally `email.opened` and `email.clicked` for open/click history

`email.opened` and `email.clicked` only appear when Resend tracking and the matching webhook events are enabled. Open tracking is not 100% accurate because some mail clients and privacy protections can proxy, block, or prefetch tracking pixels. The UI therefore treats open/click timestamps as helpful signals, not guaranteed proof.

Unsubscribe links use a signed URL in this form:

```text
/leiratkozas?contact=<contact-id>&sig=<hmac>
```

The unsubscribe flow sets `b2b_email_contacts.unsubscribed_at` and `is_active = false`, so later sends skip the contact.

## 10) Planned later phases

Planned but not yet implemented:

- OCR pipeline for automated receipt parsing/validation,
- Aquadrop Care system integration and related operational flows.

## 11) Development checklist for every change

For every code modification, follow this order before finishing work:

1. run the linter (`npm run lint`),
2. fix any TypeScript error found during checks/build,
3. verify that existing forms still work end-to-end:
   - newsletter signup form,
   - reseller application form,
   - gift claim form (including receipt upload path),
4. review responsive behavior in mobile viewport as well.

At the end of the task, summarize precisely:

- which files were changed,
- which new components were created,
- which new anchor targets or routes were added.
