// Local browser checks with mocked Apps Script/Razorpay; no live orders or charges.
const {createServer}=require('node:http');
const {readFileSync,mkdtempSync,existsSync}=require('node:fs');
const {resolve,join,extname,sep}=require('node:path');
const {tmpdir}=require('node:os');
const {spawn}=require('node:child_process');
const browser=process.argv[2];if(!browser)throw Error('Pass an installed Edge/Chrome executable.');
const root=resolve(__dirname,'../dist');
const setup=`<script>
window.bridalQA={orders:0,verifications:0,availability:[],paymentLinks:[],failVerify:true};
window.bridalQA.opened=[];window.open=url=>{if(url && url!=='about:blank')window.bridalQA.opened.push(String(url));return null;};
if(location.search.includes('checkoutRecovery=1')) {window.bridalQA.amount=300000;sessionStorage.setItem('sk-bridal-checkout-receipt-v1',JSON.stringify({proof:{razorpay_order_id:'order_bridal',razorpay_payment_id:'pay_bridal',razorpay_signature:'a'.repeat(64)},amount:300000,verified:true}));}
if(location.search.includes('recovery=1')) sessionStorage.setItem('sk-bridal-payment-receipt-v1',JSON.stringify({proof:{razorpay_order_id:'order_bridal',razorpay_payment_id:'pay_bridal',razorpay_signature:'a'.repeat(64)},verified:false}));
window.fetch=async(url,options)=>{
 const payload=JSON.parse(options.body),qa=window.bridalQA;
 if(payload.action==='check_bridal_availability'){
  qa.availability.push(payload);
  const blocked=qa.blockedSlots?.includes(payload.date+'|'+payload.session)===true;
  return {ok:true,json:async()=>({ok:true,available:!blocked,date:payload.date,session:payload.session,status:blocked?'BOOKED':'AVAILABLE'})};
 }
 if(payload.action==='create_bridal_checkout'){
  qa.orders++;qa.payload=payload;
  if(qa.failOrder)return {ok:true,json:async()=>({ok:false,code:'ORDER_FAILED',error:'Payment service temporarily unavailable. Please retry.'})};
  const total={1:2000,2:3000,3:4000}[payload.booking.days.length];
  qa.amount=total*100;
  return {ok:true,json:async()=>({ok:true,orderId:'order_bridal',keyId:'rzp_test_123',amount:qa.amount,currency:'INR'})};
 }
 if(payload.action==='verify_bridal_checkout'){
  qa.verifications++;
  return {ok:true,json:async()=>qa.failVerify?{ok:false,error:'Temporary verification failure. Do not pay again.'}:{ok:true,verified:true,orderId:'order_bridal',paymentId:'pay_bridal',amount:qa.amount,currency:'INR'}};
 }
 if(payload.action==='create_bridal_order'){
  qa.orders++;qa.payload=payload;
  return {ok:true,json:async()=>({ok:true,bookingSaved:true,orderId:'order_bridal',keyId:'rzp_test_123',amount:200000,currency:'INR'})};
 }
 if(payload.action==='verify_bridal_payment'){
  qa.verifications++;
  return {ok:true,json:async()=>qa.failVerify?{ok:false,error:'Temporary verification failure. Do not pay again.'}:{ok:true,verified:true,saved:true,orderId:'order_bridal',paymentId:'pay_bridal',amount:200000,currency:'INR'}};
 }
 throw Error('Unexpected action '+payload.action);
};
window.Razorpay=class{
 constructor(options){this.options=options;window.bridalQA.checkout=options;}
 on(){} close(){}
 open(){if(document.querySelector('dialog[open]'))throw Error('Native dialog blocks gateway');setTimeout(()=>window.bridalQA.cancelCheckout?this.options.modal.ondismiss():this.options.handler({razorpay_order_id:'order_bridal',razorpay_payment_id:'pay_bridal',razorpay_signature:'a'.repeat(64)}),50);}
};
</script>`;
const checks=require('./bridal-booking-flow-checks.cjs');
const html=readFileSync(join(root,'index.html'),'utf8').replace('<head>','<head>'+setup).replace('</body>',checks+'</body>');
const server=createServer((request,response)=>{
 const path=resolve(root,'.'+new URL(request.url,'http://localhost').pathname);
 if(path.startsWith(root+sep)&&existsSync(path)&&extname(path)){
  response.setHeader('Content-Type',({'.js':'application/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'})[extname(path)]||'application/octet-stream');response.end(readFileSync(path));
 }else{response.setHeader('Content-Type','text/html');response.end(html);}
});
// Use real render frames: virtual-time DOM dumps can skip calendar focus frames.
server.listen(0, '127.0.0.1', async () => {
 const child=spawn(browser,['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=0',`--user-data-dir=${mkdtempSync(join(tmpdir(),'sk-bridal-payment-'))}`,'about:blank'],{windowsHide:true});
 let socket;
 const timer=setTimeout(()=>child.kill(),45000);
 try {
  const port=await new Promise((resolve,reject)=>{
   let stderr='';child.once('error',reject);
   child.stderr.on('data',chunk=>{stderr+=chunk;const match=stderr.match(/DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)/);if(match)resolve(Number(match[1]));});
   child.once('exit',()=>reject(Error('Browser closed before the check completed')));
  });
  const tabs=await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  socket=new WebSocket(tabs.find(tab=>tab.type==='page').webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
  let id=0;const pending=new Map();
  socket.addEventListener('message',event=>{const message=JSON.parse(event.data),task=pending.get(message.id);if(task){pending.delete(message.id);message.error?task.reject(Error(message.error.message)):task.resolve(message.result);}});
  socket.addEventListener('close',()=>{for(const task of pending.values())task.reject(Error('Browser connection closed'));pending.clear();});
  const command=(method,params={})=>new Promise((resolve,reject)=>{const next=++id;pending.set(next,{resolve,reject});socket.send(JSON.stringify({id:next,method,params}));});
  const [width,height]=(process.argv[3]||'375,812').split(',').map(Number);
  await command('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<1024});
  await command('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/packages${process.argv[4]==='recovery'?'?recovery=1':process.argv[4]==='checkout-recovery'?'?checkoutRecovery=1':''}`});
  const evaluation=await command('Runtime.evaluate',{awaitPromise:true,returnByValue:true,expression:`new Promise((resolve,reject)=>{const timer=setInterval(()=>{const state=document.body?.dataset.qa,output=document.getElementById('qa-result');if((state==='passed'||state==='failed')&&output){clearInterval(timer);resolve({state,checks:JSON.parse(output.textContent)});}},40);setTimeout(()=>{clearInterval(timer);reject(Error('Booking checks timed out'));},35000);})`});
  if(evaluation.exceptionDetails)throw Error(evaluation.exceptionDetails.exception?.description||evaluation.exceptionDetails.text);
  const result=evaluation.result.value;
  console.log(JSON.stringify(result.checks));process.exitCode=result.state==='passed'?0:1;
 }catch(error){console.error(error.message);process.exitCode=1;}
 finally{clearTimeout(timer);socket?.close();child.kill();server.close();}
});
