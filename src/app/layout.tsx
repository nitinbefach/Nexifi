import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/shared/Providers";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#F26B1D",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "NEXIFI — Next is Now | Wholesale Prices on Electronics & Gadgets",
    template: "%s | NEXIFI",
  },
  description:
    "Shop electronics, gadgets, toys, and home appliances at wholesale prices with fast delivery across India. NEXIFI — Next is Now.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
