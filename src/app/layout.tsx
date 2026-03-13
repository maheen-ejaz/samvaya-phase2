import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const apfelGrotezk = localFont({
  src: [
    {
      path: "../../public/fonts/ApfelGrotezk-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/ApfelGrotezk-Mittel.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/ApfelGrotezk-Fett.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/ApfelGrotezk-Satt.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-apfel",
  display: "swap",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${apfelGrotezk.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
