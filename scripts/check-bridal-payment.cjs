// Local browser checks with mocked Apps Script/Razorpay; no live orders or charges.
const {createServer}=require('node:http');
const {readFileSync,mkdtempSync,existsSync}=require('node:fs');
const {resolve,join,extname,sep}=require('node:path');
const {tmpdir}=require('node:os');
const {spawn}=require('node:child_process');
const browser=process.argv[2];if(!browser)throw Error('Pass an installed Edge/Chrome executable.');
const root=resolve(__dirname,'../dist');
const setup=`<script>
window.bridalQA={orders:0,verifications:0,failVerify:true};
window.bridalQA.opened=[];window.open=url=>{window.bridalQA.opened.push(String(url));return null;};
if(location.search.includes('recovery=1')) sessionStorage.setItem('sk-bridal-payment-receipt-v1',JSON.stringify({proof:{razorpay_order_id:'order_bridal',razorpay_payment_id:'pay_bridal',razorpay_signature:'a'.repeat(64)},verified:false}));
window.fetch=async(url,options)=>{
 const payload=JSON.parse(options.body),qa=window.bridalQA;
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
 open(){setTimeout(()=>this.options.handler({razorpay_order_id:'order_bridal',razorpay_payment_id:'pay_bridal',razorpay_signature:'a'.repeat(64)}),50);}
};
</script>`;
const checks=`<script>
(async()=>{
 const results=[];
 const wait=async(fn)=>{for(let i=0;i<150;i++){if(fn())return;await new Promise(r=>setTimeout(r,50));}throw Error('Timed out');};
 const check=(condition,label)=>{if(!condition)throw Error(label);results.push(label);};
 try{
 if(location.search.includes('recovery=1')){
  await wait(()=>[...document.querySelectorAll('button')].some(b=>b.textContent.includes('Retry Payment Verification')));
  check(!document.querySelector('a[data-bridal-payment-link]'),'Existing signed receipt does not offer another payment');
  [...document.querySelectorAll('button')].find(b=>b.textContent.includes('Retry Payment Verification')).click();
  await wait(()=>document.querySelector('dialog[open]'));
  [...document.querySelectorAll('dialog[open] button')].find(b=>b.textContent.includes('Retry Verification')).click();
  await wait(()=>document.querySelector('dialog[open] [role=alert]'));
  check(!document.querySelector('dialog[open]').textContent.includes('Payment verified'),'Failed recovery never claims payment success');
  window.bridalQA.failVerify=false;
  [...document.querySelectorAll('dialog[open] button')].find(b=>b.textContent.includes('Retry Verification')).click();
  await wait(()=>document.querySelector('dialog[open] h3')?.textContent==='Payment verified');
  check(window.bridalQA.orders===0 && window.bridalQA.verifications===2,'Old receipts retry verification without creating another order');
  check(document.querySelector('dialog[open]').textContent.includes('pay_bridal'),'Recovery shows the actual payment ID');
 }else{
 await wait(()=>document.querySelector('[data-bridal-booking-trigger]'));
 const pay=document.querySelector('[data-bridal-booking-trigger]');
 check(pay.disabled,'Pay is disabled until date availability acknowledgement');
 const card=document.querySelector('[style*="rotateX"]');
 const wrapper=document.querySelector('[data-advance-card]');
 check(getComputedStyle(wrapper.querySelector('[data-advance-card-motion]')).animationName==='advance-card-viewing','Card has a gentle viewing animation before interaction');
 const hit=async(element,label)=>{
  element.scrollIntoView({block:'center',behavior:'instant'});await new Promise(r=>setTimeout(r,80));
  const rect=element.getBoundingClientRect(),target=document.elementFromPoint(rect.left+rect.width/2,rect.top+rect.height/2);
  check(target && (target===element||element.contains(target)),label+' receives pointer hits');return target;
 };
 const contact=wrapper.querySelector('[data-bridal-availability-trigger]');
 let clickedLink='';wrapper.addEventListener('click',event=>{const anchor=event.target.closest('a');if(anchor){event.preventDefault();clickedLink=anchor.href;}});
 if(matchMedia('(hover: hover) and (pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches){
  const bounds=wrapper.getBoundingClientRect(),point={bubbles:true,pointerType:'mouse',clientX:bounds.left+bounds.width*.8,clientY:bounds.top+bounds.height*.2};
  const surface=wrapper.querySelector('p');
  const before=contact.getBoundingClientRect(),origin=wrapper.getBoundingClientRect();
  const buttonBefore={left:before.left-origin.left,top:before.top-origin.top};
  surface.dispatchEvent(new PointerEvent('pointermove',point));await wait(()=>Boolean(card.style.getPropertyValue('--ry')));
  const rotation=card.style.getPropertyValue('--ry');
  check(Math.abs(parseFloat(rotation)-2.4)<.01,'Hover uses a gentle bounded tilt ('+rotation+')');
  const after=contact.getBoundingClientRect(),updatedOrigin=wrapper.getBoundingClientRect();
  check(Math.abs(buttonBefore.left-(after.left-updatedOrigin.left))<.1 && Math.abs(buttonBefore.top-(after.top-updatedOrigin.top))<.1,'3D animation never moves the button hit target');
  for(let i=0;i<5;i++){surface.dispatchEvent(new PointerEvent('pointermove',point));await new Promise(r=>setTimeout(r,100));check(card.style.getPropertyValue('--ry')===rotation,'Stationary pointer does not change tilt '+i);}
  wrapper.dispatchEvent(new PointerEvent('pointerout',{bubbles:true,pointerType:'mouse',relatedTarget:document.body}));
  check(card.style.getPropertyValue('--ry')==='0deg','Card returns to neutral when pointer leaves');
 }
 (await hit(contact,'Availability button')).click();
 await wait(()=>document.querySelector('dialog[open] #availability-date-0'));
 const availabilityForm=document.querySelector('dialog[open] form');
 availabilityForm.requestSubmit();
 await wait(()=>document.getElementById('availability-date-0').getAttribute('aria-invalid')==='true');
 check(window.bridalQA.opened.length===0,'Availability requires an event date before opening WhatsApp');
 const fillAvailability=(id,value)=>{const el=document.getElementById(id);Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,value);el.dispatchEvent(new Event('input',{bubbles:true}));};
 fillAvailability('availability-date-0','25/01/2027');
 [...availabilityForm.querySelectorAll('button')].find(button=>button.textContent.includes('Add another event')).click();
 await wait(()=>document.getElementById('availability-date-1'));
 fillAvailability('availability-date-1','26/01/2027');
 fillAvailability('availability-venue','Chennai Hall');
 [...availabilityForm.querySelectorAll('button')].find(button=>button.textContent.includes('Add another event')).click();
 await wait(()=>document.getElementById('availability-date-2'));
 const removeEvent=availabilityForm.querySelector('[aria-label="Remove event 3"]');
 check(removeEvent.textContent.trim()==='' && getComputedStyle(removeEvent).position==='absolute','Remove event uses a compact icon at the card corner');
 (await hit(removeEvent,'Remove event icon')).dispatchEvent(new MouseEvent('click',{bubbles:true}));
 await wait(()=>!document.getElementById('availability-date-2'));
 check(document.getElementById('availability-date-0').value==='25/01/2027' && document.getElementById('availability-date-1').value==='26/01/2027','Removing an event preserves the other event dates');
 await new Promise(resolve=>setTimeout(resolve,80));
 availabilityForm.requestSubmit();
 await wait(()=>window.bridalQA.opened.length===1);
 const availabilityUrl=new URL(window.bridalQA.opened[0]);
 const availabilityMessage=availabilityUrl.searchParams.get('text');
 check(availabilityUrl.pathname==='/918668038093','Availability inquiry opens the studio WhatsApp number');
 check(availabilityMessage.includes('25/01/2027 - Muhurtham') && availabilityMessage.includes('26/01/2027 - Reception') && availabilityMessage.includes('Chennai Hall'),'Availability message includes both event dates, sessions and venue');
 check(availabilityMessage.startsWith('Hi *SK Bridal Studio* !') && availabilityMessage.includes('*Event 1* :') && availabilityMessage.includes('*Venue / city* : Chennai Hall'),'Availability message uses bold studio name and field labels');
 check(!availabilityMessage.includes(String.fromCharCode(10,10)),'Availability message uses compact single-line spacing');
 check(!availabilityMessage.includes('I have confirmed') && !availabilityMessage.includes('I will pay'),'Availability inquiry asks for confirmation without claiming approval or payment');
 check(pay.disabled,'Sending an availability inquiry does not enable payment');
 document.querySelector('[aria-label="Close availability form"]').click();
 window.bridalQA.opened=[];
 await wait(()=>wrapper.dataset.motionStopped==='true');
 check(getComputedStyle(wrapper.querySelector('[data-advance-card-motion]')).animationName==='none','First click stops the viewing animation');
 wrapper.querySelector('p').dispatchEvent(new PointerEvent('pointermove',{bubbles:true,pointerType:'mouse',clientX:100,clientY:100}));
 await new Promise(resolve=>setTimeout(resolve,80));
 check(card.style.getPropertyValue('--ry')==='0deg','Hover tilt stays stopped after clicking');
 (await hit(document.getElementById('bridal-availability-confirmed'),'Availability checkbox')).click();
 await wait(()=>!pay.disabled);
 (await hit(pay,'Pay button')).click();
 await wait(()=>document.querySelector('dialog[open] form'));
 check(!document.querySelector('a[data-bridal-payment-link]'),'Payment link is unavailable before booking details are sent');
 const form=document.querySelector('dialog[open] form');
 form.requestSubmit();await wait(()=>document.querySelector('#booking-name[aria-invalid=true]'));
 check(window.bridalQA.opened.length===0,'Empty form cannot open WhatsApp or payment');
 const dateField=document.getElementById('booking-eventDate');
 dateField.nextElementSibling.click();await wait(()=>document.querySelector('[data-date]'));
 const calendar=dateField.closest('div').parentElement;
 const month=calendar.querySelector('[aria-live=polite]').textContent;
 // Mobile browsers may blur the focused date with no relatedTarget before
 // delivering the arrow click. This must not dismiss the calendar.
 document.activeElement.dispatchEvent(new FocusEvent('focusout',{bubbles:true,relatedTarget:null}));
 await new Promise(resolve=>setTimeout(resolve,50));
 check(Boolean(calendar.querySelector('[aria-label="Next month"]')),'Mobile focus change does not close the calendar before an arrow tap');
 calendar.querySelector('[aria-label="Next month"]').click();
 await wait(()=>calendar.querySelector('[aria-live=polite]').textContent!==month);
 check(true,'Styled calendar supports month navigation');
 calendar.querySelector('[aria-label="Previous month"]').click();
 await wait(()=>calendar.querySelector('[aria-live=polite]').textContent===month);
 check(true,'Previous-month arrow works after touch-style focus changes');
 calendar.querySelector('[data-calendar-heading]').click();
 await wait(()=>calendar.querySelectorAll('[data-month]').length===12);
 check(true,'Clicking month/year heading opens the month selector');
 calendar.querySelector('[data-calendar-heading]').click();
 await wait(()=>calendar.querySelectorAll('[data-year]').length===12);
 const firstYear=calendar.querySelector('[data-year]').dataset.year;
 calendar.querySelector('[aria-label="Next 12 years"]').click();
 await wait(()=>calendar.querySelector('[data-year]').dataset.year!==firstYear);
 calendar.querySelector('[aria-label="Previous 12 years"]').click();
 await wait(()=>calendar.querySelector('[data-year]').dataset.year===firstYear);
 check(true,'Year selector navigates forward and backward through year ranges');
 const yearChoices=calendar.querySelectorAll('[data-year]'),chosenYear=yearChoices[yearChoices.length-1].dataset.year;
 yearChoices[yearChoices.length-1].click();await wait(()=>calendar.querySelector('[data-month]'));
 calendar.querySelector('[data-month="2"]').click();
 await wait(()=>calendar.querySelector('[data-date="'+chosenYear+'-03-01"]'));
 check(true,'Choosing a year and month opens that calendar directly');
 const dateButton=calendar.querySelector('[data-date]'),chosenDate=dateButton.dataset.date;
 dateButton.click();await wait(()=>!calendar.querySelector('[data-date]'));
 check(dateField.value===chosenDate.split('-').reverse().join('/'),'Calendar selection displays DD/MM/YYYY');
 dateField.nextElementSibling.click();await wait(()=>calendar.querySelector('[data-date]'));
 const selectedDay=calendar.querySelector('[aria-pressed=true]');
 check(Boolean(selectedDay),'Calendar highlights the selected date');
 selectedDay.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));
 await wait(()=>document.activeElement?.hasAttribute('data-date') && document.activeElement.dataset.date!==chosenDate);
 check(true,'Calendar supports arrow-key navigation');
 document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
 await wait(()=>!calendar.querySelector('[data-date]'));
 check(document.querySelector('dialog[open]').open,'Escape closes the calendar and keeps the booking form open');
 const input=(id,value)=>{const el=document.getElementById(id);Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,value);el.dispatchEvent(new Event('input',{bubbles:true}));};
 input('booking-name','Test Bride');input('booking-email','bride@example.com');input('booking-phone','9876543210');input('booking-eventDate','2027-01-25');input('booking-venue','Chennai Hall');
 await new Promise(r=>setTimeout(r,50));form.requestSubmit();
 await wait(()=>window.bridalQA.opened.length===1);
 const whatsapp=new URL(window.bridalQA.opened[0]),message=whatsapp.searchParams.get('text');
 check(whatsapp.origin==='https://wa.me' && whatsapp.pathname==='/918668038093','Form opens the studio WhatsApp number');
 for(const detail of ['Test Bride','bride@example.com','9876543210','25/01/2027','Muhurtham','Chennai Hall'])check(message.includes(detail),'WhatsApp message contains '+detail);
 check(message.startsWith(['*BRIDAL MAKEUP ADVANCE BOOKING:*','','*Name* : Test Bride'].join(String.fromCharCode(10))),'WhatsApp heading and field labels use bold formatting with spacing');
 check(message.includes(['*Number of days* : 1','','*Day 1* : 25/01/2027'].join(String.fromCharCode(10))),'First booking day is separated from customer details');
 check(message.includes(['*Session* : Muhurtham','','*Venue / City* : Chennai Hall'].join(String.fromCharCode(10))),'Venue is separated from the event schedule');
 check(message.includes(['*Total advance* : INR 2,000','','I will pay 2000'].join(String.fromCharCode(10))),'Payment instructions are separated from the bold advance label');
 check(document.querySelector('dialog[open]').textContent.includes('Tap Send in WhatsApp'),'UI asks the customer to send the prepared message');
 check(!document.querySelector('a[data-bridal-payment-link]'),'Opening WhatsApp alone does not enable payment');
 (await hit(document.getElementById('booking-details-sent'),'WhatsApp sent acknowledgement')).click();
 await wait(()=>document.querySelector('a[data-bridal-payment-link]'));
 const link=document.querySelector('a[data-bridal-payment-link]');
 check(link.textContent.trim()==='Pay','Sent details enable the concise Pay link');
 check(link.target==='_blank' && link.rel.includes('noopener'),'Razorpay opens safely in a new tab');
 (await hit(link,'Payment button')).click();
 check(clickedLink==='https://razorpay.me/@skbridalstudio','One session opens the common Razorpay link');
 check(document.querySelector('dialog[open]').textContent.includes('2000') && document.querySelector('dialog[open]').textContent.includes('as the amount on Razorpay'),'Customer is instructed to enter the selected advance');
 check(window.bridalQA.orders===0 && window.bridalQA.verifications===0,'Hosted payment link does not call Apps Script');
 check(document.querySelector('dialog[open]').textContent.includes('send the receipt'),'Customer is asked to share receipt for manual confirmation');
 document.querySelector('dialog[open] button[aria-label="Edit booking details"]').click();
 await wait(()=>document.querySelector('dialog[open] form'));
 check(!document.querySelector('a[data-bridal-payment-link]'),'Editing details resets the WhatsApp sent acknowledgement');
 const select=async(id,value)=>{const el=document.getElementById(id);el.click();await wait(()=>el.getAttribute('aria-expanded')==='true');const menu=document.getElementById(el.getAttribute('aria-controls'));menu.querySelector('[data-value="'+value+'"]').click();await wait(()=>el.getAttribute('aria-expanded')==='false');};
 await select('booking-days','3');
 await wait(()=>document.getElementById('booking-eventDate-3'));
 check(document.querySelector('dialog[open]').textContent.includes('Total advance: ₹4,000'),'Three selected days show INR 4,000 advance');
 document.querySelector('dialog[open] form').requestSubmit();
 await wait(()=>document.getElementById('booking-eventDate-2').getAttribute('aria-invalid')==='true');
 check(window.bridalQA.opened.length===1,'Missing dates on extra days prevent sending');
 input('booking-eventDate-2','2027-01-26');input('booking-eventDate-3','2027-01-27');await select('booking-session-2','Reception');await select('booking-session-3','Engagement');
 await new Promise(r=>setTimeout(r,50));document.querySelector('dialog[open] form').requestSubmit();
 await wait(()=>window.bridalQA.opened.length===2);
 const multiMessage=new URL(window.bridalQA.opened[1]).searchParams.get('text');
 for(const detail of ['*Number of days* : 3','26/01/2027','27/01/2027','Reception','Engagement','pay 4000'])check(multiMessage.includes(detail),'Multi-day WhatsApp message includes '+detail);
 check(multiMessage.includes(['*Session* : Muhurtham','','*Day 2* : 26/01/2027'].join(String.fromCharCode(10))),'Each booking day is separated by a blank line');
 document.getElementById('booking-details-sent').click();
 await wait(()=>document.querySelector('a[data-bridal-payment-link]'));
 check(document.querySelector('dialog[open]').textContent.includes('Total advance: ₹4,000'),'Multi-day payment summary shows the full advance');
 check(document.querySelector('a[data-bridal-payment-link]').href==='https://razorpay.me/@skbridalstudio','Three sessions open the common Razorpay link');
 document.querySelector('dialog[open] button[aria-label="Edit booking details"]').click();
 await wait(()=>document.getElementById('booking-days'));
 await select('booking-days','2');await wait(()=>!document.getElementById('booking-eventDate-3'));
 check(['26/01/2027','2027-01-26'].includes(document.getElementById('booking-eventDate-2').value),'Reducing days preserves the remaining schedule');
 document.querySelector('dialog[open] form').requestSubmit();await wait(()=>window.bridalQA.opened.length===3);
 const twoDayMessage=new URL(window.bridalQA.opened[2]).searchParams.get('text');
 check(twoDayMessage.includes('pay 3000') && !twoDayMessage.includes('27/01/2027'),'Two-day booking removes the third day and recalculates INR 3,000');
 document.getElementById('booking-details-sent').click();
 await wait(()=>document.querySelector('a[data-bridal-payment-link]'));
 check(document.querySelector('a[data-bridal-payment-link]').href==='https://razorpay.me/@skbridalstudio','Two sessions open the common Razorpay link');
 document.querySelector('button[aria-label="Close booking form"]').click();
 const confirmationText=wrapper.querySelector('label[for="bridal-availability-confirmed"] span');
 (await hit(confirmationText,'Confirmation label')).click();
 await wait(()=>!document.querySelector('a[data-bridal-payment-link]'));
 check(document.querySelector('[data-bridal-booking-trigger]').disabled,'Removing acknowledgement disables payment again');
 }
 document.body.dataset.qa='passed';
 }catch(error){results.push('FAILED: '+error.message);document.body.dataset.qa='failed';}
 const output=document.createElement('pre');output.id='qa-result';output.textContent=JSON.stringify(results);document.body.append(output);
})();
</script>`;
const html=readFileSync(join(root,'index.html'),'utf8').replace('<head>','<head>'+setup).replace('</body>',checks+'</body>');
const server=createServer((request,response)=>{
 const path=resolve(root,'.'+new URL(request.url,'http://localhost').pathname);
 if(path.startsWith(root+sep)&&existsSync(path)&&extname(path)){
  response.setHeader('Content-Type',({'.js':'application/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'})[extname(path)]||'application/octet-stream');response.end(readFileSync(path));
 }else{response.setHeader('Content-Type','text/html');response.end(html);}
});
server.listen(0,'127.0.0.1',()=>{
 const child=spawn(browser,['--headless','--disable-gpu','--no-first-run','--no-default-browser-check',`--window-size=${process.argv[3]||'375,812'}`,`--user-data-dir=${mkdtempSync(join(tmpdir(),'sk-bridal-payment-'))}`,'--dump-dom','--virtual-time-budget=15000',`http://127.0.0.1:${server.address().port}/packages${process.argv[4]==='recovery'?'?recovery=1':''}`],{windowsHide:true});
 let output='';child.stdout.on('data',chunk=>output+=chunk);child.stderr.resume();
 const timer=setTimeout(()=>child.kill(),45000);
 child.on('error',error=>{console.error(error);server.close();clearTimeout(timer);process.exitCode=1;});
 child.on('close',()=>{server.close();clearTimeout(timer);console.log(output.match(/<pre id="qa-result">(.*?)<\/pre>/s)?.[1]||'Browser checks did not complete.');process.exitCode=output.includes('data-qa="passed"')?0:1;});
});
