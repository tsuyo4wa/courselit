---
title: Post-purchase LP destination
---

A course/download or community bundle can have an optional `thankYouUrl`.
Manage it in the product/community settings under **申込・購入後のページ**.
An empty value preserves the existing enrollment/learning navigation.

Extend the existing GraphQL mutations: `updateCourse(courseData: {id, thankYouUrl})`
and `updateCommunity(id: ..., thankYouUrl: ...)`. Both return the persisted value.
The existing course-manager and community-moderator authorization remains required.
The ordinary REST product update has not been extended with this setting.

Only absolute public HTTPS URLs, up to 2048 characters, without credentials or
nonstandard ports are accepted. Local/IP hosts and checkout/auth/API paths are
rejected. Buyers cannot choose a redirect via request or query parameters.
The server does not fetch the destination and does not append learner identifiers,
email addresses, order IDs or payment details to it.

For free enrollment the initiate response can contain `redirectUrl` only after
activation, or when the buyer already has active access. Manual-approval pending
memberships keep the usual community navigation. Opening an enrolled lesson or
resuming from My Content is unaffected.

For paid purchases the verify response can contain `redirectUrl` only after the
existing tenant, invoice ownership, paid status and active membership checks.
The client follows it from the confirmation screen, preserving a manual LP link,
learning link and course-list fallback. No payment is initiated by the redirect.
Invalid legacy destinations are ignored so payment/learning access still works.
Enrollment welcomes and payment webhook grant processing are unchanged.
Admin isolated test purchases retain their existing preview workflow.

This is a configurable destination, not a one-time offer or an expiry system.
Revisiting a successful confirmation can show the destination again. This does not
add saved-card or one-click charges. When using an external LP, include an obvious
way back to the school or make the existing welcome email available to learners.
