import { headers } from "next/headers";
import { notFound } from "next/navigation";
import ContactForm from "@/components/public/contact-form";
import { contactContext } from "@/services/contact-form";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "お問い合わせ",
  robots: { index: false, follow: false },
};
export default async function Page() {
  if (process.env.CONTACT_FORM_PUBLIC !== "true") notFound();
  if (!(await contactContext(await headers()))) notFound();
  return (
    <main className="px-4 py-8">
      <ContactForm />
    </main>
  );
}
