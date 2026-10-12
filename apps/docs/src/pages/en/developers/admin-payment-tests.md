---
title: Owner-only test purchases
---

The self-hosted school owner can open `/dashboard/payment-tests` to keep a test Stripe connection separate from the ordinary live checkout. The internal cookie-authenticated API is documented in `apps/web/app/api/admin/payment-tests/openapi.mjs`; it is intentionally outside the public API-key specification.

Select a product and its one-time paid plan, complete Stripe Checkout with a test card, then verify the result from the test history. The server uses the saved plan price, validates the Stripe session mode, identifier, metadata, currency and amount, and sends one test receipt to the school owner's email. Only the owner can see test records or learning-preview links. Both courses and bundled courses in a community one-time plan are supported. Recurring-payment testing is not included in this screen.

Test purchases use a separate collection with a 30-day expiry. They never create normal invoices, memberships, learner progress or production sales. Learning links open the existing owner preview after test payment verification; they do not substitute for a separate learner-role enrollment test.

On the first live cutover, the previous test connection is retained server-side and existing paid products are blocked from ordinary checkout to avoid accidentally charging for former test products. New paid products use the live path. The ordinary buyer path refuses test credentials. Live keys and a corresponding live webhook signature must be saved by the operator; no secrets are returned to the browser.

The main webhook accepts independently signed test events into isolated records and live school payment events into normal invoices. Test events cannot grant live access, and unrelated events from the same merchant account are acknowledged without membership writes. The test receipt uses an atomic send claim; uncertain or failed delivery is recorded rather than automatically sending duplicates.
