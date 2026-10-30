import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

const display = Fredoka({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600", "700"] });
const bodyFont = Nunito({ subsets: ["latin"], variable: "--font-body", weight: ["400", "600", "700", "800"] });

export const metadata: Metadata = {
  title: { default: "PING VIBE — Your World. Your Words. Your Vibe.", template: "%s · PING VIBE" },
  description: "PING VIBE is a magical, gamified English-learning universe for children aged 5–13. Discover words, complete missions, unlock kingdoms and become a confident English champion.",
  applicationName: "PING VIBE",
};
export const viewport: Viewport = { themeColor: "#17132C", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${display.variable} ${bodyFont.variable}`}>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-vibe-midnight">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
