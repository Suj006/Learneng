import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import fs from "node:fs";
import path from "node:path";
import "./globals.css";
import { MotionProvider } from "@/components/MotionProvider";
import { BrandAssetProvider } from "@/components/BrandLogo";
import { brandLogoPresent } from "@/components/PingVibeLogo";
import { DEFAULT_THEME, THEME_SEED, themeStylesheet } from "@/lib/theme/themes";

/** Built-in theme variables, inlined so the very first paint is already themed (admin changes arrive via /theme.css). */
const BUILT_IN_THEMES = themeStylesheet(THEME_SEED, DEFAULT_THEME);
/** Applies the device's saved theme and animation setting before the page paints (no flash of the wrong colours). */
const PRE_PAINT = `(function(){try{var c=document.cookie,t=/(?:^|; )pv-theme=([a-z0-9-]+)/.exec(c),m=/(?:^|; )pv-motion=(full|calm|off)/.exec(c),d=document.documentElement;if(t)d.setAttribute("data-theme",t[1]);if(m)d.setAttribute("data-motion",m[1]);}catch(e){}})();`;

const display = Fredoka({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600", "700"] });
const bodyFont = Nunito({ subsets: ["latin"], variable: "--font-body", weight: ["400", "600", "700", "800"] });

const derived = (f: string) => fs.existsSync(path.join(process.cwd(), "public/assets/brand/derived", f)) ? `/assets/brand/derived/${f}` : null;
const description = "PING VIBE is a magical, gamified English-learning universe for children aged 5–13. Discover words, complete missions, unlock kingdoms and become a confident English champion.";
const og = derived("og-image.jpg");

/** Icons and social previews come from assets derived from the official master logo (npm run brand:assets). */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: { default: "PING VIBE — Your World. Your Words. Your Vibe.", template: "%s · PING VIBE" },
  description,
  applicationName: "PING VIBE",
  icons: derived("favicon-32.png") ? { icon: [{ url: derived("favicon-32.png")!, sizes: "32x32" }, { url: derived("icon-192.png")!, sizes: "192x192" }], apple: derived("apple-touch-icon.png")! } : undefined,
  openGraph: { title: "PING VIBE — Your World. Your Words. Your Vibe.", description, siteName: "PING VIBE", type: "website", ...(og ? { images: [{ url: og, width: 1200, height: 630, alt: "PING VIBE" }] } : {}) },
  twitter: { card: og ? "summary_large_image" : "summary", title: "PING VIBE", description, ...(og ? { images: [og] } : {}) },
};
export const viewport: Viewport = { themeColor: "#F1E9FF", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${display.variable} ${bodyFont.variable}`} suppressHydrationWarning>
      <head>
        <style id="pv-themes" dangerouslySetInnerHTML={{ __html: BUILT_IN_THEMES }} />
        <link rel="stylesheet" href="/theme.css" />
        <script dangerouslySetInnerHTML={{ __html: PRE_PAINT }} />
      </head>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-vibe-night">Skip to content</a>
        <MotionProvider><BrandAssetProvider present={brandLogoPresent()}>{children}</BrandAssetProvider></MotionProvider>
      </body>
    </html>
  );
}
