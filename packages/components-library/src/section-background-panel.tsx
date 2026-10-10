import { finalUiText } from "./ui-strings";
import * as React from "react";
import {
    SectionBackground,
    SectionBackgroundOverlay,
    BlendMode,
    BackgroundRepeat,
} from "@courselit/page-models";
import ColorSelector from "./color-selector";
import PageBuilderSlider from "./page-builder-slider";
import CustomSelect from "./select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "./components/ui/accordion";
import MediaSelector from "./media-selector";
import { Address, Media, Profile } from "@courselit/common-models";
import { Lightbulb } from "lucide-react";

interface SectionBackgroundPanelProps {
    value: SectionBackground;
    onChange: (value: SectionBackground) => void;
    className?: string;
    profile: Profile;
    address: Address;
}

const BLEND_MODES: { label: string; value: BlendMode }[] = [
    { label: finalUiText["Normal"], value: "normal" },
    { label: finalUiText["Multiply"], value: "multiply" },
    { label: finalUiText["Screen"], value: "screen" },
    { label: finalUiText["Overlay"], value: "overlay" },
    { label: finalUiText["Darken"], value: "darken" },
    { label: finalUiText["Lighten"], value: "lighten" },
    { label: finalUiText["Color Dodge"], value: "color-dodge" },
    { label: finalUiText["Color Burn"], value: "color-burn" },
    { label: finalUiText["Hard Light"], value: "hard-light" },
    { label: finalUiText["Soft Light"], value: "soft-light" },
    { label: finalUiText["Difference"], value: "difference" },
    { label: finalUiText["Exclusion"], value: "exclusion" },
    { label: finalUiText["Hue"], value: "hue" },
    { label: finalUiText["Saturation"], value: "saturation" },
    { label: finalUiText["Color"], value: "color" },
    { label: finalUiText["Luminosity"], value: "luminosity" },
];

const BACKGROUND_REPEAT_OPTIONS: { label: string; value: BackgroundRepeat }[] =
    [
        { label: finalUiText["No Repeat"], value: "no-repeat" },
        { label: finalUiText["Repeat"], value: "repeat" },
        { label: finalUiText["Repeat X"], value: "repeat-x" },
        { label: finalUiText["Repeat Y"], value: "repeat-y" },
        { label: finalUiText["Space"], value: "space" },
        { label: finalUiText["Round"], value: "round" },
    ];

export function SectionBackgroundPanel({
    value = {
        type: "color",
        backgroundColor: "#ff0000",
        backgroundColorDark: undefined,
        blur: 5,
        overlay: {
            color: "#ff0000",
            colorDark: undefined,
            opacity: 3,
            blendMode: "normal",
        },
    },
    onChange,
    className,
    profile,
    address,
}: SectionBackgroundPanelProps) {
    const handleTypeChange = (type: SectionBackground["type"]) => {
        // Simply change the type while preserving all existing properties
        onChange({
            ...value,
            type,
        });
    };

    const handleColorBackgroundChange = (
        updates: Partial<SectionBackground>,
    ) => {
        onChange({ ...value, ...updates });
    };

    const handleImageBackgroundChange = (
        updates: Partial<SectionBackground>,
    ) => {
        onChange({ ...value, ...updates });
    };

    const handleGradientBackgroundChange = (
        updates: Partial<SectionBackground>,
    ) => {
        onChange({ ...value, ...updates });
    };

    const handleOverlayChange = (
        overlayUpdates: Partial<SectionBackgroundOverlay>,
    ) => {
        onChange({
            ...value,
            overlay: { ...value.overlay, ...overlayUpdates },
        });
    };

    return (
        <div className={className}>
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="background" className="border-none">
                    <AccordionTrigger className="py-2 font-medium hover:no-underline">
                        {finalUiText["Background"]}
                    </AccordionTrigger>
                    <AccordionContent className="space-y-6 pt-2">
                        <div className="space-y-2">
                            <Tabs
                                value={value.type}
                                onValueChange={handleTypeChange}
                                className="w-full"
                            >
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="color">
                                        {finalUiText["Color"]}
                                    </TabsTrigger>
                                    <TabsTrigger value="image">
                                        {finalUiText["Image"]}
                                    </TabsTrigger>
                                    <TabsTrigger value="gradient">
                                        {finalUiText["Pattern"]}
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent
                                    value="color"
                                    className="space-y-4 mt-6"
                                >
                                    <ColorSelector
                                        title={finalUiText["Color"]}
                                        value={value.backgroundColor || ""}
                                        onChange={(color) =>
                                            handleColorBackgroundChange({
                                                backgroundColor: color,
                                            })
                                        }
                                    />
                                    <ColorSelector
                                        title={finalUiText["Dark Mode Color"]}
                                        value={value.backgroundColorDark || ""}
                                        onChange={(color) =>
                                            handleColorBackgroundChange({
                                                backgroundColorDark: color,
                                            })
                                        }
                                        allowReset={true}
                                        description={
                                            finalUiText[
                                                "Optional background color for dark mode"
                                            ]
                                        }
                                    />
                                </TabsContent>

                                <TabsContent
                                    value="image"
                                    className="space-y-4 mt-6"
                                >
                                    <MediaSelector
                                        title=""
                                        src={
                                            value.media &&
                                            (value.media.thumbnail as string)
                                        }
                                        srcTitle={
                                            value.media &&
                                            (value.media
                                                .originalFileName as string)
                                        }
                                        profile={profile}
                                        address={address}
                                        onSelection={(media: Media) => {
                                            if (media) {
                                                handleImageBackgroundChange({
                                                    media: media as unknown as Record<
                                                        string,
                                                        unknown
                                                    >,
                                                });
                                            }
                                        }}
                                        onRemove={() => {
                                            handleImageBackgroundChange({
                                                media: {} as unknown as Record<
                                                    string,
                                                    unknown
                                                >,
                                            });
                                        }}
                                        strings={{}}
                                        access="public"
                                        mediaId={
                                            value.media &&
                                            (value.media.mediaId as string)
                                        }
                                        type="page"
                                    />

                                    {/* Blur Effect */}
                                    <PageBuilderSlider
                                        title={finalUiText["Blur"]}
                                        min={0}
                                        max={20}
                                        value={value.blur || 0}
                                        onChange={(blur) =>
                                            handleImageBackgroundChange({
                                                blur: blur || 0,
                                            })
                                        }
                                        unit=""
                                    />

                                    {/* Overlay Settings */}
                                    <Accordion
                                        type="single"
                                        collapsible
                                        className="w-full"
                                    >
                                        <AccordionItem
                                            value="overlay"
                                            className="border-none"
                                        >
                                            <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
                                                {
                                                    finalUiText[
                                                        "Overlay Settings"
                                                    ]
                                                }
                                            </AccordionTrigger>
                                            <AccordionContent className="space-y-4 pt-2">
                                                <ColorSelector
                                                    title={
                                                        finalUiText[
                                                            "Overlay Color"
                                                        ]
                                                    }
                                                    value={
                                                        value.overlay?.color ||
                                                        ""
                                                    }
                                                    onChange={(color) =>
                                                        handleOverlayChange({
                                                            color,
                                                        })
                                                    }
                                                />
                                                <ColorSelector
                                                    title={
                                                        finalUiText[
                                                            "Dark Mode Overlay Color"
                                                        ]
                                                    }
                                                    value={
                                                        value.overlay
                                                            ?.colorDark || ""
                                                    }
                                                    onChange={(color) =>
                                                        handleOverlayChange({
                                                            colorDark: color,
                                                        })
                                                    }
                                                    allowReset={true}
                                                    description={
                                                        finalUiText[
                                                            "Optional overlay color for dark mode"
                                                        ]
                                                    }
                                                />
                                                <PageBuilderSlider
                                                    title={
                                                        finalUiText["Opacity"]
                                                    }
                                                    min={0}
                                                    max={10}
                                                    value={
                                                        value.overlay?.opacity
                                                    }
                                                    onChange={(opacity) =>
                                                        handleOverlayChange({
                                                            opacity,
                                                        })
                                                    }
                                                    unit=""
                                                />
                                                <CustomSelect
                                                    title={
                                                        finalUiText[
                                                            "Blend Mode"
                                                        ]
                                                    }
                                                    value={
                                                        value.overlay
                                                            ?.blendMode ||
                                                        "normal"
                                                    }
                                                    onChange={(mode) =>
                                                        handleOverlayChange({
                                                            blendMode:
                                                                mode as BlendMode,
                                                        })
                                                    }
                                                    options={BLEND_MODES}
                                                />
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>

                                    {/* Advanced Settings */}
                                    <Accordion
                                        type="single"
                                        collapsible
                                        className="w-full"
                                    >
                                        <AccordionItem
                                            value="advanced"
                                            className="border-none"
                                        >
                                            <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
                                                {finalUiText["Advanced"]}
                                            </AccordionTrigger>
                                            <AccordionContent className="space-y-4 pt-2">
                                                {/* Image Properties */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="image-background-size">
                                                        {
                                                            finalUiText[
                                                                "Background Size"
                                                            ]
                                                        }
                                                    </Label>
                                                    <Input
                                                        id="image-background-size"
                                                        value={
                                                            value.backgroundSize
                                                        }
                                                        onChange={(e) =>
                                                            handleImageBackgroundChange(
                                                                {
                                                                    backgroundSize:
                                                                        e.target
                                                                            .value,
                                                                },
                                                            )
                                                        }
                                                        placeholder="cover, contain, 100%, etc."
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="image-background-position">
                                                        {
                                                            finalUiText[
                                                                "Background Position"
                                                            ]
                                                        }
                                                    </Label>
                                                    <Input
                                                        id="image-background-position"
                                                        value={
                                                            value.backgroundPosition
                                                        }
                                                        onChange={(e) =>
                                                            handleImageBackgroundChange(
                                                                {
                                                                    backgroundPosition:
                                                                        e.target
                                                                            .value,
                                                                },
                                                            )
                                                        }
                                                        placeholder="center, top left, 50% 50%, etc."
                                                    />
                                                </div>

                                                <CustomSelect
                                                    title={
                                                        finalUiText[
                                                            "Background Repeat"
                                                        ]
                                                    }
                                                    value={
                                                        value.backgroundRepeat ||
                                                        "no-repeat"
                                                    }
                                                    onChange={(repeat) =>
                                                        handleImageBackgroundChange(
                                                            {
                                                                backgroundRepeat:
                                                                    repeat as BackgroundRepeat,
                                                            },
                                                        )
                                                    }
                                                    options={
                                                        BACKGROUND_REPEAT_OPTIONS
                                                    }
                                                />

                                                {/* Mask Image */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="mask-image">
                                                        {
                                                            finalUiText[
                                                                "Mask Image"
                                                            ]
                                                        }{" "}
                                                        <a
                                                            href="https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-muted-foreground text-xs underline"
                                                        >
                                                            {
                                                                finalUiText[
                                                                    "Learn more"
                                                                ]
                                                            }
                                                        </a>
                                                    </Label>
                                                    <Input
                                                        id="mask-image"
                                                        value={
                                                            value.maskImage ||
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            handleImageBackgroundChange(
                                                                {
                                                                    maskImage:
                                                                        e.target
                                                                            .value ||
                                                                        undefined,
                                                                },
                                                            )
                                                        }
                                                        placeholder="linear-gradient(black, transparent)"
                                                    />
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </TabsContent>

                                <TabsContent
                                    value="gradient"
                                    className="space-y-4 mt-6"
                                >
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            {
                                                finalUiText[
                                                    "For advanced users who know CSS."
                                                ]
                                            }
                                        </p>
                                        {/* <p className="text-xs text-muted-foreground">
                                            You can find patterns on sites like {" "}
                                            <a 
                                                href="https://patterncraft.fun" 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="underline"
                                            >
                                            PatternCraft</a> and {" "}
                                            <a
                                                href="https://magicpattern.design/" 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="underline"
                                            >
                                            MagicPattern</a>.
                                        </p> */}
                                    </div>
                                    {/* Gradient CSS */}
                                    <div className="space-y-2">
                                        <Label htmlFor="gradient-css">
                                            {finalUiText["Background Image"]}
                                        </Label>
                                        <Input
                                            id="gradient-css"
                                            value={value.backgroundImage || ""}
                                            onChange={(e) =>
                                                handleGradientBackgroundChange({
                                                    backgroundImage:
                                                        e.target.value,
                                                })
                                            }
                                            placeholder="linear-gradient(45deg, #ff0000, #0000ff)"
                                        />
                                        {/* <p className="text-xs text-muted-foreground">
                                            Enter CSS gradient syntax (e.g.,
                                            linear-gradient, radial-gradient)
                                        </p> */}
                                    </div>

                                    {/* Dark Mode Gradient */}
                                    <div className="space-y-2">
                                        <Label htmlFor="gradient-css-dark">
                                            {
                                                finalUiText[
                                                    "Dark Mode Background Image"
                                                ]
                                            }
                                        </Label>
                                        <Input
                                            id="gradient-css-dark"
                                            value={
                                                value.backgroundImageDark || ""
                                            }
                                            onChange={(e) =>
                                                handleGradientBackgroundChange({
                                                    backgroundImageDark:
                                                        e.target.value ||
                                                        undefined,
                                                })
                                            }
                                            placeholder="linear-gradient(45deg, #333333, #666666)"
                                        />
                                    </div>

                                    {/* Advanced Settings */}
                                    <Accordion
                                        type="single"
                                        collapsible
                                        className="w-full"
                                    >
                                        <AccordionItem
                                            value="gradient-advanced"
                                            className="border-none"
                                        >
                                            <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
                                                {finalUiText["Advanced"]}
                                            </AccordionTrigger>
                                            <AccordionContent className="space-y-4 pt-2">
                                                {/* Gradient Properties */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="gradient-background-size">
                                                        {
                                                            finalUiText[
                                                                "Background Size"
                                                            ]
                                                        }
                                                    </Label>
                                                    <Input
                                                        id="gradient-background-size"
                                                        value={
                                                            (value as any)
                                                                .gradientBackgroundSize
                                                        }
                                                        onChange={(e) =>
                                                            handleGradientBackgroundChange(
                                                                {
                                                                    gradientBackgroundSize:
                                                                        e.target
                                                                            .value,
                                                                } as any,
                                                            )
                                                        }
                                                        placeholder="cover, contain, 100%, etc."
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="gradient-background-position">
                                                        {
                                                            finalUiText[
                                                                "Background Position"
                                                            ]
                                                        }
                                                    </Label>
                                                    <Input
                                                        id="gradient-background-position"
                                                        value={
                                                            (value as any)
                                                                .gradientBackgroundPosition
                                                        }
                                                        onChange={(e) =>
                                                            handleGradientBackgroundChange(
                                                                {
                                                                    gradientBackgroundPosition:
                                                                        e.target
                                                                            .value,
                                                                } as any,
                                                            )
                                                        }
                                                        placeholder="center, top left, 50% 50%, etc."
                                                    />
                                                </div>

                                                <CustomSelect
                                                    title={
                                                        finalUiText[
                                                            "Background Repeat"
                                                        ]
                                                    }
                                                    value={
                                                        (value as any)
                                                            .gradientBackgroundRepeat ||
                                                        "no-repeat"
                                                    }
                                                    onChange={(repeat) =>
                                                        handleGradientBackgroundChange(
                                                            {
                                                                gradientBackgroundRepeat:
                                                                    repeat as BackgroundRepeat,
                                                            } as any,
                                                        )
                                                    }
                                                    options={
                                                        BACKGROUND_REPEAT_OPTIONS
                                                    }
                                                />

                                                {/* Mask Image */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="gradient-mask-image">
                                                        {
                                                            finalUiText[
                                                                "Mask Image"
                                                            ]
                                                        }{" "}
                                                        <a
                                                            href="https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-muted-foreground text-xs underline"
                                                        >
                                                            {
                                                                finalUiText[
                                                                    "Learn more"
                                                                ]
                                                            }
                                                        </a>
                                                    </Label>
                                                    <Input
                                                        id="gradient-mask-image"
                                                        value={
                                                            (value as any)
                                                                .gradientMaskImage ||
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            handleGradientBackgroundChange(
                                                                {
                                                                    gradientMaskImage:
                                                                        e.target
                                                                            .value ||
                                                                        undefined,
                                                                } as any,
                                                            )
                                                        }
                                                        placeholder="linear-gradient(black, transparent)"
                                                    />
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>

                                    <div className="flex items-center gap-1">
                                        <Lightbulb className="h-8 w-8 text-muted-foreground" />
                                        <p className="text-xs text-muted-foreground">
                                            {
                                                finalUiText[
                                                    "You can find cool patterns on sites like"
                                                ]
                                            }{" "}
                                            <a
                                                href="https://patterncraft.fun"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="underline"
                                            >
                                                PatternCraft
                                            </a>{" "}
                                            {finalUiText["and"]}{" "}
                                            <a
                                                href="https://magicpattern.design/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="underline"
                                            >
                                                MagicPattern
                                            </a>
                                            .
                                        </p>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
