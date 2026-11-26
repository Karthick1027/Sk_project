# Bridal booking advances

## Live session availability

The Packages page availability modal posts `check_bridal_availability` to `BRIDAL_AVAILABILITY_API_URL` in `src/lib/bridalAvailability.ts`, using the studio-supplied deployment ending `NgrWsNYgQlw/exec`. Workshop payment requests retain the separate default `WORKSHOP_API_URL` in `src/lib/workshopPayment.ts`.

The lookup reads only date/year (C-D), confirmation (N), session (P) and booking status (Q) from the booking tab with **sheet ID `0` (`gid=0`)** in spreadsheet `1m5sE85VjltmUIaVyYMleLZ8Ai1UeFD3Gr4zZ33G0fwA`. The tab is selected by `getSheetById(0)`, so trailing spaces or renaming `Customer Booking Details` do not break the lookup. A missing ID returns an error; there is no fallback to a different or newly created tab. It does not read or return customer details, does not inspect Fully Settled (O), and does not write or reserve rows. `CONFIRMED`, `PENDING` and `COMPLETED` block that session; `CANCELLED` does not. A dated non-cancelled row with a blank or invalid session blocks both slots until corrected. Muhurtham defaults to Morning and Reception to Evening; customers can also select Full Day. Full Day requires both Morning and Evening to be available and overlaps either slot on the same date. The frontend checks the two existing slot actions for compatibility with the current deployment. In the booking register, set Session (column P) to `Full Day` to block both slots; a cancelled booking releases both. The updated Apps Script also accepts direct Full Day checks.

The frontend checks each event after its date, occasion or session changes, rejects duplicate date/session selections within the request, and rechecks all events immediately before opening WhatsApp Web. The backend serializes availability reads with `LockService` and checks the register while holding the script lock. The action remains read-only and does not reserve a slot; preventing two customers from both receiving an available result before a booking is written requires the booking write path to recheck and save the reservation while holding the same script lock.

## Current flow: workshop-style Standard Checkout

The advance card has one entry button, **Check Availability & Book**. It opens the date/session check, keeps the studio confirmation acknowledgement inside that step, and continues directly to contact details after rechecking availability. Selected dates and venue carry forward. **Change dates** returns to the availability check while preserving contact details. Customers send one complete WhatsApp message, acknowledge sending it, then pay. Once a receipt exists, the card's single action becomes **View payment receipt** (older receipts retain their existing recovery action).

The bridal Pay button now opens the same Razorpay Standard Checkout SDK used by workshops. The customer's collected name, phone and email are prefilled; phone/email fields are hidden and read-only. No payment method is forced, so Checkout displays the account's enabled methods. The native booking dialog closes while the gateway opens so it cannot block the payment iframe.

The frontend calls `create_bridal_checkout` with the 1-3 day booking and WhatsApp acknowledgement. The backend validates it and calculates INR 2,000 / 3,000 / 4,000 in paise, ignoring client amounts. A deterministic receipt and script lock reuse the same order after cancellations, retries or lost API responses. Paid orders reject another checkout. Existing hosted payment links for identical details block creating a second payment route; the studio must review an old active link before switching that booking. No existing live links are automatically cancelled.

After Checkout returns a signed receipt, the frontend stores it before calling `verify_bridal_checkout`. The backend checks the signature, order type/reference, day-count amount, currency and captured payment, capturing an authorized payment if needed. Only confirmed server verification displays Payment verified. Failed verification and page reloads offer verification-only recovery with the actual payment ID; they never start a second payment. Customers still share the receipt on WhatsApp for studio booking confirmation. This flow does not reserve dates or write booking rows, and it does not implement a webhook.

Deploy the complete `WorkshopRegistrations.gs` as a new version on the existing Apps Script deployment first. The read-only `bridal_payment_link_status` action must return `checkoutProfile: standard-checkout-v1` and `ready: true`. Then build and deploy the website to Firebase Hosting. Until the backend is activated, keep the live frontend in place. Run owner acceptance in Razorpay Test Mode. Automated checks mock the provider and do not create real orders or charges.

## Earlier flow: API-generated fixed-amount payment links

After availability confirmation, customers send their booking details on WhatsApp and acknowledge sending them. Pay now calls the separate `create_bridal_payment_link` action on `BRIDAL_AVAILABILITY_API_URL`. The server validates 1-3 distinct event dates and calculates INR 2,000 / 3,000 / 4,000 in paise from the day count, ignoring any client amount. It creates a Standard Razorpay Payment Link with partial payments disabled; customers no longer enter an amount manually.

The server uses `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` from Apps Script Script Properties. No secret is sent to the browser. Customer details accompany the link request; notifications and reminders are disabled. Opening the payment link is a customer action. The API does not reserve dates, write booking rows, or mark payments successful. Customers still share the receipt on WhatsApp for studio verification.

New links also send the validated name, email and international phone in `options.checkout.prefill`, mark contact/email read-only and request they be hidden with `options.checkout.hidden`. No `prefill.method` is set, so customers can choose from the account's enabled payment methods. Razorpay documents prefilling/read-only fields for Payment Links and hidden contact fields for Standard Checkout; the hosted Payment Link page must be checked after deployment to confirm it honors the hidden-field settings. Provider-required authentication may still appear.

Deploy a new Apps Script version for this change; a website build is unnecessary. Existing payment links keep their original checkout settings. The backend deliberately reuses them rather than creating another payable link for the same booking; do not change booking details or the reference just to obtain a different checkout. Verify the new settings with a fresh booking in Test Mode. No live payment link is created by the automated tests.

A deterministic booking reference and the Apps Script lock reuse existing links for identical details, including after a lost create response. Paid or partially paid links block another payment; expired/cancelled links require studio review. The client checks the response amount, currency, link ID and provider hostname before navigating. Changed details invalidate the local link; a blocked popup leaves a validated Pay link available for a second tap.

### Activate this backend before publishing the frontend

1. Replace the existing main script with the complete updated `WorkshopRegistrations.gs` in the Apps Script project serving `BRIDAL_AVAILABILITY_API_URL`. It now includes the payment-link helpers. If `BridalPaymentLinks.gs` already exists in the editor, replace it with the local comment-only copy to avoid duplicate function definitions.
2. Keep the studio's matching Razorpay key pair in that project's Script Properties. Use test credentials for owner-run acceptance before using live credentials. Do not place secrets in frontend files or chat.
3. Save and deploy a New version of that existing Web App, preserving its URL and execution/access settings.
4. Send the read-only `bridal_payment_link_status` POST action. It must return `api: bridal-payment-links-v1`, `checkoutProfile: standard-checkout-v1` and `ready: true`. An absent or different `checkoutProfile` means Standard Checkout is not confirmed deployed. This checks deployment capability and credential presence; it does not prove a live payment or create a link.
5. Build, verify the booking UI, then publish Firebase Hosting. Until activation, keep the current live frontend in place. No live links, charges, SMS or email notifications were created by the automated checks; provider calls are mocked.

### Payment button returns REQUEST_FAILED before opening Razorpay

If both `bridal_payment_link_status` and `create_bridal_payment_link` (even without booking data) return `REQUEST_FAILED`, the deployment can be missing the payment-link helper file. The readiness action does not contact Razorpay, and an empty create request should return `AVAILABILITY_REQUIRED` before contacting Razorpay. Apps Script can show the execution as Completed because `doPost` catches the exception and returns an error response.

The main script now contains these helpers, removing the separate-file deployment dependency. Replace the complete main script as above, save, then use **Deploy > Manage deployments > Edit > New version > Deploy** on the existing deployment. Saving code alone does not update the live Web App. Verify the deployed readiness action returns `ok: true`, `api: bridal-payment-links-v1`, and `ready: true` before retrying payment. No frontend deployment is required for this backend-only repair.

Existing signed receipts from the older order/Checkout flow retain verification-only recovery. Workshop registration and payment verification retain their existing API connection.

## Earlier API integration and receipt recovery

The Packages page uses the same Apps Script endpoint and server-side Razorpay credentials as workshop checkout. It sends separate `create_bridal_order` and `verify_bridal_payment` actions; bridal advances never create workshop registrations or use workshop course amounts.

The flow uses server-created orders and server-side signature/capture checks as described in [Razorpay's Standard Checkout integration guidance](https://github.com/razorpay/markdown-docs/blob/master/payments/payment-gateway/web-integration/standard.md).

## Customer flow

1. Contact SK Bridal Studio on WhatsApp to discuss the event date and session.
2. After the studio confirms availability, acknowledge this on the website. This is a customer acknowledgement, not an automatic calendar check or studio approval token.
3. Select Pay INR 2,000 Advance. Enter name, email, Indian mobile number, event date and one session.
4. Apps Script saves a Pending entry in a separate `Bridal Bookings` tab in the existing spreadsheet, then creates a Razorpay order for exactly 200000 paise. The browser cannot override the advance.
5. Checkout opens with the server order and the existing Razorpay public key. The private key remains in Script Properties.
6. The signed checkout receipt is retained in session storage before verification. Apps Script checks its signature, booking hash, order type, amount, currency and captured payment status, then writes and reads back the verified status in the same booking row.
7. Only confirmed verification shows Payment verified. The studio still sends final booking confirmation after reviewing the agreed date/session. Failed verification permits verification-only retry; it does not create another payment.

Each order covers one session. Muhurtham and Reception require separate session advances. A pending order is reused for the same phone, event date, session and matching booking details, including after a page reload. Already verified bookings reject another advance. Changed details for an existing reservation require studio review.

## Deployment

1. Open the existing `SK Bridal Register - Automation` Apps Script project for `BRIDAL_AVAILABILITY_API_URL`. Keep its existing deployment URL.
2. Copy the updated local [WorkshopRegistrations.gs](google-apps-script/WorkshopRegistrations.gs) into the existing project. It contains the availability constants/helpers and the `check_bridal_availability` dispatch in the existing `doPost(e)`. Do not add another Apps Script project or deploy the standalone Bridal Availability project. Keep the existing `doGet`, workshop actions, payment actions and Script Properties unchanged.
3. Ensure P1 and Q1 in the existing booking tab are labelled `Session` and `Booking Status`; do not move or rewrite columns A-O. Fill in existing bookings' sessions/statuses as appropriate. Blank sessions are intentionally treated as blocking both slots unless cancelled.
4. Copy the updated `BridalAvailabilityDiagnostics.gs` into the same Apps Script project, save both files, and run `testBridalAvailabilityConnection` in the editor. It should report `ok: true` and `sheetId: 0`. It reads the existing booking register and does not change rows or payments. Resolve any diagnostic error before publishing.
5. Update the existing availability Web App deployment: Deploy > Manage deployments > Edit > New version > Deploy. Preserve its URL and current execution/access settings. The deploying account must have access to the booking spreadsheet. Workshop payments continue using the separate `WORKSHOP_API_URL`.
6. Build and publish the frontend to the existing Firebase Hosting site: run `npm run build`, then `firebase deploy --only hosting` from the project directory.

The `Bridal Bookings` tab is created on the first bridal order. If a tab with that name already exists with different headers, the backend rejects the request rather than overwriting it. Workshop rows and unique-contact rules remain separate.

## Verification and recovery

Automated tests mock Razorpay, Sheets and browser network calls. No real orders, payments or booking rows are created during these checks:

```powershell
node --test google-apps-script/BridalBookings.test.cjs google-apps-script/WorkshopRegistrations.test.cjs src/lib/bridalPayment.test.cjs src/lib/workshopPayment.test.cjs src/lib/workshopCheckout.test.cjs
node --test google-apps-script/BridalAvailability.test.cjs src/lib/bridalAvailability.test.cjs
npx tsc -p tsconfig.app.json --noEmit
npm run build
node scripts/check-bridal-payment.cjs "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
```

Use Razorpay Test Mode for owner-run end-to-end verification after deployment. Session storage keeps the actual signed receipt for recovery on that browser tab. If a customer is charged but closes the page before Checkout returns its receipt, the studio must reconcile the payment in Razorpay before asking them to retry. This flow does not implement a webhook or unattended booking confirmation.
