# Workshop Registration with Razorpay

Workshop registrations are completed only after Firebase verifies a captured ₹500 Razorpay payment. A Firebase Cloud Function creates the order with a hash of the normalized registration details, then verifies Razorpay's payment signature, order details, and captured payment before sending the registration to Google Apps Script. The script writes verified attendees to the `Registrations` tab.

Existing columns A–N remain in place. The selected course is also recorded in O, the Razorpay payment ID in P, the order ID in Q, and the ₹500 advance in R. Payment status remains in L, so the existing WhatsApp confirmation flow continues to work.

## Connect your sheet

1. Create or open the Google spreadsheet where registrations should be saved.
2. In the spreadsheet, open **Extensions → Apps Script**. Copy the contents of `google-apps-script/WorkshopRegistrations.gs` into the script editor and save it. The spreadsheet ID from the link you provided is already configured in that file.
3. In **Project Settings → Script properties**, add `WORKSHOP_API_TOKEN` with a long random value. Keep this value private.
4. Choose **Deploy → Manage deployments**, edit the web app deployment, select **New version**, and save. Set **Execute as** to your account and **Who has access** to **Anyone**.
5. The deployed web app URL is `https://script.google.com/macros/s/AKfycbydFnmOzR1QlMBNjcX5yy1BKVMW7ktNomOC7ZzhpKNyrDs3yrzfx43cgP8gp8ZwLzf5/exec`.

The web app is publicly reachable, but rejects requests without the server-side token. Keep the spreadsheet private; do not put the API token or Razorpay secret in frontend code.

## Configure Razorpay and Firebase

1. In Firebase Console, upgrade the project to the Blaze plan and enable Cloud Functions.
2. Set these Firebase Functions secrets with your Razorpay **Key ID**, **Key Secret**, and the same random token configured in Apps Script:

```sh
firebase functions:secrets:set RAZORPAY_KEY_ID
firebase functions:secrets:set RAZORPAY_KEY_SECRET
firebase functions:secrets:set WORKSHOP_API_TOKEN
```

Enter each value directly in the Firebase CLI prompt. Never commit or paste secret values into source files. If a live key secret has been shared in chat or another public place, rotate it in Razorpay before adding it to Firebase. Use Razorpay test credentials first and switch to live credentials only after completing a test registration.

Install the Functions dependency from the `functions` directory, then deploy:

```sh
cd functions && npm install
cd ..
firebase deploy --only functions,hosting:skbridalstudio
```

For local development, payment requires the Firebase Functions emulator with the same secrets configured. A plain `npm run dev` page cannot create or verify payment orders by itself.

Test a Razorpay payment and confirm it appears once in the `Registrations` tab with `Payment Status` set to `Verified` before announcing registration is open.
