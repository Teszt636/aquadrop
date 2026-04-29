import { resolveAquadropSenderEmail } from '@/lib/email/config';
import { sendEmailWithResend } from '@/lib/email/resend';
import { getBudapestNow } from '@/lib/datetime/budapest';
import { renderBrandedEmailLayout } from '@/lib/email/templates';

const STATUSES = ['Új igénylés','Blokk ellenőrzés alatt','Hiánypótlás szükséges','Csomagolás alatt'] as const;

function headers(){ const k=process.env.SUPABASE_SERVICE_ROLE_KEY!; return {apikey:k,Authorization:`Bearer ${k}`,'Content-Type':'application/json'};}
function rest(){ return `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/,'')}/rest/v1`; }

export async function runGiftDailySummaryCron(params:{dryRun:boolean;debug?:boolean}){
 const now=getBudapestNow();
 const summary:any={success:true,nowUtc:now.nowUtc,nowBudapest:now.nowBudapest,checkedUsers:1,checkedLeads:0,eligibleLeads:0,wouldSendTo:[],sentEmails:0,skippedReasons:{},resendErrors:[],dryRun:params.dryRun};
 if (!((now.hour===8)||(now.hour===13))) { summary.skippedReasons.outside_window=1; return summary; }
 const q = new URLSearchParams({select:'id,pipeline_status',pipeline_status:`in.(${STATUSES.join(',')})`,limit:'5000'});
 const r=await fetch(`${rest()}/gift_claims?${q.toString()}`,{headers:headers(),cache:'no-store'}); if(!r.ok) throw new Error(await r.text());
 const rows=await r.json() as Array<{id:string;pipeline_status:string|null}>; summary.checkedLeads=rows.length;
 const counts=Object.fromEntries(STATUSES.map(s=>[s,0]));
 rows.forEach(x=>{ if(x.pipeline_status && x.pipeline_status in counts) counts[x.pipeline_status]++;});
 const total=Object.values(counts).reduce((a,b)=>a+Number(b),0); if(total===0){summary.skippedReasons.no_tasks=1; return {...summary,counts};}
 const subject='🔥 Mai ajándék elbírálások – Aquadrop CRM Gift';
 const html=renderBrandedEmailLayout({subject,headline:'Mai ajándék elbírálások',bodyHtml:`<p><strong>${counts['Új igénylés']}</strong> új</p><p><strong>${counts['Blokk ellenőrzés alatt']}</strong> ellenőrzés alatt</p><p><strong>${counts['Hiánypótlás szükséges']}</strong> hiánypótlás</p><p><strong>${counts['Csomagolás alatt']}</strong> csomagolás</p>`,ctaText:'Admin megnyitása',ctaUrl:'https://www.aquadrop.hu/admin?tab=gift_claims'});
 summary.wouldSendTo=['admin@aquadrop.hu']; summary.eligibleLeads=total;
 if(params.dryRun) return {...summary,counts};
 const from=resolveAquadropSenderEmail({allowFallback:true});
 const resend=await sendEmailWithResend({from,to:'admin@aquadrop.hu',subject,html,replyTo: ['hello@aquadrop.hu']});
 summary.sentEmails=1; (summary as any).resendAttempted=true; (summary as any).resendId=resend?.id ?? null;
 return {...summary,counts};
}
