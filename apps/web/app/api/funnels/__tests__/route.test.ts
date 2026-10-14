import mongoose from "mongoose";
import { NextRequest } from "next/server";
import { GET, POST } from "../route";
import { auth } from "@/auth";
import Domain from "@models/Domain";
import User from "@models/User";
import Funnel from "@models/Funnel";
import { UIConstants } from "@courselit/common-models";
jest.mock("@/auth", () => ({ auth: { api: { getSession: jest.fn() } } }));
describe("Funnel management HTTP boundary", () => {
    const session = auth.api.getSession as unknown as jest.Mock;
    let domain: mongoose.Types.ObjectId;
    function req(body?: unknown, headers: Record<string, string> = {}) {
        return new NextRequest("https://school.example.com/api/funnels", {
            method: body === undefined ? "GET" : "POST",
            headers: {
                domain: "funnel-http-test",
                host: "school.example.com",
                origin: "https://school.example.com",
                "content-type": "application/json",
                ...headers,
            },
            ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        });
    }
    beforeAll(async () => {
        domain = new mongoose.Types.ObjectId();
        await Domain.collection.insertOne({
            _id: domain,
            name: "funnel-http-test",
            email: "owner@example.com",
            customDomain: "school.example.com",
            settings: { stripeSecret: "server-only-test-marker" },
        });
        await User.collection.insertOne({
            domain,
            email: "owner@example.com",
            userId: "http-owner",
            active: true,
            permissions: [UIConstants.permissions.manageSite],
        });
    });
    beforeEach(() => {
        session.mockResolvedValue({ user: { email: "owner@example.com" } });
    });
    afterAll(async () => {
        await Domain.deleteOne({ _id: domain });
        await User.deleteMany({ domain });
        await Funnel.deleteMany({ domainId: String(domain) });
    });
    it("denies anonymous access to the management listing", async () => {
        session.mockResolvedValue(null);
        const r = await GET(req());
        expect(r.status).toBe(403);
    });
    it("denies a signed-in account without the tenant's site-management permission", async () => {
        session.mockResolvedValue({ user: { email: "someone@example.com" } });
        const r = await GET(req());
        expect(r.status).toBe(403);
    });
    it("returns a private non-cached admin listing without any domain payment secret", async () => {
        const r = await GET(req());
        expect(r.status).toBe(200);
        expect(r.headers.get("cache-control")).toContain("no-store");
        expect(JSON.stringify(await r.json())).not.toContain(
            "server-only-test-marker",
        );
    });
    it("blocks cross-origin writes before any mutation", async () => {
        const r = await POST(
            req(
                { action: "create", name: "企画", courseId: "not-a-course" },
                { origin: "https://attacker.example" },
            ),
        );
        expect(r.status).toBe(403);
        expect(await Funnel.countDocuments({ domainId: String(domain) })).toBe(
            0,
        );
    });
    it("rejects an unrecognized action or attempted public state injection", async () => {
        const r = await POST(
            req({
                action: "create",
                name: "企画",
                courseId: "not-a-course",
                active: true,
            }),
        );
        expect(r.status).toBe(400);
    });
    it("bounds the request size without accepting an oversized payload", async () => {
        const r = await POST(
            req({
                action: "create",
                name: "あ".repeat(25000),
                courseId: "not-a-course",
            }),
        );
        expect(r.status).toBe(413);
    });
});
