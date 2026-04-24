# media-kit-download-notifier

Supabase Edge Function, amely `media_kit_downloads` insert után küld 2 emailt:

1. letöltőnek
2. adminnak (`admin@aquadrop.hu`)

## Trigger (Database Webhook)

A Supabase Dashboardban hozz létre webhookot:

- **Table:** `public.media_kit_downloads`
- **Events:** `INSERT`
- **Type:** `Supabase Edge Functions`
- **Function:** `media-kit-download-notifier`

## Reseller check query

A function ezt futtatja REST-en keresztül (SQL megfelelője):

```sql
select * from reseller_applications
where email = input.email
limit 1;
```

## Kötelező env változók

- `RESEND_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Opcionális env változók

- `MEDIA_KIT_FROM_EMAIL` (default: `Aquadrop <noreply@aquadrop.hu>`)
- `MEDIA_KIT_ADMIN_EMAIL` (default: `admin@aquadrop.hu`)
- `MEDIA_KIT_REPLY_TO_EMAIL` (default: `hello@aquadrop.hu`)
- `MEDIA_KIT_RESELLER_APPLICATION_URL` (default: `https://www.aquadrop.hu/partner#reseller-application-form`)
- `MEDIA_KIT_DOWNLOAD_BASE_URL` (default: `https://www.aquadrop.hu`)

## Miért nem blokkolja a letöltést?

A letöltés kliens oldalon az insert után elindul, az email pedig a DB webhook + Edge Function ágon fut.
Ha email küldés hiba történik, a function logol és `200` válasszal tér vissza, így nem töri meg az alap flow-t.
