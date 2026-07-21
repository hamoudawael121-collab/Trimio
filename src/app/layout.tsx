import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ClientToaster from "@/components/ClientToaster";
import PwaRegister from "@/components/PwaRegister";

export const metadata: Metadata = {
  title: "Trimio - احجز صالونك الآن",
  description: "منصة الحجوزات الذكية لصالونات الحلاقة ومراكز التجميل. اكتشف أفضل المحلات، قارن الأسعار، واحجز موعدك بسهولة.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#0EA5E9",
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
    <html lang="ar" dir="rtl">
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body>
        <PwaRegister />
        <ClientToaster />
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
