import type { Config } from "tailwindcss";

/**
 * PING VIBE design tokens.
 * Base palette from the brand brief, extended with tints/shades that were
 * needed once real layouts were composed (deep space backgrounds, glow tints).
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        vibe: {
          purple: "#7047FF",
          "purple-light": "#9B7BFF",
          "purple-dark": "#4F2BD9",
          midnight: "#17132C",
          "midnight-2": "#211B3F",
          "midnight-3": "#2C2452",
          coral: "#FF6B6B",
          aqua: "#39D5E8",
          sun: "#FFD65A",
          lavender: "#EAE4FF",
          mint: "#5BE3A8",
          pink: "#FF7AC6",
          magenta: "#F2358D",
          sky: "#1FB6F2",
          lime: "#6BCF3A",
          violet: "#9B3FE6",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: { "4xl": "2rem", "5xl": "2.5rem" },
      boxShadow: {
        glow: "0 0 40px -8px rgba(112,71,255,0.65)",
        "glow-aqua": "0 0 40px -8px rgba(57,213,232,0.6)",
        "glow-sun": "0 0 40px -8px rgba(255,214,90,0.6)",
        card: "0 20px 50px -20px rgba(8,4,30,0.8)",
      },
      backgroundImage: {
        "vibe-hero":
          "radial-gradient(1200px 600px at 70% -10%, rgba(112,71,255,0.55), transparent 60%), radial-gradient(900px 500px at 0% 30%, rgba(57,213,232,0.25), transparent 60%), radial-gradient(800px 500px at 100% 80%, rgba(255,107,107,0.22), transparent 60%)",
        "vibe-cta": "linear-gradient(135deg, #7047FF 0%, #9B3FE6 45%, #F2358D 100%)",
        "vibe-aqua": "linear-gradient(135deg, #39D5E8 0%, #7047FF 100%)",
        "vibe-sun": "linear-gradient(135deg, #FFD65A 0%, #FF6B6B 100%)",
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
