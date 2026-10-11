import { headers } from "next/headers";
import { notFound } from "next/navigation";
import ContactForm from "@/components/public/contact-form";
import { contactContext } from "@/services/contact-form";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "お問い合わせ・公開前の確認",
  robots: { index: false, follow: false },
};
export default async function Page() {
  const context = await contactContext(await headers());
  if (!context?.owner) notFound();
  return (
    <main>
      <p className="mx-auto max-w-[720px] rounded-lg bg-amber-50 p-4 text-amber-900">
        公開前の確認画面です。送信すると実際に運営者へ通知され、返信先へ受付メールが届きます。一般公開ページはまだ変更していません。
      </p>
      <ContactForm />
    </main>
  );
}
