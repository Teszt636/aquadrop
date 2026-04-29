import { NextResponse } from 'next/server';
import { resolveAquadropSenderEmail } from '@/lib/email/config';
import { sendEmailWithResend } from '@/lib/email/resend';
import { buildPartnerDailyTasksEmail, buildPartnerOneHourReminderEmail } from '@/lib/email/templates';
export async function POST(request: Request){
 const body=await request.json().catch(()=>null) as {userEmail?:string;type?:'daily'|'reminder'} | null;
 if(!body?.userEmail || !body?.type) return NextResponse.json({success:false,error:'Missing userEmail or type'},{status:400});
 const email=body.type==='daily' ? buildPartnerDailyTasksEmail({overdueLeads:[{companyName:'Teszt Kft',contactName:'Teszt Elek',nextActionAt:new Date().toISOString(),nextActionDescription:'Hívás',leadScore:90,pipelineStatus:'Új lead'}],todayLeads:[],hotLeads:[]}) : buildPartnerOneHourReminderEmail({companyName:'Teszt Kft',contactName:'Teszt Elek',nextActionAt:new Date(Date.now()+3600000).toISOString(),nextActionDescription:'Emlékeztető',leadScore:80,pipelineStatus:'Kapcsolatfelvétel'});
 const resend=await sendEmailWithResend({from:resolveAquadropSenderEmail({allowFallback:true}),to:body.userEmail,subject:email.subject,html:email.html,replyTo: ['hello@aquadrop.hu']});
 return NextResponse.json({success:true,resendAttempted:true,resendId:resend?.id ?? null,resendError:null});
}
