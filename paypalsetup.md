PayPal Integration Testing Guide                                           
                                                                             
What is the Sandbox?                                                       
                                                                             
PayPal provides a Sandbox (test environment) that is 100% identical to the 
real PayPal but uses fake money. No real charges ever happen. You test     
everything there before going live.

---
Step 1 — Create a PayPal Developer Account

  1. Go to developer.paypal.com
  2. Log in with your regular PayPal account (or create one)
  3. You're now in the Developer Dashboard

  ---
  Step 2 — Get Sandbox Credentials

  1. Go to Apps & Credentials in the dashboard
  2. Make sure you're on the Sandbox tab
  3. Click Create App
  4. Give it a name (e.g. Adriel Test)
  5. You'll get:
    - Client ID → goes in your .env as PAYPAL_CLIENT_ID
    - Secret → goes in your .env as PAYPAL_SECRET

  ---
  Step 3 — Sandbox Test Accounts

  PayPal automatically creates two fake accounts for you:

  ┌──────────────────┬──────────────────┬────────────────────────┐
  │     Account      │       Role       │        Purpose         │
  ├──────────────────┼──────────────────┼────────────────────────┤
  │ Business account │ You (the seller) │ Receives the money     │
  ├──────────────────┼──────────────────┼────────────────────────┤
  │ Personal account │ The buyer        │ Pays for the promotion │
  └──────────────────┴──────────────────┴────────────────────────┘

  To find them:
  1. Go to Testing → Sandbox Accounts
  2. You'll see both accounts listed
  3. Click on the personal account → View/Edit → note the email and password

  ---
  Step 4 — Test Visa Card Numbers

  PayPal gives you fake Visa cards to test with — these are not real cards:

  ┌────────────┬──────────────────┬─────────────────┬──────────────┐
  │ Card Type  │      Number      │     Expiry      │     CVV      │
  ├────────────┼──────────────────┼─────────────────┼──────────────┤
  │ Visa       │ 4032039317984019 │ Any future date │ Any 3 digits │
  ├────────────┼──────────────────┼─────────────────┼──────────────┤
  │ Visa       │ 4111111111111111 │ Any future date │ Any 3 digits │
  ├────────────┼──────────────────┼─────────────────┼──────────────┤
  │ Mastercard │ 5425233430109903 │ Any future date │ Any 3 digits │
  └────────────┴──────────────────┴─────────────────┴──────────────┘

  These numbers only work in Sandbox mode — they will fail on real payments.

  ---
  Step 5 — How to Test a Payment

  1. Open your app (running locally)
  2. Go to the advertise page (store or repair dashboard)
  3. Pick a promotion plan
  4. The PayPal button appears
  5. Click the button → a popup opens
  6. You have two options to test:

  Option A — Test with PayPal account:
  - Log in with the sandbox personal account email/password from Step 3
  - Click Pay
  - Done ✓

  Option B — Test with Visa card:
  - Click "Pay with Debit or Credit Card" in the popup
  - Enter any of the test Visa numbers from Step 4
  - Fill in any future expiry date and any 3-digit CVV
  - Fill in any name and billing address
  - Click Pay
  - Done ✓

  ---
  Step 6 — Verify the Payment Went Through

  After paying you can verify in two places:

  In the Sandbox dashboard:
  1. Go to developer.paypal.com
  2. Testing → Sandbox Accounts
  3. Click the Business account → Balance → you'll see the money arrived

  In your app:
  - The promotion should activate immediately
  - The plan badge should appear on the store/repair dashboard

  ---
  Step 7 — Going Live (When Ready for Real Customers)

  1. Go back to Apps & Credentials
  2. Switch to the Live tab
  3. Create a Live app → get your Live Client ID and Live Secret
  4. Update your production .env with the live credentials
  5. Change one setting in the code: environment: "sandbox" → environment:
  "production"
  6. Real Visa cards and real PayPal accounts will now work

  Important: Make sure your PayPal Business account is fully verified before
  going live or payments will be held.

  ---
  Common Issues During Testing

  ┌─────────────────────────────┬────────────────────────────────────────┐
  │           Problem           │                  Fix                   │
  ├─────────────────────────────┼────────────────────────────────────────┤
  │ PayPal button doesn't       │ Check that PAYPAL_CLIENT_ID is set     │
  │ appear                      │ correctly in .env                      │
  ├─────────────────────────────┼────────────────────────────────────────┤
  │ Payment popup blocked       │ Allow popups for localhost in your     │
  │                             │ browser                                │
  ├─────────────────────────────┼────────────────────────────────────────┤
  │ Card declined               │ Make sure you're using the test card   │
  │                             │ numbers above, not a real card         │
  ├─────────────────────────────┼────────────────────────────────────────┤
  │ Payment goes through but    │ Check the backend capture endpoint     │
  │ promotion doesn't activate  │ logs                                   │
  ├─────────────────────────────┼────────────────────────────────────────┤
  │ "This seller doesn't accept │ Your sandbox Business account needs to │
  │  payments"                  │  be fully set up                       │
  └─────────────────────────────┴────────────────────────────────────────┘

  ---
  Summary for the Client

  "Before going live we test everything using PayPal's Sandbox — a fake
  version of PayPal with fake money. We simulate real customers paying with
  both Visa cards and PayPal accounts. Only after everything works perfectly
  in the test environment do we switch to live mode where real money is
  processed. The transition takes a single setting change."

  ---
  Whenever you're ready, share your PayPal Sandbox Client ID and Secret and
  I'll build the full integration.