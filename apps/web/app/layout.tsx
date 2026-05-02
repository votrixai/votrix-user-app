import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces, Geist_Mono } from "next/font/google";
import { MSWProvider } from "@/components/msw-provider";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Votrix",
  description: "AI Employees for your team",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable} ${geistMono.variable}`}>
      <body className="h-dvh overflow-hidden bg-background text-foreground antialiased">
        <MSWProvider>{children}</MSWProvider>
      </body>
    </html>
  );
}
