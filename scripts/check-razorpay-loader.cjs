// Loads the official Checkout script in a clean browser without creating an
// order, opening Checkout, charging a payment, or saving a registration.
const { createServer } = require('node:http');
const { readFileSync, mkdtempSync, existsSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { spawn } = require('node:child_process');
const ts = require('typescript');

const browser = process.argv[2];
if (!browser) throw new Error('Pass the installed Edge/Chrome executable path.');
const helper = ts.transpileModule(readFileSync(join(__dirname, '../src/lib/workshopPayment.ts'), 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ES2020 },
}).outputText;
const html = `<!doctype html><html><body><pre id="result">pending</pre><script type="module">
import { loadCheckout } from '/payment.js';
const start = performance.now();
try {
 await loadCheckout();
 document.getElementById('result').textContent = JSON.stringify({loaded: typeof window.Razorpay === 'function', milliseconds: Math.round(performance.now() - start)});
 document.body.dataset.state = typeof window.Razorpay === 'function' ? 'passed' : 'failed';
} catch(error) {
 document.getElementById('result').textContent = JSON.stringify({loaded: false, error: error.message, milliseconds: Math.round(performance.now() - start)});
 document.body.dataset.state = 'failed';
}
</script></body></html>`;

const server = createServer((request, response) => {
  response.setHeader('Content-Type', request.url === '/payment.js' ? 'application/javascript' : 'text/html');
  response.end(request.url === '/payment.js' ? helper : html);
});
server.listen(0, '127.0.0.1', async () => {
  const url = `http://127.0.0.1:${server.address().port}`;
  const profile = mkdtempSync(join(tmpdir(), 'sk-workshop-cors-'));
  // Use real wall-clock time. Virtual time can expire the SDK timeout before
  // the browser has had time to complete an actual network request.
  const child = spawn(browser, ['--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  let launchError;
  child.on('error', error => { launchError = error; });
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  let socket;
  try {
    const portFile = join(profile, 'DevToolsActivePort');
    for (let attempt = 0; !existsSync(portFile) && attempt < 100; attempt++) {
      if (launchError) throw launchError;
      await delay(100);
    }
    const port = readFileSync(portFile, 'utf8').split('\n')[0].trim();
    const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    socket = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
    let id = 0;
    const pending = new Map();
    const requests = new Set();
    const network = [];
    socket.addEventListener('message', event => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const callback = pending.get(message.id);
        if (callback) { pending.delete(message.id); callback(message); }
      }
      const params = message.params;
      if (message.method === 'Network.requestWillBeSent' && params.request.url.startsWith('https://checkout.razorpay.com/')) requests.add(params.requestId);
      if (requests.has(params?.requestId)) {
        if (message.method === 'Network.responseReceived') network.push({ status: params.response.status, protocol: params.response.protocol });
        if (message.method === 'Network.loadingFailed') network.push({ error: params.errorText, blockedReason: params.blockedReason, canceled: params.canceled });
      }
    });
    const command = (method, params = {}) => new Promise((resolve, reject) => {
      const commandId = ++id;
      const timer = setTimeout(() => { pending.delete(commandId); reject(new Error(`Browser command timed out: ${method}`)); }, 5000);
      pending.set(commandId, message => { clearTimeout(timer); message.error ? reject(new Error(message.error.message)) : resolve(message.result); });
      socket.send(JSON.stringify({ id: commandId, method, params }));
    });
    await command('Network.enable');
    await command('Page.navigate', { url });
    let result;
    const started = Date.now();
    while (Date.now() - started < 40000) {
      await delay(500);
      const response = await command('Runtime.evaluate', { expression: 'JSON.stringify({state: document.body?.dataset.state, result: document.getElementById("result")?.textContent})', returnByValue: true });
      result = JSON.parse(response.result.value);
      if (result.state) break;
    }
    console.log(JSON.stringify({ browser: 'clean profile, real wall-clock timers', ...result, network }, null, 2));
    process.exitCode = result?.state === 'passed' ? 0 : 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    socket?.close();
    child.kill();
    server.close();
  }
});
