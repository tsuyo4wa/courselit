import { finalUiText, pageBlockLabels } from "@/config/strings";
import { useState } from "react";
import widgets from "@ui-config/widgets";
import { Button } from "@courselit/components-library";
import AdminWidget from "./admin-widget";
import { State } from "@courselit/common-models";

interface EditWidgetProps {
    onChange: (widgetId: string, settings: Record<string, unknown>) => void;
    onClose: (...args: any[]) => void;
    onDelete: (widgetId: string) => void;
    widget: {
        name: string;
        settings?: Record<string, unknown>;
        widgetId: string;
        deleteable: boolean;
    };
    pageData: Record<string, unknown>;
    state: State;
}

export default function EditWidget({
    onChange,
    onClose,
    onDelete,
    widget,
    pageData,
    state,
}: EditWidgetProps) {
    const [deleteConfirmation, setDeleteConfirmation] = useState(false);
    const [hideActionButtons, setHideActionButtons] = useState(false);
    const [preservedStateAcrossRerender, setPreservedStateAcrossRerender] =
        useState<Record<string, unknown>>({});

    const actualWidget = widgets[widget.name];
    const blockLabel = pageBlockLabels[widget.name];

    const onDeleteWidget = () => {
        if (!widget.deleteable) {
            return;
        }

        if (deleteConfirmation) {
            onDelete(widget.widgetId);
        } else {
            setDeleteConfirmation(true);
            setTimeout(() => setDeleteConfirmation(false), 2000);
        }
    };

    return (
        <div>
            {actualWidget && (
                <div className="px-2">
                    {blockLabel && (
                        <div className="mb-5 border-b pb-4">
                            <h3 className="text-base font-semibold leading-6">
                                {blockLabel.title}
                            </h3>
                            <p className="mt-1 text-sm leading-5 text-muted-foreground">
                                {blockLabel.description}
                            </p>
                        </div>
                    )}
                    <AdminWidget
                        name={widget.name}
                        settings={widget.settings || {}}
                        onChange={(e: Record<string, unknown>) => {
                            onChange(widget.widgetId, e);
                        }}
                        hideActionButtons={(
                            e: boolean,
                            state: Record<string, unknown>,
                        ) => {
                            setHideActionButtons(e);
                            setPreservedStateAcrossRerender(state);
                        }}
                        preservedStateAcrossRerender={
                            preservedStateAcrossRerender
                        }
                        pageData={pageData}
                        state={state}
                    />
                    {!hideActionButtons && (
                        <div
                            className={`flex mb-8 ${
                                widget.deleteable
                                    ? "justify-between"
                                    : "justify-end"
                            }`}
                        >
                            {widget.deleteable && (
                                <Button
                                    color="error"
                                    onClick={onDeleteWidget}
                                    variant="soft"
                                >
                                    {deleteConfirmation
                                        ? finalUiText["Sure?"]
                                        : finalUiText["Delete block"]}
                                </Button>
                            )}
                            <Button onClick={onClose}>
                                {finalUiText["Done"]}
                            </Button>
                        </div>
                    )}
                </div>
            )}
            {!actualWidget && (
                <p>
                    {widget.name}
                    {finalUiText["not found"]}
                </p>
            )}
        </div>
    );
}
