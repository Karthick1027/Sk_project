# Workshop registration with automatic Razorpay verification

The backend source of truth for this change is the supplied C:/Users/ASWIN/Downloads/WorkshopRegistrations_AutomaticVerification.gs (workshop-auto-verify-v3). Its active repository copy is google-apps-script/WorkshopRegistrations.gs, version workshop-auto-verify-v7-unique-contacts. Do not deploy both full scripts into one Apps Script project: replace the old code to avoid duplicate function/CONFIG definitions.

The first-empty-row selection remains unchanged. appendPendingRegistration_ checks contact uniqueness and accepts an optional local payment-proof upload before saving the Pending row. Field aliases, course validation, Pending persistence, amount conversion, spreadsheet destination and the existing WhatsApp/edit-trigger workflow remain as supplied. Payment verification rechecks duplicate callbacks against Razorpay, returns amount/currency consistently, rejects duplicate order rows/reused payments, and distinguishes captured-payment Sheet failures. The verified update writes only L-R, does not require typed-column reformatting, retains a plain WhatsApp link if rich-link formatting fails and preserves an existing sent confirmation.

Each phone number and email address is allowed in only one registration across all courses. Before uploading proof or creating a row/order, the backend compares normalized Indian phone numbers and trimmed, case-insensitive emails against all existing response rows, including older Google Form responses and Pending registrations. Either match returns DUPLICATE_REGISTRATION with an inline error on the matching field. The contact check and Pending save share a script lock to prevent competing website submissions from reserving the same contact. Existing-order checkout retries and payment verification remain available; a new registration using a reserved contact requires the studio to resolve the original record first. Google Forms submissions made directly outside this API do not use this lock or validation.

## Complete request flow

New course options: 2-Day Online Live Demo Workshop; 15-Day Bridal Makeup Masterclass; 30-Day Professional Bridal Makeup Masterclass. The first option is the default. Existing saved rows retain their original course names and remain eligible for payment verification; legacy names are not accepted for new registrations.

1. React validates the current form and flexible whole-rupee amount. Default is INR 500, minimum INR 1.
2. create_order sends registration details and amount in rupees using a readable text/plain JSON POST to the existing Apps Script URL.
3. The supplied Apps Script saver finds the first completely empty A-R row below the header. Existing values and formulas, including formulas displaying blank, prevent a row from being reused. Under a script lock it writes the complete Pending registration, flushes and reads it back. A-K headers and all prior response rows are preserved.
4. Apps Script creates the Razorpay order, writes the returned order ID into Q on that Pending row and confirms it. Only then does it return ok true, registrationSaved true, saved true, a row number, public key, order ID, amount in paise, currency INR and paymentVerification AUTOMATIC.
5. React requires explicit registrationSaved true, a valid row, matching amount/currency, valid key/order fields and automatic mode. It then loads and opens Razorpay Checkout.
6. Checkout success alone does not show payment success. The callback receipt is retained in sessionStorage, and React sends only action verify_payment plus the actual orderId, paymentId and signature returned by Checkout. It never sends a customer-supplied verification amount or registration replacement.
7. Apps Script verifies HMAC-SHA256 with the private Script Property secret, finds Q, and checks the saved amount/registration against the Razorpay order. It fetches the payment directly, checks payment ID, order ID, amount and INR currency, captures authorized payments with the supplied logic when necessary, and refetches the captured status.
8. Under the script lock it updates the same registration row: L Verified, M Ready to Send, N WhatsApp confirmation link, P payment ID, Q unchanged order ID, R verified INR amount. No new registration is appended during verification. A-K remain unchanged. Flush and read-back must succeed.
9. The response includes ok true, verified true, saved true, amount in paise, currency, row and IDs. React shows Payment Verified only after those confirmations and matching payment/amount checks. It clears the receipt only after confirmed success and resets the form when the success dialog is dismissed.

For INR 500, the request amount is 500; Razorpay order/Checkout/verification amounts are 50000 paise; column R and displayed amounts are 500 rupees. React passes the returned paise amount directly to Checkout. It does not multiply the returned amount again.

## Existing Sheet structure

Spreadsheet ID: 1TdrQD7sq_uRgLkPoKwubH23QJY-reCejaNTVgvr3ows

Tab: Form Responses 1 (the supplied backend selects this exact existing tab by name).

A-K contain Timestamp, Name, Phone, Gender, Main Goal, Comments, Experience, Email, City, blank Score and optional Screenshot URL. Their headers and existing response data are never changed by verification.

| Column | Before Checkout | After confirmed verification |
| --- | --- | --- |
| L | Pending | Verified |
| M | No | Ready to Send (an already sent confirmation is preserved on retries) |
| N | Blank | WhatsApp confirmation link |
| O | Selected course | Same selected course |
| P | Blank | Razorpay Payment ID |
| Q | Razorpay Order ID | Same Razorpay Order ID |
| R | Chosen advance in INR | Verified advance in INR |

WhatsApp sending remains manual: verification generates the link, and the studio sends the message. The supplied handlePaymentStatusEdit, createWhatsAppLink_ and setupEditTrigger functions remain available.

## Failure handling and recovery

WhatsApp emoji links: column N now contains separate `WhatsApp Web` and `WhatsApp App` links with the same once-encoded Unicode message. Web opens web.whatsapp.com directly; App uses api.whatsapp.com. After replacing the Apps Script code, publish a new version of the existing deployment for future payments. Run `testWhatsAppEmojiEncoding` to obtain both test URLs and verify encoding, then run `rebuildVerifiedLinks` once to replace previously saved links. Rebuilding does not send messages and preserves existing `Confirmation Sent` values. Check the prefilled message in both clients before sending; automated tests verify URL contents, not WhatsApp's client rendering.

- Pending save fails: no usable order is returned and Checkout remains closed.
- Razorpay order creation fails after Pending persistence: the Pending row remains in the Sheet. Contact the studio before submitting another registration.
- Checkout is cancelled or reports payment.failed: the Pending row remains; an unchanged mounted form can reuse its saved order.
- Verification/signature/order/payment/capture fails: no success dialog, and the receipt remains available. Retry Verification sends the same payment proof and never opens another Checkout or creates an order.
- Payment captured but Sheet update fails: the backend returns ok false, verified true, paymentCaptured true, saved false and REGISTRATION_SAVE_FAILED. The UI instructs the customer to contact SK Bridal Studio, not pay again, and retry only verification.
- Lost acknowledgement after a Verified write: a retry authenticates the same proof and rechecks Razorpay before idempotently confirming that same row with amount/currency included.
- Duplicate callbacks/double clicks: callback settlement and the processing lock prevent duplicate frontend requests/payments. The backend lock, order lookup and payment-ID checks protect the Sheet update.
- Older manual-flow receipts have no usable signature. They remain available as Payment Needs Review, and cannot show verified success or start another payment automatically. The studio must reconcile those existing payments; no signature is fabricated.
- Closing the page before receiving a Checkout receipt cannot be recovered from an absent browser receipt. Reconcile the Dashboard payment before asking a charged customer to pay again. This change does not add a webhook or unattended reconciliation service.

Credentials remain exclusively in Apps Script Script Properties. Checkout receives only the public key. Browser logs exclude registrations, raw callback objects, signatures, secrets and raw API responses.

## Exact manual deployment steps

No deployment, credential change, authenticated test order or real payment has been performed by the agent.

1. Open the existing Apps Script project serving this URL:

https://script.google.com/macros/s/AKfycbydFnmOzR1QlMBNjcX5yy1BKVMW7ktNomOC7ZzhpKNyrDs3yrzfx43cgP8gp8ZwLzf5/exec

2. Replace its old Code.gs contents with the entire corrected google-apps-script/WorkshopRegistrations.gs. Remove other copies of the full old backend from the same project so old manual handlers cannot override it. The Downloads original remains unchanged.
3. In Project Settings > Script properties, keep the matching RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET pair. Start with Razorpay Test Mode keys. Do not put the secret into React, .env frontend variables or chat.
4. Run setupWorkshopRegistration as the account with edit access to the existing spreadsheet and authorize the required Sheet/UrlFetch scopes. Keep the existing form and tab. The supplied setup prepares automation headers L-R only. If the edit trigger is not already installed, run setupEditTrigger once; it retains other Google Forms triggers.
5. Choose Deploy > Manage deployments > edit the EXISTING deployment > New version > Deploy. Execute as Me (the spreadsheet editor account), access Anyone. Saving editor code alone does not publish /exec.
6. Confirm the URL reports version workshop-auto-verify-v7-unique-contacts and ok true. The supplied health function also prepares L-R headers; it is not a completely read-only endpoint, and readiness alone does not prove a saved registration/payment.
7. Keep WORKSHOP_API_URL unchanged if this deployment URL is retained. If you intentionally create a different deployment, update that constant in src/lib/workshopPayment.ts before building.
8. Publish the frontend only after the backend supports automatic verification:

~~~powershell
npm.cmd run build
firebase deploy --only hosting:skbridalstudio
~~~

Firebase remains on Spark: no Functions, Secret Manager, Blaze services or Hosting backend rewrites are introduced. Refresh any old browser tabs after publishing.

## Automated checks

~~~powershell
node --test google-apps-script/WorkshopRegistrations.test.cjs src/lib/workshopPayment.test.cjs src/lib/workshopCheckout.test.cjs
npx tsc -p tsconfig.app.json --noEmit
npm.cmd run build
node scripts/check-workshop-form.cjs "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
~~~

These tests use in-memory Sheets and Razorpay mocks. The browser check mocks all payment/backend calls. No live registrations, orders or charges are created. Coverage includes genuine empty gaps/formula preservation, Pending-before-order persistence, amount conversion, HMAC rejection, order/payment/currency checks, capture, same-row verification, duplicate retries, failed saving after capture, lost acknowledgements, proof retention, disabled processing controls and UI success gating.

## Razorpay Test Mode checklist

Perform these owner-run checks only after explicitly publishing Test Mode backend credentials and the matching frontend:

1. Note existing Sheet row contents. Enter a unique test registration and amount INR 500. In Chrome Sources pause immediately before new window.Razorpay in Workshops.tsx. Network create_order must show amount 500 and return registrationSaved true, paymentVerification AUTOMATIC, a row number and amount 50000.
2. While paused, inspect the exact returned row in Form Responses 1. Confirm every registration field, L Pending, M No, N/P blank, Q returned order ID and R 500. Verify existing rows and headers A-K are unchanged.
3. Resume and verify Checkout shows INR 500 using an rzp_test_ key. Complete only a Razorpay Test Mode payment. The subsequent verify_payment request must contain the actual Checkout order ID, payment ID and signature, with no API secret.
4. Wait for the backend response: ok true, verified true and saved true. The SAME row number must now have L Verified, M Ready to Send, N WhatsApp link, P payment ID, the same Q and R 500. Confirm no row was appended and A-K are byte-for-byte unchanged for that row.
5. Repeat with flexible amounts such as INR 5, 250 and 750. Confirm the order amounts are 500, 25000 and 75000 paise respectively, and the INR values in R match.
6. Cancel Checkout on a fresh test registration: it stays Pending. Retry the unchanged form in the same page session and confirm order reuse.
7. Use the automated mocked tests to alter a signature, payment/order ID, amount/currency or captured status. These must never mark a row Verified or display success. Do not alter production records to force failures.
8. Use the mocked browser Sheet-failure scenario: after a callback, verify that the contact/do-not-pay-again message appears. Retry Verification must make no new order or Checkout request. A later confirmed verification updates the original row.
9. Send the same Test Mode verification callback again. It must return duplicate true, the same row/amount/currency, and no second registration. A previously sent confirmation must remain sent.
10. Reload after an unconfirmed callback receipt: Verify Existing Payment must retry that proof without another payment. Old manual receipts must show Payment Needs Review rather than automatic success.

The same-row update is confirmed by automated integration tests. Production/Test Mode Sheet acceptance remains an owner-observed check; it has not been claimed from mocked results alone.

## Optional local payment-proof upload

The workshop form includes a compact file picker, local image preview and Remove proof control. It is optional because new customers pay through Checkout after submitting the form. JPG, PNG, WEBP and PDF files are accepted, up to 5 MB. Browser and backend validate type/size; the backend also checks the file signature. Proof upload does not verify a payment.

The selected file is sent as base64 in paymentProof alongside create_order. Apps Script creates the file in the configured Drive folder and stores its URL in K on the new Pending row. That URL is checked before returning paymentProofSaved true; selected-file submissions without this acknowledgement cannot open Checkout. Existing Google Forms rows and headers are preserved. Upload bytes and original local filenames are not logged or stored in sessionStorage. Folder access is inherited; the app never enables public sharing.

Before publishing this version, run setupWorkshopProofUploads() once as the Apps Script owner and authorize Drive access. It creates a folder named SK Bridal Studio - Workshop Payment Proofs and stores its ID in Script Property WORKSHOP_PROOF_FOLDER_ID. Alternatively, set that property to an existing folder the deployment owner can edit before running setup. Share the folder only with studio staff who should review proofs. Then publish a New version of the existing web app (Execute as Me, access Anyone), confirm workshop-auto-verify-v5-proof-upload, and deploy the rebuilt frontend. An unconfigured upload folder produces a clear error when a file is selected; registrations without a file continue to work. No real folder or file upload was performed by the agent.

The upload implementation uses the [Drive folder file API](https://developers.google.com/apps-script/reference/drive/folder#createFile(BlobSource)) and [Apps Script binary utilities](https://developers.google.com/apps-script/reference/utilities/utilities). No Firebase Storage or paid Firebase service is introduced.
