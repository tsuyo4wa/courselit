import { parseContactInput, htmlEscape } from "../contact-input";
const good = {
  id: "04f9d758-aa82-484d-92f3-7d60d801c4f1",
  name: "テスト",
  email: "student+contact@example.com",
  topic: "ログイン・受講について",
  message: "テスト本文",
  privacyAcknowledged: true,
};
describe("Contact input boundary", () => {
  it("accepts Gmail aliases and trims without rewriting the message", () =>
    expect(
      parseContactInput({ ...good, message: " 本文\n続き " }).message,
    ).toBe("本文\n続き"));
  it.each([
    "to@example.com\r\nBcc:other@example.com",
    "a@example.com,b@example.com",
    "Name <a@example.com>",
    "a@bad",
    "日本@example.com",
  ])("rejects non-single mailbox %s", (email) =>
    expect(() => parseContactInput({ ...good, email })).toThrow(),
  );
  it.each([
    { privacyAcknowledged: false },
    { website: "bot" },
    { message: "x".repeat(4001) },
    { name: "a\r\nheader" },
    { topic: "unknown" },
    { id: "arbitrary" },
  ])("rejects unsafe/unchecked input", (change) =>
    expect(() => parseContactInput({ ...good, ...change })).toThrow(),
  );
  it("does not execute user HTML in notification", () =>
    expect(htmlEscape('<img src=x onerror="alert(1)">')).toBe(
      "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;",
    ));
});
