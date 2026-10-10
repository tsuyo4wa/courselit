import { finalUiText } from "../../ui-strings";
import React, { useEffect, useState } from "react";
import type {
    Address,
    Alignment,
    Media,
    Profile,
} from "@courselit/common-models";
import { Theme, ThemeStyle, SectionBackground } from "@courselit/page-models";
import Settings from "./settings";
import {
    AdminWidgetPanel,
    AdminWidgetPanelContainer,
    MediaSelector,
    Select,
    Form,
    FormField,
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
    PageBuilderSlider,
    PageBuilderPropertyHeader,
    CssIdField,
    ImageObjectFit,
    Checkbox,
    VerticalPaddingSelector,
    MaxWidthSelector,
    SectionBackgroundPanel,
} from "@courselit/components-library";
import { AspectRatio } from "../../components";
import { isVideo } from "@courselit/utils";
import { Editor } from "@courselit/text-editor";

interface AdminWidgetProps {
    name: string;
    settings: Settings;
    onChange: (...args: any[]) => void;
    address: Address;
    networkAction: boolean;
    profile: Profile;
    theme: Theme;
}

export default function AdminWidget({
    settings,
    onChange,
    profile,
    address,
    theme,
}: AdminWidgetProps): JSX.Element {
    const dummyDescription: Record<string, unknown> = {
        type: "doc",
        content: [
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "ここに説明文を入力してください。",
                    },
                ],
            },
        ],
    };
    const [title, setTitle] = useState(settings.title || "Hero section");
    const [description, setDescription] = useState(
        settings.description || dummyDescription,
    );
    const [buttonAction, setButtonAction] = useState(settings.buttonAction);
    const [buttonCaption, setButtonCaption] = useState(settings.buttonCaption);
    const [mediaBorderRadius, setMediaBorderRadius] = useState(
        settings.mediaRadius || 2,
    );
    const [youtubeLink, setYoutubeLink] = useState(settings.youtubeLink);
    const [alignment, setAlignment] = useState(settings.alignment || "left");

    const [media, setMedia] = useState<Partial<Media>>(settings.media || {});
    const [secondaryButtonAction, setSecondaryButtonAction] = useState(
        settings.secondaryButtonAction,
    );
    const [secondaryButtonCaption, setSecondaryButtonCaption] = useState(
        settings.secondaryButtonCaption,
    );
    const [titleFontSize, setTitleFontSize] = useState(
        settings.titleFontSize || 4,
    );
    const [descriptionFontSize, setDescriptionFontSize] = useState(
        settings.descriptionFontSize || 0,
    );
    const [contentAlignment, setContentAlignment] = useState<Alignment>(
        settings.contentAlignment || "center",
    );
    const [cssId, setCssId] = useState(settings.cssId);
    const [playVideoInModal, setPlayVideoInModal] = useState(
        settings.playVideoInModal || false,
    );
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>(
        settings.aspectRatio || "16/9",
    );
    const [objectFit, setObjectFit] = useState<ImageObjectFit>(
        settings.objectFit || "cover",
    );
    const [verticalPadding, setVerticalPadding] = useState<
        ThemeStyle["structure"]["section"]["padding"]["y"]
    >(settings.verticalPadding);
    const [maxWidth, setMaxWidth] = useState<
        ThemeStyle["structure"]["page"]["width"]
    >(settings.maxWidth);
    const [background, setBackground] = useState<SectionBackground>(
        settings.background,
    );
    const [layout, setLayout] = useState<"normal" | "card">(
        settings.layout || "normal",
    );
    const hasHeroGraphic = youtubeLink || (media && media.mediaId);

    const onSettingsChanged = () =>
        onChange({
            title,
            description,
            buttonAction,
            buttonCaption,
            youtubeLink,
            media,
            alignment,
            mediaRadius: mediaBorderRadius,
            verticalPadding,
            secondaryButtonAction,
            secondaryButtonCaption,
            titleFontSize,
            descriptionFontSize,
            contentAlignment,
            cssId,
            playVideoInModal,
            aspectRatio,
            objectFit,
            maxWidth,
            background,
            layout,
        });

    useEffect(() => {
        onSettingsChanged();
    }, [
        title,
        description,
        buttonAction,
        buttonCaption,
        youtubeLink,
        alignment,
        media,
        mediaBorderRadius,
        verticalPadding,
        secondaryButtonAction,
        secondaryButtonCaption,
        titleFontSize,
        descriptionFontSize,
        contentAlignment,
        cssId,
        playVideoInModal,
        aspectRatio,
        objectFit,
        maxWidth,
        background,
        layout,
    ]);

    return (
        <AdminWidgetPanelContainer
            type="multiple"
            defaultValue={["basic", "media", "calls-to-action", "design"]}
        >
            <AdminWidgetPanel title={finalUiText["Basic"]} value="basic">
                <Form>
                    <FormField
                        label={finalUiText["Title"]}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </Form>
                <div>
                    <p className="mb-1 font-medium">
                        {finalUiText["Description"]}
                    </p>
                    <Editor
                        initialContent={description}
                        onChange={(state: any) => setDescription(state)}
                        showToolbar={false}
                        url={address.backend}
                    />
                </div>
            </AdminWidgetPanel>
            <AdminWidgetPanel title={finalUiText["Media"]} value="media">
                <Form>
                    <FormField
                        label={finalUiText["YouTube/Vimeo Link"]}
                        placeholder={finalUiText["Enter the link to the video"]}
                        value={youtubeLink}
                        onChange={(e) => setYoutubeLink(e.target.value)}
                    />
                </Form>
                <PageBuilderPropertyHeader
                    label={finalUiText["Upload media"]}
                    tooltip={
                        finalUiText[
                            "This will be overridden if you have provided a YouTube video id above"
                        ]
                    }
                />
                <MediaSelector
                    title=""
                    src={media && media.thumbnail}
                    srcTitle={media && media.originalFileName}
                    profile={profile}
                    address={address}
                    onSelection={(media: Media) => {
                        if (media) {
                            setMedia(media);
                        }
                    }}
                    onRemove={() => {
                        setMedia({});
                    }}
                    strings={{}}
                    access="public"
                    mediaId={media && media.mediaId}
                    type="page"
                />
                {isVideo(youtubeLink, media) ? (
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between mt-2">
                            <div className="flex grow items-center gap-1">
                                <p>{finalUiText["Play video in a pop-up"]}</p>
                            </div>
                            <Checkbox
                                checked={playVideoInModal}
                                onChange={(value: boolean) =>
                                    setPlayVideoInModal(value)
                                }
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        <PageBuilderSlider
                            title={finalUiText["Media border radius"]}
                            value={mediaBorderRadius}
                            onChange={setMediaBorderRadius}
                            min={0}
                            max={8}
                        />
                        <Select
                            title={finalUiText["Object fit"]}
                            value={objectFit}
                            options={[
                                { label: finalUiText["Cover"], value: "cover" },
                                {
                                    label: finalUiText["Contain"],
                                    value: "contain",
                                },
                                { label: finalUiText["Fill"], value: "fill" },
                                { label: "なし", value: "none" },
                                { label: "Scale-down", value: "scale-down" },
                            ]}
                            onChange={(value: ImageObjectFit) =>
                                setObjectFit(value)
                            }
                        />
                    </div>
                )}
                <Select
                    title={finalUiText["Aspect ratio"]}
                    value={aspectRatio}
                    options={[
                        { label: "16:9", value: "16/9" },
                        { label: "4:3", value: "4/3" },
                        { label: "1:1", value: "1/1" },
                        { label: "9:16", value: "9/16" },
                    ]}
                    onChange={(value: AspectRatio) => setAspectRatio(value)}
                />
            </AdminWidgetPanel>
            <AdminWidgetPanel
                title={finalUiText["Calls to action"]}
                value="calls-to-action"
            >
                <Accordion type="single" collapsible>
                    <AccordionItem value="primary">
                        <AccordionTrigger>
                            {finalUiText["Primary button"]}
                        </AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-4">
                            <Form className="flex flex-col gap-4">
                                <FormField
                                    label={finalUiText["Button Text"]}
                                    value={buttonCaption}
                                    onChange={(e) =>
                                        setButtonCaption(e.target.value)
                                    }
                                />
                                <FormField
                                    label={finalUiText["Button Action"]}
                                    value={buttonAction}
                                    onChange={(e) =>
                                        setButtonAction(e.target.value)
                                    }
                                />
                            </Form>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="secondary">
                        <AccordionTrigger>
                            {finalUiText["Secondary button"]}
                        </AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-4">
                            <Form className="flex flex-col gap-4">
                                <FormField
                                    label={finalUiText["Button Text"]}
                                    value={secondaryButtonCaption}
                                    onChange={(e) =>
                                        setSecondaryButtonCaption(
                                            e.target.value,
                                        )
                                    }
                                />
                                <FormField
                                    label={finalUiText["Button Action"]}
                                    value={secondaryButtonAction}
                                    onChange={(e) =>
                                        setSecondaryButtonAction(e.target.value)
                                    }
                                />
                            </Form>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </AdminWidgetPanel>
            <AdminWidgetPanel title={finalUiText["Design"]} value="design">
                {hasHeroGraphic && (
                    <Select
                        title={finalUiText["Media alignment"]}
                        value={alignment}
                        options={[
                            { label: finalUiText["Left"], value: "left" },
                            { label: finalUiText["Right"], value: "right" },
                        ]}
                        onChange={(value: Alignment | "right") =>
                            setAlignment(value)
                        }
                    />
                )}
                <Select
                    title={finalUiText["Layout"]}
                    value={layout}
                    options={[
                        { label: finalUiText["Normal"], value: "normal" },
                        { label: finalUiText["Card"], value: "center" },
                    ]}
                    onChange={(value: "normal" | "card") => setLayout(value)}
                />
                <Select
                    title={finalUiText["Content alignment"]}
                    value={contentAlignment}
                    options={[
                        { label: finalUiText["Left"], value: "left" },
                        { label: finalUiText["Center"], value: "center" },
                    ]}
                    onChange={(value: Alignment) => setContentAlignment(value)}
                />

                <PageBuilderSlider
                    title={finalUiText["Title font size"]}
                    value={titleFontSize}
                    onChange={setTitleFontSize}
                    min={3}
                    max={8}
                />
                {/* <PageBuilderSlider
                    title="Description font size"
                    value={descriptionFontSize}
                    onChange={setDescriptionFontSize}
                    min={0}
                    max={6}
                /> */}
                <PageBuilderSlider
                    title={finalUiText["Media border radius"]}
                    value={mediaBorderRadius}
                    min={0}
                    max={8}
                    onChange={setMediaBorderRadius}
                />
                <MaxWidthSelector
                    value={maxWidth || theme.theme.structure.page.width}
                    onChange={setMaxWidth}
                />
                <VerticalPaddingSelector
                    value={
                        verticalPadding ||
                        theme.theme.structure.section.padding.y
                    }
                    onChange={setVerticalPadding}
                />
                <SectionBackgroundPanel
                    value={background}
                    onChange={setBackground}
                    profile={profile}
                    address={address}
                />
            </AdminWidgetPanel>
            <AdminWidgetPanel title={finalUiText["Advanced"]} value="advanced">
                <CssIdField value={cssId} onChange={setCssId} />
            </AdminWidgetPanel>
        </AdminWidgetPanelContainer>
    );
}
