/** @jest-environment node */
import Layout from "../layout";
const mockSetup = jest.fn();
jest.mock("@ui-lib/utils", () => ({
    getFullSiteSetup: (...args: any[]) => mockSetup(...args),
}));
jest.mock("@/auth", () => ({
    auth: { api: { getSession: jest.fn().mockResolvedValue(null) } },
}));
jest.mock("next/headers", () => ({
    headers: jest.fn().mockResolvedValue(new Headers()),
}));
jest.mock("@/app/actions", () => ({
    getAddressFromHeaders: jest
        .fn()
        .mockResolvedValue({ backend: "https://school.example.com" }),
}));
jest.mock("../layout-with-context", () => ({
    __esModule: true,
    default: () => null,
}));
describe("server learner-upload context bridge", () => {
    it.each([false, true, undefined])(
        "passes saved learner upload setting (%s) through the real layout formatter",
        async (value) => {
            mockSetup.mockResolvedValue({
                settings: { title: "School", learnerUploadsEnabled: value },
            });
            const element = await Layout({ children: null });
            expect(element.props.siteinfo.learnerUploadsEnabled).toBe(
                value !== false,
            );
        },
    );
});
