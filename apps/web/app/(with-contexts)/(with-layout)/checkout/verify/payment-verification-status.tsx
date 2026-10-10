import { checkoutStrings } from "@/config/strings";
import { XCircle, Loader2, RefreshCw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoicesStatus } from "@courselit/common-models";

interface PaymentVerificationStatusProps {
    status: InvoicesStatus;
    onRetryVerification: () => Promise<void>;
    loading: boolean;
}

export function PaymentVerificationStatus({
    status,
    onRetryVerification,
    loading,
}: PaymentVerificationStatusProps) {
    return (
        <div className="flex flex-col items-center space-y-4">
            {status !== "paid" && (
                <>
                    {status === "pending" && (
                        <>
                            <Button
                                onClick={onRetryVerification}
                                disabled={loading}
                            >
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    {checkoutStrings.checkAgain}
                                </>
                            </Button>
                            {!loading && (
                                <>
                                    <Clock className="w-8 h-8 text-black-500" />
                                    <p className="text-lg font-medium">
                                        {checkoutStrings.paymentPending}
                                    </p>
                                </>
                            )}
                            {loading && (
                                <>
                                    <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
                                    <h2 className="text-2xl font-bold">
                                        {checkoutStrings.verifying}
                                    </h2>
                                    <p className="text-muted-foreground">
                                        {checkoutStrings.wait}
                                    </p>
                                </>
                            )}
                        </>
                    )}
                    {status === "failed" && (
                        <>
                            <XCircle className="w-8 h-8 text-red-500" />
                            <p className="text-lg font-medium">
                                {checkoutStrings.paymentFailed}
                            </p>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
