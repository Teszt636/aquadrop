import { NextResponse } from 'next/server';
import { isCronRequestAuthorized } from '@/lib/cron/partner-crm';
import { runGiftDailySummaryCron } from '@/lib/cron/gift-crm';
export async function GET(request: Request){
 if(!isCronRequestAuthorized(request)) return NextResponse.json({success:false,error:'Unauthorized'},{status:401});
 const p=new URL(request.url).searchParams;
 const dryRunParam=p.get('dryRun')==='1';
 const debug=p.get('debug')==='1';
 const send = p.get('send') === '1' || p.get('send') === 'true';
 const dryRun=dryRunParam || debug || !send;
 try {
  const result = await runGiftDailySummaryCron({dryRun,debug});
  return NextResponse.json({ ...result, debug, requestedSend: send, effectiveDryRun: dryRun });
 } catch(e){
  return NextResponse.json({success:false,error:'Cron route failed',details:e instanceof Error?e.message:e,dryRun,debug,requestedSend:send,effectiveDryRun:dryRun,nowUtc:new Date().toISOString(),nowBudapest:'',checkedUsers:0,checkedLeads:0,eligibleLeads:0,wouldSendTo:[],sentEmails:0,skippedReasons:{},resendErrors:[e instanceof Error?e.message:'Unexpected']},{status:500});
 }
}
