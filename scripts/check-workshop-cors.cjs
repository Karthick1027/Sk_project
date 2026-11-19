// Browser-only connectivity probe: deliberately invalid data cannot create an
// order or payment. Uses the actual frontend helper and ordinary browser CORS.
const { createServer } = require('node:http');
const { readFileSync, mkdtempSync } = require('node:fs');
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
import { WORKSHOP_API_URL, initialRegistration } from '/payment.js';
const results = [];
for (const payload of [
  { action: 'create_order', registration: { ...initialRegistration, goal: '' } },
  { action: 'verify_payment', orderId: '', paymentId: '', signature: '' },
]) {
  try {
    // Deliberately bypass local validation only in this connectivity probe.
    const response = await fetch(WORKSHOP_API_URL, {
      method: 'POST', mode: 'cors', redirect: 'follow', credentials: 'omit',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify(payload),
    });
    const data = await response.json();
    results.push({ action: payload.action, readable: response.ok && data.ok === false && typeof data.error === 'string', error: data.error || 'Unexpected server response' });
  } catch (error) {
    results.push({ action: payload.action, readable: false, error: error.message });
  }
}
document.getElementById('result').textContent = JSON.stringify(results);
document.body.dataset.state = results.every(result => result.readable) ? 'passed' : 'failed';
</script></body></html>`;

const server = createServer((request, response) => {
  response.setHeader('Content-Type', request.url === '/payment.js' ? 'application/javascript' : 'text/html');
  response.end(request.url === '/payment.js' ? helper : html);
});
server.listen(0, '127.0.0.1', () => {
  const url = `http://127.0.0.1:${server.address().port}`;
  const profile = mkdtempSync(join(tmpdir(), 'sk-workshop-cors-'));
  const child = spawn(browser, ['--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check', `--user-data-dir=${profile}`, '--dump-dom', '--timeout=45000', '--virtual-time-budget=30000', url], { windowsHide: true });
  let output = '';
  let diagnostics = '';
  child.stdout.on('data', chunk => { output += chunk; });
  child.stderr.on('data', chunk => { diagnostics += chunk; });
  const timeout = setTimeout(() => { child.kill(); server.close(); console.error('Browser CORS probe timed out.'); process.exitCode = 1; }, 55000);
  child.on('error', error => { console.error(error.message); clearTimeout(timeout); server.close(); process.exitCode = 1; });
  child.on('close', () => {
    clearTimeout(timeout);
    server.close();
    console.log(output.match(/<pre id="result">(.*?)<\/pre>/s)?.[1] || 'No browser response captured.');
    const passed = output.includes('data-state="passed"');
    console.log(`Browser CORS probe: ${passed ? 'PASSED' : 'FAILED / INCOMPLETE'}`);
    if (!passed) console.error(diagnostics.slice(-3000));
    process.exitCode = passed ? 0 : 1;
  });
});
