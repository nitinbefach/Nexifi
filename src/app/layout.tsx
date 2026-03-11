import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Providers from "@/components/shared/Providers";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#7C3AED",
  viewportFit: "cover",
};

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nexifi.in";

export const metadata: Metadata = {
  title: {
    default: "NEXIFI — Next is Now | Wholesale Prices on Electronics & Gadgets",
    template: "%s | NEXIFI",
  },
  description:
    "Shop electronics, gadgets, toys, and home appliances at wholesale prices with fast delivery across India. NEXIFI — Next is Now.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    siteName: "NEXIFI",
    locale: "en_IN",
    url: siteUrl,
    title: "NEXIFI — Next is Now",
    description:
      "Shop electronics, gadgets, toys, and home appliances at wholesale prices with fast delivery across India.",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "NEXIFI — Next is Now" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NEXIFI — Next is Now",
    description:
      "Shop electronics, gadgets, toys, and home appliances at wholesale prices with fast delivery across India.",
    images: ["/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
