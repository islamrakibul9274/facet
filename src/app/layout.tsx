import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Facet — Interactive 3D Glass Sculpture",
  description:
    "An interactive optical study merging on-device computer vision with physical volcanic glass and real-time WebGL shaders.",
  authors: [{ name: "Rakibul Islam Rumel" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="bg-[#030305] text-white antialiased overflow-hidden selection:bg-white/20 selection:text-white"
        style={{ backgroundColor: "#030305", margin: 0 }}
      >
        {children}
      </body>
    </html>
  );
}