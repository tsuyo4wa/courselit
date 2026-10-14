/** A free course label describes its default offer, never a coupon or trial. */
export function isFreeCourse(course: {
    type?: unknown;
    defaultPaymentPlan?: string;
    paymentPlans?: { planId: string; type: string }[];
    costType?: unknown;
}): boolean {
    if (
        typeof course.type !== "string" ||
        course.type.toLowerCase() !== "course"
    )
        return false;
    if (course.defaultPaymentPlan) {
        return (
            course.paymentPlans
                ?.find((plan) => plan.planId === course.defaultPaymentPlan)
                ?.type.toLowerCase() === "free"
        );
    }
    const plans = course.paymentPlans || [];
    if (plans.length === 1) return plans[0].type.toLowerCase() === "free";
    return (
        plans.length === 0 &&
        typeof course.costType === "string" &&
        course.costType.toLowerCase() === "free"
    );
}
