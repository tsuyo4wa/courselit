// Internal owner-only endpoint; intentionally excluded from public OpenAPI routes.
export const launchPreviewOpenApi = {
    paths: {
        "/api/launch-preview": {
            get: {
                description:
                    "Owner-only preview readiness, revision and catalog exclusions. Never returns HTML or credentials.",
                security: [{ ApiKeyAuth: [] }],
                responses: {
                    200: { description: "Private status" },
                    403: { description: "Owner required" },
                    503: { description: "Unavailable" },
                },
            },
            post: {
                description:
                    "Owner-only 7-day sandboxed HTML preview and tenant-scoped catalog exclusions. No public page publication or enrollment writes.",
                security: [{ ApiKeyAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                additionalProperties: false,
                                required: [
                                    "revision",
                                    "pages",
                                    "hiddenProductIds",
                                ],
                                properties: {
                                    revision: {
                                        type: "string",
                                        pattern: "^[a-f0-9]{64}$",
                                    },
                                    pages: {
                                        type: "object",
                                        additionalProperties: false,
                                        required: [
                                            "home",
                                            "recruitment",
                                            "signup",
                                        ],
                                        properties: {
                                            home: {
                                                type: "string",
                                                maxLength: 60000,
                                            },
                                            recruitment: {
                                                type: "string",
                                                maxLength: 60000,
                                            },
                                            signup: {
                                                type: "string",
                                                maxLength: 20000,
                                            },
                                        },
                                    },
                                    hiddenProductIds: {
                                        type: "array",
                                        maxItems: 100,
                                        items: {
                                            type: "string",
                                            pattern: "^[a-zA-Z0-9_-]{1,80}$",
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Saved" },
                    400: { description: "Invalid body" },
                    403: { description: "Owner or same origin required" },
                    413: { description: "Body over 180000 bytes" },
                    503: {
                        description: "Storage unavailable or unknown product",
                    },
                },
            },
        },
    },
};
