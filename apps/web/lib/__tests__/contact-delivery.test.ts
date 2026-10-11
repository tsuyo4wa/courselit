const records = new Map();
const counts = new Map();
const receipts = {
  createIndex: jest.fn(),
  findOne: jest.fn(async (q) => records.get(q._id)),
  insertOne: jest.fn(async (d) => {
    if (records.has(d._id)) throw { code: 11000 };
    records.set(d._id, { ...d });
  }),
  updateOne: jest.fn(async (q, u) => Object.assign(records.get(q._id), u.$set)),
};
const limits = {
  createIndex: jest.fn(),
  findOneAndUpdate: jest.fn(async (q) => {
    const count = (counts.get(q._id) || 0) + 1;
    counts.set(q._id, count);
    return { count };
  }),
};
const sendMail = jest.fn();
jest.mock("mongoose", () => ({
  __esModule: true,
  default: {
    connection: {
      db: {
        collection: (n: string) =>
          n === "contact_receipts" ? receipts : limits,
      },
    },
  },
}));
jest.mock("nodemailer", () => ({
  __esModule: true,
  default: { createTransport: () => ({ sendMail, close: jest.fn() }) },
}));
jest.mock("@models/Domain", () => ({ __esModule: true, default: {} }));
jest.mock("@models/User", () => ({ __esModule: true, default: {} }));
jest.mock("@/auth", () => ({ auth: {} }));
jest.mock("@/app/api/public-api", () => ({
  validatePublicApiRequest: jest.fn(),
}));
import { deliverContact } from "@/services/contact-form";
const input = {
  id: "04f9d758-aa82-484d-92f3-7d60d801c4f1",
  name: "テスト",
  email: "student@example.com",
  topic: "その他",
  message: "<script>unsafe</script>",
  privacyAcknowledged: true as const,
};
const domain = { _id: "school", email: "owner@example.com" };
beforeEach(() => {
  records.clear();
  counts.clear();
  sendMail.mockReset();
  sendMail.mockResolvedValue({ accepted: ["ok"] });
  Object.assign(process.env, {
    AUTH_SECRET: "unit-test-only",
    EMAIL_FROM: "sender@example.com",
    EMAIL_HOST: "smtp.example.com",
    EMAIL_USER: "test",
    EMAIL_PASS: "unit-test-only",
  });
});
it("notifies only server recipient and accepts receipt with separate reply-to", async () => {
  expect((await deliverContact(domain, input, "test-ip")).status).toBe(200);
  expect(sendMail).toHaveBeenCalledTimes(2);
  expect(sendMail.mock.calls[0][0].to).toBe(domain.email);
  expect(sendMail.mock.calls[0][0].replyTo).toBe(input.email);
  expect(sendMail.mock.calls[0][0].html).not.toContain("<script>");
  expect(sendMail.mock.calls[1][0].to).toBe(input.email);
  expect(sendMail.mock.calls[1][0].text).not.toContain(input.message);
});
it("same submission retried or submitted concurrently sends exactly two mails", async () => {
  await Promise.all([
    deliverContact(domain, input, "test-ip"),
    deliverContact(domain, input, "test-ip"),
  ]);
  expect(sendMail).toHaveBeenCalledTimes(2);
  expect((await deliverContact(domain, input, "test-ip")).status).toBe(200);
  expect(sendMail).toHaveBeenCalledTimes(2);
});
it("does not resend after uncertain SMTP outcome", async () => {
  sendMail.mockRejectedValue(new Error("secret SMTP failure"));
  expect((await deliverContact(domain, input, "test-ip")).status).toBe(503);
  expect((await deliverContact(domain, input, "test-ip")).status).toBe(409);
  expect(sendMail).toHaveBeenCalledTimes(1);
});
it("receipt failure preserves accepted notification without duplicate retry", async () => {
  sendMail
    .mockResolvedValueOnce({ accepted: ["ok"] })
    .mockRejectedValueOnce(new Error("receipt failure"));
  expect((await deliverContact(domain, input, "test-ip")).status).toBe(202);
  expect((await deliverContact(domain, input, "test-ip")).status).toBe(202);
  expect(sendMail).toHaveBeenCalledTimes(2);
});
it("rejects changed contents with same submission ID", async () => {
  await deliverContact(domain, input, "test-ip");
  expect(
    (await deliverContact(domain, { ...input, message: "changed" }, "test-ip"))
      .status,
  ).toBe(409);
  expect(sendMail).toHaveBeenCalledTimes(2);
});
it("limits repeated messages to same email", async () => {
  for (let i = 0; i < 3; i++)
    await deliverContact(
      domain,
      { ...input, id: `04f9d758-aa82-484d-92f3-7d60d801c4f${i}` },
      "test-ip",
    );
  expect(
    (
      await deliverContact(
        domain,
        { ...input, id: "04f9d758-aa82-484d-92f3-7d60d801c4f4" },
        "test-ip",
      )
    ).status,
  ).toBe(429);
  expect(sendMail).toHaveBeenCalledTimes(6);
});
it("stores no message, name, address or raw IP in receipt records", async () => {
  await deliverContact(domain, input, "private-ip");
  const stored = JSON.stringify([
    ...Array.from(records.values()),
    ...Array.from(counts.keys()),
  ]);
  for (const value of [input.email, input.message, input.name, "private-ip"])
    expect(stored).not.toContain(value);
});
