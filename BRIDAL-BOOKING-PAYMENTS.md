# Bridal booking advances

## Live session availability

The Packages page availability modal posts `check_bridal_availability` to the existing Apps Script Web App URL in `src/lib/workshopPayment.ts`. This keeps availability, workshop registration and bridal payment actions on the same existing `SK Bridal Studio WhatsApp Automation` project and deployment.

The lookup reads only date/year (C-D), confirmation (N), session (P) and booking status (Q) from the existing `Customer Booking Details` tab in spreadsheet `1m5sE85VjltmUIaVyYMleLZ8Ai1UeFD3Gr4zZ33G0fwA`. It does not read or return customer details, does not inspect Fully Settled (O), and does not write or reserve rows. `CONFIRMED`, `PENDING` and `COMPLETED` block that session; `CANCELLED` does not. A dated non-cancelled row with a blank or invalid session blocks both slots until corrected. Muhurtham defaults to Morning and Reception to Evening; the other supported occasions default to Morning and can use either session.

The frontend checks each event after its date, occasion or session changes, rejects duplicate date/session selections within the request, and rechecks all events immediately before opening WhatsApp Web. The backend serializes availability reads with `LockService` and checks the register while holding the script lock. The action remains read-only and does not reserve a slot; preventing two customers from both receiving an available result before a booking is written requires the booking write path to recheck and save the reservation while holding the same script lock.

## Current flow: hosted Razorpay payment page

### Common payment link

All package session counts open the same owner-requested URL: `https://razorpay.me/@skbridalstudio`. Customers manually enter the displayed total advance on Razorpay: INR 2,000 for 1 day/session, INR 3,000 for 2, or INR 4,000 for 3. The website does not prefill or lock the Razorpay amount. Separate session links and environment overrides are no longer used.

After acknowledging confirmed date availability, customers select Pay INR 2,000 Advance to open a compact booking form. Name, email, Indian WhatsApp number, event date and session are required; venue/city is optional. Submitting prepares a WhatsApp message addressed to `+91 86680 38093` and opens WhatsApp. Customers must tap Send themselves; the website does not claim to send or verify delivery automatically.

Customers can select 1, 2 or 3 days. Each selected day requires its own date and session, with one session per day. The form and WhatsApp message use the agreed advances: INR 2,000 for 1 day, INR 3,000 for 2 days, INR 4,000 for 3 days. All dates must be distinct. Reducing the number of days removes the unused day from the message and total while preserving the remaining schedule. The payment link stays the same.

The customer returns to the form and acknowledges sending their details. Only then is the common Pay link enabled. The website tells the customer which amount to enter and asks them to share the receipt in the same WhatsApp conversation. Editing details resets the acknowledgement. The live availability check is separate from this hosted payment flow and does not change order creation or payment verification.

The website displays the advance for the selected number of days. The hosted page controls the actual payable amount; the website does not override it or infer payment success from opening the link. After payment, customers share their receipt on WhatsApp and the studio verifies it before confirming the booking. The link's amount configuration must be checked in Razorpay by the owner.

Existing signed receipts from the earlier API flow retain verification-only recovery, preventing a customer with a captured payment from being directed to pay again. The implementation below documents that earlier API path and its deployment requirements only.

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

1. Open the existing `SK Bridal Studio WhatsApp Automation` Apps Script project. Do not create a project or deployment.
2. Copy the updated local [WorkshopRegistrations.gs](google-apps-script/WorkshopRegistrations.gs) into the existing project. It contains the availability constants/helpers and the `check_bridal_availability` dispatch in the existing `doPost(e)`. Do not add another Apps Script project or deploy the standalone Bridal Availability project. Keep the existing `doGet`, workshop actions, payment actions and Script Properties unchanged.
3. Ensure P1 and Q1 in the existing booking tab are labelled `Session` and `Booking Status`; do not move or rewrite columns A-O. Fill in existing bookings' sessions/statuses as appropriate. Blank sessions are intentionally treated as blocking both slots unless cancelled.
4. Save and deploy a new version of the existing Web App deployment. Keep its deployment URL, execute-as-owner setting and current website access setting. The script owner must have read access to the bridal booking spreadsheet. The existing frontend API URL remains in `src/lib/workshopPayment.ts`; no new frontend secret or API URL is needed.
5. In Apps Script, update the existing Web App deployment to a new version containing `check_bridal_availability`. Keep the existing deployment URL, execute-as-owner setting and access policy; the separate Bridal Availability URL currently returns “Script function not found” and is not used by the site.
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
