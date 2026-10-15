import { pageBlockLabels } from "@/config/strings";
import {
    PageTypeProduct,
    PageTypeSite,
    PageTypeBlog,
    PageTypeCommunity,
} from "@courselit/common-models";
import widgets from "@ui-config/widgets";

interface WidgetsListProps {
    pageType: PageTypeProduct | PageTypeSite | PageTypeBlog | PageTypeCommunity;
    onSelection: (...args: any[]) => void;
    onClose: (...args: any[]) => void;
}

function AddWidget({ pageType, onSelection }: WidgetsListProps) {
    return (
        <ul className="space-y-1">
            {Object.keys(widgets)
                .filter((name) => !["header", "footer"].includes(name))
                .filter((name) =>
                    widgets[name].metadata.compatibleWith.includes(pageType),
                )
                .map((name) => {
                    const copy = pageBlockLabels[name];
                    return (
                        <li key={name}>
                            <button
                                type="button"
                                className="block w-full rounded-md px-3 py-2.5 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                                aria-label={
                                    copy?.title ||
                                    widgets[name].metadata.displayName
                                }
                                aria-describedby={
                                    copy?.description
                                        ? `block-help-${name}`
                                        : undefined
                                }
                                onClick={() => onSelection(name)}
                            >
                                <span className="block text-base font-medium leading-6">
                                    {copy?.title ||
                                        widgets[name].metadata.displayName}
                                </span>
                                {copy?.description && (
                                    <span
                                        id={`block-help-${name}`}
                                        className="mt-1 block text-sm leading-5 text-muted-foreground"
                                    >
                                        {copy.description}
                                    </span>
                                )}
                            </button>
                        </li>
                    );
                })}
        </ul>
    );
}

export default AddWidget;
