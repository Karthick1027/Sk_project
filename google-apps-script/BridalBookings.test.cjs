const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');
const booking = { name:'Bride', email:'BRIDE@example.com', phone:'9876543210', eventDate:'2027-01-25', session:'Muhurtham' };
const request = { action:'create_bridal_order', booking, requestId:'test-request-12345678', availabilityConfirmed:true };
const signature = crypto.createHmac('sha256','test-secret').update('order_bridal|pay_bridal').digest('hex');
const proof = { action:'verify_bridal_payment', orderId:'order_bridal', paymentId:'pay_bridal', signature };

function backend(options={}) {
  const rows=[],calls=[]; let order,locked=false,status=options.status||'captured',failSave=false;
  const sheet={
    getLastRow:()=>rows.length,
    getRange(row,col,count=1,width=1) {
      const values=()=>Array.from({length:count},(_,r)=>Array.from({length:width},(_,c)=>rows[row+r-1]?.[col+c-1]??''));
      const range={getValues:values,getValue:()=>values()[0][0],setNumberFormat:()=>range,setValue:value=>range.setValues([[value]]),setValues(matrix) {
        if(failSave && col===8) throw Error('Write failed after capture');
        matrix.forEach((line,r)=>{while(rows.length<row+r)rows.push([]);line.forEach((value,c)=>{rows[row+r-1][col+c-1]=value;});});
      }}; return range;
    }
  };
  let created=false;
  const context={
    console:{log(){},warn(){},error(){}},
    SpreadsheetApp:{openById:()=>({getSheetByName(name){assert.equal(name,'Bridal Bookings');return created?sheet:null;},insertSheet(name){assert.equal(name,'Bridal Bookings');created=true;return sheet;}}),flush(){}},
    LockService:{getScriptLock:()=>({waitLock(){assert.equal(locked,false);locked=true;},releaseLock(){locked=false;}})},
    PropertiesService:{getScriptProperties:()=>({getProperty:key=>key==='RAZORPAY_KEY_ID'?'rzp_test_123':'test-secret'})},
    Utilities:{DigestAlgorithm:{SHA_256:'sha256'},Charset:{UTF_8:'utf8'},base64Encode:s=>Buffer.from(s).toString('base64'),computeDigest:(_,s)=>[...crypto.createHash('sha256').update(s).digest()],computeHmacSha256Signature:(s,key)=>[...crypto.createHmac('sha256',key).update(s).digest()]},
    ContentService:{MimeType:{JSON:'json'},createTextOutput:s=>({setMimeType:()=>JSON.parse(s)})},
    UrlFetchApp:{fetch(url,init){
      assert.equal(locked,true);calls.push({url,init});let data;
      if(url.endsWith('/orders')) {
        assert.equal(rows[1][7],'Pending');order={id:'order_bridal',...JSON.parse(init.payload)};data=order;
      } else if(url.endsWith('/orders/order_bridal')) data={...order,...options.order};
      else if(url.endsWith('/capture')) {status=options.captureFails?'authorized':'captured';data={};}
      else if(url.endsWith('/payments/pay_bridal')) data={id:'pay_bridal',order_id:'order_bridal',amount:200000,currency:'INR',status,captured:status==='captured',...options.payment};
      else throw Error('Unexpected URL');
      return {getResponseCode:()=>200,getContentText:()=>JSON.stringify(data)};
    }}
  };
  vm.createContext(context);vm.runInContext(readFileSync(__dirname+'/WorkshopRegistrations.gs','utf8'),context);
  return {rows,calls,post:payload=>context.doPost({postData:{contents:JSON.stringify(payload)}}),failSaving:()=>{failSave=true;},allowSaving:()=>{failSave=false;}};
}

test('bridal create saves separate event details and fixes the amount server-side',()=>{
  const api=backend();const result=api.post({...request,amount:1});
  assert.equal(result.ok,true);assert.equal(result.bookingSaved,true);assert.equal(result.amount,200000);
  assert.equal(api.rows[1][2],'bride@example.com');assert.equal(api.rows[1][3],'919876543210');assert.equal(api.rows[1][4],booking.eventDate);assert.equal(api.rows[1][6],2000);
  assert.equal(JSON.parse(api.calls[0].init.payload).notes.type,'bridal_advance');
});
test('availability and invalid event details block orders',()=>{
  for(const payload of [{...request,availabilityConfirmed:false},{...request,booking:{...booking,eventDate:'2027-02-31'}},{...request,booking:{...booking,phone:'123'}},{...request,booking:{...booking,email:'invalid'}},{...request,requestId:'bad'}]) {
    const api=backend();assert.equal(api.post(payload).ok,false);assert.equal(api.calls.length,0);assert.equal(api.rows.length,0);
  }
});
test('retries and another browser reuse the same pending booking and order',()=>{
  const api=backend();api.post(request);const count=api.calls.length;
  assert.equal(api.post(request).orderId,'order_bridal');
  assert.equal(api.post({...request,requestId:'another-browser-1234'}).orderId,'order_bridal');
  assert.equal(api.calls.length,count);assert.equal(api.rows.length,2);
  assert.equal(api.post({...request,booking:{...booking,name:'Changed name'}}).code,'BOOKING_EXISTS');
});
test('captured bridal payment verifies the same row and duplicate callbacks are idempotent',()=>{
  const api=backend();api.post(request);const original=api.rows[1].slice(0,7);
  assert.equal(api.post(proof).verified,true);assert.equal(api.rows[1][7],'Verified');assert.equal(api.rows[1][9],'pay_bridal');
  assert.deepEqual(api.rows[1].slice(0,7),original);assert.equal(api.post(proof).saved,true);assert.equal(api.rows.length,2);
  assert.equal(api.post(request).code,'BOOKING_ALREADY_PAID');
});
test('authorized payments are captured before confirmation',()=>{
  const api=backend({status:'authorized'});api.post(request);assert.equal(api.post(proof).verified,true);
  assert.equal(api.calls.filter(call=>call.url.endsWith('/capture')).length,1);
});
test('bad signatures, amounts, currency, order type and uncaptured payments cannot verify',()=>{
  for(const options of [{payment:{amount:1}},{payment:{currency:'USD'}},{payment:{order_id:'order_other'}},{order:{notes:{type:'workshop_advance'}}},{status:'authorized',captureFails:true}]) {
    const api=backend(options);api.post(request);assert.equal(api.post(proof).ok,false);assert.equal(api.rows[1][7],'Pending');
  }
  const api=backend();api.post(request);const count=api.calls.length;assert.equal(api.post({...proof,signature:'0'.repeat(64)}).ok,false);assert.equal(api.calls.length,count);
});
test('captured payment saving failures can retry verification without a new charge',()=>{
  const api=backend();api.post(request);api.failSaving();const failed=api.post(proof);
  assert.equal(failed.code,'REGISTRATION_SAVE_FAILED');assert.equal(failed.paymentCaptured,true);assert.match(failed.error,/Do not pay again/);
  api.allowSaving();assert.equal(api.post(proof).verified,true);assert.equal(api.calls.filter(call=>call.url.endsWith('/orders')).length,1);
});
test('modified saved details and duplicate order rows require review',()=>{
  const changed=backend();changed.post(request);changed.rows[1][4]='2027-01-26';assert.equal(changed.post(proof).ok,false);
  const duplicate=backend();duplicate.post(request);duplicate.rows.push(duplicate.rows[1].slice());assert.equal(duplicate.post(proof).ok,false);
});
