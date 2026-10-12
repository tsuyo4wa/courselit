export const adminPaymentTestsOpenApi = {
    openapi: "3.0.3",
    info: { title: "CourseLit owner payment-test API", version: "1.0.0" },
    components: {
        securitySchemes: {
            OwnerSession: {
                type: "apiKey",
                in: "cookie",
                name: "__Secure-courselit.session_token",
                description:
                    "HTTPS school-owner session. Public API keys and ordinary learners are not accepted.",
            },
        },
    },
    paths: {
        "/api/admin/payment-tests": {
            get: {
                tags: ["Owner administration"],
                summary:
                    "Read owner-only test status, history or paid test learning preview links",
                security: [{ OwnerSession: [] }],
                parameters: [
                    {
                        name: "learn",
                        in: "query",
                        schema: { type: "string", format: "uuid" },
                    },
                ],
                responses: {
                    200: {
                        description:
                            "Non-secret status or learning preview links",
                    },
                    403: { description: "Not the active school owner" },
                    400: { description: "Invalid or unavailable test record" },
                },
            },
            post: {
                tags: ["Owner administration"],
                summary:
                    "Configure separate connections, start a buyout test, or verify its payment",
                security: [{ OwnerSession: [] }],
                description:
                    "Requires same-origin JSON, an active school-owner session, server-priced plans and test-mode Stripe credentials. Does not grant normal enrollment. API keys are not accepted.",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                oneOf: [
                                    {
                                        type: "object",
                                        additionalProperties: false,
                                        properties: {
                                            action: { enum: ["start"] },
                                            entityId: { type: "string" },
                                            entityType: {
                                                enum: ["course", "community"],
                                            },
                                            planId: { type: "string" },
                                            requestId: {
                                                type: "string",
                                                format: "uuid",
                                            },
                                        },
                                        required: [
                                            "action",
                                            "entityId",
                                            "entityType",
                                            "planId",
                                            "requestId",
                                        ],
                                    },
                                    {
                                        type: "object",
                                        additionalProperties: false,
                                        properties: {
                                            action: { enum: ["refresh"] },
                                            testId: {
                                                type: "string",
                                                format: "uuid",
                                            },
                                        },
                                        required: ["action", "testId"],
                                    },
                                    {
                                        type: "object",
                                        additionalProperties: false,
                                        properties: {
                                            action: { enum: ["configure"] },
                                            mode: { enum: ["live", "test"] },
                                            publicKey: { type: "string" },
                                            secretKey: {
                                                type: "string",
                                                writeOnly: true,
                                            },
                                            webhookSecret: {
                                                type: "string",
                                                writeOnly: true,
                                            },
                                        },
                                        required: [
                                            "action",
                                            "mode",
                                            "publicKey",
                                            "secretKey",
                                            "webhookSecret",
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Saved or test Checkout URL" },
                    400: { description: "Invalid input or connection" },
                    403: { description: "Owner or origin check failed" },
                    413: { description: "Input too long" },
                },
            },
        },
    },
};
