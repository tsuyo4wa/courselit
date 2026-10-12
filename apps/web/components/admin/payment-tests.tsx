"use client";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { paymentTestText as t } from "@/config/strings";
import type {
    PaymentTestStatus,
    PaymentTestSettingsInput,
    PaymentTestLearningLink,
    AdminPaymentConnectionProps,
} from "@courselit/common-models";
const schema = z.object({
    publicKey: z.string().min(10),
    secretKey: z.string().min(10),
    webhookSecret: z.string().startsWith("whsec_"),
});
async function action(body: unknown) {
    const r = await fetch("/api/admin/payment-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || t.failed);
    return data;
}
function Connection({ mode, onSaved }: AdminPaymentConnectionProps) {
    const [busy, setBusy] = useState(false),
        [message, setMessage] = useState("");
    const current = useRef<PaymentTestSettingsInput>({
        publicKey: "",
        secretKey: "",
        webhookSecret: "",
    });
    const form = useForm<PaymentTestSettingsInput>({
        resolver: zodResolver(schema),
        defaultValues: current.current,
        mode: "onChange",
    });
    const values = form.watch();
    current.current = values;
    return (
        <form
            className="rounded-xl border p-5 space-y-3"
            onSubmit={form.handleSubmit(async (data) => {
                setBusy(true);
                setMessage("");
                try {
                    await action({ action: "configure", mode, ...data });
                    form.reset({
                        publicKey: "",
                        secretKey: "",
                        webhookSecret: "",
                    });
                    setMessage(t.saved);
                    onSaved();
                } catch (e) {
                    setMessage((e as Error).message);
                } finally {
                    setBusy(false);
                }
            })}
        >
            <h2 className="font-semibold text-lg">
                {mode === "live" ? t.live : t.test}
            </h2>
            {(["publicKey", "secretKey", "webhookSecret"] as const).map(
                (name, i) => (
                    <label key={name} className="block text-sm">
                        {[t.key, t.secret, t.webhook][i]}
                        <Input
                            type="password"
                            autoComplete="off"
                            {...form.register(name)}
                        />
                    </label>
                ),
            )}
            <Button
                type="submit"
                disabled={
                    busy ||
                    !form.formState.isValid ||
                    !current.current.secretKey
                }
            >
                {t.save}
            </Button>
            <p role="status">{message}</p>
        </form>
    );
}
export default function PaymentTests() {
    const [data, setData] = useState<PaymentTestStatus>(),
        [entity, setEntity] = useState(""),
        [plan, setPlan] = useState(""),
        [message, setMessage] = useState(""),
        [busy, setBusy] = useState(false),
        [links, setLinks] = useState<Record<string, PaymentTestLearningLink[]>>(
            {},
        );
    const startId = useRef("");
    const load = async () => {
        const r = await fetch("/api/admin/payment-tests", {
            cache: "no-store",
        });
        if (!r.ok) throw new Error(t.failed);
        setData(await r.json());
    };
    useEffect(() => {
        load().catch(() => setMessage(t.failed));
    }, []);
    const product = data?.products.find((p) => `${p.type}:${p.id}` === entity);
    const refresh = async (testId: string) => {
        setBusy(true);
        try {
            await action({ action: "refresh", testId });
            await load();
            const r = await fetch(
                `/api/admin/payment-tests?learn=${encodeURIComponent(testId)}`,
                { cache: "no-store" },
            );
            if (r.ok) {
                const x = await r.json();
                setLinks((old) => ({ ...old, [testId]: x.links }));
            }
        } catch (e) {
            setMessage((e as Error).message);
        } finally {
            setBusy(false);
        }
    };
    return (
        <main className="mx-auto max-w-4xl p-6 space-y-6">
            <h1 className="text-2xl font-semibold">{t.title}</h1>
            <p className="leading-relaxed">{t.description}</p>
            <p className="text-sm">
                {t.live}：{data?.liveReady ? t.ready : t.notReady} ／ {t.test}：
                {data?.testReady ? t.ready : t.notReady}
            </p>
            <div className="grid gap-4 md:grid-cols-2">
                <Connection mode="live" onSaved={() => void load()} />
                <Connection mode="test" onSaved={() => void load()} />
            </div>
            <p className="text-sm text-muted-foreground">{t.keyNote}</p>
            <p className="text-sm">{t.blocked}</p>
            <section className="rounded-xl border p-5 space-y-3">
                <h2 className="font-semibold">{t.start}</h2>
                {data?.products.length ? (
                    <>
                        <label className="block">
                            {t.product}
                            <select
                                className="block w-full border rounded p-2"
                                value={entity}
                                onChange={(e) => {
                                    setEntity(e.target.value);
                                    setPlan("");
                                    startId.current = "";
                                }}
                            >
                                <option value="">—</option>
                                {data.products.map((p) => (
                                    <option
                                        key={`${p.type}:${p.id}`}
                                        value={`${p.type}:${p.id}`}
                                    >
                                        {p.title}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="block">
                            {t.plan}
                            <select
                                className="block w-full border rounded p-2"
                                value={plan}
                                onChange={(e) => {
                                    setPlan(e.target.value);
                                    startId.current = "";
                                }}
                            >
                                <option value="">—</option>
                                {product?.plans.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.title}（
                                        {new Intl.NumberFormat("ja-JP", {
                                            style: "currency",
                                            currency: data?.currency || "JPY",
                                        }).format(p.amount)}
                                        ）
                                    </option>
                                ))}
                            </select>
                        </label>
                        <Button
                            disabled={
                                busy || !data.testReady || !product || !plan
                            }
                            onClick={async () => {
                                if (!product) return;
                                setBusy(true);
                                setMessage("");
                                startId.current ||= crypto.randomUUID();
                                try {
                                    const x = await action({
                                        action: "start",
                                        entityId: product.id,
                                        entityType: product.type,
                                        planId: plan,
                                        requestId: startId.current,
                                    });
                                    if (
                                        new URL(x.url).hostname !==
                                        "checkout.stripe.com"
                                    )
                                        throw new Error(t.failed);
                                    location.assign(x.url);
                                } catch (e) {
                                    setMessage((e as Error).message);
                                    setBusy(false);
                                }
                            }}
                        >
                            {t.start}
                        </Button>
                    </>
                ) : (
                    <p>{t.empty}</p>
                )}
            </section>
            <p role="status">{message}</p>
            <section className="space-y-3">
                <h2 className="font-semibold text-lg">{t.history}</h2>
                {data?.tests.map((x) => (
                    <article
                        key={x.testId}
                        className="border rounded-xl p-4 space-y-2"
                    >
                        <p className="font-medium">{x.title}</p>
                        <p>
                            {x.status === "paid" ? t.paid : t.pending} ／{" "}
                            {t.mail}：
                            {x.mailStatus === "sent"
                                ? t.sent
                                : x.mailStatus === "sending"
                                  ? t.sending
                                  : x.mailStatus === "failed"
                                    ? t.mailFailed
                                    : t.pending}
                        </p>
                        <p className="text-xs">{x.testId}</p>
                        <Button
                            disabled={busy}
                            onClick={() => void refresh(x.testId)}
                        >
                            {t.refresh}
                        </Button>
                        {links[x.testId]?.map((link) => (
                            <Link
                                className="block underline"
                                key={link.url}
                                href={link.url}
                            >
                                {t.learn}：{link.title}
                            </Link>
                        ))}
                    </article>
                ))}
            </section>
            <p className="text-sm text-muted-foreground">{t.preview}</p>
        </main>
    );
}
