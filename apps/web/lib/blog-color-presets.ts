import { ThemeStyle } from "@courselit/page-models";

// Exact palette values from Blog-astro/pj-astro/src/theme-presets.ts.
export const blogColorPresets = {
    navy: {
        primary: "#1e3a5f",
        primaryDark: "#0f2847",
        primaryLight: "#e8eef7",
        navBg: "#0f2847",
        navText: "#ffffff",
        accent: "#2c6cb0",
    },
    rose: {
        primary: "#be3455",
        primaryDark: "#8f2440",
        primaryLight: "#fbe9ee",
        navBg: "#7a1f37",
        navText: "#ffffff",
        accent: "#c02d54",
    },
    pink: {
        primary: "#c5396e",
        primaryDark: "#7d2549",
        primaryLight: "#fce5ed",
        navBg: "#9e2f5e",
        navText: "#ffffff",
        accent: "#c5396e",
    },
    forest: {
        primary: "#2f6b4f",
        primaryDark: "#1f4a37",
        primaryLight: "#e6f1eb",
        navBg: "#1f4a37",
        navText: "#ffffff",
        accent: "#2f7a59",
    },
    terracotta: {
        primary: "#c05621",
        primaryDark: "#8f3f18",
        primaryLight: "#fcebe0",
        navBg: "#7a3514",
        navText: "#ffffff",
        accent: "#a4471a",
    },
    plum: {
        primary: "#6b46c1",
        primaryDark: "#4f3091",
        primaryLight: "#efeafb",
        navBg: "#412879",
        navText: "#ffffff",
        accent: "#7c4fd4",
    },
    charcoal: {
        primary: "#2d3748",
        primaryDark: "#1a202c",
        primaryLight: "#edf0f3",
        navBg: "#1a202c",
        navText: "#ffffff",
        accent: "#3d5a80",
    },
    sky: {
        primary: "#157f96",
        primaryDark: "#0a5868",
        primaryLight: "#d9f0f5",
        navBg: "#0a5a6e",
        navText: "#ffffff",
        accent: "#157f96",
    },
    sunny: {
        primary: "#806b10",
        primaryDark: "#544209",
        primaryLight: "#fef4b8",
        navBg: "#6e560f",
        navText: "#ffffff",
        accent: "#806b10",
    },
    greige: {
        primary: "#5a4f42",
        primaryDark: "#43392e",
        primaryLight: "#f3efe9",
        navBg: "#4a4036",
        navText: "#ffffff",
        accent: "#6e6052",
    },
    luxe: {
        primary: "#305330",
        primaryDark: "#1f3a20",
        primaryLight: "#efece2",
        navBg: "#fbfbf9",
        navText: "#2d2a28",
        accent: "#305330",
    },
    champagne: {
        primary: "#9b2242",
        primaryDark: "#7d1a35",
        primaryLight: "#f7e9ed",
        navBg: "#fbfbf9",
        navText: "#2d2a28",
        accent: "#9b2242",
    },
    slate: {
        primary: "#445063",
        primaryDark: "#2f3744",
        primaryLight: "#eef0f3",
        navBg: "#fbfbf9",
        navText: "#2d2a28",
        accent: "#445063",
    },
    azure: {
        primary: "#264a8a",
        primaryDark: "#1a3360",
        primaryLight: "#e7edf7",
        navBg: "#fbfbf9",
        navText: "#2d2a28",
        accent: "#264a8a",
    },
    amethyst: {
        primary: "#523584",
        primaryDark: "#3a2560",
        primaryLight: "#ece6f5",
        navBg: "#fbfbf9",
        navText: "#2d2a28",
        accent: "#523584",
    },
} as const;

export function applyBlogColorPreset(
    colors: ThemeStyle["colors"],
    presetId: keyof typeof blogColorPresets,
): ThemeStyle["colors"] {
    const preset = blogColorPresets[presetId];
    const lightBackground =
        preset.navText === "#ffffff" ? "#ffffff" : preset.navBg;
    return {
        light: {
            ...colors.light,
            background: lightBackground,
            foreground: "#2d2a28",
            card: lightBackground,
            cardForeground: "#2d2a28",
            popover: lightBackground,
            popoverForeground: "#2d2a28",
            primary: preset.primary,
            primaryForeground: "#ffffff",
            secondary: preset.primaryLight,
            secondaryForeground: preset.primaryDark,
            muted: preset.primaryLight,
            mutedForeground: "#5a4f46",
            accent: preset.primaryLight,
            accentForeground: preset.primaryDark,
            border: "#dedbd5",
            input: "#dedbd5",
            ring: preset.accent,
            sidebar: preset.navBg,
            sidebarForeground: preset.navText,
            sidebarPrimary: preset.primary,
            sidebarPrimaryForeground: "#ffffff",
            sidebarAccent: preset.primaryLight,
            sidebarAccentForeground: preset.primaryDark,
            sidebarBorder: preset.primaryDark,
            sidebarRing: preset.accent,
        },
        dark: {
            ...colors.dark,
            background: "#171c22",
            foreground: "#f5f3ed",
            card: "#171c22",
            cardForeground: "#f5f3ed",
            popover: "#171c22",
            popoverForeground: "#f5f3ed",
            primary: preset.primaryLight,
            primaryForeground: preset.primaryDark,
            secondary: "#252c36",
            secondaryForeground: "#f5f3ed",
            muted: "#252c36",
            mutedForeground: "#c6c4c0",
            accent: preset.primaryDark,
            accentForeground: preset.primaryLight,
            border: "#46505e",
            input: "#46505e",
            ring: preset.primaryLight,
            sidebar: preset.primaryDark,
            sidebarForeground: "#ffffff",
            sidebarPrimary: preset.primaryLight,
            sidebarPrimaryForeground: preset.primaryDark,
            sidebarAccent: "#252c36",
            sidebarAccentForeground: "#f5f3ed",
            sidebarBorder: "#46505e",
            sidebarRing: preset.primaryLight,
        },
    };
}

export function getBlogColorPreset(colors?: ThemeStyle["colors"]) {
    if (!colors) return undefined;
    return (
        Object.keys(blogColorPresets) as Array<keyof typeof blogColorPresets>
    ).find((id) => {
        const expected = applyBlogColorPreset(colors, id);
        return (["light", "dark"] as const).every((mode) =>
            Object.entries(expected[mode]).every(
                ([key, value]) =>
                    colors[mode][key as keyof typeof colors.light] === value,
            ),
        );
    });
}
