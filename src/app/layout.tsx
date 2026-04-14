import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        suppressHydrationWarning 
        className="bg-black text-white antialiased"
        style={{ backgroundColor: 'black', margin: 0 }} // Hard-coded fallback
      >
        {children}
      </body>
    </html>
  );
}