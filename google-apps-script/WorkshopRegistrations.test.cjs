const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');
const ts = require('typescript');
const registration = { name: 'Student', phone: '919876543210', email: 'student@example.com', gender: 'Female', goal: 'Learn bridal makeup', question: 'Keep my details', experience: 'Beginner', city: 'Chennai', course: '2-Day Online Live Demo Workshop' };

test('each course defaults to its advance and generates the correct WhatsApp balance', () => {
  for (const [course, advance, balance] of [
    ['2-Day Online Live Demo Workshop', 500, '3,499'],
    ['15-Day Bridal Makeup Masterclass', 5000, '24,999'],
    ['30-Day Professional Bridal Makeup Masterclass', 10000, '39,999'],
  ]) {
    const api = backend();
    const order = api.post({ action: 'create_order', registration: { ...registration, course } });
    assert.equal(order.ok, true);
    assert.equal(order.amount, advance * 100);
    assert.equal(api.post(proof).verified, true);
    const message = new URL(api.rows[order.row - 1][13]).searchParams.get('text');
    assert.ok(message.includes(course));
    assert.ok(message.includes('Remaining Balance: ₹' + balance));
    assert.equal(message.includes('\uFFFD'), false);
  }
});
const signature = crypto.createHmac('sha256', 'test-secret').update('order_test|pay_test').digest('hex');
const proof = { action: 'verify_payment', orderId: 'order_test', paymentId: 'pay_test', signature };
function backend(options = {}) {
  const headers = Array.from({length:11}, (_,i) => 'Original Form header ' + i);
  const rows = [headers.slice(), ['existing timestamp', 'Existing Form Student', '919999999999', 'Female', 'Original goal', '', 'Pro', 'original@example.com', 'City', 9, 'existing-screenshot']];
  if (options.gap) rows.splice(1, 0, []);
  if (options.formulaGap) { rows.splice(1, 0, []); }
  const original = JSON.stringify(rows);
  let columns = 11, locked = false, status = options.status || 'captured', order;
  let failUpdate = Boolean(options.failUpdate), failPending = Boolean(options.failPending), verifiedWritten = false;
  let failVerifiedFlush = Boolean(options.failVerifiedFlush), rejectFormat = false;
  const calls = [], writes = [], logs = [], files = [], richLinks = [];
  const properties = new Map([['RAZORPAY_KEY_ID','rzp_test_123'],['RAZORPAY_KEY_SECRET','test-secret']]);
  if (!options.noProofFolder) properties.set('WORKSHOP_PROOF_FOLDER_ID', 'proof_folder');
  const proofFolder = { getId: () => 'proof_folder', getUrl: () => 'https://drive.google.com/drive/folders/proof_folder', createFile(blob) {
    if(options.driveFails) throw Error('Drive upload denied');
    files.push(blob); return { getUrl: () => 'https://drive.google.com/file/d/proof_test/view' };
  } };
  const sheet = {
    getName: () => 'Form Responses 1', getSheetId: () => 1885927180, getLastRow: () => rows.length,
    getMaxColumns: () => columns, insertColumnsAfter: (_,n) => { columns += n; },
    getRange(row, column, count=1, width=1) {
      assert.ok(column+width-1 <= columns);
      const values = () => Array.from({length:count},(_,r) => Array.from({length:width},(_,c) => rows[row-1+r]?.[column-1+c] ?? ''));
      function write(r,c,value) {
        assert.ok(r !== 1 || c > 11, 'Form headers A-K must be preserved');
        while(rows.length < r) rows.push([]);
        while(rows[r-1].length < c) rows[r-1].push('');
        rows[r-1][c-1] = value;
        writes.push({row:r,column:c,value});
      }
      return {
        getValues: values, getDisplayValues: () => values().map(r => r.map(String)),
        getFormulas: () => Array.from({length:count},(_,r) => Array.from({length:width},(_,c) => options.formulaGap && row+r === 2 && column+c === 1 ? '=IF(FALSE,1,"")' : '')),
        getValue: () => values()[0][0], getDisplayValue: () => String(values()[0][0]),
        setNumberFormat() { if(rejectFormat) throw Error('Typed columns cannot be reformatted'); return this; },
        setValue: value => write(row,column,value),
        setValues(matrix) {
          if(row>1 && column===1 && failPending) throw Error('Pending row write denied');
          if(row>1 && column===12 && matrix[0][0]==='Verified') {
            if(failUpdate) throw Error('Verified row write denied');
            verifiedWritten = true;
          }
          matrix.forEach((line,r) => line.forEach((value,c) => write(row+r,column+c,value)));
          if(options.dropProof && row>1 && column===1) rows[row-1][10]='';
        },
        setRichTextValue: value => write(row,column,value.url), clearContent: () => write(row,column,''),
      };
    },
  };
  const context = {
    Logger: {log: value => logs.push(String(value))},
    console: {log: (...a) => logs.push(a.join(' ')), error: (...a) => logs.push(a.join(' ')), warn: (...a) => logs.push(a.join(' '))},
    LockService: {getScriptLock: () => ({waitLock() {assert.equal(locked,false);locked=true;}, releaseLock(){locked=false;}})},
    PropertiesService: {getScriptProperties: () => ({getProperty: key => properties.get(key),setProperty:(key,value)=>properties.set(key,value)})},
    DriveApp: {getFolderById(id){assert.equal(id,'proof_folder');return proofFolder;},createFolder:()=>proofFolder},
    SpreadsheetApp: {
      openById(id) { assert.equal(id,'1TdrQD7sq_uRgLkPoKwubH23QJY-reCejaNTVgvr3ows'); return {getSheetByName(name){assert.equal(name,'Form Responses 1');return sheet;}}; },
      flush() { if(verifiedWritten && failVerifiedFlush){failVerifiedFlush=false;throw Error('Lost flush acknowledgement');} },
      newRichTextValue() { const value={text:'',setText(text){value.text=text;return value;},setLinkUrl(start,end,url){richLinks.push({label:value.text.slice(start,end),url});if(!value.url)value.url=url;return value;},build(){return value;}};return value; },
    },
    ContentService: {MimeType:{JSON:'application/json'},createTextOutput: text => ({setMimeType: () => JSON.parse(text)})},
    Utilities: {getUuid: () => '12345678-1234-1234-1234-123456789012', Charset:{UTF_8:'UTF-8'}, DigestAlgorithm:{SHA_256:'SHA-256'},
      base64Encode: s => Buffer.from(s).toString('base64'),
      base64Decode: s => [...Buffer.from(s,'base64')], newBlob: (bytes,mimeType,name) => ({bytes,mimeType,name}),
      computeDigest: (_,s) => [...crypto.createHash('sha256').update(s).digest()],
      computeHmacSha256Signature: (s,key) => [...crypto.createHmac('sha256',key).update(s).digest()],
    },
    UrlFetchApp: {fetch(url, request) {
      assert.ok(url.startsWith('https://api.razorpay.com/v1/'));
      assert.equal(request.headers.Authorization,'Basic '+Buffer.from('rzp_test_123:test-secret').toString('base64'));
      calls.push({url,request});
      let result, code=200;
      if(url.endsWith('/orders')) {
        assert.ok(rows.some(r => r[11]==='Pending'), 'Pending row must exist before Razorpay order creation');
        const body=JSON.parse(request.payload);
        order={id:'order_test',...body};result=order;
      } else if(url.endsWith('/orders/order_test')) result={...order,...options.order};
      else if(url.endsWith('/capture')) {
        assert.equal(JSON.parse(request.payload).amount,order.amount);
        if(options.captureFails){code=400;result={error:'failed'};} else {status='captured';result={status};}
      } else if(url.endsWith('/payments/pay_test')) result={id:'pay_test',order_id:'order_test',amount:order.amount,currency:'INR',status,captured:status==='captured',...options.payment};
      else throw Error('Unexpected Razorpay URL');
      return {getResponseCode:()=>code,getContentText:()=>JSON.stringify(result)};
    }},
  };
  vm.createContext(context);vm.runInContext(readFileSync(__dirname+'/WorkshopRegistrations.gs','utf8'),context);
  const post = payload => context.doPost({postData:{contents:JSON.stringify(payload)}});
  return {rows,original,sheet,context,calls,writes,logs,files,richLinks,properties,post,create: (amount,paymentProof) => post({action:'create_order',registration,amount:amount??500,paymentProof}),allowUpdate:()=>{failUpdate=false;},rejectFormatting:()=>{rejectFormat=true;}};
}
test('either an existing phone or email blocks registration before uploads, rows or orders are created',()=>{
  for (const [contact, value] of [['phone','+91 99999 99999'],['email',' ORIGINAL@EXAMPLE.COM ']]) {
    const api=backend();
    const result=api.post({action:'create_order',registration:{...registration,[contact]:value},paymentProof:pngProof});
    assert.equal(result.code,'DUPLICATE_REGISTRATION');
    assert.deepEqual(Object.keys(result.fields),[contact]);
    assert.match(result.fields[contact],/already registered/);
    assert.equal(api.rows.length,2);assert.equal(api.calls.length,0);assert.equal(api.files.length,0);
  }
});

test('contact normalization detects older phone formats and case-insensitive emails',()=>{
  for(const phone of ['9999999999','09999999999','+91 99999 99999','00919999999999']) {
    const api=backend();api.rows[1][2]=phone;
    assert.equal(api.post({action:'create_order',registration:{...registration,phone:'919999999999'}}).code,'DUPLICATE_REGISTRATION');
  }
  const api=backend();api.rows[1][7]=' ORIGINAL@EXAMPLE.COM ';
  assert.equal(api.post({action:'create_order',registration:{...registration,email:'original@example.com'}}).fields.email.includes('already'),true);
});

test('pending and verified registrations reserve both contacts across courses while payment verification can retry',()=>{
  for(const verified of [false,true]) {
    const api=backend();assert.equal(api.create().ok,true);
    if(verified) assert.equal(api.post(proof).verified,true);
    const count=api.rows.length,calls=api.calls.length;
    const result=api.post({action:'create_order',registration:{...registration,course:'15-Day Bridal Makeup Masterclass'}});
    assert.equal(result.code,'DUPLICATE_REGISTRATION');assert.deepEqual(Object.keys(result.fields).sort(),['email','phone']);
    assert.equal(api.rows.length,count);assert.equal(api.calls.length,calls);
    assert.equal(api.post(proof).verified,true);
  }
});

test('supplied first-empty-row saver persists a complete Pending registration before returning an order',()=>{
  const api=backend({gap:true});const original=JSON.parse(api.original);const order=api.create();
  assert.equal(order.ok,true);assert.equal(order.registrationSaved,true);assert.equal(order.row,2);assert.equal(order.paymentVerification,'AUTOMATIC');
  assert.equal(order.amount,50000);assert.equal(JSON.parse(api.calls[0].request.payload).amount,50000);
  assert.deepEqual(api.rows[1].slice(1,11),['Student','919876543210','Female','Learn bridal makeup','Keep my details','Beginner','student@example.com','Chennai','','']);
  assert.deepEqual(api.rows[1].slice(11),['Pending','No','',registration.course,'','order_test',500]);
  assert.deepEqual(api.rows[0].slice(0,11),original[0]);assert.deepEqual(api.rows[2],original[2]);
});
test('a visually empty formula row is preserved by the supplied first-empty-row search',()=>{
  const api=backend({formulaGap:true});const result=api.create();assert.equal(result.row,4);assert.equal(api.rows[1].length,0);
});
test('Pending-save rejection never creates a Razorpay order',()=>{
  const api=backend({failPending:true});const result=api.create();assert.equal(result.ok,false);assert.equal(api.calls.length,0);assert.equal(result.orderId,undefined);
});
test('flexible INR amounts reach Razorpay in paise and verify in the same saved row',()=>{
  for(const amount of [1,5,250,500,750]){const api=backend();const order=api.create(amount);const before=api.rows[2].slice(0,11);const count=api.rows.length;
    const result=api.post(proof);assert.equal(result.ok,true);assert.equal(result.verified,true);assert.equal(result.saved,true);assert.equal(result.row,order.row);assert.equal(result.amount,amount*100);assert.equal(result.currency,'INR');assert.equal(api.rows.length,count);assert.deepEqual(api.rows[2].slice(0,11),before);
    assert.equal(api.rows[2][11],'Verified');assert.equal(api.rows[2][12],'Ready to Send');assert.ok(api.rows[2][13].startsWith('https://web.whatsapp.com/send?phone=919876543210&text='));assert.equal(api.rows[2][15],'pay_test');assert.equal(api.rows[2][16],'order_test');assert.equal(api.rows[2][17],amount);
  }
});
test('invalid signatures cannot fetch, capture or change the Pending row',()=>{
  const api=backend();api.create();const before=JSON.stringify(api.rows),calls=api.calls.length;const result=api.post({...proof,signature:'0'.repeat(64)});assert.equal(result.ok,false);assert.equal(api.calls.length,calls);assert.equal(JSON.stringify(api.rows),before);
});
for(const options of [{payment:{amount:500}},{payment:{currency:'USD'}},{payment:{order_id:'order_other'}},{payment:{id:'pay_other'}},{order:{amount:500}},{order:{currency:'USD'}},{status:'failed'},{captureFails:true,status:'authorized'}]){
  test('mismatched or uncaptured payment cannot mark Verified: '+JSON.stringify(options),()=>{const api=backend(options);api.create();const result=api.post(proof);assert.equal(result.ok,false);assert.equal(api.rows[2][11],'Pending');assert.equal(api.rows[2][15],'');});
}
test('authorized payment uses the supplied capture logic and refetches captured status',()=>{
  const api=backend({status:'authorized'});api.create();const result=api.post(proof);assert.equal(result.verified,true);const capture=api.calls.findIndex(c=>c.url.endsWith('/capture'));assert.ok(capture>0);assert.ok(api.calls[capture+1].url.endsWith('/payments/pay_test'));
});
test('duplicate verification rechecks Razorpay, returns complete confirmation and never appends',()=>{
  const api=backend();api.create();api.post(proof);const before=api.rows.length,calls=api.calls.length;api.rows[2][12]='Confirmation Sent';
  const result=api.post(proof);assert.equal(result.duplicate,true);assert.equal(result.saved,true);assert.equal(result.amount,50000);assert.equal(result.currency,'INR');assert.equal(api.calls.length,calls+2);assert.equal(api.rows.length,before);assert.equal(api.rows[2][12],'Confirmation Sent');
});
test('captured payment with a failed Sheet update retains its row and supports verification-only retry',()=>{
  const api=backend({failUpdate:true});const order=api.create();const result=api.post(proof);assert.equal(result.ok,false);assert.equal(result.verified,true);assert.equal(result.paymentCaptured,true);assert.equal(result.saved,false);assert.equal(result.code,'REGISTRATION_SAVE_FAILED');assert.match(result.error,/Do not pay again/);assert.equal(api.rows[2][11],'Pending');
  api.allowUpdate();assert.equal(api.post(proof).row,order.row);assert.equal(api.rows.length,3);assert.equal(api.calls.filter(c=>c.url.endsWith('/orders')).length,1);
});
test('lost acknowledgement after a Verified write recovers through the same row',()=>{
  const api=backend({failVerifiedFlush:true});api.create();assert.equal(api.post(proof).ok,false);assert.equal(api.rows[2][11],'Verified');const result=api.post(proof);assert.equal(result.ok,true);assert.equal(result.duplicate,true);assert.equal(api.rows.length,3);
});
test('verification does not require reformatting typed columns',()=>{const api=backend();api.create();api.rejectFormatting();assert.equal(api.post(proof).ok,true);});
test('duplicate order rows and reused Payment IDs cannot be silently accepted',()=>{
  const duplicate=backend();duplicate.create();duplicate.rows.push(duplicate.rows[2].slice());assert.equal(duplicate.post(proof).ok,false);
  const reused=backend();reused.create();reused.rows[1][15]='pay_test';assert.equal(reused.post(proof).ok,false);assert.equal(reused.rows[2][11],'Pending');
});
test('a missing order row never causes verification to create a replacement registration',()=>{const api=backend();api.create();api.rows.splice(2,1);const count=api.rows.length;assert.equal(api.post(proof).ok,false);assert.equal(api.rows.length,count);});
test('frontend helper and supplied backend agree on the rupee/paise and verification contracts',async()=>{
  const api=backend({gap:true}),frontend={};
  vm.runInNewContext(ts.transpileModule(readFileSync(__dirname+'/../src/lib/workshopPayment.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:frontend,setTimeout,clearTimeout,AbortController,Error,TypeError,SyntaxError,fetch:async(_,options)=>{const result=api.post(JSON.parse(options.body));return {ok:true,type:'cors',json:async()=>result};}});
  const form={...frontend.initialRegistration,name:registration.name,email:registration.email,phone:'9876543210',gender:registration.gender,experience:registration.experience,mainGoal:registration.goal};
  const order=await frontend.createWorkshopOrder({registration:form,amount:'500'});assert.equal(order.amount,50000);assert.equal(api.rows[1][11],'Pending');const receipt={razorpay_order_id:'order_test',razorpay_payment_id:'pay_test',razorpay_signature:signature};assert.equal(await frontend.verifyWorkshopPayment(receipt,order.amount),500);assert.equal(api.rows[1][11],'Verified');assert.equal(api.rows.length,3);
});

const pngProof = {mimeType:'image/png',base64:Buffer.from([137,80,78,71,13,10,26,10]).toString('base64')};

test('saved Web and App links preserve every emoji, Tamil text and URL-sensitive characters',()=>{
  const api=backend();api.create();api.post(proof);
  const message=api.context.buildConfirmationMessage_(registration.name,500,registration.course);
  assert.deepEqual(api.richLinks.map(link=>link.label),['WhatsApp Web','WhatsApp App']);
  for(const link of api.richLinks) {
    const url=new URL(link.url);
    assert.equal(url.searchParams.get('phone'),registration.phone);
    assert.equal(url.searchParams.get('text'),message);
    assert.equal(link.url.includes('%EF%BF%BD'),false);
    for(const point of [0x1F389,0x1F496,0x2705,0x1F484,0x2728,0x1F4DA,0x1F4C5,0x1F310,0x1F5E3,0x1F4B0,0x1F4CC,0x2764]) assert.ok(url.searchParams.get('text').includes(String.fromCodePoint(point)));
  }
  const text='தமிழ் & + # %\n'+String.fromCodePoint(0x1F389,0x2764,0xFE0F);
  const links=api.context.buildWhatsAppLinks_(registration.phone,text);
  for(const link of Object.values(links)) assert.equal(new URL(link).searchParams.get('text'),text);
  assert.throws(()=>api.context.buildWhatsAppLinks_(registration.phone,'Broken \uFFFD'),/damaged text/);
  assert.equal(api.context.testWhatsAppEmojiEncoding().linksPreserveMessage,true);
});

test('rebuilding old links repairs URLs and preserves sent confirmations and registration details',()=>{
  const api=backend();api.create();api.post(proof);
  api.rows[2][12]='Confirmation Sent';api.rows[2][13]='https://wa.me/919876543210?text=%EF%BF%BD';
  const before=api.rows[2].slice();
  api.context.rebuildVerifiedLinks();
  assert.equal(new URL(api.rows[2][13]).searchParams.get('text'),api.context.buildConfirmationMessage_(registration.name,500,registration.course));
  before.forEach((value,index)=>{if(index!==13)assert.equal(api.rows[2][index],value);});
});
test('uploaded proof is stored in Drive and its URL is confirmed in K before Checkout',()=>{
  const api=backend(); const order=api.create(500,pngProof);
  assert.equal(order.ok,true);assert.equal(order.paymentProofSaved,true);
  assert.equal(api.files.length,1);assert.equal(api.files[0].mimeType,'image/png');
  assert.equal(api.rows[2][10],'https://drive.google.com/file/d/proof_test/view');
  assert.equal(api.rows[2][11],'Pending');
  const before=api.rows[2].slice(0,11);assert.equal(api.post(proof).verified,true);
  assert.deepEqual(api.rows[2].slice(0,11),before);assert.equal(api.rows.length,3);
});
test('invalid file content, missing Drive setup and failed uploads cannot open Checkout',()=>{
  for(const [options,upload] of [[{}, {mimeType:'text/html',base64:pngProof.base64}], [{}, {mimeType:'application/pdf',base64:pngProof.base64}], [{}, {mimeType:'image/png',base64:'invalid%'}], [{noProofFolder:true},pngProof], [{driveFails:true},pngProof]]) {
    const api=backend(options); const result=api.create(500,upload);
    assert.equal(result.ok,false);assert.equal(api.calls.length,0);assert.equal(api.rows.length,2);
  }
});
test('a missing proof URL in K is never acknowledged as an uploaded registration',()=>{
  const api=backend({dropProof:true});const result=api.create(500,pngProof);
  assert.equal(result.ok,false);assert.notEqual(result.paymentProofSaved,true);assert.equal(api.calls.length,0);
});
test('proof setup records a private folder without changing Sheet data or creating orders',()=>{
  const api=backend({noProofFolder:true});const report=api.context.setupWorkshopProofUploads();
  assert.equal(report.ready,true);assert.equal(api.properties.get('WORKSHOP_PROOF_FOLDER_ID'),'proof_folder');
  assert.equal(JSON.stringify(api.rows),api.original);assert.equal(api.calls.length,0);assert.equal(api.files.length,0);
});

test('previously saved courses can finish verification but cannot create new registrations',()=>{
  for(const course of ['Full 2-day masterclass','Muhurtham Look (Day 1)','Reception Look (Day 2)']) {
    const remoteOrder={};const api=backend({order:remoteOrder});api.create();
    api.rows[2][14]=course;
    const saved=api.context.registrationFromSheetRow_(api.sheet,3);
    remoteOrder.notes={...JSON.parse(api.calls[0].request.payload).notes,course,registration_hash:api.context.registrationHash_(saved)};
    assert.equal(api.post(proof).verified,true);assert.equal(api.rows[2][14],course);assert.equal(api.rows.length,3);
    const fresh=backend();const result=fresh.post({action:'create_order',amount:500,registration:{...registration,course}});
    assert.equal(result.code,'VALIDATION_ERROR');assert.equal(fresh.calls.length,0);
  }
});
