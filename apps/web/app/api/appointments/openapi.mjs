// Internal browser API; not part of the public API-key interface.
const ok = {
    200: { description: "Successful response; no OAuth secrets are returned" },
    400: { description: "Invalid input or incomplete configuration" },
    401: { description: "Login required" },
    403: { description: "Owner, tenant, preview or origin guard denied" },
    409: { description: "Conflicting/stale booking or processing in progress" },
    429: { description: "Rate limit" },
    503: {
        description:
            "Google/SMTP/service unavailable; booking state must be checked before retry",
    },
};
const session = [{ SchoolSession: [] }];
export const appointmentOpenApi = {
    openapi: "3.0.3",
    info: {
        title: "CourseLit internal individual consultation API",
        version: "1.0.0",
    },
    components: {
        securitySchemes: {
            SchoolSession: {
                type: "apiKey",
                in: "cookie",
                name: "__Secure-courselit.session_token",
                description:
                    "Tenant-scoped active member session. Owner actions require domain.email owner. Public API keys not accepted.",
            },
        },
    },
    paths: {
        "/api/appointments/settings": {
            get: {
                summary:
                    "Owner-only settings, saved-status flags and up to 100 bookings",
                security: session,
                responses: ok,
            },
            post: {
                summary: "Owner: save/check/connect/disconnect",
                security: session,
                description:
                    "Same-origin JSON {action,data?}. save data: config, optional clientId/clientSecret (write-only). config: enabled,title,description,duration,interval,bufferBefore,bufferAfter,noticeHours,horizonDays,startDate,endDate,excludedDates,windows[{day,start,end}],zoomUrl,calendarId,busyCalendarIds. connect returns Google OAuth URL and sets short-lived HttpOnly PKCE state cookie. check returns calendar choices. Future/unresolved bookings prevent connection/calendar replacement.",
                responses: ok,
            },
        },
        "/api/appointments/google/callback": {
            get: {
                summary: "Single-use owner/session/tenant-bound OAuth callback",
                security: session,
                parameters: [
                    {
                        in: "query",
                        name: "state",
                        required: true,
                        schema: { type: "string" },
                    },
                    { in: "query", name: "code", schema: { type: "string" } },
                ],
                responses: {
                    302: {
                        description:
                            "Owner settings with literal connected/failed status; secrets and provider errors not included",
                    },
                },
            },
        },
        "/api/appointments/availability": {
            get: {
                summary:
                    "Anonymous availability only when enabled; owner-only preview while OFF",
                description:
                    "Returns {slots:[{start,end}],timeZone:'Asia/Tokyo'} only. No meeting URL, names, notes or Google event data. Any Google calendar error fails closed.",
                parameters: [
                    {
                        name: "from",
                        in: "query",
                        required: true,
                        schema: { type: "string", format: "date" },
                    },
                    {
                        name: "days",
                        in: "query",
                        schema: {
                            type: "integer",
                            minimum: 1,
                            maximum: 14,
                            default: 7,
                        },
                    },
                    {
                        name: "preview",
                        in: "query",
                        schema: { enum: ["0", "1"] },
                    },
                    {
                        name: "bookingId",
                        in: "query",
                        description:
                            "Authenticated own booking for reschedule availability",
                        schema: { type: "string", format: "uuid" },
                    },
                ],
                responses: ok,
            },
        },
        "/api/appointments/bookings": {
            get: {
                summary: "Own bookings only, latest 100",
                security: session,
                responses: ok,
            },
            post: {
                summary: "Create, reschedule, cancel or owner-reconcile",
                security: session,
                description:
                    "Same-origin JSON {action,preview,key(UUID),id?(UUID),version?(integer),start?(UTC ISO),name?,notes?,consent?(true)}. create requires start/name/consent; others require id/version. reschedule requires start. reconcile owner-only. Email and userId come from the authenticated tenant member. The server rechecks Google and persisted intervals, serializes host mutations, persists holds before Google writes, and verifies deterministic Google event ID + private metadata before confirming. needs_review retains holds. No automatic resend of uncertain emails.",
                responses: ok,
            },
        },
    },
};
