# Bridal booking advances

## Current flow: hosted Razorpay payment page

### Common payment link

All package session counts open the same owner-requested URL: `https://razorpay.me/@skbridalstudio`. Customers manually enter the displayed total advance on Razorpay: INR 2,000 for 1 day/session, INR 3,000 for 2, or INR 4,000 for 3. The website does not prefill or lock the Razorpay amount. Separate session links and environment overrides are no longer used.

After acknowledging confirmed date availability, customers select Pay INR 2,000 Advance to open a compact booking form. Name, email, Indian WhatsApp number, event date and session are required; venue/city is optional. Submitting prepares a WhatsApp message addressed to `+91 86680 38093` and opens WhatsApp. Customers must tap Send themselves; the website does not claim to send or verify delivery automatically.

Customers can select 1, 2 or 3 days. Each selected day requires its own date and session, with one session per day. The form and WhatsApp message use the agreed advances: INR 2,000 for 1 day, INR 3,000 for 2 days, INR 4,000 for 3 days. All dates must be distinct. Reducing the number of days removes the unused day from the message and total while preserving the remaining schedule. The payment link stays the same.

The customer returns to the form and acknowledges sending their details. Only then is the common Pay link enabled. The website tells the customer which amount to enter and asks them to share the receipt in the same WhatsApp conversation. Editing details resets the acknowledgement. New bridal enquiries do not use the custom Apps Script order actions. No v8 Apps Script deployment is needed for this flow.

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

1. Replace the existing Apps Script source with all of [WorkshopRegistrations.gs](google-apps-script/WorkshopRegistrations.gs). Do not add a second copy of its global definitions.
2. Keep the existing Razorpay key ID and secret in Script Properties.
3. Publish a new version of the existing deployment, retaining its URL, execute-as-owner setting and website access. The health version should be `workshop-auto-verify-v8-bridal-advances`.
4. Build and publish the frontend after the backend update. No new payment link or frontend API credentials are required.

The `Bridal Bookings` tab is created on the first bridal order. If a tab with that name already exists with different headers, the backend rejects the request rather than overwriting it. Workshop rows and unique-contact rules remain separate.

## Verification and recovery

Automated tests mock Razorpay, Sheets and browser network calls. No real orders, payments or booking rows are created during these checks:

```powershell
node --test google-apps-script/BridalBookings.test.cjs google-apps-script/WorkshopRegistrations.test.cjs src/lib/bridalPayment.test.cjs src/lib/workshopPayment.test.cjs src/lib/workshopCheckout.test.cjs
npx tsc -p tsconfig.app.json --noEmit
npm run build
node scripts/check-bridal-payment.cjs "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
```

Use Razorpay Test Mode for owner-run end-to-end verification after deployment. Session storage keeps the actual signed receipt for recovery on that browser tab. If a customer is charged but closes the page before Checkout returns its receipt, the studio must reconcile the payment in Razorpay before asking them to retry. This flow does not implement a webhook or unattended booking confirmation.
