const {test}=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const crypto=require('node:crypto');const {readFileSync}=require('node:fs');
const days=[{eventDate:'2027-01-25',session:'Muhurtham'},{eventDate:'2027-01-26',session:'Reception'},{eventDate:'2027-01-27',session:'Baby Shower'}];
const booking={name:'Bride',email:'BRIDE@example.com',phone:'9876543210',venue:'Chennai',days:days.slice(0,1)};
const request=changes=>({action:'create_bridal_payment_link',booking,availabilityConfirmed:true,detailsSent:true,...changes});
function backend(options={}){
 const calls=[],links=[];let locked=false,lost=false;
 const context={
  console:{log(){},error(){}},
  PropertiesService:{getScriptProperties:()=>({getProperty:key=>options.noKeys?'':key==='RAZORPAY_KEY_ID'?'rzp_test_example':'test-secret'})},
  Utilities:{DigestAlgorithm:{SHA_256:'sha256'},Charset:{UTF_8:'utf8'},base64Encode:value=>Buffer.from(value).toString('base64'),computeDigest:(_,value)=>[...crypto.createHash('sha256').update(value).digest()]},
  LockService:{getScriptLock:()=>({waitLock(){assert.equal(locked,false);locked=true;},releaseLock(){locked=false;}})},
  ContentService:{MimeType:{JSON:'json'},createTextOutput:content=>({setMimeType:()=>JSON.parse(content)})},
  UrlFetchApp:{fetch(url,init){
   assert.equal(locked,true);assert.ok(init.headers.Authorization.startsWith('Basic '));
   calls.push({url,init});let data;
   if(init.method==='get')data=options.badCollection?{}:{payment_links:links.filter(link=>link.reference_id===new URL(url).searchParams.get('reference_id'))};
   else{
    const payload=JSON.parse(init.payload);
    const link={...payload,id:'plink_example',amount_paid:0,status:'created',short_url:'https://rzp.io/i/example',...options.link};
    links.push(link);data=link;
    if(options.lostResponse&&!lost){lost=true;throw Error('Connection lost after provider created link');}
   }
   return{getResponseCode:()=>200,getContentText:()=>JSON.stringify(data)};
  }}
 };
 vm.createContext(context);
 vm.runInContext(readFileSync(__dirname+'/WorkshopRegistrations.gs','utf8'),context);
 vm.runInContext(readFileSync(__dirname+'/BridalPaymentLinks.gs','utf8'),context);
 return{calls,links,post:payload=>context.doPost({postData:{contents:JSON.stringify(payload)}})};
}

test('API fixes 1/2/3-day advances at INR 2000/3000/4000, ignores client amount, and disables notifications',()=>{
 for(const count of [1,2,3]){
  const api=backend();const result=api.post(request({booking:{...booking,days:days.slice(0,count)},amount:1}));
  assert.equal(result.ok,true);assert.equal(result.amount,[0,200000,300000,400000][count]);assert.equal(result.amountPreset,true);
  const payload=JSON.parse(api.calls.find(call=>call.init.method==='post').init.payload);
  assert.equal(payload.amount,result.amount);assert.equal(payload.currency,'INR');assert.equal(payload.accept_partial,false);
  assert.deepEqual(payload.notify,{sms:false,email:false});assert.equal(payload.reminder_enable,false);assert.ok(payload.reference_id.length<=40);
  assert.equal(payload.customer.email,'bride@example.com');assert.equal(payload.customer.contact,'+919876543210');
  assert.equal(JSON.stringify(result).includes('test-secret'),false);
 }
});
test('retries and lost create responses reuse a unique booking link without creating twice',()=>{
 for(const options of [{},{lostResponse:true}]){
  const api=backend(options);assert.equal(api.post(request()).ok,true);assert.equal(api.post(request()).ok,true);
  assert.equal(api.calls.filter(call=>call.init.method==='post').length,1);assert.equal(api.links.length,1);
 }
});
test('missing acknowledgement and invalid booking details cannot contact Razorpay',()=>{
 for(const changes of [{availabilityConfirmed:false},{detailsSent:false},{booking:{...booking,days:[]}},{booking:{...booking,days:[days[0],days[0]]}},{booking:{...booking,email:'invalid'}},{booking:{...booking,days:[{eventDate:'2027-02-30',session:'Reception'}]}}]){
  const api=backend();assert.equal(api.post(request(changes)).ok,false);assert.equal(api.calls.length,0);
 }
});
test('paid, partial, expired or cancelled links never issue another payment link',()=>{
 for(const change of [{status:'paid',amount_paid:200000},{status:'partially_paid',amount_paid:1},{status:'expired'},{status:'cancelled'}]){
  const api=backend();assert.equal(api.post(request()).ok,true);Object.assign(api.links[0],change);
  assert.equal(api.post(request()).ok,false);assert.equal(api.calls.filter(call=>call.init.method==='post').length,1);
 }
});
test('wrong amounts, currency, URLs and partial-payment settings cannot produce a usable link',()=>{
 for(const link of [{amount:1},{currency:'USD'},{short_url:'https://example.com/pay'},{short_url:'http://rzp.io/i/example'},{accept_partial:true},{id:'invalid'},{notes:{booking_hash:'different'}},{reference_id:'other'}]){
  const api=backend({link});assert.equal(api.post(request()).ok,false);
 }
});
test('missing API keys and malformed provider collections fail without creating links',()=>{
 for(const options of [{noKeys:true},{badCollection:true}]){
  const api=backend(options);assert.equal(api.post(request()).ok,false);assert.equal(api.links.length,0);
 }
});
test('read-only API readiness exposes capability and key mode without revealing credentials',()=>{
 const api=backend();const result=api.post({action:'bridal_payment_link_status'});
 assert.deepEqual(JSON.parse(JSON.stringify(result)),{ok:true,api:'bridal-payment-links-v1',ready:true,mode:'test'});assert.equal(api.calls.length,0);
 assert.equal(backend({noKeys:true}).post({action:'bridal_payment_link_status'}).ready,false);
});
