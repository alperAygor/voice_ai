import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sesli AI Resepsiyonist",
  description: "Ev hizmetleri işletmeleri için sesli AI resepsiyonist platformu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
