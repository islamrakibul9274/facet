import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Facet — Matter in Motion",
  description:
    "A quiet playground for form, light, and curiosity. Explore four interactive digital sculptures and four mineral finishes, with optional on-device presence tracking.",
  authors: [{ name: "Rakibul Islam Rumel" }],
  openGraph: {
    title: "Facet — Matter in Motion",
    description:
      "Four forms. Endless perspectives. An interactive digital sculpture studio.",
    type: "website",
  },
};
export const viewport: Viewport = {
  themeColor: "#080b0b",
  width: "device-width",
  initialScale: 1,
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
