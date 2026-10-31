import type { Config } from "tailwindcss";

/**
 * PING VIBE design tokens. Colours come from the active colour theme (CSS variables set by the theme engine);
 * see src/lib/theme/themes.ts. Default theme: Rainbow Wonder (the official logo palette).
 */
/** Tailwind colour that reads a theme variable and still supports opacity modifiers (e.g. bg-vibe-aqua/20). */
const v = (name: string) => `rgb(var(--pv-${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Every colour reads a theme variable (src/lib/theme/themes.ts), so the whole app follows the selected theme.
        vibe: {
          purple: v("primary"), "purple-light": v("primary"), "purple-dark": v("primary-ink"),
          midnight: v("bg"), "midnight-2": v("surface-2"), "midnight-3": v("surface-3"),
          lavender: v("ink-soft"),
          aqua: v("secondary"), sky: v("secondary"),
          sun: v("reward"), coral: v("error"), orange: v("orange"),
          mint: v("success"), lime: v("success"),
          pink: v("pink"), magenta: v("pink"), violet: v("accent"),
          // Text-safe ("ink") versions of each accent for the theme's surfaces
          "purple-ink": v("primary-ink"), "purple-light-ink": v("primary-ink"), "aqua-ink": v("secondary-ink"), "sky-ink": v("secondary-ink"),
          "sun-ink": v("reward-ink"), "coral-ink": v("error-ink"), "orange-ink": v("orange-ink"), "mint-ink": v("success-ink"), "lime-ink": v("success-ink"),
          "pink-ink": v("pink-ink"), "magenta-ink": v("pink-ink"), "violet-ink": v("accent-ink"),
          // Fixed colours that must not change with the theme (text on yellow buttons, white speech bubbles, modal scrims)
          night: "#19162F",
        },
        ink: v("ink"), "ink-soft": v("ink-soft"), glass: v("glass"), line: v("line"), surface: v("surface-2"),
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: { "4xl": "2rem", "5xl": "2.5rem" },
      boxShadow: {
        glow: "0 10px 34px -10px rgb(var(--pv-primary) / 0.55)",
        "glow-aqua": "0 10px 34px -10px rgb(var(--pv-secondary) / 0.55)",
        "glow-sun": "0 10px 34px -10px rgb(var(--pv-reward) / 0.65)",
        card: "0 18px 40px -18px rgb(var(--pv-shadow) / var(--pv-shadow-alpha))",
      },
      backgroundImage: {
        "vibe-hero":
          "radial-gradient(1200px 600px at 70% -10%, rgb(var(--pv-glow-a) / 0.22), transparent 60%), radial-gradient(900px 500px at 0% 30%, rgb(var(--pv-glow-b) / 0.2), transparent 60%), radial-gradient(800px 500px at 100% 80%, rgb(var(--pv-glow-c) / 0.2), transparent 60%)",
        "vibe-cta": "linear-gradient(135deg, rgb(var(--pv-cta-from)) 0%, rgb(var(--pv-cta-to)) 100%)",
        "vibe-aqua": "linear-gradient(135deg, rgb(var(--pv-secondary)) 0%, rgb(var(--pv-primary)) 100%)",
        "vibe-sun": "linear-gradient(135deg, rgb(var(--pv-reward)) 0%, rgb(var(--pv-orange)) 100%)",
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-14px)" } },
        twinkle: { "0%,100%": { opacity: "0.2" }, "50%": { opacity: "1" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        wiggle: { "0%,100%": { transform: "rotate(-4deg)" }, "50%": { transform: "rotate(4deg)" } },
        blink: { "0%,92%,100%": { transform: "scaleY(1)" }, "95%": { transform: "scaleY(0.1)" } },
        drift: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 9s ease-in-out infinite",
        twinkle: "twinkle 3s ease-in-out infinite",
        shimmer: "shimmer 2.4s linear infinite",
        wiggle: "wiggle 2.5s ease-in-out infinite",
        blink: "blink 5s ease-in-out infinite",
        drift: "drift 60s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
