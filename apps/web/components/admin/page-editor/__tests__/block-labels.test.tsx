import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { pageBlockLabels } from "@/config/strings";
import widgets from "@ui-config/widgets";
import AddWidget from "../add-widget";
import EditWidget from "../edit-widget";

jest.mock("@ui-config/widgets", () => {
    const directories = [
        "rich-text",
        "featured",
        "banner",
        "hero",
        "grid",
        "content",
        "faq",
        "pricing",
        "media",
        "marquee",
        "embed",
        "email-form",
        "footer",
        "header",
    ];
    return {
        __esModule: true,
        default: Object.fromEntries(
            directories
                .map((directory) => {
                    const metadata = require(
                        `../../../../../../packages/page-blocks/src/blocks/${directory}/metadata`,
                    ).default;
                    return [metadata.name, { metadata }];
                })
                .concat([
                    [
                        "extension",
                        {
                            metadata: {
                                name: "extension",
                                displayName: "追加プラグイン",
                                compatibleWith: ["site"],
                            },
                        },
                    ],
                ]),
        ),
    };
});
jest.mock("@courselit/components-library", () => ({
    Button: ({ children, onClick }) => (
        <button onClick={onClick}>{children}</button>
    ),
}));
jest.mock("../admin-widget", () => ({
    __esModule: true,
    default: ({ name, settings, onChange }) => (
        <div data-testid="block-settings" data-name={name}>
            <span>{settings.content}</span>
            <button onClick={() => onChange({ content: "updated" })}>
                設定変更のテスト
            </button>
        </div>
    ),
}));

it("shows Japanese names and usage guidance for every compatible site block, and selects the unchanged widget ID", () => {
    const onSelection = jest.fn();
    render(
        <AddWidget
            pageType="site"
            onSelection={onSelection}
            onClose={jest.fn()}
        />,
    );
    for (const [name, widget] of Object.entries(widgets)) {
        if (
            ["header", "footer", "extension"].includes(name) ||
            !widget.metadata.compatibleWith.includes("site")
        )
            continue;
        const copy = pageBlockLabels[name];
        expect(copy).toBeDefined();
        const button = screen.getByRole("button", {
            name: copy.title,
        });
        expect(button).toHaveAccessibleDescription(copy.description);
        expect(
            screen.queryByText(widget.metadata.displayName, { exact: true }),
        ).not.toBeInTheDocument();
        fireEvent.click(button);
        expect(onSelection).toHaveBeenLastCalledWith(name);
    }
    expect(
        screen.queryByRole("button", { name: pageBlockLabels.header.title }),
    ).not.toBeInTheDocument();
    expect(
        screen.queryByRole("button", { name: pageBlockLabels.footer.title }),
    ).not.toBeInTheDocument();
    expect(
        screen.queryByRole("button", { name: pageBlockLabels.banner.title }),
    ).not.toBeInTheDocument();
    expect(
        screen.queryByRole("button", { name: pageBlockLabels.content.title }),
    ).not.toBeInTheDocument();
});

it("preserves product-only blocks and excludes the site-only pricing block", () => {
    const onSelection = jest.fn();
    render(
        <AddWidget
            pageType="product"
            onSelection={onSelection}
            onClose={jest.fn()}
        />,
    );
    fireEvent.click(
        screen.getByRole("button", { name: pageBlockLabels.banner.title }),
    );
    expect(onSelection).toHaveBeenLastCalledWith("banner");
    fireEvent.click(
        screen.getByRole("button", { name: pageBlockLabels.content.title }),
    );
    expect(onSelection).toHaveBeenLastCalledWith("content");
    expect(
        screen.queryByRole("button", { name: pageBlockLabels.pricing.title }),
    ).not.toBeInTheDocument();
});

it("preserves blog compatibility and unknown extension fallback", () => {
    const onSelection = jest.fn();
    const first = render(
        <AddWidget
            pageType="blog"
            onSelection={onSelection}
            onClose={jest.fn()}
        />,
    );
    expect(screen.getAllByRole("button")).toHaveLength(3);
    expect(
        screen.getByRole("button", { name: pageBlockLabels.hero.title }),
    ).toBeVisible();
    expect(
        screen.getByRole("button", { name: pageBlockLabels.media.title }),
    ).toBeVisible();
    expect(
        screen.getByRole("button", {
            name: pageBlockLabels["newsletter-signup"].title,
        }),
    ).toBeVisible();
    first.unmount();
    render(
        <AddWidget
            pageType="site"
            onSelection={onSelection}
            onClose={jest.fn()}
        />,
    );
    fireEvent.click(screen.getByRole("button", { name: "追加プラグイン" }));
    expect(onSelection).toHaveBeenLastCalledWith("extension");
});

it("shows the same Japanese block name while editing and preserves settings and callbacks", () => {
    const onChange = jest.fn(),
        onClose = jest.fn(),
        onDelete = jest.fn();
    render(
        <EditWidget
            widget={{
                name: "embed",
                widgetId: "existing-block",
                settings: { content: "existing content" },
                deleteable: true,
            }}
            pageData={{}}
            state={{} as never}
            onChange={onChange}
            onClose={onClose}
            onDelete={onDelete}
        />,
    );
    expect(
        screen.getByRole("heading", { name: pageBlockLabels.embed.title }),
    ).toBeVisible();
    expect(screen.getByText(pageBlockLabels.embed.description)).toBeVisible();
    expect(screen.getByTestId("block-settings")).toHaveAttribute(
        "data-name",
        "embed",
    );
    expect(screen.getByText("existing content")).toBeVisible();
    expect(onChange).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "設定変更のテスト" }));
    expect(onChange).toHaveBeenLastCalledWith("existing-block", {
        content: "updated",
    });
    fireEvent.click(screen.getByRole("button", { name: "完了" }));
    expect(onClose).toHaveBeenCalledTimes(1);
});
