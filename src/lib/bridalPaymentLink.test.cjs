const {test}=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const {readFileSync}=require('node:fs');const ts=require('typescript');
const compile=path=>ts.transpileModule(readFileSync(__dirname+'/'+path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const enquiry={};vm.runInNewContext(compile('bridalEnquiry.ts'),{exports:enquiry,URL});
class WorkshopApiError extends Error{constructor(code){super('Server error');this.diagnostics={code};}}
const endpoint='https://script.google.com/macros/s/availability/exec';
function client(response){const api={},calls=[];vm.runInNewContext(compile('bridalPaymentLink.ts'),{exports:api,URL,require:path=>path==='./bridalEnquiry'?enquiry:path==='./bridalAvailability'?{BRIDAL_AVAILABILITY_API_URL:endpoint}:{WorkshopApiError,postWorkshopAction:async(payload,url)=>{calls.push({payload,url});if(response instanceof Error)throw response;return response;}}});return{api,calls};}
const booking={name:'Bride',email:'bride@example.com',phone:'9876543210',venue:'Chennai',days:[{eventDate:'2027-01-25',session:'Reception'}]};
const response={ok:true,paymentLinkId:'plink_example',url:'https://rzp.io/i/example',amount:200000,currency:'INR',status:'created',amountPreset:true};
test('client requests an API payment link without sending an editable payment amount',async()=>{
 const {api,calls}=client(response);assert.equal((await api.createBridalPaymentLink(booking)).amount,200000);
 assert.equal(calls[0].url,endpoint);assert.equal(calls[0].payload.action,'create_bridal_payment_link');assert.equal(calls[0].payload.amount,undefined);assert.equal(calls[0].payload.detailsSent,true);
});
test('client checks exact day-count amount, status, currency and provider URL before payment',async()=>{
 for(const change of [{amount:2000},{currency:'USD'},{status:'paid'},{amountPreset:false},{ok:false},{url:'https://example.com/pay'},{url:'http://rzp.io/i/example'},{paymentLinkId:'wrong'}])await assert.rejects(()=>client({...response,...change}).api.createBridalPaymentLink(booking));
 for(const count of [2,3]){
  const details={...booking,days:Array.from({length:count},(_,i)=>({eventDate:'2027-01-'+(25+i),session:'Reception'}))};
  const amount=count===2?300000:400000;assert.equal((await client({...response,amount}).api.createBridalPaymentLink(details)).amount,amount);
 }
});
test('invalid booking details never send a payment request',async()=>{
 const {api,calls}=client(response);await assert.rejects(()=>api.createBridalPaymentLink({...booking,days:[]}));assert.equal(calls.length,0);
});
test('an older deployment gives a clear update-needed error without falling back to a zero-amount page',async()=>{
 await assert.rejects(()=>client(new WorkshopApiError('UNKNOWN_ACTION')).api.createBridalPaymentLink(booking),/connection needs an update/);
});
