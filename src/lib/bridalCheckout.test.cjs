const {test}=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const {readFileSync}=require('node:fs');const ts=require('typescript');
const compile=name=>ts.transpileModule(readFileSync(__dirname+'/'+name,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const enquiry={};vm.runInNewContext(compile('bridalEnquiry.ts'),{exports:enquiry,URL});
const booking={name:'Bride',email:'bride@example.com',phone:'9876543210',venue:'Chennai',days:[{eventDate:'2027-01-25',session:'Reception'}]};
const order={ok:true,orderId:'order_bridal',keyId:'rzp_test_123',amount:200000,currency:'INR'};
const receipt={proof:{razorpay_order_id:'order_bridal',razorpay_payment_id:'pay_bridal',razorpay_signature:'a'.repeat(64)},amount:200000,verified:false};
class WorkshopApiError extends Error{constructor(code){super('Server error');this.diagnostics={code};}}
function client(response){const api={},calls=[],storage=new Map();vm.runInNewContext(compile('bridalCheckout.ts'),{exports:api,sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},require:path=>path==='./bridalEnquiry'?enquiry:path==='./bridalAvailability'?{BRIDAL_AVAILABILITY_API_URL:'https://example.com/api'}:{WorkshopApiError,postWorkshopAction:async(payload,url)=>{calls.push({payload,url});if(response instanceof Error)throw response;return response;}}});return{api,calls,storage};}
test('older deployments explain checkout is unavailable without exposing internal action codes',async()=>{
 const {api,calls}=client(new WorkshopApiError('UNKNOWN_ACTION'));
 await assert.rejects(()=>api.createBridalCheckout(booking),/Payment has not started/);assert.equal(calls.length,1);
 const offline=new Error('Connection unavailable');await assert.rejects(()=>client(offline).api.createBridalCheckout(booking),/Connection unavailable/);
});
test('checkout validates fixed amount, currency, order and key before SDK opens',async()=>{
 const {api,calls}=client(order);assert.equal((await api.createBridalCheckout(booking)).amount,200000);assert.equal(calls[0].payload.action,'create_bridal_checkout');assert.equal(calls[0].payload.amount,undefined);
 for(const change of [{amount:1},{currency:'USD'},{orderId:'bad'},{keyId:'secret'},{ok:false}])await assert.rejects(()=>client({...order,...change}).api.createBridalCheckout(booking));
 await assert.rejects(()=>api.createBridalCheckout({...booking,phone:'bad'}));assert.equal(calls.length,1);
});
test('verification checks backend acknowledgement and never creates another order',async()=>{
 const data={ok:true,verified:true,orderId:'order_bridal',paymentId:'pay_bridal',amount:200000,currency:'INR'};
 const {api,calls}=client(data);await api.verifyBridalCheckout(receipt);assert.equal(calls[0].payload.action,'verify_bridal_checkout');
 for(const change of [{verified:false},{amount:1},{paymentId:'pay_other'},{orderId:'order_other'},{currency:'USD'}])await assert.rejects(()=>client({...data,...change}).api.verifyBridalCheckout(receipt));
});
test('signed receipts survive reload for verification-only recovery',()=>{
 const {api,storage}=client(order);api.storeBridalCheckoutReceipt(receipt);assert.equal(api.readBridalCheckoutReceipt().proof.razorpay_payment_id,'pay_bridal');
 api.storeBridalCheckoutReceipt({...receipt,verified:true});assert.equal(api.readBridalCheckoutReceipt().verified,false);
 storage.set('sk-bridal-checkout-receipt-v1',JSON.stringify({...receipt,proof:{...receipt.proof,razorpay_signature:'bad'}}));assert.equal(api.readBridalCheckoutReceipt(),null);
});
