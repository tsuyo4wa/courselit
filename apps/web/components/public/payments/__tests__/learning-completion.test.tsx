import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import Page from "@/app/(with-contexts)/(with-layout)/checkout/verify/page";
import { AddressContext } from "@components/contexts";
import { checkoutStrings, thankYouStrings } from "@/config/strings";

const mockExec = jest.fn();
const mockReplace = jest.fn();
const originalLocation = window.location;
beforeAll(() => {
    Object.defineProperty(window, "location", {
        configurable: true,
        value: { replace: mockReplace },
    });
});
afterAll(() => {
    Object.defineProperty(window, "location", {
        configurable: true,
        value: originalLocation,
    });
});
jest.mock("next/navigation", () => ({
    useSearchParams: () => new URLSearchParams("id=invoice"),
}));
jest.mock("@courselit/utils", () => ({
    FetchBuilder: class {
        setUrl() {
            return this;
        }
        setHeaders() {
            return this;
        }
        setPayload() {
            return this;
        }
        build() {
            return { exec: mockExec };
        }
    },
}));

function renderPage() {
    return render(
        <AddressContext.Provider
            value={{ backend: "https://school.example" } as any}
        >
            <Page />
        </AddressContext.Provider>,
    );
}

describe("purchase completion to learning", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    afterEach(() => {
        jest.useRealTimers();
    });
    it("offers the purchased course and a return-visit course list", async () => {
        mockExec.mockResolvedValue({
            status: "paid",
            title: "仕事の講座",
            learningPath: "/course/work/c?learn=true",
        });
        renderPage();
        expect(
            await screen.findByRole("link", {
                name: checkoutStrings.startLearning,
            }),
        ).toHaveAttribute("href", "/course/work/c?learn=true");
        expect(screen.getByText("仕事の講座")).toBeVisible();
        expect(
            screen.getByRole("link", { name: checkoutStrings.dashboard }),
        ).toHaveAttribute("href", "/dashboard/my-content/products");
    });
    it("waits for access to be granted before offering learning", async () => {
        jest.useFakeTimers();
        mockExec
            .mockResolvedValueOnce({ status: "pending" })
            .mockResolvedValueOnce({
                status: "paid",
                learningPath: "/course/work/c?learn=true",
            });
        renderPage();
        await waitFor(() =>
            expect(
                screen.getByText(checkoutStrings.paymentPending),
            ).toBeVisible(),
        );
        expect(
            screen.queryByRole("link", { name: checkoutStrings.startLearning }),
        ).toBeNull();
        await act(async () => {
            jest.advanceTimersByTime(2500);
        });
        expect(
            await screen.findByRole("link", {
                name: checkoutStrings.startLearning,
            }),
        ).toBeVisible();
        expect(mockExec).toHaveBeenCalledTimes(2);
    });
    it("shows verification errors without claiming payment or access succeeded", async () => {
        mockExec.mockRejectedValue(new Error("network"));
        renderPage();
        expect(await screen.findByRole("alert")).toHaveTextContent(
            checkoutStrings.verifyError,
        );
        expect(
            screen.queryByRole("link", { name: checkoutStrings.startLearning }),
        ).toBeNull();
    });
    it("redirects only after verified payment and keeps a learning fallback", async () => {
        mockExec.mockResolvedValue({
            status: "paid",
            redirectUrl: "https://example.com/consultation",
            learningPath: "/course/work/c?learn=true",
        });
        renderPage();
        await waitFor(() =>
            expect(mockReplace).toHaveBeenCalledWith(
                "https://example.com/consultation",
            ),
        );
        expect(
            screen.getByRole("link", { name: thankYouStrings.continue }),
        ).toHaveAttribute("href", "https://example.com/consultation");
        expect(
            screen.getByRole("link", { name: checkoutStrings.startLearning }),
        ).toHaveAttribute("href", "/course/work/c?learn=true");
    });
    it("ignores a redirect before payment is ready", async () => {
        mockExec.mockResolvedValue({
            status: "pending",
            redirectUrl: "https://example.com/consultation",
        });
        renderPage();
        await waitFor(() =>
            expect(
                screen.getByText(checkoutStrings.paymentPending),
            ).toBeVisible(),
        );
        expect(mockReplace).not.toHaveBeenCalled();
    });
    it("ignores an unsafe redirect even if returned by a malformed response", async () => {
        mockExec.mockResolvedValue({
            status: "paid",
            redirectUrl: "javascript:alert(1)",
        });
        renderPage();
        await waitFor(() =>
            expect(
                screen.getByRole("link", {
                    name: checkoutStrings.startLearning,
                }),
            ).toBeVisible(),
        );
        expect(mockReplace).not.toHaveBeenCalled();
    });
});
