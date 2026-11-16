import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.URL ?? "https://effortless-pegasus-52bab1.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Amit Nettings — Mosquito Nets, Bird Net & Invisible Grill",
    template: "%s | Amit Nettings",
  },
  description:
    "Amit Nettings provides professional netting services in Navi Mumbai and Mumbai: mosquito nets, bird nets and invisible grills for homes and offices.",
  keywords: ["mosquito net", "pleated mosquito net", "bird net", "pigeon net", "invisible grill", "Navi Mumbai", "Mumbai"],
  openGraph: {
    title: "Amit Nettings — Mosquito Nets, Bird Net & Invisible Grill",
    description: "Professional netting services in Navi Mumbai and Mumbai.",
    type: "website",
    images: ["/media/photos/grill-1.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Outfit:wght@500;600;700;800&display=swap"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
