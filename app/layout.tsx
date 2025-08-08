import localFont from "next/font/local";

import type { Metadata } from "next";

import "./globals.css";

import Providers from "~/components/Providers";
import { Toaster } from "~/components/ui/sonner";

const gyonggiBatangFont = localFont({
  src: [
    {
      path: "./Batang_Regular.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "./Batang_Bold.woff",
      weight: "700",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: "🍋 레몬트리",
  description: "당신의 일기를 위한 공간",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${gyonggiBatangFont.className} antialiased`}>
        <main className="w-full">
          <Providers>{children}</Providers>
        </main>
        <Toaster />
      </body>
    </html>
  );
}
