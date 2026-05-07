import { NextResponse } from 'next/server';
import { isCronRequestAuthorized, isCronSecretAuthorized, isVercelCronRequest } from '@/lib/cron/partner-crm';
import { runGiftDailySummaryCron } from '@/lib/cron/gift-crm';
export async function GET(request: Request){
 if(!isCronRequestAuthorized(request)) {
  const nowUtc = new Date().toISOString();
  return NextResponse.json({success:false,error:'Unauthorized',dryRun:true,debug:false,force:false,requestedSend:false,effectiveDryRun:true,nowUtc,nowBudapest:'',checkedUsers:0,checkedLeads:0,eligibleLeads:0,skippedByTimeWindow:false,wouldSendTo:[],sentEmails:0,skippedReasons:{unauthorized:1},resendAttempted:false,resendResponses:[],resendErrors:[]},{status:401});
 }
 const p=new URL(request.url).searchParams;
 const dryRunParam=p.get('dryRun')==='1';
 const debug=p.get('debug')==='1';
 const send = p.get('send') === '1' || p.get('send') === 'true';
 const force = p.get('force') === '1' && isCronSecretAuthorized(request);
 const requestedSend = send || isVercelCronRequest(request);
 const dryRun=dryRunParam || debug || !requestedSend;
 try {
  const result = await runGiftDailySummaryCron({dryRun,debug,force});
  return NextResponse.json({ ...result, debug, force, requestedSend, effectiveDryRun: dryRun });
 } catch(e){
  return NextResponse.json({success:false,error:'Cron route failed',details:e instanceof Error?e.message:e,dryRun,debug,force,requestedSend,effectiveDryRun:dryRun,nowUtc:new Date().toISOString(),nowBudapest:'',checkedUsers:0,checkedLeads:0,eligibleLeads:0,skippedByTimeWindow:false,wouldSendTo:[],sentEmails:0,skippedReasons:{},resendResponses:[],resendErrors:[e instanceof Error?e.message:'Unexpected'],resendAttempted:false},{status:500});
 }
}
