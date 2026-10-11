import { NextRequest } from "next/server";
import { POST } from "@/app/api/contact/route";
import { contactContext, deliverContact } from "@/services/contact-form";
jest.mock("@/services/contact-form", () => ({
  contactContext: jest.fn(),
  deliverContact: jest.fn(),
}));
const good = {
  id: "04f9d758-aa82-484d-92f3-7d60d801c4f1",
  name: "",
  email: "student@example.com",
  topic: "その他",
  message: "テスト",
  privacyAcknowledged: true,
};
function request(
  body: unknown = good,
  origin = "https://school.example.com",
  extra: Record<string, string> = {},
) {
  return new NextRequest("https://school.example.com/api/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin,
      host: "school.example.com",
      ...extra,
    },
    body: JSON.stringify(body),
  });
}
beforeEach(() => {
  jest.clearAllMocks();
  delete process.env.CONTACT_FORM_PUBLIC;
  (contactContext as jest.Mock).mockResolvedValue({
    domain: { customDomain: "school.example.com" },
    owner: true,
  });
  (deliverContact as jest.Mock).mockResolvedValue({
    status: 200,
    message: "受付",
  });
});
it("blocks learner and anonymous submission before release", async () => {
  (contactContext as jest.Mock).mockResolvedValue({ domain: {}, owner: false });
  expect((await POST(request())).status).toBe(403);
  expect(deliverContact).not.toHaveBeenCalled();
});
it("blocks foreign-origin submissions even by owner", async () => {
  expect((await POST(request(good, "https://evil.example"))).status).toBe(403);
  expect(deliverContact).not.toHaveBeenCalled();
});
it("blocks missing tenant", async () => {
  (contactContext as jest.Mock).mockResolvedValue(null);
  expect((await POST(request())).status).toBe(403);
});
it("rejects unchecked disclosure before sending", async () => {
  expect(
    (await POST(request({ ...good, privacyAcknowledged: false }))).status,
  ).toBe(400);
  expect(deliverContact).not.toHaveBeenCalled();
});
it("rejects oversized body before sending", async () => {
  expect(
    (await POST(request({ ...good, message: "x".repeat(21000) }))).status,
  ).toBe(413);
  expect(deliverContact).not.toHaveBeenCalled();
});
it("returns opaque failure without leaking SMTP exception", async () => {
  (deliverContact as jest.Mock).mockRejectedValue(
    new Error("SMTP secret mailbox@example.com"),
  );
  const result = await POST(request());
  expect(result.status).toBe(503);
  expect(await result.text()).not.toContain("mailbox");
});
it("accepts canonical browser submission and returns no recipient address", async () => {
  const result = await POST(request());
  expect(result.status).toBe(200);
  expect(await result.text()).not.toContain("@example.com");
});
it("permits public form only after explicit release flag", async () => {
  process.env.CONTACT_FORM_PUBLIC = "true";
  (contactContext as jest.Mock).mockResolvedValue({
    domain: { customDomain: "school.example.com" },
    owner: false,
  });
  expect((await POST(request())).status).toBe(200);
});
