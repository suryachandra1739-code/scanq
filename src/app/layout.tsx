import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/contexts/AppContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Company — Product Traceability",
  description: "Scan QR codes to verify and trace product information, view manufacturing details, and download product manuals.",
  keywords: ["product traceability", "QR code", "product verification", "manufacturing"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
        <AppProvider>
          <div className="mesh-bg" />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
