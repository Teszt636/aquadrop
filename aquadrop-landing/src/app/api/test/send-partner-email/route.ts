import { NextResponse } from 'next/server';
import { resolveAquadropSenderEmail } from '@/lib/email/config';
import { sendEmailWithResend } from '@/lib/email/resend';
import { buildPartnerDailyTasksEmail, buildPartnerOneHourReminderEmail } from '@/lib/email/templates';
import { requireAdminSession } from '@/lib/admin/auth';
import { checkEmailRateLimit, markEmailSent } from '@/lib/cron/email-safety';

function jsonError(status: number, error: string, details?: unknown) {
  return NextResponse.json({ success: false, error, details: details ?? null, wouldSendTo: [], sentEmails: 0, skippedReasons: { error: 1 }, resendAttempted: false }, { status });
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
 const rateLimit = checkEmailRateLimit(body.userEmail, `partner_test_${body.type}`, now);
 if (rateLimit.blocked) {
  return jsonError(429,'Duplicate request throttled',{retryAfterMs:rateLimit.retryAfterMs});
 }

 const email=body.type==='daily' ? buildPartnerDailyTasksEmail({overdueLeads:[{companyName:'Teszt Kft',contactName:'Teszt Elek',nextActionAt:new Date().toISOString(),nextActionDescription:'Hívás',leadScore:90,pipelineStatus:'Új lead'}],todayLeads:[],hotLeads:[]}) : buildPartnerOneHourReminderEmail({companyName:'Teszt Kft',contactName:'Teszt Elek',nextActionAt:new Date(Date.now()+3600000).toISOString(),nextActionDescription:'Emlékeztető',leadScore:80,pipelineStatus:'Kapcsolatfelvétel'});

 const shouldSend = body.send === true;
 if (!shouldSend) {
  return NextResponse.json({success:true,dryRun:true,message:'Safe mode: explicit send=true nélkül nem küld emailt.',wouldSendTo:[body.userEmail],sentEmails:0,skippedReasons:{safe_mode:1},resendAttempted:false,to:body.userEmail,type:body.type});
 }

 try {
  const resend=await sendEmailWithResend({from:resolveAquadropSenderEmail({allowFallback:true}),to:body.userEmail,subject:email.subject,html:email.html,replyTo: ['hello@aquadrop.hu']});
  markEmailSent(body.userEmail, `partner_test_${body.type}`, now);
  return NextResponse.json({success:true,dryRun:false,wouldSendTo:[body.userEmail],sentEmails:1,skippedReasons:{},resendAttempted:true,resendId:resend?.id ?? null,resendError:null,to:body.userEmail,type:body.type});
 } catch (error) {
  return jsonError(500,'Failed to send partner test email',error instanceof Error ? error.message : error);
 }
}
