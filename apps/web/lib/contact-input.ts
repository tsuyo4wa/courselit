export const contactTopics = [
  "ログイン・受講について",
  "登録情報・退会について",
  "個人情報の取り扱いについて",
  "連絡先メールアドレスの案内を希望",
  "その他",
];
export type ContactInput = {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  privacyAcknowledged: true;
};
export function parseContactInput(value: unknown): ContactInput {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("入力内容を確認してください。");
  const v = value as Record<string, unknown>;
  if (v.website) throw new Error("送信できませんでした。");
  const field = (key: string, max: number, required = true) => {
    const raw = v[key];
    if (
      typeof raw !== "string" ||
      raw.length > max ||
      (required && !raw.trim())
    )
      throw new Error("入力内容を確認してください。");
    return raw.trim();
  };
  const id = field("id", 36);
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      id,
    )
  )
    throw new Error("ページを開き直してください。");
  const name = field("name", 80, false),
    email = field("email", 254).toLowerCase();
  // Restrict to a single ASCII mailbox, never an address list or header value.
  if (
    !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/i.test(
      email,
    ) ||
    /[\r\n\x00-\x1f]/.test(name)
  )
    throw new Error("返信先メールアドレスとお名前を確認してください。");
  const topic = field("topic", 80),
    message = field("message", 4000);
  if (
    !contactTopics.includes(topic) ||
    /\x00/.test(message) ||
    v.privacyAcknowledged !== true
  )
    throw new Error("入力内容と情報の取り扱いをご確認ください。");
  return { id, name, email, topic, message, privacyAcknowledged: true };
}
export function htmlEscape(value: string) {
  return value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}
