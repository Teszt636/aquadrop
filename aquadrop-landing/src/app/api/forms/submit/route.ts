import { NextResponse } from 'next/server';

import { sendFormNotifications } from '@/lib/email/notifications';
import { type EmailNotificationRequest } from '@/lib/email/types';
import { type FormSubmitRequest } from '@/lib/forms/types';
import { insertIntoTableAsAdmin, selectFromTableAsAdmin } from '@/lib/supabase-admin';

function normalizeText(value: string | null | undefined): string {
  return (value ?? '').trim();
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as FormSubmitRequest;

    switch (body.formType) {
      case 'announcement_signup': {
        const name = normalizeText(body.payload.name);
        const email = normalizeText(body.payload.email);
        const phone = normalizeText(body.payload.phone ?? '');

        const existingSignupQuery = new URLSearchParams({
          select: 'id',
          email: `eq.${email}`,
          limit: '1'
        });
        const existingSignup = await selectFromTableAsAdmin<{ id: number }>(
          'announcement_signups',
          existingSignupQuery
        );

        const notification: EmailNotificationRequest = existingSignup.length
          ? {
              type: 'announcement_signup_exists',
              payload: { name, email, phone: phone || null }
            }
          : {
              type: 'announcement_signup',
              payload: { name, email, phone: phone || null }
            };

        if (!existingSignup.length) {
          await insertIntoTableAsAdmin('announcement_signups', {
            name,
            email,
            phone: phone || null,
            consent: body.payload.consent
          });
        }

        await sendFormNotifications(notification);

        return NextResponse.json({ ok: true, isDuplicate: existingSignup.length > 0 });
      }

      case 'gift_claim': {
        const fullName = normalizeText(body.payload.full_name);
        const email = normalizeText(body.payload.email);
        const phone = normalizeText(body.payload.phone);
        const shippingAddress = normalizeText(body.payload.shipping_address);
        const purchaseLocation = normalizeText(body.payload.purchase_location);

        const existingClaimQuery = new URLSearchParams({
          select: 'id',
          or: `(email.eq.${email},phone.eq.${phone})`,
          limit: '1'
        });
        const existingClaim = await selectFromTableAsAdmin<{ id: number }>('gift_claims', existingClaimQuery);

        const notification: EmailNotificationRequest = existingClaim.length
          ? {
              type: 'gift_claim_exists',
              payload: {
                fullName,
                email,
                phone,
                shippingAddress,
                purchaseLocation,
                purchaseDate: body.payload.purchase_date,
                receiptUrl: body.payload.receipt_url
              }
            }
          : {
              type: 'gift_claim',
              payload: {
                fullName,
                email,
                phone,
                shippingAddress,
                purchaseLocation,
                purchaseDate: body.payload.purchase_date,
                receiptUrl: body.payload.receipt_url
              }
            };

        if (!existingClaim.length) {
          await insertIntoTableAsAdmin('gift_claims', {
            full_name: fullName,
            email,
            phone,
            shipping_address: shippingAddress,
            purchase_location: purchaseLocation,
            purchase_date: body.payload.purchase_date,
            consent: body.payload.consent,
            purchase_declaration: body.payload.purchase_declaration,
            receipt_url: body.payload.receipt_url,
            receipt_path: body.payload.receipt_path
          });
        }

        await sendFormNotifications(notification);

        return NextResponse.json({ ok: true, isDuplicate: existingClaim.length > 0 });
      }

      case 'reseller_application': {
        const companyName = normalizeText(body.payload.company_name);
        const contactName = normalizeText(body.payload.contact_name);
        const email = normalizeText(body.payload.email);
        const phone = normalizeText(body.payload.phone);
        const website = normalizeText(body.payload.website ?? '');
        const message = normalizeText(body.payload.message ?? '');

        const existingApplicationQuery = new URLSearchParams({
          select: 'id',
          email: `eq.${email}`,
          limit: '1'
        });
        const existingApplication = await selectFromTableAsAdmin<{ id: number }>(
          'reseller_applications',
          existingApplicationQuery
        );

        const notification: EmailNotificationRequest = existingApplication.length
          ? {
              type: 'reseller_application_exists',
              payload: {
                companyName,
                contactName,
                email,
                phone,
                website: website || null,
                salesChannel: body.payload.sales_channel,
                message: message || null
              }
            }
          : {
              type: 'reseller_application',
              payload: {
                companyName,
                contactName,
                email,
                phone,
                website: website || null,
                salesChannel: body.payload.sales_channel,
                message: message || null
              }
            };

        if (!existingApplication.length) {
          await insertIntoTableAsAdmin('reseller_applications', {
            company_name: companyName,
            contact_name: contactName,
            email,
            phone,
            website: website || null,
            sales_channel: body.payload.sales_channel,
            message: message || null
          });
        }

        await sendFormNotifications(notification);

        return NextResponse.json({ ok: true, isDuplicate: existingApplication.length > 0 });
      }

      default:
        return NextResponse.json({ ok: false, error: 'Unsupported form type.' }, { status: 400 });
    }
  } catch (error) {
    console.error('[forms][submit] Server-side duplicate check or insert failed', error);

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unexpected form submit error'
      },
      { status: 500 }
    );
  }
}
