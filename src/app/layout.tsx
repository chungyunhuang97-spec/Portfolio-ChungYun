import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit, Nunito, Fredoka } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
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

// Used for the mobile-only wordmark in <Navbar /> (Figma spec: "Fredoka One").
// The classic single-weight "Fredoka One" family was folded into the newer
// variable-weight "Fredoka" family in next/font/google, so weight 400 is
// requested explicitly to match the old "Fredoka One" look.
const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400"],
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
      className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} ${nunito.variable} ${fredoka.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-ink">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
