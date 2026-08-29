import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit, Nunito } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ClickEffects } from "@/components/design-system/ClickEffects";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Used by the shared "project page" design system (case-study pages,
// eventually the homepage). Kept as an additional variable rather than
// replacing --font-sans so existing screens (admin dashboard, etc.) keep
// their current typeface untouched.
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Chung Yun Huang — Product Designer",
  description:
    "A hybrid creator bridging the gap between design and strategy — product design, systems, and AI-augmented craft.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} ${nunito.variable} h-full antialiased`}
    >
      <head>
        {/*
         * Figma specs "Fredoka One" (the classic single-weight display
         * family, Figma's Typography panel shows it literally as its own
         * font name, weight "Regular") for every numeral/heading on the
         * metro case study -- NOT the newer variable-weight "Fredoka"
         * family. These are two genuinely different Google Fonts entries
         * with different letterforms/proportions; next/font/google only
         * ships the variable "Fredoka" (confirmed via its font-data.json --
         * "Fredoka One" isn't in that list), so it can't be loaded the
         * normal self-hosted way. It's still live on Google's own CDN
         * (fonts.googleapis.com/css2?family=Fredoka+One resolves and serves
         * a real @font-face), just not exposed as a next/font/google
         * import -- so it's loaded here as a plain external stylesheet
         * instead. This replaces the earlier (incorrect) assumption that
         * "Fredoka One" had been folded into the variable family and that
         * weight 400 of "Fredoka" was an acceptable stand-in -- Joe flagged
         * the visual mismatch directly against the Figma reference.
         */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-ink">
        {children}
        <ClickEffects />
        <Analytics />
      </body>
    </html>
  );
}
