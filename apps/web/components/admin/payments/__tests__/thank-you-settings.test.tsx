import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ThankYouSettings from "../thank-you-settings";
import { Constants, MembershipEntityType } from "@courselit/common-models";
import { thankYouStrings } from "@/config/strings";
import { BUTTON_SAVE } from "@ui-config/strings";
const mockExec = jest.fn(),
    mockPayload = jest.fn(),
    mockToast = jest.fn();
jest.mock("@courselit/components-library", () => ({
    useToast: () => ({ toast: mockToast }),
}));
jest.mock("@/hooks/use-graphql-fetch", () => ({
    useGraphQLFetch: () => ({
        setPayload: (p) => {
            mockPayload(p);
            return { build: () => ({ exec: mockExec }) };
        },
    }),
}));
const lp = "https://example.com/consultation";
function show(
    initialUrl: string | null = "",
    entityType: MembershipEntityType = Constants.MembershipEntityType.COURSE,
) {
    return render(
        <ThankYouSettings
            id="course-id"
            entityType={entityType}
            initialUrl={initialUrl}
        />,
    );
}
describe("thank-you settings form", () => {
    beforeEach(() => jest.clearAllMocks());
    it("treats a legacy null field as an empty unconfigured URL", () => {
        show(null);
        expect(screen.getByLabelText(thankYouStrings.label)).toHaveValue("");
        expect(screen.getByRole("status")).toHaveTextContent(
            thankYouStrings.empty,
        );
        expect(
            screen.getByRole("button", { name: BUTTON_SAVE }),
        ).toBeDisabled();
        expect(mockExec).not.toHaveBeenCalled();
    });
    it("starts unconfigured and saves only the URL through the course mutation", async () => {
        mockExec.mockResolvedValue({ updateCourse: { thankYouUrl: lp } });
        show();
        expect(screen.getByRole("status")).toHaveTextContent(
            thankYouStrings.empty,
        );
        expect(
            screen.getByRole("button", { name: BUTTON_SAVE }),
        ).toBeDisabled();
        fireEvent.change(screen.getByLabelText(thankYouStrings.label), {
            target: { value: lp },
        });
        fireEvent.click(screen.getByRole("button", { name: BUTTON_SAVE }));
        await waitFor(() => expect(mockExec).toHaveBeenCalledTimes(1));
        expect(mockPayload.mock.calls[0][0].variables).toEqual({
            id: "course-id",
            url: lp,
        });
        expect(mockPayload.mock.calls[0][0].query).not.toMatch(
            /title|price|published/,
        );
        await waitFor(() =>
            expect(screen.getByRole("status")).toHaveTextContent(
                thankYouStrings.configured,
            ),
        );
        expect(
            screen.getByRole("link", { name: thankYouStrings.open }),
        ).toHaveAttribute("href", lp);
        expect(
            screen.getByRole("button", { name: BUTTON_SAVE }),
        ).toBeDisabled();
    });
    it("allows clearing the setting and restores the unconfigured status", async () => {
        mockExec.mockResolvedValue({ updateCourse: { thankYouUrl: "" } });
        show(lp);
        fireEvent.change(screen.getByLabelText(thankYouStrings.label), {
            target: { value: "" },
        });
        fireEvent.click(screen.getByRole("button", { name: BUTTON_SAVE }));
        await waitFor(() =>
            expect(screen.getByRole("status")).toHaveTextContent(
                thankYouStrings.empty,
            ),
        );
        expect(
            screen.queryByRole("link", { name: thankYouStrings.open }),
        ).toBeNull();
    });
    it("uses the community mutation for a bundle", async () => {
        mockExec.mockResolvedValue({ updateCommunity: { thankYouUrl: lp } });
        show("", Constants.MembershipEntityType.COMMUNITY);
        fireEvent.change(screen.getByLabelText(thankYouStrings.label), {
            target: { value: lp },
        });
        fireEvent.click(screen.getByRole("button", { name: BUTTON_SAVE }));
        await waitFor(() => expect(mockExec).toHaveBeenCalledTimes(1));
        expect(mockPayload.mock.calls[0][0].query).toContain("updateCommunity");
    });
    it("keeps unsaved input and saved status on server rejection", async () => {
        mockExec.mockRejectedValue(new Error("Not authorized"));
        show();
        fireEvent.change(screen.getByLabelText(thankYouStrings.label), {
            target: { value: lp },
        });
        fireEvent.click(screen.getByRole("button", { name: BUTTON_SAVE }));
        await waitFor(() =>
            expect(mockToast).toHaveBeenCalledWith(
                expect.objectContaining({ variant: "destructive" }),
            ),
        );
        expect(screen.getByRole("status")).toHaveTextContent(
            thankYouStrings.empty,
        );
        expect(screen.getByLabelText(thankYouStrings.label)).toHaveValue(lp);
        expect(screen.getByRole("button", { name: BUTTON_SAVE })).toBeEnabled();
    });
});
