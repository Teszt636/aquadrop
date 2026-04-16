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
```

Both variables are required at runtime.

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

## 6) How to create the database tables

1. Open your Supabase dashboard.
2. Go to **SQL Editor**.
3. Open `supabase/schema.sql` from this repo.
4. Paste and run the SQL.

This creates:

- `announcement_signups`
- `gift_claims`
- `reseller_applications`

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

## 8) How the simple admin page works

There is no custom in-app admin UI yet.

Current "simple admin" workflow is through Supabase dashboard:

- Use **Table Editor → gift_claims** to review new claims.
- Open `receipt_file_url` to inspect uploaded receipt images.
- Update `status` (default: `uj`) and `admin_note` manually to track review decisions.
- Use `announcement_signups` and `reseller_applications` for marketing and partner follow-up.

## 9) Planned later phases

Planned but not yet implemented:

- OCR pipeline for automated receipt parsing/validation,
- Aquadrop Care system integration and related operational flows.

## 10) Development checklist for every change

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
