import { finalUiDynamic } from "../../ui-strings";

import { finalUiText } from "../../ui-strings";
import type { EmailBlock, EmailStyle } from "@/types/email-editor";
import type { ImageBlockSettings } from "./types";
import { SettingsInput } from "@/components/settings/settings-input";
import { SettingsSelect } from "@/components/settings/settings-select";
import { SettingsColorPicker } from "@/components/settings/settings-color-picker";
import { SettingsSlider } from "@/components/settings/settings-slider";
import { SettingsSection } from "@/components/settings/settings-section";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface ImageSettingsProps {
    block: Required<EmailBlock> & { settings: ImageBlockSettings };
    style?: EmailStyle;
    updateBlock: (id: string, content: Partial<EmailBlock>) => void;
}

export function ImageSettings({
    block,
    style,
    updateBlock,
}: ImageSettingsProps) {
    const handleSettingChange = (key: string, value: any) => {
        updateBlock(block.id, {
            settings: {
                ...block.settings,
                [key]: value,
            },
        });
    };

    const handleImageUpload = () => {
        const url = window.prompt("Enter image URL:", block.settings.src || "");
        if (url !== null) {
            handleSettingChange("src", url);
        }
    };

    // Helper function to convert px string to number
    const pxToNumber = (
        value: string | undefined,
        defaultValue: number,
    ): number => {
        if (!value) return defaultValue;
        const match = value.match(/^(\d+)px$/);
        return match ? Number.parseInt(match[1], 10) : defaultValue;
    };

    // Get numeric values from settings
    const borderRadius = pxToNumber(block.settings.borderRadius, 0);
    const borderWidth = pxToNumber(block.settings.borderWidth, 0);

    // Sample images
    const sampleImages = [
        "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop",
    ];

    // Width options
    const widthOptions = [
        { value: "auto", label: finalUiText["Auto"] },
        { value: "100px", label: "100px" },
        { value: "200px", label: "200px" },
        { value: "300px", label: "300px" },
        { value: "400px", label: "400px" },
        { value: "500px", label: "500px" },
        { value: "100%", label: "100%" },
    ];

    // Height options
    const heightOptions = [
        { value: "auto", label: finalUiText["Auto"] },
        { value: "100px", label: "100px" },
        { value: "150px", label: "150px" },
        { value: "200px", label: "200px" },
        { value: "250px", label: "250px" },
        { value: "300px", label: "300px" },
    ];

    // Max width options
    const maxWidthOptions = [
        { value: "100%", label: "100%" },
        { value: "75%", label: "75%" },
        { value: "50%", label: "50%" },
        { value: "25%", label: "25%" },
        { value: "none", label: "なし" },
    ];

    // Alignment options
    const alignmentOptions = [
        { value: "left", label: finalUiText["Left"] },
        { value: "center", label: finalUiText["Center"] },
        { value: "right", label: finalUiText["Right"] },
    ];

    // Border style options
    const borderStyleOptions = [
        { value: "solid", label: "実線" },
        { value: "dashed", label: finalUiText["Dashed"] },
        { value: "dotted", label: finalUiText["Dotted"] },
    ];

    return (
        <div className="space-y-4">
            {/* Image Source */}
            <div>
                <div className="flex gap-2 mt-1">
                    <SettingsInput
                        label={finalUiText["Image URL"]}
                        value={block.settings.src || ""}
                        onChange={(value) => handleSettingChange("src", value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                            e.preventDefault();
                            handleImageUpload();
                        }}
                        title={finalUiText["Browse for image"]}
                    >
                        <Upload className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Sample Images */}
            <div>
                <label className="text-sm font-medium">
                    {finalUiText["Sample Images"]}
                </label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                    {sampleImages.map((url, index) => (
                        <button
                            key={index}
                            onClick={(e) => {
                                e.preventDefault();
                                handleSettingChange("src", url);
                            }}
                            className="aspect-square rounded border-2 border-transparent hover:border-blue-500 overflow-hidden transition-colors"
                        >
                            <img
                                src={url || "/placeholder.svg"}
                                alt={finalUiDynamic.sample(index + 1)}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* Alt Text */}
            <SettingsInput
                label={finalUiText["Alt Text"]}
                value={block.settings.alt || ""}
                onChange={(value) => handleSettingChange("alt", value)}
                placeholder={finalUiText["Describe the image"]}
                defaultValue=""
            />

            {/* Alignment */}
            <SettingsSelect
                label={finalUiText["Alignment"]}
                value={block.settings.alignment || "left"}
                onChange={(value) => handleSettingChange("alignment", value)}
                options={alignmentOptions}
                defaultValue="left"
            />

            {/* Dimensions */}
            <SettingsSection title={finalUiText["Dimensions"]}>
                <SettingsSelect
                    label={finalUiText["Width"]}
                    value={block.settings.width || "auto"}
                    onChange={(value) => handleSettingChange("width", value)}
                    options={widthOptions}
                    defaultValue="auto"
                />

                <SettingsSelect
                    label={finalUiText["Height"]}
                    value={block.settings.height || "auto"}
                    onChange={(value) => handleSettingChange("height", value)}
                    options={heightOptions}
                    defaultValue="auto"
                />

                <SettingsSelect
                    label={finalUiText["Max Width"]}
                    value={block.settings.maxWidth || "100%"}
                    onChange={(value) => handleSettingChange("maxWidth", value)}
                    options={maxWidthOptions}
                    defaultValue="100%"
                />
            </SettingsSection>

            {/* Border */}
            <SettingsSection title={finalUiText["Border"]}>
                <SettingsSlider
                    label={finalUiText["Border Radius"]}
                    value={borderRadius}
                    onChange={(value) =>
                        handleSettingChange("borderRadius", `${value}px`)
                    }
                    min={0}
                    max={50}
                    defaultValue={0}
                />

                <SettingsSlider
                    label={finalUiText["Border Width"]}
                    value={borderWidth}
                    onChange={(value) =>
                        handleSettingChange("borderWidth", `${value}px`)
                    }
                    min={0}
                    max={20}
                    defaultValue={0}
                />

                <SettingsSelect
                    label={finalUiText["Border Style"]}
                    value={block.settings.borderStyle || "solid"}
                    onChange={(value) =>
                        handleSettingChange("borderStyle", value)
                    }
                    options={borderStyleOptions}
                    defaultValue="solid"
                />

                <SettingsColorPicker
                    label={finalUiText["Border Color"]}
                    value={block.settings.borderColor || "#e2e8f0"}
                    onChange={(value) =>
                        handleSettingChange("borderColor", value)
                    }
                    defaultValue="#e2e8f0"
                />
            </SettingsSection>

            {/* Common Block Settings */}
            <SettingsSection title={finalUiText["Block Settings"]}>
                <SettingsColorPicker
                    label={finalUiText["Background Color"]}
                    value={block.settings.backgroundColor || "transparent"}
                    onChange={(value) =>
                        handleSettingChange("backgroundColor", value)
                    }
                    defaultValue="transparent"
                />

                <SettingsSlider
                    label={finalUiText["Padding Top"]}
                    value={pxToNumber(
                        block.settings.paddingTop ||
                            style?.structure.section.padding?.y,
                        16,
                    )}
                    onChange={(value) =>
                        handleSettingChange("paddingTop", `${value}px`)
                    }
                    min={0}
                    max={100}
                    defaultValue={pxToNumber(
                        style?.structure.section.padding?.y,
                        16,
                    )}
                />

                <SettingsSlider
                    label={finalUiText["Padding Bottom"]}
                    value={pxToNumber(
                        block.settings.paddingBottom ||
                            style?.structure.section.padding?.y,
                        16,
                    )}
                    onChange={(value) =>
                        handleSettingChange("paddingBottom", `${value}px`)
                    }
                    min={0}
                    max={100}
                    defaultValue={pxToNumber(
                        style?.structure.section.padding?.y,
                        16,
                    )}
                />
            </SettingsSection>
        </div>
    );
}
