import type { Metadata } from "next";
import { PageTransition } from "@/components/page-transition";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voxa — AI Voice Receptionist",
  description:
    "AI voice receptionist for home services — answers calls 24/7, qualifies callers and books appointments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
