import { render, screen } from "@testing-library/react";
import PaymentPlanList from "../payment-plan-list";
import { SiteInfoContext } from "@components/contexts";
import { Constants, PaymentPlan } from "@courselit/common-models";
const plan: PaymentPlan = {
    name: "受講プラン",
    planId: "fixture",
    type: Constants.PaymentPlanType.FREE,
    entityId: "course",
    entityType: Constants.MembershipEntityType.COURSE,
};
function show(value: PaymentPlan) {
    return render(
        <SiteInfoContext.Provider value={{ currencyISOCode: "JPY" }}>
            <PaymentPlanList
                paymentPlans={[value]}
                defaultPaymentPlanId="fixture"
                onPlanArchived={() => {}}
                entityId="course"
                entityType="product"
            />
        </SiteInfoContext.Provider>,
    );
}
it("renders a free course plan without treating an undefined label as an amount object", () => {
    show(plan);
    expect(screen.getAllByText("無料").length).toBeGreaterThan(0);
});
it("still renders the one-time yen price", () => {
    show({
        ...plan,
        type: Constants.PaymentPlanType.ONE_TIME,
        oneTimeAmount: 500,
    });
    expect(screen.getByText(/[¥￥]500/)).toBeInTheDocument();
});
