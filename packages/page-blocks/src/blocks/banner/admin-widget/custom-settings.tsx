import { finalUiText } from "../../../ui-strings";
import * as React from "react";
import { useState, useEffect } from "react";
import Settings from "../settings";
import {
    Select,
    AdminWidgetPanel,
    AdminWidgetPanelContainer,
    Form,
    FormField,
    VerticalPaddingSelector,
    MaxWidthSelector,
    PageBuilderSlider,
} from "@courselit/components-library";
import {
    Address,
    Alignment,
    Constants,
    PaymentPlan,
} from "@courselit/common-models";
import { DEFAULT_FAILURE_MESSAGE, DEFAULT_SUCCESS_MESSAGE } from "../constants";
import { ThemeStyle } from "@courselit/page-models";
import { Editor } from "@courselit/text-editor";
import { TextEditorContent } from "@courselit/common-models";

interface CustomSettingsProps {
    name: string;
    settings: Settings;
    pageData: Record<string, unknown>;
    onChange: (...args: any[]) => void;
    address: Address;
    theme: ThemeStyle;
}

export default function CustomSettings({
    settings,
    onChange,
    pageData,
    address,
    theme,
}: CustomSettingsProps): JSX.Element {
    const defaultSuccessMessage: Record<string, unknown> = {
        type: "doc",
        content: [
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: DEFAULT_SUCCESS_MESSAGE,
                    },
                ],
            },
        ],
    };
    const [title, setTitle] = useState(settings.title);
    const [description, setDescription] = useState(settings.description);
    const [buttonCaption, setButtonCaption] = useState(settings.buttonCaption);
    const [buttonAction, setButtonAction] = useState(settings.buttonAction);
    const [alignment, setAlignment] = useState(settings.alignment || "left");
    const [textAlignment, setTextAlignment] = useState<Alignment>(
        settings.textAlignment || "left",
    );
    const [successMessage, setSuccessMessage] = useState(
        settings.successMessage || defaultSuccessMessage,
    );
    const [failureMessage, setFailureMessage] = useState(
        settings.failureMessage || DEFAULT_FAILURE_MESSAGE,
    );
    const [editingViewShowSuccess, setEditingViewShowSuccess] = useState<
        "1" | "0"
    >(settings.editingViewShowSuccess || "0");
    const [maxWidth, setMaxWidth] = useState<
        ThemeStyle["structure"]["page"]["width"]
    >(settings.maxWidth);
    const [verticalPadding, setVerticalPadding] = useState<
        ThemeStyle["structure"]["section"]["padding"]["y"]
    >(settings.verticalPadding);
    const [mediaBorderRadius, setMediaBorderRadius] = useState(
        settings.mediaRadius || 2,
    );
    const type = Object.keys(pageData).length === 0 ? "site" : "product";
    const isLeadMagnet =
        type === Constants.PageType.PRODUCT &&
        pageData.leadMagnet &&
        (pageData.paymentPlans as PaymentPlan[]).length === 1 &&
        (pageData.paymentPlans as PaymentPlan[])[0].type ===
            Constants.PaymentPlanType.FREE;

    useEffect(() => {
        onChange({
            title,
            description,
            buttonCaption,
            alignment,
            buttonAction,
            textAlignment,
            successMessage,
            failureMessage,
            editingViewShowSuccess,
            maxWidth,
            verticalPadding,
            mediaRadius: mediaBorderRadius,
        });
    }, [
        title,
        description,
        buttonCaption,
        alignment,
        buttonAction,
        textAlignment,
        successMessage,
        failureMessage,
        editingViewShowSuccess,
        maxWidth,
        verticalPadding,
        mediaBorderRadius,
    ]);

    return (
        <AdminWidgetPanelContainer
            type="multiple"
            defaultValue={["basic", "call-to-action", "design"]}
        >
            <AdminWidgetPanel title={finalUiText["Basic"]} value="basic">
                <Form
                    onSubmit={(e: React.FormEvent) => {
                        e.preventDefault();
                    }}
                >
                    <FormField
                        value={title}
                        label={finalUiText["Custom title"]}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <div>
                        <p className="mb-1 font-medium">
                            {finalUiText["Custom description"]}
                        </p>
                        <Editor
                            initialContent={description}
                            onChange={(state: any) => setDescription(state)}
                            showToolbar={false}
                            url={address.backend}
                        />
                    </div>
                </Form>
            </AdminWidgetPanel>
            <AdminWidgetPanel
                title={finalUiText["Call to action"]}
                value="call-to-action"
            >
                <Form>
                    <FormField
                        value={buttonCaption}
                        label={finalUiText["Button caption"]}
                        onChange={(e) => setButtonCaption(e.target.value)}
                    />
                    {type === "site" && (
                        <FormField
                            value={buttonAction}
                            label={finalUiText["Button Action (URL)"]}
                            onChange={(e) => setButtonAction(e.target.value)}
                        />
                    )}
                    {isLeadMagnet && (
                        <>
                            <div>
                                <p className="mb-1 font-medium">
                                    {finalUiText["Success message"]}
                                </p>
                                <Editor
                                    initialContent={
                                        successMessage as unknown as TextEditorContent
                                    }
                                    onChange={(state: any) =>
                                        setSuccessMessage(state)
                                    }
                                    showToolbar={false}
                                    url={address.backend}
                                />
                            </div>
                            <FormField
                                label={finalUiText["Failure message"]}
                                value={failureMessage}
                                placeholder={DEFAULT_FAILURE_MESSAGE}
                                onChange={(e) =>
                                    setFailureMessage(e.target.value)
                                }
                            />
                            <Select
                                title={finalUiText["Editing view"]}
                                value={editingViewShowSuccess}
                                options={[
                                    {
                                        label: finalUiText["Before submit"],
                                        value: "0",
                                    },
                                    {
                                        label: finalUiText["After submit"],
                                        value: "1",
                                    },
                                ]}
                                onChange={(value: "1" | "0") =>
                                    setEditingViewShowSuccess(value)
                                }
                            />
                        </>
                    )}
                </Form>
            </AdminWidgetPanel>
            <AdminWidgetPanel title={finalUiText["Design"]} value="design">
                <Select
                    title={finalUiText["Text content position"]}
                    value={alignment}
                    options={[
                        { label: finalUiText["Top"], value: "top" },
                        { label: finalUiText["Bottom"], value: "bottom" },
                        { label: finalUiText["Left"], value: "left" },
                        { label: finalUiText["Right"], value: "right" },
                    ]}
                    onChange={(value: "top" | "bottom" | "left" | "right") =>
                        setAlignment(value)
                    }
                />
                <Select
                    title={finalUiText["Text alignment"]}
                    value={textAlignment}
                    options={[
                        { label: finalUiText["Left"], value: "left" },
                        { label: finalUiText["Center"], value: "center" },
                        { label: finalUiText["Right"], value: "right" },
                    ]}
                    onChange={(value: Alignment) => setTextAlignment(value)}
                />
                <MaxWidthSelector value={maxWidth} onChange={setMaxWidth} />
                <VerticalPaddingSelector
                    value={verticalPadding}
                    onChange={setVerticalPadding}
                />
                <PageBuilderSlider
                    title={finalUiText["Media border radius"]}
                    value={mediaBorderRadius}
                    min={0}
                    max={8}
                    onChange={setMediaBorderRadius}
                />
            </AdminWidgetPanel>
        </AdminWidgetPanelContainer>
    );
}
