import type { Config } from "tailwindcss";

/*
 * Every color resolves to a CSS variable holding an RGB channel triplet, defined
 * in src/app/globals.css. The `<alpha-value>` placeholder is what keeps opacity
 * modifiers (`border-outline-variant/40`, `bg-warning-amber/20`) working — a
 * plain `var(--x)` holding a hex string would break them silently.
 *
 * Because of this indirection, a theme override is just a variable override:
 * `.high-contrast` in globals.css re-themes the whole app without touching a
 * single component.
 */
const token = (name: string) => `rgb(var(--color-${name}) / <alpha-value>)`;

/* Status groups all share the same four-part shape. */
const statusGroup = (name: string) => ({
  DEFAULT: token(name),
  container: token(`${name}-container`),
  "on-container": token(`${name}-on-container`),
  border: token(`${name}-border`),
});

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette
        "midnight-navy": token("midnight-navy"),
        "medical-blue": token("medical-blue"),
        "emergency-red": token("emergency-red"),
        "warning-amber": token("warning-amber"),
        "ghost-white": token("ghost-white"),
        "slate-gray": token("slate-gray"),

        // Surface scale
        surface: {
          DEFAULT: token("surface"),
          dim: token("surface-dim"),
          bright: token("surface-bright"),
          "container-lowest": token("surface-container-lowest"),
          "container-low": token("surface-container-low"),
          container: token("surface-container"),
          "container-high": token("surface-container-high"),
          "container-highest": token("surface-container-highest"),
          variant: token("surface-variant"),
          tint: token("surface-tint"),
        },

        // On-surface
        "on-surface": token("on-surface"),
        "on-surface-variant": token("on-surface-variant"),
        "inverse-surface": token("inverse-surface"),
        "inverse-on-surface": token("inverse-on-surface"),

        // Outline
        outline: {
          DEFAULT: token("outline"),
          variant: token("outline-variant"),
        },

        // Primary (Midnight Navy as brand primary)
        primary: {
          DEFAULT: token("primary"),
          container: token("primary-container"),
          fixed: token("primary-fixed"),
          "fixed-dim": token("primary-fixed-dim"),
        },
        "on-primary": token("on-primary"),
        "on-primary-container": token("on-primary-container"),
        "on-primary-fixed": token("on-primary-fixed"),
        "on-primary-fixed-variant": token("on-primary-fixed-variant"),
        "inverse-primary": token("inverse-primary"),

        // Secondary (Medical Blue)
        secondary: {
          DEFAULT: token("secondary"),
          container: token("secondary-container"),
          fixed: token("secondary-fixed"),
          "fixed-dim": token("secondary-fixed-dim"),
        },
        "on-secondary": token("on-secondary"),
        "on-secondary-container": token("on-secondary-container"),
        "on-secondary-fixed": token("on-secondary-fixed"),
        "on-secondary-fixed-variant": token("on-secondary-fixed-variant"),

        // Tertiary
        tertiary: {
          DEFAULT: token("tertiary"),
          container: token("tertiary-container"),
          fixed: token("tertiary-fixed"),
          "fixed-dim": token("tertiary-fixed-dim"),
        },
        "on-tertiary": token("on-tertiary"),
        "on-tertiary-container": token("on-tertiary-container"),
        "on-tertiary-fixed": token("on-tertiary-fixed"),
        "on-tertiary-fixed-variant": token("on-tertiary-fixed-variant"),

        // Semantic
        error: {
          DEFAULT: token("error"),
          container: token("error-container"),
        },
        "on-error": token("on-error"),
        "on-error-container": token("on-error-container"),

        /*
         * Status tokens — use these in badges and state chips instead of raw
         * Tailwind palette colors. `bg-success-container text-success-on-container`
         * replaces the old `bg-green-100 text-green-800`, and unlike the old
         * values these re-theme correctly under `.high-contrast`.
         */
        /*
         * AI surfaces. Generated content is visually distinct from user input so
         * it is never mistaken for a clinician's own entry.
         */
        ai: {
          accent: token("ai-accent"),
          surface: token("ai-surface"),
          border: token("ai-border"),
          "on-surface": token("ai-on-surface"),
          "user-surface": token("ai-user-surface"),
        },

        success: statusGroup("success"),
        complete: statusGroup("complete"),
        info: statusGroup("info"),
        transit: statusGroup("transit"),
        warning: statusGroup("warning"),
        conflict: statusGroup("conflict"),
        danger: statusGroup("danger"),
        neutral: statusGroup("neutral"),
      },

      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
        label: ["Space Grotesk", "ui-sans-serif", "sans-serif"],
      },

      fontSize: {
        "headline-lg": ["2rem", { lineHeight: "1.2", fontWeight: "700" }],
        "headline-md": ["1.5rem", { lineHeight: "1.3", fontWeight: "600" }],
        "body-lg": ["1rem", { lineHeight: "1.5", fontWeight: "400" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
        "data-mono": ["0.875rem", { lineHeight: "1.4", fontWeight: "500", letterSpacing: "-0.02em" }],
        "label-caps": ["0.75rem", { lineHeight: "1", fontWeight: "600" }],
      },

      borderRadius: {
        sm: "0.125rem",
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },

      spacing: {
        "touch-min": "3rem", // 48px minimum touch target
        gutter: "1rem",
        "margin-mobile": "1.5rem",
        "margin-desktop": "2rem",
        "widget-gap": "1.25rem",
      },

      boxShadow: {
        card: "0 2px 4px rgba(0,0,0,0.08)",
        "card-md": "0 4px 8px rgba(0,0,0,0.10)",
        "card-lg": "0 8px 24px rgba(0,0,0,0.12)",
        sidebar: "2px 0 8px rgba(15,23,42,0.15)",
      },

      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "pulse-stat": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        // Streaming caret for AI output in progress.
        "caret-blink": {
          "0%, 70%, 100%": { opacity: "1" },
          "20%, 50%": { opacity: "0" },
        },
      },

      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "slide-in": "slide-in 0.25s ease-out",
        "slide-in-right": "slide-in-right 0.25s ease-out",
        "pulse-stat": "pulse-stat 1.5s ease-in-out infinite",
        "caret-blink": "caret-blink 1.2s ease-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
