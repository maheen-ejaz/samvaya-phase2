import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Inter, Geist, Fraunces } from "next/font/google";
import "./globals.css";
import { buildThemeCss } from "@/lib/theme";
import { fetchThemeConfig } from "@/lib/theme.server";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Samvaya Matrimony",
  description: "Premium curated matrimony for medical professionals",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Samvaya",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e293b",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await fetchThemeConfig();
  const themeCss = buildThemeCss(theme);

  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
      </head>
      <body
        className={`${instrumentSans.variable} ${inter.variable} ${geist.variable} ${fraunces.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
