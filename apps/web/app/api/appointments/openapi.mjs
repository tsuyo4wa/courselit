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
        version: "1.1.0",
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
        "/api/appointments/types": {
            get: {
                summary:
                    "Owner-only consultation summaries; no credentials or Zoom URL",
                security: session,
                responses: ok,
            },
            post: {
                summary: "Owner: create paused menu",
                description:
                    "Same-origin JSON {name,duration(integer 15..180 multiple of 5)}. Inherits existing schedule and fixed Zoom, remains OFF. At most 20 menus including the preserved default.",
                security: session,
                responses: ok,
            },
        },
        "/api/appointments/types/{id}": {
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string" },
                    description:
                        "default or consultation UUID, scoped to the current school",
                },
            ],
            get: {
                summary:
                    "Owner-only menu config, version and bookings; no OAuth secrets",
                security: session,
                responses: ok,
            },
            post: {
                summary: "Owner: update a menu",
                description:
                    "Same-origin JSON {config,version}. Stale version returns 409. Google connection and calendar selection are inherited from common settings and cannot be changed here. Enabling validates Google first.",
                security: session,
                responses: ok,
            },
        },
        "/api/appointments/login-intent": {
            post: {
                summary:
                    "Prepare email-bound, tenant-bound, 30-minute booking-only OTP account intent",
                description:
                    "Same-origin JSON {email,typeId?(UUID or default)}. The selected menu must be enabled. Sets a Secure HttpOnly cookie. New account creation consumes the hashed intent once and sets subscribedToUpdates=false. Existing users remain unchanged. No plain email retained in transient store.",
                responses: ok,
            },
            delete: {
                summary:
                    "Clear the short-lived booking intent cookie after authentication or before unrelated login",
                description:
                    "Same-origin request; does not change any user subscription or booking.",
                responses: ok,
            },
        },
        "/api/appointments/settings": {
            get: {
                summary:
                    "Owner-only settings, saved-status flags and up to 100 bookings",
                security: session,
                responses: ok,
            },
            post: {
                summary: "Owner: save/save_connection/check/connect/disconnect",
                security: session,
                description:
                    "Same-origin JSON {action,data?}. save_connection preserves default schedule and intake and changes only shared calendar selection/credentials. Active menus prevent connection replacement. save data: config, optional clientId/clientSecret (write-only). config: enabled,title,description,duration,interval,bufferBefore,bufferAfter,noticeHours,horizonDays,startDate,endDate,excludedDates,windows[{day,start,end}],zoomUrl,calendarId,busyCalendarIds. connect returns Google OAuth URL and sets short-lived HttpOnly PKCE state cookie. check returns calendar choices. Future/unresolved bookings prevent connection/calendar replacement.",
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
                    "Returns {slots:[{start,end}],timeZone:'Asia/Tokyo'} only. Optional typeId selects the consultation (default preserves /appointments). All menus share persisted host holds. No meeting URL, names, notes or Google event data. Any Google calendar error fails closed.",
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
                summary:
                    "Own bookings for query typeId (default when omitted), latest 100",
                security: session,
                responses: ok,
            },
            post: {
                summary: "Create, reschedule, cancel or owner-reconcile",
                security: session,
                description:
                    "Same-origin JSON {action,typeId?(UUID or default),preview,key(UUID),id?(UUID),version?(integer),start?(UTC ISO),name?,notes?,consent?(true)}. create requires start/name/consent; others require id/version. reschedule requires start. reconcile owner-only. Email and userId come from the authenticated tenant member. The server rechecks Google and persisted intervals, serializes host mutations, persists holds before Google writes, and verifies deterministic Google event ID + private metadata before confirming. needs_review retains holds. No automatic resend of uncertain emails.",
                responses: ok,
            },
        },
    },
};
