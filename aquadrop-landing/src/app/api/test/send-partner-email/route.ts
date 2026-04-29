import { NextResponse } from 'next/server';
import { resolveAquadropSenderEmail } from '@/lib/email/config';
import { sendEmailWithResend } from '@/lib/email/resend';
import { buildPartnerDailyTasksEmail, buildPartnerOneHourReminderEmail } from '@/lib/email/templates';
import { requireAdminSession } from '@/lib/admin/auth';

const DUPLICATE_WINDOW_MS = 5 * 60 * 1000;
const recentRequests = new Map<string, number>();

function jsonError(status: number, error: string, details?: unknown) {
  return NextResponse.json({ success: false, error, details: details ?? null }, { status });
}

function cleanupRecentRequests(now: number) {
  for (const [key, ts] of recentRequests.entries()) {
    if (now - ts > DUPLICATE_WINDOW_MS) {
      recentRequests.delete(key);
    }
  }
}

export async function POST(request: Request){
 const body=await request.json().catch(()=>null) as {userEmail?:string;type?:'daily'|'reminder';secret?:string;send?:boolean} | null;
 if(!body?.userEmail || !body?.type) return jsonError(400,'Missing userEmail or type',{required:['userEmail','type']});

 const adminSession = await requireAdminSession(['admin']);
 const expectedSecret = process.env.TEST_EMAIL_SECRET?.trim();
 const providedSecret = body.secret?.trim() || request.headers.get('x-test-email-secret')?.trim() || undefined;
 const isSecretAuthorized = Boolean(expectedSecret && providedSecret && providedSecret === expectedSecret);
 if (!adminSession && !isSecretAuthorized) {
  return jsonError(401,'Unauthorized',{message:'Admin session vagy érvényes TEST_EMAIL_SECRET szükséges.'});
 }

 const now = Date.now();
 cleanupRecentRequests(now);
 const dedupeKey = `${body.userEmail.trim().toLowerCase()}::${body.type}`;
 const lastSentAt = recentRequests.get(dedupeKey);
 if (lastSentAt && now - lastSentAt < DUPLICATE_WINDOW_MS) {
  return jsonError(429,'Duplicate request throttled',{retryAfterMs:DUPLICATE_WINDOW_MS - (now - lastSentAt)});
 }

 const email=body.type==='daily' ? buildPartnerDailyTasksEmail({overdueLeads:[{companyName:'Teszt Kft',contactName:'Teszt Elek',nextActionAt:new Date().toISOString(),nextActionDescription:'Hívás',leadScore:90,pipelineStatus:'Új lead'}],todayLeads:[],hotLeads:[]}) : buildPartnerOneHourReminderEmail({companyName:'Teszt Kft',contactName:'Teszt Elek',nextActionAt:new Date(Date.now()+3600000).toISOString(),nextActionDescription:'Emlékeztető',leadScore:80,pipelineStatus:'Kapcsolatfelvétel'});

 const shouldSend = body.send === true;
 if (!shouldSend) {
  return NextResponse.json({success:true,dryRun:true,message:'Safe mode: explicit send=true nélkül nem küld emailt.',to:body.userEmail,type:body.type});
 }

 try {
  const resend=await sendEmailWithResend({from:resolveAquadropSenderEmail({allowFallback:true}),to:body.userEmail,subject:email.subject,html:email.html,replyTo: ['hello@aquadrop.hu']});
  recentRequests.set(dedupeKey, now);
  return NextResponse.json({success:true,dryRun:false,resendAttempted:true,resendId:resend?.id ?? null,resendError:null,to:body.userEmail,type:body.type});
 } catch (error) {
  return jsonError(500,'Failed to send partner test email',error instanceof Error ? error.message : error);
 }
}
