const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
const api={};
vm.runInNewContext(ts.transpileModule(readFileSync(__dirname+'/bridalEnquiry.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:api,URL});
const details={name:'Bride தமிழ் & Family',email:' BRIDE@example.com ',phone:'9876543210',days:[{eventDate:'2027-01-25',session:'Reception'}],venue:'Chennai + Hall #1'};
test('WhatsApp booking message includes all details, the studio number and typed advance instructions',()=>{
  const url=new URL(api.buildBridalEnquiryUrl(details));
  assert.equal(url.origin,'https://wa.me');assert.equal(url.pathname,'/918668038093');
  const message=url.searchParams.get('text');
  for(const value of [details.name,'bride@example.com','+91 9876543210','25/01/2027','Reception',details.venue,'1 day INR 2,000; 2 days INR 3,000; 3 days INR 4,000','pay 2000'])assert.ok(message.includes(value),value);
  assert.equal(message.includes('\uFFFD'),false);
  assert.equal(api.BRIDAL_PAYMENT_URL,'https://razorpay.me/@skbridalstudio');
});
test('invalid contact, date or session cannot generate a WhatsApp payment enquiry',()=>{
  for(const changed of [{name:' '},{email:'invalid'},{phone:'123'},{days:[{eventDate:'2027-02-31',session:'Reception'}]},{days:[{eventDate:'',session:'Reception'}]},{days:[{eventDate:'2027-01-25',session:'Invalid'}]},{venue:'x'.repeat(201)},{days:[]},{days:Array(4).fill(details.days[0])}]){
    assert.ok(Object.keys(api.validateBridalEnquiry({...details,...changed})).length);
    assert.throws(()=>api.buildBridalEnquiryUrl({...details,...changed}));
  }
});
test('venue is optional and every supported session can be sent',()=>{
  for(const session of api.BRIDAL_ENQUIRY_SESSIONS){
    assert.equal(Object.keys(api.validateBridalEnquiry({...details,days:[{...details.days[0],session}],venue:''})).length,0);
    assert.ok(new URL(api.buildBridalEnquiryUrl({...details,days:[{...details.days[0],session}],venue:''})).searchParams.get('text').includes('To be shared'));
  }
});

test('one, two and three days include every date/session and calculate the matching total advance',()=>{
  const days=[{eventDate:'2027-01-25',session:'Engagement'},{eventDate:'2027-01-26',session:'Muhurtham'},{eventDate:'2027-01-27',session:'Reception'}];
  for(const count of [1,2,3]){
    const booking={...details,days:days.slice(0,count)};
    const message=new URL(api.buildBridalEnquiryUrl(booking)).searchParams.get('text');
    const expected={1:2000,2:3000,3:4000}[count];
    assert.equal(api.bridalAdvanceTotal(booking),expected);
    assert.ok(message.includes('Number of days: '+count));assert.ok(message.includes('pay '+expected));
    booking.days.forEach((day,index)=>{assert.ok(message.includes('Day '+(index+1)+': '+day.eventDate.split('-').reverse().join('/')));assert.ok(message.includes(day.session));});
  }
});
test('every selected day needs its own valid date and session',()=>{
  const days=[details.days[0],{eventDate:'',session:'Reception'}];
  assert.ok(api.validateBridalEnquiry({...details,days})['eventDate-2']);
  assert.ok(api.validateBridalEnquiry({...details,days:[details.days[0],details.days[0]]})['eventDate-2']);
});

test('all booking durations use the common Razorpay link with manual amount entry',()=>{
  for(const count of [1,2,3]){
    const booking={...details,days:Array.from({length:count},()=>details.days[0])};
    const destination=api.bridalPaymentDestination(booking);
    assert.equal(destination.url,'https://razorpay.me/@skbridalstudio');assert.equal(destination.amountPreset,false);
  }
});
test('unsupported booking durations cannot produce a payment destination',()=>{
  for (const count of [0,4]) assert.throws(()=>api.bridalPaymentDestination({...details,days:Array.from({length:count},()=>details.days[0])}));
});
