// Checks actual rendered frames through Edge's DevTools connection.
const { createServer } = require('node:http');
const { readFileSync, existsSync, mkdtempSync } = require('node:fs');
const { resolve, join, extname, sep } = require('node:path');
const { tmpdir } = require('node:os');
const { spawn } = require('node:child_process');
const browser = process.argv[2];
if (!browser) throw Error('Pass an installed Edge or Chrome executable.');
const root = resolve(__dirname, '../dist');
const server = createServer((request, response) => {
  const path = resolve(root, '.' + new URL(request.url, 'http://localhost').pathname);
  if (path.startsWith(root + sep) && existsSync(path) && extname(path)) {
    response.setHeader('Content-Type', ({ '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' })[extname(path)] || 'application/octet-stream');
    response.end(readFileSync(path));
  } else { response.setHeader('Content-Type', 'text/html'); response.end(readFileSync(join(root, 'index.html'))); }
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const child = spawn(browser, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${mkdtempSync(join(tmpdir(), 'sk-package-scroll-'))}`, 'about:blank'], { windowsHide: true });
  let socket;
  const watchdog = setTimeout(() => { child.kill(); server.close(); process.exitCode = 1; console.error('Package scroll browser check timed out.'); }, 45000);
  try {
    const port = await new Promise((resolve, reject) => {
      let stderr = '';
      child.once('error', reject);
      child.stderr.on('data', chunk => { stderr += chunk; const match = stderr.match(/DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)/); if (match) resolve(Number(match[1])); });
    });
    const tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    socket = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
    let id = 0;
    const pending = new Map();
    socket.addEventListener('message', event => { const message = JSON.parse(event.data); const task = pending.get(message.id); if (task) { pending.delete(message.id); message.error ? task.reject(Error(message.error.message)) : task.resolve(message.result); } });
    const command = (method, params = {}) => new Promise((resolve, reject) => { const next = ++id; pending.set(next, { resolve, reject }); socket.send(JSON.stringify({ id: next, method, params })); });
    const evaluate = async expression => { const result = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text); return result.result.value; };
    await command('Emulation.setDeviceMetricsOverride', { width: 403, height: 682, deviceScaleFactor: 1, mobile: true });
    await command('Page.navigate', { url: `http://127.0.0.1:${server.address().port}/packages` });
    await evaluate(`new Promise((resolve,reject)=>{const timer=setInterval(()=>{if(document.querySelectorAll('[data-package-id]').length===3){clearInterval(timer);resolve(true);}},40);setTimeout(()=>{clearInterval(timer);reject(Error('Package cards did not load'));},8000);})`);
    const results = await evaluate(`(async()=>{
      const results=[];
      const wait=async fn=>{for(let i=0;i<120;i++){if(fn())return;await new Promise(resolve=>setTimeout(resolve,40));}throw Error('Highlight update timed out');};
      const cards=[...document.querySelectorAll('[data-package-id]')];
      const show=async id=>{
        const card=document.getElementById('package-'+id);
        card.scrollIntoView({block:'start',behavior:'instant'});
        await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
        await wait(()=>card.dataset.active==='true');
        if(!card.classList.contains('bg-chocolate')||cards.filter(item=>item.dataset.active==='true').length!==1)throw Error('Expected only package '+id+' to be dark');
        results.push('Package '+id+' is the only dark card after scrolling');
      };
      for(const id of [1,2,3,2,1])await show(id);
      cards[0].querySelector('button[aria-expanded]').click();
      await wait(()=>cards[0].querySelector('button[aria-expanded]').getAttribute('aria-expanded')==='true');
      await show(3);
      results.push('Highlighting follows expanded card heights');
      return results;
    })()`);
    await command('Emulation.setDeviceMetricsOverride', { width: 1365, height: 900, deviceScaleFactor: 1, mobile: false });
    const desktop = await evaluate(`(async()=>{
      const wait=async fn=>{for(let i=0;i<120;i++){if(fn())return;await new Promise(resolve=>setTimeout(resolve,40));}throw Error('Desktop selection timed out');};
      const cards=[...document.querySelectorAll('[data-package-id]')];
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      cards[0].dispatchEvent(new PointerEvent('pointerover',{bubbles:true,pointerType:'mouse',relatedTarget:document.body}));
      await wait(()=>cards[0].dataset.active==='true');
      cards[0].dispatchEvent(new PointerEvent('pointerout',{bubbles:true,pointerType:'mouse',relatedTarget:document.body}));
      cards[2].click();await wait(()=>cards[2].dataset.active==='true');
      return 'Desktop hover and click work after resizing from mobile';
    })()`);
    const cardMotion = await evaluate(`(async()=>{
      const wait=async fn=>{for(let i=0;i<120;i++){if(fn())return;await new Promise(resolve=>setTimeout(resolve,40));}throw Error('Card motion state did not update');};
      const wrapper=document.querySelector('[data-advance-card]');
      const card=wrapper.querySelector('[data-advance-card-motion]');
      const button=wrapper.querySelector('[data-bridal-availability-trigger]');
      wrapper.scrollIntoView({block:'center',behavior:'instant'});
      document.activeElement?.blur();
      await wait(()=>getComputedStyle(card).animationPlayState==='running');
      const firstPose=getComputedStyle(card).transform;
      const firstRect=button.getBoundingClientRect();
      await new Promise(resolve=>setTimeout(resolve,300));
      const moved=button.getBoundingClientRect();
      if(getComputedStyle(card).transform===firstPose||Math.abs(firstRect.top-moved.top)+Math.abs(firstRect.left-moved.left)<.05)throw Error('Whole-card motion is not visible');
      const content=wrapper.querySelector('p');
      content.dispatchEvent(new PointerEvent('pointerover',{bubbles:true,pointerType:'mouse',relatedTarget:document.body}));
      await wait(()=>getComputedStyle(card).animationPlayState==='paused');
      for(const selector of ['.advance-card-ground-shadow','.advance-card-aura']){
        if(getComputedStyle(wrapper.querySelector(selector)).animationPlayState!=='paused')throw Error('Decorative motion did not pause: '+selector);
      }
      if(getComputedStyle(wrapper.querySelector('.advance-card-sheen'),'::after').animationPlayState!=='paused')throw Error('Gold sheen did not pause');
      if(getComputedStyle(card).transformStyle!=='preserve-3d'||!wrapper.querySelector('.advance-card-depth'))throw Error('Layered depth is missing');
      const frozen=button.getBoundingClientRect();
      await new Promise(resolve=>setTimeout(resolve,200));
      const still=button.getBoundingClientRect();
      if(Math.abs(frozen.top-still.top)+Math.abs(frozen.left-still.left)>.01)throw Error('Hovered card controls moved');
      content.dispatchEvent(new PointerEvent('pointerout',{bubbles:true,pointerType:'mouse',relatedTarget:document.body}));
      await wait(()=>getComputedStyle(card).animationPlayState==='running');
      button.click();
      await wait(()=>document.querySelector('dialog[open] [aria-label="Close availability form"]'));
      const availabilityDialog=document.querySelector('dialog[open]');
      const box=availabilityDialog.getBoundingClientRect();
      await new Promise(resolve=>setTimeout(resolve,200));
      const later=availabilityDialog.getBoundingClientRect();
      if(Math.abs(box.top-later.top)+Math.abs(box.left-later.left)>.01)throw Error('Availability dialog moves with the card');
      const bookingDialog=document.querySelector('dialog[open]');
      const date=document.getElementById('availability-date-0');
      date.nextElementSibling.click();
      await wait(()=>bookingDialog.querySelector('[data-date]:not(:disabled)'));
      bookingDialog.querySelector('[data-date]:not(:disabled)').click();
      await wait(()=>!bookingDialog.querySelector('[data-date]'));
      date.nextElementSibling.click();
      await wait(()=>bookingDialog.querySelector('[data-date][aria-pressed="true"]'));
      const chosen=bookingDialog.querySelector('[data-date][aria-pressed="true"]');
      await wait(()=>document.activeElement===chosen);
      chosen.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));
      await wait(()=>document.activeElement?.hasAttribute('data-date')&&document.activeElement.dataset.date!==chosen.dataset.date);
      bookingDialog.querySelector('[aria-label="Close availability form"]').click();
      return 'Whole card visibly moves, pauses on hover, and keeps the availability dialog and calendar keyboard navigation stable';
    })()`);
    await evaluate("document.querySelector('[data-bridal-availability-trigger]').focus({preventScroll:true})");
    await command('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
    await command('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
    await evaluate(`new Promise((resolve,reject)=>{const timer=setInterval(()=>{if(getComputedStyle(document.querySelector('[data-advance-card-motion]')).animationPlayState==='paused'){clearInterval(timer);resolve(true);}},40);setTimeout(()=>{clearInterval(timer);reject(Error('Keyboard focus did not pause the card'));},3000);})`);
    // With one card action, Tab can scroll to the next section. Keep the card
    // visible when checking that leaving keyboard focus resumes its animation.
    await evaluate("document.querySelector('[data-package-id] button').focus({preventScroll:true}); document.querySelector('[data-advance-card]').scrollIntoView({block:'center',behavior:'instant'})");
    await evaluate(`new Promise((resolve,reject)=>{const timer=setInterval(()=>{if(getComputedStyle(document.querySelector('[data-advance-card-motion]')).animationPlayState==='running'){clearInterval(timer);resolve(true);}},40);setTimeout(()=>{clearInterval(timer);reject(Error('Leaving keyboard focus did not resume the card: '+JSON.stringify({active:document.activeElement?.outerHTML?.slice(0,150),paused:document.querySelector('[data-advance-card]').dataset.motionPaused,dialogs:document.querySelectorAll('dialog[open]').length})));},3000);})`);
    await command('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    const reducedMotion = await evaluate(`new Promise((resolve,reject)=>{setTimeout(()=>{getComputedStyle(document.querySelector('[data-advance-card-motion]')).animationName==='none'?resolve('Reduced-motion preference disables the card loop'):reject(Error('Reduced-motion preference was ignored'));},100);})`);
    console.log(JSON.stringify([...results, desktop, cardMotion, 'Real Tab-key focus pauses the card and leaving it resumes motion', 'Depth, gold sheen and floating shadow share the hover pause', reducedMotion]));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
  finally { clearTimeout(watchdog); socket?.close(); child.kill(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error.message); server.close(); process.exitCode = 1; });
