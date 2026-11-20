# Workshop registration: Firebase Spark + Google Apps Script

The active payment backend is `google-apps-script/WorkshopRegistrations.gs`. Firebase is used for Hosting and the existing analytics setup only. No Cloud Functions, Secret Manager, paid Firebase services, or new spreadsheet/tab are used.

The amount is editable: INR 500 is the default suggestion, students may pay below or above it, and the minimum is INR 1. The chosen rupee amount must be a positive integer (no decimals). Checkout, verification, the pending row and the confirmation all use the chosen order amount.

## What was wrong

The repository's old Apps Script action handlers called Firebase Functions to create orders and verify/save payments. That was not a Spark-only backend. The old sheet helper also recreated a missing response tab and rewrote headers A-R, including the Google Form-owned columns A-K. Finally, using `getLastRow()` after a website append could update the wrong student's WhatsApp cell if Google Forms appended concurrently.

The deployed URL's old generic `ok: true` status only proved that a web app was reachable. It did not prove sheet permissions, credential configuration, payment verification, or saving. The updated status identifies the backend version and reports sheet access and whether credentials are configured. Live saving still needs the updated script to be deployed and a real Razorpay test-mode registration.

The later error “The registration server needs the Apps Script-only update before payments can be accepted” was produced by an extra frontend `backend`/`version` response check. The frontend was already POSTing directly to the configured Apps Script URL; this message did not establish that Firebase was being called. That check has been removed. Order responses require the documented public key, order ID, matching chosen amount and INR currency, plus the API's `ok: true` acknowledgement. The diagnostic backend/version labels are not prerequisites for opening Checkout. During local Vite Fast Refresh, the page clears obsolete development notices while retaining entered registration fields.

## Existing destination and column preservation

Spreadsheet: `1TdrQD7sq_uRgLkPoKwubH23QJY-reCejaNTVgvr3ows`

Existing tab: `Form Responses 1`

The script opens that exact spreadsheet and tab. If the tab is absent or inaccessible, Checkout is blocked; no replacement tab is created. Existing Google Form headers A-K and all existing response rows are preserved. Only blank L-R header cells are filled, and columns are extended to R in that same tab only if necessary.

| Column | Website value |
| --- | --- |
| A | Timestamp |
| B | Name |
| C | International phone (`91XXXXXXXXXX`) |
| D | Gender |
| E | Goal (`mainGoal` in React, `goal` in the API) |
| F | Question |
| G | Experience |
| H | Email |
| I | City |
| J | Blank score |
| K | Screenshot URL if supplied; otherwise blank |
| L | Pending before payment; Verified after capture |
| M | No before payment; Ready to Send after verification |
| N | Mobile-compatible WhatsApp confirmation link after verification |
| O | Exact selected course |
| P | Razorpay payment ID |
| Q | Razorpay order ID |
| R | Actual verified payment in rupees |

Before Checkout opens, the website registration is appended once with `Pending` in L, `No` in M, a blank P, the Razorpay order ID in Q, and the selected advance in R. The phone, payment ID and order ID cells are formatted as text. After capture, the exact row is located using Q and updated in place; A-K are not touched. Duplicate order IDs and payment IDs are rejected or return the already verified row rather than creating another registration. Google Forms continues to submit normally. The existing payment-status edit trigger and WhatsApp helpers remain available.

## Configure and deploy the existing Apps Script project

1. Open the existing spreadsheet and its Apps Script project. Replace the project code with the updated `google-apps-script/WorkshopRegistrations.gs`. Do not create a spreadsheet or response tab.
2. In Apps Script **Project Settings > Script properties**, set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`. Use Razorpay test credentials first. Enter secrets only in Script Properties; never in frontend code or chat. The old `WORKSHOP_API_TOKEN` is no longer used.
3. Run `setupWorkshopRegistration()` once as the spreadsheet owner. Authorize the script. It checks the exact destination and fills missing L-R headers without changing A-K. Its execution log reports readiness without printing secret values.
4. Choose **Deploy > Manage deployments**, edit the EXISTING web app deployment, select **New version**, and deploy. Set **Execute as: Me** (an account with edit access to this spreadsheet) and **Who has access: Anyone**. Reauthorize updated permissions if prompted.
5. Keep this existing endpoint:

   `https://script.google.com/macros/s/AKfycbydFnmOzR1QlMBNjcX5yy1BKVMW7ktNomOC7ZzhpKNyrDs3yrzfx43cgP8gp8ZwLzf5/exec`

   Use the web app `/exec` URL, not the library URL or a `/dev` URL.
6. Open that endpoint. The new response must identify `backend: "google-apps-script"`, `version: "workshop-spark-v3-sheet-pending"`, `sheet: "Form Responses 1"`, `sheetAccessible: true`, `credentialsConfigured: true`, `suggestedAmountRupees: 500`, `minimumAmountRupees: 1`, `currency: "INR"`, and `ok: true`. Configured credentials still need a successful Razorpay test to establish that they are valid. A generic or older version response means the updated source is not deployed at this URL.
7. Build and deploy Hosting only:

   ```sh
   npm run build
   firebase deploy --only hosting:skbridalstudio
   ```

`firebase.json` no longer configures Functions deployment. The `functions/` source remains as an archived reference and is not called by the active website. Do not deploy it or upgrade the project to Blaze for this flow.

## Server-side payment and save flow

`create_order` receives the nine registration fields and the chosen amount as a positive integer in rupees. Name, phone, email, gender, experience, goal and course are required; city and question are optional. The three allowed course names are unchanged. The server checks destination access, validates the chosen amount and converts it exactly to paise, fixes currency at INR, and calls Razorpay directly using Script Properties credentials. Before returning the order to the frontend, it writes a complete `Pending` row to the existing sheet and confirms the order ID, status and amount by reading the row back. Failure to persist the pending row blocks Checkout. New orders do not depend on Script Properties to retain student details; the sheet row is the durable source.

The frontend supplies the default 500 explicitly. A request missing its amount is rejected, rather than silently creating an INR 500 order.

```json
{"action":"create_order","amount":250,"registration":{"name":"Student","phone":"919876543210","email":"student@example.com","gender":"Female","experience":"Beginner","goal":"Learn bridal makeup","question":"","city":"Chennai","course":"Full 2-day masterclass"}}
```

Checkout uses only the validated returned `keyId`, `orderId`, `amount` and `currency`. The frontend requires a readable, successful JSON response with the matching chosen amount before opening it, without requiring extra backend/version metadata. Deploy the updated Apps Script before using editable amounts: an older fixed-price backend returning INR 500 for an INR 250 request is rejected before Checkout opens.

```json
{"action":"verify_payment","orderId":"order_example","paymentId":"pay_example","signature":"<Razorpay signature>"}
```

Apps Script verifies HMAC-SHA256 with its private Razorpay secret, fetches the order and payment from Razorpay, checks the pending row's course/registration hash, order ID, INR currency and raw numeric amount, and confirms captured status. Authorized payments are captured for the exact server-fetched order amount and fetched again before saving. Verification never trusts an amount supplied by the frontend. Invalid signatures, wrong amounts/currencies, failed capture or mismatched orders cannot mark a registration verified.

Only then does the script acquire its write lock, search both P and Q for duplicates, update L-R on the existing pending row, flush and read the values back. It stores the payment ID and order ID as text and R as numeric INR. Duplicate retries return the same verified row without appending. The response includes `{ "ok": true, "verified": true, "saved": true, "orderId": "order_…", "paymentId": "pay_…", "amount": 1000, "currency": "INR", "row": 123, "duplicate": false }` only after saving is confirmed. A failed sheet update returns `verified: true`, `saved: false`, `code: "REGISTRATION_SAVE_FAILED"`; the pending row and browser receipt remain available for retry without another charge. The public API has no append/mark-verified action and no legacy Firebase callback.

For an owner-run captured-payment recovery, pass a Payment ID to `recoverCapturedWorkshopPayment(paymentId)`. If running it from the Apps Script editor, set the temporary Script Property `WORKSHOP_RECOVERY_PAYMENT_ID` first because the editor does not supply function arguments. The helper fetches the payment from Razorpay to obtain its order ID, then verifies it again and updates the pending row found in Q. It does not accept registration details from the caller or create another payment.

## Errors and recovery

- `VALIDATION_ERROR` includes field errors; React displays them inline before Checkout.
- `CONFIG_ERROR` / `SHEET_NOT_FOUND` block order creation. Check Script Properties, the exact tab name, permissions and deployment owner.
- `PAYMENT_VERIFICATION_FAILED` blocks saving. Keep the receipt and retry verification without creating a new charge.
- `REGISTRATION_SAVE_FAILED` means payment was verified but sheet saving was not confirmed. The separate saving-failure dialog preserves form details and the receipt. Fix sheet access and retry the same payment. Never ask an already-charged student to pay again.
- If an older deployment never retained the original registration and neither a pending/verified sheet row nor the original Script Property exists, the payment can be authenticated but the student registration cannot be reconstructed safely. Do not charge again or invent details; locate the original registration from an authorized source and reconcile it manually.
- A legacy order can be retried without paying again when its server-side registration still contains the exact expected amount/currency and matches the original Razorpay order hash. New orders recover from the sheet first. Missing expected amounts are never replaced with an assumed INR 500 value.

For a saving failure, the response now includes `reference`, `saveStage` and `saveCause`. The matching owner-only Apps Script execution log retains the actual Google Sheets exception, stack and destination; the public response does not expose those details. Stages distinguish lock timeout (`acquire_lock`), tab/header preparation (`prepare_sheet`), duplicate lookup (`check_duplicate`), missing order registration (`load_registration`), append (`append_row`), flush (`flush_new_row`) and read-back (`read_back`). These diagnostics do not change verification rules or mark failures successful.

Run `diagnoseWorkshopSaving()` manually in the Apps Script editor for a read-only report of spreadsheet ID, actual sheet name/ID, last used row, column count and filter presence. The expected tab ID from the provided spreadsheet link is `1885927180`. This diagnostic does not create orders, payments, tabs or test registrations. A successful `setupEditTrigger()` run is not a website saving test.

Requests use `text/plain;charset=UTF-8`, CORS mode, omitted credentials and followed redirects. HTTP errors, unreadable/opaque responses, malformed JSON and backend errors never count as successful orders or registrations. A health response alone cannot confirm a saved registration.

The Razorpay Checkout script loads before an Apps Script order is created. If the CDN is unavailable, times out after 30 seconds, is blocked by a security policy, or fails to initialize, the form keeps its data and shows “Unable to Open Payment”. No order is created on that attempt. Retry removes the failed script and starts a fresh load. This is separate from payment verification or Sheets saving and does not require an Apps Script change. Use `node scripts/check-razorpay-loader.cjs "<installed Edge or Chrome executable>"` to check actual Checkout script loading without opening Checkout or creating orders/charges. A network/browser extension or security policy block must be resolved in the affected browser/network; the website does not bypass it or show false success.

## Checks and release QA

### Checkout diagnostic findings (20 November 2026)

The official `https://checkout.razorpay.com/v1/checkout.js` returned HTTP 200
and initialized `window.Razorpay` in approximately 9.3 seconds in a clean Edge
profile. The diagnostic now uses real wall-clock time and Chrome DevTools
Protocol network events, rather than virtual time. A failed sandbox network
probe is not evidence that the customer's browser or Razorpay is broken.

The deployed Web App health response separately reported `sheetAccessible:false`
because its older code requires R1 to be exactly `Advance Paid (INR)`. The local
Apps Script preserves every existing nonempty header and addresses column R by
position. Deploy that complete file to the existing Web App deployment to remove
the header-name restriction without renaming Google Form columns A-K.

The loader reports `SDK_LOAD_FAILED`, `SDK_OFFLINE`, `SDK_TIMEOUT`,
`SDK_CSP_BLOCKED`, `SDK_NOT_INITIALIZED`, or `SDK_INSERTION_BLOCKED`. A script
error alone cannot identify an extension, DNS, TLS or HTTP failure. In the
affected browser inspect the Network entry for `checkout.js` and the console's
`[Workshop payment]` events. Logs exclude registration data, signatures, key
secrets and raw API responses. No project CSP blocking Razorpay was found in
the HTML or Firebase Hosting configuration.

Opening errors use the gateway-unavailable dialog; actual `payment.failed`
events use the payment-failure dialog. Unchanged forms reuse their last order
within the mounted page after cancellation/opening failure/payment failure.
Once a receipt exists, retry only verifies that payment. Order reuse is not
persisted across page reloads. If a browser closes before receiving a payment
receipt, reconcile that payment in Razorpay before requesting another payment.

Both `rzp_test_` and `rzp_live_` public keys are accepted; the returned key is
passed directly to Checkout. Script Properties must contain the corresponding
key ID and secret from the same mode. This review did not access credentials
or create an authenticated live/test order, so it cannot confirm their pairing.

```sh
node --test google-apps-script/WorkshopRegistrations.test.cjs src/lib/workshopPayment.test.cjs src/lib/workshopCheckout.test.cjs
npx tsc -p tsconfig.app.json --noEmit
npm run build
node scripts/check-workshop-form.cjs "<installed Edge or Chrome executable>"
node scripts/check-workshop-cors.cjs "<installed Edge or Chrome executable>"
```

The Apps Script tests use realistic in-memory spreadsheet and Razorpay mocks: unchanged A-K headers and existing records, missing L-R headers, no new tabs, pending-row persistence, HMAC rejection, capture and amount/currency/order checks, in-place L-R update, save failures, lost responses, duplicate retries, property-free sheet recovery and concurrent Google Form append. Browser form tests mock payments and send no live registrations. The CORS probe sends only invalid requests and tests readable errors, not successful saving.

After deployment, submit one Google Form response and confirm existing data/headers remain intact. Then complete one website registration with Razorpay test credentials from the production origin using an amount below INR 500 and one above it. Verify the payment is captured and the website's row appears exactly once in the SAME `Form Responses 1` tab with the correct P/Q IDs and actual verified amount in R. Test cancellation, failed verification and a retry after saving failure. Confirm the page stays on Workshops and success appears only after verification plus saving. Switch to live credentials only after this passes.
