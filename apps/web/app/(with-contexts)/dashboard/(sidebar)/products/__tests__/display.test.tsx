import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import Page from "../page";
import { useProducts } from "@/hooks/use-products";
import { finalUiText, productDisplayText } from "@/config/strings";

const mockPush = jest.fn();
let mockSearchParams = new URLSearchParams();
jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: mockPush }),
    useSearchParams: () => mockSearchParams,
}));
jest.mock("@/hooks/use-products", () => ({ useProducts: jest.fn() }));
jest.mock("@components/admin/dashboard-content", () => ({
    __esModule: true,
    default: ({ children }) => <main>{children}</main>,
}));
jest.mock("@components/contexts", () => ({
    SiteInfoContext: require("react").createContext({ currencyISOCode: "JPY" }),
}));
jest.mock("@components/resources", () => ({
    __esModule: true,
    default: () => null,
}));
jest.mock("@courselit/components-library", () => ({
    ContentCard: ({ href, children }) => <a href={href}>{children}</a>,
    // Test double for the optimized shared image component.
    // eslint-disable-next-line @next/next/no-img-element
    ContentCardImage: ({ src, alt }) => <img src={src} alt={alt} />,
    ContentCardContent: ({ children }) => <div>{children}</div>,
    ContentCardHeader: ({ children }) => <h3>{children}</h3>,
    Badge: ({ children }) => <span>{children}</span>,
    getSymbolFromCurrency: () => "¥",
}));
jest.mock("@components/ui/select", () => ({
    Select: ({ value, onValueChange, children }) => (
        <select
            aria-label="商品の種類"
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
        >
            {children}
        </select>
    ),
    SelectTrigger: () => null,
    SelectValue: () => null,
    SelectContent: ({ children }) => <>{children}</>,
    SelectItem: ({ value, children }) => (
        <option value={value}>{children}</option>
    ),
}));
jest.mock("@components/public/pagination", () => ({
    PaginationControls: ({ onPageChange }) => (
        <button onClick={() => onPageChange(2)}>次のページ</button>
    ),
}));
jest.mock("@/app/(with-contexts)/(with-layout)/products/empty-state", () => ({
    EmptyState: () => <p>商品はありません</p>,
}));

const products = [
    {
        courseId: "course-one",
        title: "ChatGPT無料講座",
        type: "course",
        featuredImage: { file: "/course-one.webp" },
        privacy: "public",
        published: true,
        sales: 50000,
        customers: 12,
    },
    {
        courseId: "download-two",
        title: "制作テンプレート",
        type: "download",
        privacy: "hidden",
        published: false,
    },
];
const useProductsMock = jest.mocked(useProducts);
const storageKey = "courselit:admin:products:view";

beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
    mockSearchParams = new URLSearchParams();
    useProductsMock.mockReturnValue({
        products: products as never,
        loading: false,
        totalPages: 18,
    });
});
afterEach(() => jest.restoreAllMocks());

it("switches the same courses between cards and thumbnail rows with their existing destinations and metrics", () => {
    render(<Page />);
    expect(
        screen.getByRole("button", { name: productDisplayText.cards }),
    ).toHaveAttribute("aria-pressed", "true");
    const cards = screen.getByRole("region", {
        name: productDisplayText.cards,
    });
    const cardLinks = within(cards)
        .getAllByRole("link")
        .map((link) => link.getAttribute("href"));
    fireEvent.click(
        screen.getByRole("button", { name: productDisplayText.list }),
    );
    const list = screen.getByRole("list", { name: productDisplayText.list });
    expect(
        within(list)
            .getAllByRole("link")
            .map((link) => link.getAttribute("href")),
    ).toEqual(cardLinks);
    expect(
        within(list).getByRole("heading", { name: products[0].title }),
    ).toBeVisible();
    expect(list.querySelectorAll("img")[0]).toHaveAttribute(
        "src",
        "/course-one.webp",
    );
    expect(list.querySelectorAll("img")[1]).toHaveAttribute(
        "src",
        "/courselit_backdrop_square.webp",
    );
    expect(within(list).getByText(/50,000/)).toBeVisible();
    expect(within(list).getByText(/12 人の/)).toBeVisible();
    expect(within(list).getByText("下書き")).toBeVisible();
    expect(within(list).getByText(finalUiText["Hidden"])).toBeVisible();
    fireEvent.click(
        screen.getByRole("button", { name: productDisplayText.cards }),
    );
    expect(
        screen.getByRole("region", { name: productDisplayText.cards }),
    ).toBeVisible();
    expect(
        screen.queryByRole("list", { name: productDisplayText.list }),
    ).not.toBeInTheDocument();
});

it("restores the last explicit display choice after remounting", () => {
    const first = render(<Page />);
    fireEvent.click(
        screen.getByRole("button", { name: productDisplayText.list }),
    );
    expect(localStorage.getItem(storageKey)).toBe("list");
    first.unmount();
    render(<Page />);
    expect(
        screen.getByRole("list", { name: productDisplayText.list }),
    ).toBeVisible();
    fireEvent.click(
        screen.getByRole("button", { name: productDisplayText.cards }),
    );
    expect(localStorage.getItem(storageKey)).toBe("cards");
});

it("falls back to cards for an invalid stored choice", () => {
    localStorage.setItem(storageKey, "unknown");
    render(<Page />);
    expect(
        screen.getByRole("region", { name: productDisplayText.cards }),
    ).toBeVisible();
});

it("still switches views when browser storage is unavailable", () => {
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("blocked");
    });
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("blocked");
    });
    render(<Page />);
    fireEvent.click(
        screen.getByRole("button", { name: productDisplayText.list }),
    );
    expect(
        screen.getByRole("list", { name: productDisplayText.list }),
    ).toBeVisible();
});

it("still switches when storage can be read but cannot be written", () => {
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("quota");
    });
    render(<Page />);
    fireEvent.click(
        screen.getByRole("button", { name: productDisplayText.cards }),
    );
    fireEvent.click(
        screen.getByRole("button", { name: productDisplayText.list }),
    );
    expect(
        screen.getByRole("list", { name: productDisplayText.list }),
    ).toBeVisible();
    fireEvent.click(
        screen.getByRole("button", { name: productDisplayText.cards }),
    );
    expect(
        screen.getByRole("region", { name: productDisplayText.cards }),
    ).toBeVisible();
});

it("preserves the existing type filter and pagination while using the list", () => {
    mockSearchParams = new URLSearchParams("page=3&filter=course");
    localStorage.setItem(storageKey, "list");
    render(<Page />);
    expect(useProductsMock).toHaveBeenLastCalledWith(3, 9, ["COURSE"]);
    fireEvent.click(screen.getByRole("button", { name: "次のページ" }));
    expect(mockPush).toHaveBeenLastCalledWith(
        "/dashboard/products?page=2&filter=course",
    );
    fireEvent.change(
        screen.getByRole("combobox", { name: productDisplayText.filter }),
        { target: { value: "download" } },
    );
    expect(mockPush).toHaveBeenLastCalledWith(
        "/dashboard/products?filter=download",
    );
    expect(
        screen.getByRole("button", { name: productDisplayText.list }),
    ).toHaveAttribute("aria-pressed", "true");
});
