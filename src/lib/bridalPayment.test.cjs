const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const {readFileSync}=require('node:fs');
const ts=require('typescript');
class WorkshopApiError extends Error { constructor(code) { super('Unknown registration action. (UNKNOWN_ACTION)');this.diagnostics={code}; } }
function client(response) {
  const api={},calls=[];
  vm.runInNewContext(ts.transpileModule(readFileSync(__dirname+'/bridalPayment.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:api,require:()=>({WorkshopApiError,postWorkshopAction:async request=>{calls.push(request);if(response instanceof Error)throw response;return response;}})});
  return {api,calls};
}
const booking={name:'Bride',email:'bride@example.com',phone:'9876543210',eventDate:'2027-01-25',session:'Muhurtham'};
const order={bookingSaved:true,orderId:'order_bridal',keyId:'rzp_test_123',amount:200000,currency:'INR'};
const proof={razorpay_order_id:'order_bridal',razorpay_payment_id:'pay_bridal',razorpay_signature:'a'.repeat(64)};
test('older deployed backends show a clear unavailable message and protect charged customers',async()=>{
  const {api}=client(new WorkshopApiError('UNKNOWN_ACTION'));
  await assert.rejects(api.createBridalOrder(booking,'request-test-12345678'),/Bridal payments are temporarily unavailable/);
  await assert.rejects(api.verifyBridalPayment(proof),/Do not pay again/);
});
test('bridal checkout requires the saved server order with exact INR advance',async()=>{
  const {api,calls}=client(order);assert.equal((await api.createBridalOrder(booking,'request-test-12345678')).amount,200000);assert.equal(calls[0].action,'create_bridal_order');
  for(const changed of [{bookingSaved:false},{amount:2000},{currency:'USD'},{orderId:'invalid'},{keyId:'invalid'}]) {
    await assert.rejects(client({...order,...changed}).api.createBridalOrder(booking,'request-test-12345678'));
  }
});
test('bridal verification cannot accept a generic success or a different payment',async()=>{
  const result={verified:true,saved:true,amount:200000,currency:'INR',orderId:'order_bridal',paymentId:'pay_bridal'};
  const {api,calls}=client(result);await api.verifyBridalPayment(proof);assert.equal(calls[0].action,'verify_bridal_payment');assert.equal(calls[0].signature,proof.razorpay_signature);assert.equal(calls[0].booking,undefined);
  for(const changed of [{verified:false},{saved:false},{amount:2000},{currency:'USD'},{paymentId:'pay_other'},{orderId:'order_other'}]) await assert.rejects(client({...result,...changed}).api.verifyBridalPayment(proof));
});
