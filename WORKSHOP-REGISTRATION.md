# Workshop registration with manual payment review

The active backend is the complete file google-apps-script/WorkshopRegistrations.gs. The frontend uses src/lib/workshopPayment.ts, src/pages/Workshops.tsx and src/components/WorkshopPaymentDialog.tsx. Firebase is Hosting only; no Cloud Functions, Secret Manager or Blaze services are required.

## Business workflow

1. The customer fills the existing form and selects a whole-rupee advance (default INR 500, minimum INR 1).
2. React sends create_order with the validated registration and amount in rupees.
3. Apps Script first appends a complete Pending registration with a unique temporary registration reference in Q under a script lock. It flushes, locates the reference and reads all A-R values back. It never relies only on Script Properties for registration storage.
4. It then creates a Razorpay order with payment.capture = manual. Under a new lock it finds the saved registration by its unique reference, replaces only Q with the Razorpay order ID, flushes, locates the order again and verifies the complete row. If Razorpay fails, the already saved registration remains Pending. Contact the studio before retrying an order-after-save error to avoid another submission.
5. Only after successful persistence does it return ok: true, registrationSaved: true, verificationMode: manual, row, orderId, keyId, amount and currency. The response amount is paise.

   The currently deployed manual backend may instead return paymentVerification: MANUAL and saved: true. React accepts either manual-mode field (case-insensitive), while still requiring registrationSaved: true, a valid row and the exact paise amount. If both mode fields are present, both must say manual; an automatic or conflicting mode is rejected. This compatibility change does not require changing the working deployed Apps Script.
6. React checks that confirmation, row, manual mode, amount, currency and order fields before loading/opening Checkout. A failed save blocks Checkout. An SDK load failure occurs after the Pending registration has been saved.
7. Checkout completion shows Registration Saved / Pending manual review. It sends no verify_payment or payment-status request, stores no signature, and makes no automatic seat-confirmation claim.
8. Closing or failing Checkout leaves the saved row Pending. An unchanged form retry reuses the saved order during the mounted page session; reloading after cancellation can start a new registration. A completed Checkout receipt survives reload in sessionStorage and blocks a second payment while manual review is pending. Old automatic-flow receipts migrate to manual-review status without replaying verification; their Sheet persistence is not assumed.
9. The owner checks the actual Razorpay Dashboard record and manually captures it there when required. The owner can enter the Payment ID in P, then manually changes L from Pending to Verified.
10. The installed edit trigger generates a WhatsApp link in N and sets M to Ready to Send. This creates a link only; the owner clicks it and sends the message manually. No customer message is sent automatically.

The old public verify_payment action returns MANUAL_VERIFICATION_REQUIRED without fetching, capturing or writing any payment. Automatic signature verification, payment fetching/capture helpers, automatic Verified-row updates and automatic captured-payment recovery are removed. Manual Dashboard review replaces them.

## Existing Google Sheet

Spreadsheet ID: 1TdrQD7sq_uRgLkPoKwubH23QJY-reCejaNTVgvr3ows

Existing tab: Form Responses 1

Required tab ID (gid): 1885927180. The backend checks this ID as well as the spreadsheet ID and tab name, and rejects a mismatch before creating an order or writing a row.

No new sheet or spreadsheet is created. Existing Forms headers and existing data A-K are never renamed, reordered, cleared or overwritten. A website registration is appended as a new row with the same 18-column structure. Only blank L-R headers are filled; the same tab is extended to R if needed.

| Column | Website registration value |
| --- | --- |
| A | Timestamp |
| B | Full name |
| C | International WhatsApp number |
| D | Gender |
| E | Main goal |
| F | Additional comments |
| G | Makeup experience |
| H | Email |
| I | City |
| J | Blank |
| K | Screenshot URL if supplied, otherwise blank; no screenshot field is added to the existing website form |
| L | Pending; only the owner changes it to Verified |
| M | No; Ready to Send after owner verification |
| N | Blank; WhatsApp link only after owner verification |
| O | Selected course |
| P | Blank; owner may enter the Payment ID later |
| Q | Unique internal registration reference before the gateway request, replaced by the Razorpay Order ID before Checkout |
| R | Selected advance in INR |

The lookup scans P-Q and matches Q for order identity. A duplicate order is rejected. Read-back validation checks all A-R Pending values. The app never creates another row after Checkout success or during payment verification. A Pending status edit clears N and restores M to No. Existing sent confirmations are preserved when regenerating a Verified link.

For INR 500: form/request amount = 500 rupees; Razorpay order/response/Checkout amount = 50000 paise; Sheet R/display = 500 rupees. Only Apps Script converts the request amount to paise. React passes the validated returned paise amount directly to Checkout. Editable amounts remain supported; an input of 5 means INR 5, not INR 500.

## Manual deployment steps

No deployment, credential edits, authenticated order creation or real payment was performed by the agent.

1. Open the existing Apps Script project belonging to the existing web app URL. Replace the project source with the complete WorkshopRegistrations.gs file. Remove old duplicate action handlers or webhook functions from that project if present. Save.
2. Keep RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET exclusively in Project Settings > Script properties. Use a matching test-mode key pair for owner-run tests. Never put the secret into React or chat.
3. Run diagnoseWorkshopSaving() for a read-only destination report. Run setupWorkshopRegistration() as the account with edit access to the exact spreadsheet, authorizing the required scopes. This prepares only missing automation columns/headers and preserves A-K.
4. Run setupEditTrigger() once. It replaces duplicate handlePaymentStatusEdit triggers with one spreadsheet on-edit trigger. Existing Google Forms triggers are preserved.
5. In Razorpay Dashboard, review Account & Settings > Payments Capture and choose Manual Capture. The order API also explicitly requests manual capture. Only the account owner can change this setting. Capture authorized payments within the configured timeout; otherwise Razorpay refunds them. Platform exceptions apply: Direct Settlement merchants and bank-transfer payments can be auto-captured irrespective of manual capture settings. Confirm supported payment methods/account configuration with Razorpay if the business requires no automatic capture in every case.
6. In Apps Script choose Deploy > Manage deployments > edit the existing deployment > New version > Deploy. Execute as Me using the spreadsheet editor account; access Anyone. Saving the editor code does not update the /exec deployment.
7. Keep this exact URL unless you intentionally create a different deployment:

https://script.google.com/macros/s/AKfycbzj1dDVfYQt-zOTTdkV8fTegusSdISJZHUr4RuzHPc5gwWnUCcE77NToadNgrWsNYgQlw/exec

8. Open /exec and confirm version workshop-manual-v9-table-safe, verificationMode manual, ok true, sheetAccessible true and credentialsConfigured true. This proves readiness only, not a Sheet write. If a different URL is intentionally used, update WORKSHOP_API_URL in src/lib/workshopPayment.ts.
9. Build and publish Hosting only, after the backend is updated:

~~~powershell
npm.cmd run build
firebase deploy --only hosting:skbridalstudio
~~~

Refresh the browser after publishing. Existing open tabs running old code receive a safe rejection if they attempt automatic verification.

Razorpay references: [Manual capture settings](https://razorpay.com/docs/payments/payments/capture-settings/) and [per-order manual capture](https://razorpay.com/docs/payments/payments/capture-settings/api).

## Tests without a real payment

~~~powershell
node --test google-apps-script/WorkshopRegistrations.test.cjs src/lib/workshopPayment.test.cjs src/lib/workshopCheckout.test.cjs
npx tsc -p tsconfig.app.json --noEmit
npm.cmd run build
node scripts/check-workshop-form.cjs "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
~~~

These tests use mocked Razorpay and Sheets, and the browser test blocks real payment requests. They assert:

- A readable persisted Pending row exists before the order response reaches the actual frontend helper.
- Save/flush/lookup/read-back failures return an error and never open Checkout.
- INR 500 reaches Checkout as exactly 50000 paise.
- Order creation requests manual capture and is the only Razorpay API request.
- Checkout success makes no verification request or automatic confirmation claim.
- Cancellation, failure and completed Checkout never append a second row for the same saved order.
- Receipt reload does not create a new payment or call automatic verification.
- Only an owner edit of L to Verified generates N and sets M to Ready to Send; A-K remain unchanged.

## Owner-observed Pending-before-Checkout test

Perform this only after manually publishing the backend with Razorpay test credentials:

1. In Chrome Sources, set a breakpoint immediately before new window.Razorpay in Workshops.tsx.
2. Fill the form with a chosen INR 500 advance and submit. This creates a test-mode order and registration; do not complete payment.
3. Network must show create_order with amount 500. The response must include ok true, registrationSaved true, verificationMode manual, amount 50000 and a row number.
4. While paused before Checkout construction, inspect that row in Form Responses 1. Confirm L Pending, M No, N/P blank, O selected course, Q returned order ID and R 500. Confirm A-K headers and all prior response rows are intact.
5. Resume, confirm Checkout displays INR 500, and close it. The same row must remain Pending. Retry the unchanged form in the mounted page: the row/order is reused.
6. To exercise the UI completion path without a payment, use the mocked browser test. It must show Pending manual review and make no verify_payment request.
7. After an actual owner Dashboard review in normal operation, manually enter the payment ID in P and change L to Verified. Confirm M Ready to Send and a WhatsApp link in N on the same row. Clicking/sending remains manual.

To force save failures, use the mocked tests rather than removing production sheet permissions. For an unexpected save failure, use the returned reference/saveStage to locate the owner-only Apps Script log. Exception messages are redacted before logging; customer details, signatures and credentials are not logged. Neither health checks nor passing mocked tests prove production write permission.

## Investigating an empty reported row

The attached workshop-manual-v2 source writes via getLastRow() + 1 and returns a numeric row position. That position can be misleading after row insertions/sorting, and a tab selected only by name is not proof of gid 1885927180. A previous success response is not proof that the intended row still contains the registration. The corrected source checks the exact spreadsheet and tab ID, appends through appendRow rather than writing to an unchecked grid index, finds rows by a unique reference, compares sanitized stored values correctly and confirms all 18 columns.

For an existing reported order, run locateWorkshopRegistration(orderId) in the Apps Script editor as the owner. The editor cannot supply arguments directly: set Script Property WORKSHOP_LOOKUP_ORDER_ID to the order ID from the original Network response, then run locateWorkshopRegistration. It returns the exact spreadsheet/tab IDs, match count, presence flags and a direct link to each matching row. It does not return names, emails or phone numbers, create orders, edit rows or change payment status. A zero match means this exact tab does not currently contain that reference; inspect execution history and any other triggers or row-deletion/sorting scripts before resubmitting. A read-only lookup cannot reconstruct missing customer data.

Replace the existing Apps Script code with the entire corrected file and manually update that deployment to a new version before using these fixes. Health should report workshop-manual-v9-table-safe, spreadsheetId 1TdrQD7sq_uRgLkPoKwubH23QJY-reCejaNTVgvr3ows and sheetId 1885927180. The previously supplied pasted script's health handler rewrites L-R headers; the corrected health handler is read-only.

## Saved row followed by a Checkout-blocking error

The screenshot message REGISTRATION_SAVE_FAILED is a backend rejection before Checkout, not a Razorpay payment failure. If the row is visible, inspect the post-write operation and its original Apps Script exception rather than bypassing registrationSaved. The corrected backend no longer calls setNumberFormat on Form response columns or rewrites phone/P/Q after the full row append. Column types can control formatting in Sheets tables; a formatting failure must not be a prerequisite for Checkout. Order linking changes only Q and remains subject to full A-R read-back verification. WhatsApp links read the raw phone value so display formatting cannot corrupt a numeric 12-digit phone number. Missing/mismatched data, failed flushes and wrong amounts still block Checkout. The exact deployed exception remains unconfirmed until the owner provides its execution log.
