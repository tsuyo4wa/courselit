"use client";
import { finalUiDynamic } from "@/config/strings";

import { finalUiText, finalUiLabels } from "@/config/strings";

import { useContext, useState } from "react";
import { Plus, Archive, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Constants, PaymentPlan } from "@courselit/common-models";
import { formatCurrency } from "@courselit/utils";
import Link from "next/link";
import { SiteInfoContext } from "@/components/contexts";
const { PaymentPlanType: paymentPlanType } = Constants;

function formatAmount(
    amount: number | undefined,
    currencyISOCode: string,
): string {
    return amount
        ? formatCurrency(amount, currencyISOCode)
        : finalUiText["Free"];
}

function getPlanAmount(
    plan: PaymentPlan,
    currencyISOCode: string,
): string | { amount: string; installments: number } {
    switch (plan.type) {
        case paymentPlanType.FREE:
            return finalUiText["Free"];
        case paymentPlanType.ONE_TIME:
            return formatAmount(plan.oneTimeAmount, currencyISOCode);
        case paymentPlanType.SUBSCRIPTION:
            return formatAmount(
                plan.subscriptionMonthlyAmount || plan.subscriptionYearlyAmount,
                currencyISOCode,
            );
        case paymentPlanType.EMI:
            return {
                amount: formatAmount(plan.emiAmount, currencyISOCode),
                installments: plan.emiTotalInstallments || 0,
            };
        default:
            return finalUiLabels.unavailable;
    }
}

function getPlanTypeLabel(plan: PaymentPlan): string {
    const { type } = plan;

    switch (type) {
        case paymentPlanType.ONE_TIME:
            return finalUiLabels.oneTime;
        case paymentPlanType.SUBSCRIPTION:
            return plan.subscriptionYearlyAmount
                ? finalUiLabels.yearly
                : finalUiLabels.monthly;
        case paymentPlanType.EMI:
            return finalUiLabels.installments;
        case paymentPlanType.FREE:
            return finalUiText["Free"];
        default:
            return type;
    }
}

export default function PaymentPlanList({
    paymentPlans = [],
    onPlanArchived,
    onDefaultPlanChanged,
    defaultPaymentPlanId,
    entityId,
    entityType,
    disabled = false,
}: {
    paymentPlans: PaymentPlan[];
    onPlanArchived: (planId: PaymentPlan["planId"]) => void;
    onDefaultPlanChanged?: (planId: string) => void;
    defaultPaymentPlanId?: string;
    entityId: string;
    entityType: "community" | "product";
    disabled?: boolean;
}) {
    const [planToArchive, setPlanToArchive] = useState<PaymentPlan | null>(
        null,
    );
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const siteinfo = useContext(SiteInfoContext);
    const currencyISOCode = siteinfo.currencyISOCode || "USD";

    function handleArchive(plan: PaymentPlan) {
        onPlanArchived(plan.planId);
        setPlanToArchive(null);
        setIsDialogOpen(false);
    }

    return (
        <div className="w-full max-w-md mx-auto p-2 space-y-2">
            <div className="space-y-2">
                {paymentPlans.map((plan) => (
                    <div
                        key={plan.planId}
                        className="p-2 border rounded-md bg-background hover:border-primary/50 transition-colors"
                    >
                        <div className="flex justify-between items-center mb-1">
                            <Link
                                href={`/dashboard/paymentplan/${entityType}/${plan.entityId}/edit/${plan.planId}`}
                            >
                                <h3 className="text-sm font-medium hover:underline">
                                    {plan.name}
                                </h3>
                            </Link>
                            <div className="flex items-center space-x-2">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    onDefaultPlanChanged?.(
                                                        plan.planId,
                                                    );
                                                }}
                                                disabled={
                                                    disabled ||
                                                    defaultPaymentPlanId ===
                                                        plan.planId
                                                }
                                            >
                                                <Star
                                                    className={`h-3 w-3`}
                                                    color={
                                                        defaultPaymentPlanId ===
                                                        plan.planId
                                                            ? "black"
                                                            : "#d3d3d3"
                                                    }
                                                />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>
                                                {
                                                    finalUiText[
                                                        "Make recommended"
                                                    ]
                                                }
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <Dialog
                                    open={isDialogOpen}
                                    onOpenChange={setIsDialogOpen}
                                >
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setPlanToArchive(
                                                                plan,
                                                            );
                                                            setIsDialogOpen(
                                                                true,
                                                            );
                                                        }}
                                                        disabled={disabled}
                                                    >
                                                        <Archive className="h-3 w-3" />
                                                    </Button>
                                                </DialogTrigger>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>
                                                    {
                                                        finalUiText[
                                                            "Archive plan"
                                                        ]
                                                    }
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>
                                                {
                                                    finalUiText[
                                                        "Are you sure you want to archive this plan?"
                                                    ]
                                                }
                                            </DialogTitle>
                                            <DialogDescription>
                                                {
                                                    finalUiText[
                                                        "This action cannot be undone. This will permanently archive the payment plan &quot;"
                                                    ]
                                                }
                                                {planToArchive?.name}
                                                &quot;.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setPlanToArchive(null);
                                                    setIsDialogOpen(false);
                                                }}
                                            >
                                                {finalUiText["Cancel"]}
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={() =>
                                                    planToArchive &&
                                                    handleArchive(planToArchive)
                                                }
                                                disabled={disabled}
                                            >
                                                {finalUiText["Archive"]}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-xs">
                                {(() => {
                                    const planAmount = getPlanAmount(
                                        plan,
                                        currencyISOCode,
                                    );
                                    return typeof planAmount === "string"
                                        ? planAmount
                                        : `${planAmount.amount} × ${planAmount.installments}`;
                                })()}
                            </span>
                            <Badge
                                variant="secondary"
                                className="rounded-full px-1.5 py-0.5 text-[10px]"
                            >
                                {getPlanTypeLabel(plan)}
                            </Badge>
                            {plan.includedProducts &&
                                plan.includedProducts.length > 0 && (
                                    <Badge
                                        variant="outline"
                                        className="rounded-full px-1.5 py-0.5 text-[10px]"
                                    >
                                        {finalUiDynamic.additionalProducts(
                                            plan.includedProducts.length,
                                        )}
                                    </Badge>
                                )}
                        </div>
                    </div>
                ))}
                <div className="p-2 border border-dashed rounded-md bg-background hover:border-primary/50 transition-colors group cursor-pointer mt-4">
                    <Link
                        href={`/dashboard/paymentplan/${entityType}/${entityId}/new`}
                    >
                        <div className="flex justify-between items-center mb-1">
                            <h3 className="text-sm font-medium text-muted-foreground group-hover:text-primary">
                                {finalUiText["New Plan"]}
                            </h3>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            >
                                <Plus className="h-3 w-3" />
                            </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground">
                                {finalUiLabels.planPlaceholder}
                            </span>
                            <Badge
                                variant="secondary"
                                className="rounded-full px-1.5 py-0.5 text-[10px]"
                            >
                                {finalUiText["Payment frequency"]}
                            </Badge>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
