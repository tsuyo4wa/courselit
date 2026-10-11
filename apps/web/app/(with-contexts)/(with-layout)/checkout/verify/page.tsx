"use client";

import { checkoutStrings } from "@/config/strings";

import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PaymentVerificationStatus } from "./payment-verification-status";
import { useSearchParams } from "next/navigation";
import { useCallback, useContext, useEffect, useState } from "react";
import { AddressContext } from "@components/contexts";
import { FetchBuilder } from "@courselit/utils";
import { InvoicesStatus } from "@courselit/common-models";

export default function Page() {
    const params = useSearchParams();
    const id = params?.get("id");
    const [paymentStatus, setPaymentStatus] =
        useState<InvoicesStatus>("pending");
    const [loading, setLoading] = useState(false);
    const [learningHref, setLearningHref] = useState(
        "/dashboard/my-content/products",
    );
    const [courseTitle, setCourseTitle] = useState("");
    const [verificationError, setVerificationError] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const address = useContext(AddressContext);

    const verifyPayment = useCallback(async () => {
        if (!id) {
            setVerificationError(true);
            return;
        }
        setVerificationError(false);
        const fetch = new FetchBuilder()
            .setUrl(`${address.backend}/api/payment/verify-new`)
            .setHeaders({
                "Content-Type": "application/json",
            })
            .setPayload(JSON.stringify({ id }))
            .build();

        try {
            setLoading(true);
            const response = await fetch.exec();
            if (response.status) {
                setPaymentStatus(response.status);
                if (response.status === "paid") {
                    setLearningHref(
                        response.learningPath ||
                            "/dashboard/my-content/products",
                    );
                    setCourseTitle(response.title || "");
                }
            }
        } catch (error) {
            setVerificationError(true);
        } finally {
            setLoading(false);
            setAttempts((count) => count + 1);
        }
    }, [id, address.backend]);

    useEffect(() => {
        verifyPayment();
    }, [verifyPayment]);

    useEffect(() => {
        if (
            paymentStatus !== "pending" ||
            loading ||
            verificationError ||
            attempts === 0 ||
            attempts >= 12
        )
            return;
        const timer = setTimeout(verifyPayment, 2500);
        return () => clearTimeout(timer);
    }, [paymentStatus, loading, verificationError, attempts, verifyPayment]);

    return (
        <div className="flex flex-col items-center justify-center space-y-6 text-center max-w-md mx-auto pt-20">
            {paymentStatus === "paid" ? (
                <>
                    {/* <CheckCircle className="w-16 h-16 text-green-500" /> */}
                    <h2 className="text-2xl font-bold">
                        {checkoutStrings.thanksPurchase}
                    </h2>
                    <p className="text-muted-foreground">
                        {checkoutStrings.orderNumber}{" "}
                        <span className="font-medium">{id}</span>
                    </p>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <p className="text-lg font-medium text-green-600">
                        {checkoutStrings.paymentVerified}
                    </p>
                    <p className="text-muted-foreground">
                        {checkoutStrings.learningReady}
                    </p>
                    {courseTitle && (
                        <p className="font-medium">{courseTitle}</p>
                    )}
                </>
            ) : (
                <>
                    <h2 className="text-2xl font-bold">
                        {checkoutStrings.thanksOrder}
                    </h2>
                    <p className="text-muted-foreground">
                        {checkoutStrings.orderNumber}{" "}
                        <span className="font-medium">{id}</span>
                    </p>
                    <PaymentVerificationStatus
                        status={paymentStatus}
                        onRetryVerification={verifyPayment}
                        loading={loading}
                    />
                    {verificationError && (
                        <p role="alert" className="text-sm text-destructive">
                            {checkoutStrings.verifyError}
                        </p>
                    )}
                </>
            )}

            <div className="flex flex-col items-center gap-4 mt-6">
                {paymentStatus === "paid" && (
                    <Button asChild>
                        <Link href={learningHref}>
                            {checkoutStrings.startLearning}
                        </Link>
                    </Button>
                )}
                <Link
                    href="/dashboard/my-content/products"
                    className="text-sm underline underline-offset-4"
                >
                    {checkoutStrings.dashboard}
                </Link>
                {paymentStatus === "paid" && (
                    <p className="text-sm text-muted-foreground">
                        {checkoutStrings.nextVisit}
                    </p>
                )}
                {/* <Button variant="outline" asChild>
          <Link href="/support">Need Help?</Link>
        </Button> */}
            </div>
        </div>
    );
}
