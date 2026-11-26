const {test}=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const crypto=require('node:crypto');const {readFileSync}=require('node:fs');
const booking={name:'Bride',email:'bride@example.com',phone:'9876543210',venue:'Chennai',days:[{eventDate:'2027-01-25',session:'Muhurtham'}]};
const create=changes=>({action:'create_bridal_checkout',booking,availabilityConfirmed:true,detailsSent:true,...changes});
const signature=crypto.createHmac('sha256','test-secret').update('order_bridal|pay_bridal').digest('hex');
const proof={action:'verify_bridal_checkout',orderId:'order_bridal',paymentId:'pay_bridal',signature};
function backend(options={}){
 const calls=[],orders=[];let locked=false,lost=false,status=options.status||'captured';
 const context={console:{log(){},error(){},warn(){}},
  PropertiesService:{getScriptProperties:()=>({getProperty:key=>key==='RAZORPAY_KEY_ID'?'rzp_test_123':'test-secret'})},
  Utilities:{DigestAlgorithm:{SHA_256:'sha256'},Charset:{UTF_8:'utf8'},base64Encode:s=>Buffer.from(s).toString('base64'),computeDigest:(_,s)=>[...crypto.createHash('sha256').update(s).digest()],computeHmacSha256Signature:(s,key)=>[...crypto.createHmac('sha256',key).update(s).digest()]},
  LockService:{getScriptLock:()=>({waitLock(){assert.equal(locked,false);locked=true;},releaseLock(){locked=false;}})},
  ContentService:{MimeType:{JSON:'json'},createTextOutput:s=>({setMimeType:()=>JSON.parse(s)})},
  UrlFetchApp:{fetch(url,init){
   assert.equal(locked,true);calls.push({url,init});let data;
   if(url.includes('/payment_links?')) data={payment_links:options.legacy?[{...options.legacy,reference_id:new URL(url).searchParams.get('reference_id')}]:[]};
   else if(url.includes('/orders?')) data=options.badCollection?{}:{items:orders.filter(o=>o.receipt===new URL(url).searchParams.get('receipt'))};
   else if(url.endsWith('/orders')) {
    data={...JSON.parse(init.payload),id:'order_bridal',status:'created',amount_paid:0,...options.order};orders.push(data);
    if(options.lostResponse&&!lost){lost=true;throw Error('Lost response');}
   } else if(url.endsWith('/orders/order_bridal')) data=orders[0];
   else if(url.endsWith('/capture')) {status=options.captureFails?'authorized':'captured';data={};}
   else if(url.endsWith('/payments/pay_bridal')) data={id:'pay_bridal',order_id:'order_bridal',amount:orders[0].amount,currency:'INR',status,captured:status==='captured',...options.payment};
   else throw Error('Unexpected URL');
   return{getResponseCode:()=>200,getContentText:()=>JSON.stringify(data)};
  }}
 };vm.createContext(context);vm.runInContext(readFileSync(__dirname+'/WorkshopRegistrations.gs','utf8'),context);
 return{calls,orders,post:payload=>context.doPost({postData:{contents:JSON.stringify(payload)}})};
}
test('checkout fixes multi-day amounts on the server and verifies the signed captured payment',()=>{
 for(const days of [1,2,3]){
  const api=backend();const result=api.post(create({booking:{...booking,days:Array.from({length:days},(_,i)=>({eventDate:`2027-01-${25+i}`,session:'Reception'}))},amount:1}));
  assert.equal(result.ok,true);assert.equal(result.amount,[0,200000,300000,400000][days]);
  assert.equal(result.keyId,'rzp_test_123');assert.ok(!JSON.stringify(result).includes('test-secret'));
  const verified=api.post(proof);assert.equal(verified.verified,true);assert.equal(verified.amount,result.amount);
 }
});
test('retries including lost responses reuse orders; paid orders reject another checkout',()=>{
 for(const options of [{},{lostResponse:true}]){
  const api=backend(options);assert.equal(api.post(create()).ok,true);assert.equal(api.post(create()).ok,true);
  assert.equal(api.orders.length,1);api.orders[0].status='paid';api.orders[0].amount_paid=200000;
  assert.equal(api.post(create()).code,'BOOKING_ALREADY_PAID');assert.equal(api.orders.length,1);
 }
});
test('legacy active and paid links block duplicate payment routes',()=>{
 for(const legacy of [{status:'created',amount_paid:0},{status:'paid',amount_paid:200000},{status:'partially_paid',amount_paid:1}]){
  const api=backend({legacy});assert.equal(api.post(create()).ok,false);assert.equal(api.orders.length,0);
 }
 for(const status of ['cancelled','expired'])assert.equal(backend({legacy:{status,amount_paid:0}}).post(create()).ok,true);
});
test('invalid requests and unconfirmed collections cannot create orders',()=>{
 for(const changes of [{detailsSent:false},{availabilityConfirmed:false},{booking:{...booking,days:[]}},{booking:{...booking,phone:'bad'}}]){
  const api=backend();assert.equal(api.post(create(changes)).ok,false);assert.equal(api.calls.length,0);
 }
 const api=backend({badCollection:true});assert.equal(api.post(create()).ok,false);assert.equal(api.orders.length,0);
});
test('wrong order and payment attributes cannot confirm a bridal advance',()=>{
 for(const order of [{amount:1},{currency:'USD'},{notes:{type:'workshop'}},{receipt:'wrong'}])assert.equal(backend({order}).post(create()).ok,false);
 for(const payment of [{amount:1},{currency:'USD'},{order_id:'order_other'},{id:'pay_other'},{captured:false},{status:'failed'}]){
  const api=backend({payment});api.post(create());assert.equal(api.post(proof).ok,false);
 }
 const api=backend();api.post(create());assert.equal(api.post({...proof,signature:'0'.repeat(64)}).ok,false);
});
test('capture checks and duplicate verification do not create orders',()=>{
 for(const captureFails of [false,true]){
  const api=backend({status:'authorized',captureFails});api.post(create());
  assert.equal(api.post(proof).verified,!captureFails);assert.equal(api.post(proof).verified,!captureFails);assert.equal(api.orders.length,1);
 }
});
