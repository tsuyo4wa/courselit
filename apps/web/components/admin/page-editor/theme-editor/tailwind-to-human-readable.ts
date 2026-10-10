import { finalUiText } from "@/config/strings";
export interface TailwindOption {
    label: string;
    value: string;
}

export const paddingOptions = {
    x: [
        { label: "なし", value: "px-0" },
        { label: finalUiText["Extra Small"], value: "px-4" },
        { label: finalUiText["Small"], value: "px-6" },
        { label: finalUiText["Medium"], value: "px-8" },
        { label: finalUiText["Large"], value: "px-10" },
        { label: finalUiText["Extra Large"], value: "px-12" },
        { label: finalUiText["2X Large"], value: "px-16" },
        { label: finalUiText["3X Large"], value: "px-20" },
        { label: finalUiText["4X Large"], value: "px-24" },
        { label: finalUiText["5X Large"], value: "px-32" },
        { label: finalUiText["6X Large"], value: "px-40" },
        { label: finalUiText["7X Large"], value: "px-48" },
        { label: finalUiText["8X Large"], value: "px-56" },
        { label: finalUiText["9X Large"], value: "px-64" },
    ],
    y: [
        { label: "なし", value: "py-0" },
        { label: finalUiText["Extra Small"], value: "py-4" },
        { label: finalUiText["Small"], value: "py-6" },
        { label: finalUiText["Medium"], value: "py-8" },
        { label: finalUiText["Large"], value: "py-10" },
        { label: finalUiText["Extra Large"], value: "py-12" },
        { label: finalUiText["2X Large"], value: "py-16" },
        { label: finalUiText["3X Large"], value: "py-20" },
        { label: finalUiText["4X Large"], value: "py-24" },
        { label: finalUiText["5X Large"], value: "py-32" },
        { label: finalUiText["6X Large"], value: "py-40" },
        { label: finalUiText["7X Large"], value: "py-48" },
        { label: finalUiText["8X Large"], value: "py-56" },
        { label: finalUiText["9X Large"], value: "py-64" },
    ],
} as const;

export const borderWidthOptions: TailwindOption[] = [
    { label: "なし", value: "border-0" },
    { label: finalUiText["Light"], value: "border" },
    { label: finalUiText["Medium"], value: "border-2" },
    { label: finalUiText["Heavy"], value: "border-4" },
    { label: finalUiText["Extra Heavy"], value: "border-8" },
];

export const borderStyleOptions: TailwindOption[] = [
    { label: "なし", value: "border-none" },
    { label: "実線", value: "border-solid" },
    { label: finalUiText["Dashed"], value: "border-dashed" },
    { label: finalUiText["Dotted"], value: "border-dotted" },
    { label: finalUiText["Double"], value: "border-double" },
    { label: finalUiText["Hidden"], value: "border-hidden" },
];

export const borderRadiusOptions: TailwindOption[] = [
    { label: "なし", value: "rounded-none" },
    { label: finalUiText["Small"], value: "rounded-sm" },
    { label: finalUiText["Default"], value: "rounded" },
    { label: finalUiText["Medium"], value: "rounded-md" },
    { label: finalUiText["Large"], value: "rounded-lg" },
    { label: finalUiText["Extra Large"], value: "rounded-xl" },
    { label: finalUiText["2X Large"], value: "rounded-2xl" },
    { label: finalUiText["3X Large"], value: "rounded-3xl" },
    { label: finalUiText["Full"], value: "rounded-full" },
];

export const shadowOptions: TailwindOption[] = [
    { label: "なし", value: "shadow-none" },
    { label: finalUiText["Extra Small"], value: "shadow-2xs" },
    { label: finalUiText["Small"], value: "shadow-xs" },
    { label: finalUiText["Default"], value: "shadow-sm" },
    { label: finalUiText["Medium"], value: "shadow-md" },
    { label: finalUiText["Large"], value: "shadow-lg" },
    { label: finalUiText["Extra Large"], value: "shadow-xl" },
    { label: finalUiText["2X Large"], value: "shadow-2xl" },
];

export const textShadowOptions: TailwindOption[] = [
    { label: "なし", value: "text-shadow-none" },
    { label: finalUiText["Extra Small"], value: "text-shadow-2xs" },
    { label: finalUiText["Small"], value: "text-shadow-xs" },
    { label: finalUiText["Default"], value: "text-shadow-sm" },
    { label: finalUiText["Medium"], value: "text-shadow-md" },
    { label: finalUiText["Large"], value: "text-shadow-lg" },
    { label: finalUiText["Custom"], value: "text-shadow-custom" },
];

export const opacityOptions: TailwindOption[] = [
    { label: "50%", value: "opacity-50" },
    { label: "75%", value: "opacity-75" },
    { label: "100%", value: "opacity-100" },
];

export const cursorOptions: TailwindOption[] = [
    { label: finalUiText["Not Allowed"], value: "cursor-not-allowed" },
    { label: finalUiText["Default"], value: "cursor-default" },
    { label: "ポインター", value: "cursor-pointer" },
];

export const fontSizeOptions: TailwindOption[] = [
    { label: finalUiText["Extra Small"], value: "text-xs" },
    { label: finalUiText["Small"], value: "text-sm" },
    { label: finalUiText["Base"], value: "text-base" },
    { label: finalUiText["Large"], value: "text-lg" },
    { label: finalUiText["Extra Large"], value: "text-xl" },
    { label: finalUiText["2X Large"], value: "text-2xl" },
    { label: finalUiText["3X Large"], value: "text-3xl" },
    { label: finalUiText["4X Large"], value: "text-4xl" },
    { label: finalUiText["5X Large"], value: "text-5xl" },
    { label: finalUiText["6X Large"], value: "text-6xl" },
    { label: finalUiText["7X Large"], value: "text-7xl" },
    { label: finalUiText["8X Large"], value: "text-8xl" },
    { label: finalUiText["9X Large"], value: "text-9xl" },
];

export const fontWeightOptions: TailwindOption[] = [
    { label: finalUiText["Thin"], value: "font-thin" },
    { label: finalUiText["Extra Light"], value: "font-extralight" },
    { label: finalUiText["Light"], value: "font-light" },
    { label: finalUiText["Normal"], value: "font-normal" },
    { label: finalUiText["Medium"], value: "font-medium" },
    { label: finalUiText["Semi Bold"], value: "font-semibold" },
    { label: finalUiText["Bold"], value: "font-bold" },
    { label: finalUiText["Extra Bold"], value: "font-extrabold" },
    { label: finalUiText["Black"], value: "font-black" },
];

export const lineHeightOptions: TailwindOption[] = [
    { label: "なし", value: "leading-none" },
    { label: finalUiText["Tight"], value: "leading-tight" },
    { label: finalUiText["Snug"], value: "leading-snug" },
    { label: finalUiText["Normal"], value: "leading-normal" },
    { label: finalUiText["Relaxed"], value: "leading-relaxed" },
    { label: finalUiText["Loose"], value: "leading-loose" },
];

export const letterSpacingOptions: TailwindOption[] = [
    { label: finalUiText["Tighter"], value: "tracking-tighter" },
    { label: finalUiText["Tight"], value: "tracking-tight" },
    { label: finalUiText["Normal"], value: "tracking-normal" },
    { label: finalUiText["Wide"], value: "tracking-wide" },
    { label: finalUiText["Wider"], value: "tracking-wider" },
    { label: finalUiText["Widest"], value: "tracking-widest" },
];

export const textAlignOptions: TailwindOption[] = [
    { label: finalUiText["Left"], value: "text-left" },
    { label: finalUiText["Center"], value: "text-center" },
    { label: finalUiText["Right"], value: "text-right" },
    { label: finalUiText["Justify"], value: "text-justify" },
];

export const textTransformOptions: TailwindOption[] = [
    { label: "なし", value: "normal-case" },
    { label: finalUiText["Uppercase"], value: "uppercase" },
    { label: finalUiText["Lowercase"], value: "lowercase" },
    { label: finalUiText["Capitalize"], value: "capitalize" },
];

export const fontFamilyOptions = {
    Sans: [
        { label: "Inter", value: "font-inter" },
        { label: "Open Sans", value: "font-open-sans" },
        { label: "Source Sans 3", value: "font-source-sans-3" },
        { label: "Noto Sans", value: "font-noto-sans" },
        { label: "Roboto", value: "font-roboto" },
        { label: "Mulish", value: "font-mulish" },
        { label: "Nunito", value: "font-nunito" },
        { label: "Work Sans", value: "font-work-sans" },
    ],
    Serif: [
        { label: "Merriweather", value: "font-merriweather" },
        { label: "Alegreya", value: "font-alegreya" },
        { label: "Playfair Display", value: "font-playfair-display" },
        { label: "Roboto Slab", value: "font-roboto-slab" },
        { label: "Source Serif 4", value: "font-source-serif-4" },
    ],
    Display: [
        { label: "Montserrat", value: "font-montserrat" },
        { label: "Poppins", value: "font-poppins" },
        { label: "Raleway", value: "font-raleway" },
        { label: "Rubik", value: "font-rubik" },
        { label: "Oswald", value: "font-oswald" },
        { label: "Bebas Neue", value: "font-bebas-neue" },
    ],
    Modern: [
        { label: "Lato", value: "font-lato" },
        { label: "PT Sans", value: "font-pt-sans" },
        { label: "Quicksand", value: "font-quicksand" },
    ],
} as const;
