import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";

export const metadata: Metadata = {
  title: "LoL 내전 매니저",
  description: "리그오브레전드 내전을 쉽게 관리하세요. 팀 밸런스, 피어리스, 게임 기록까지!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body className="antialiased min-h-screen bg-background font-sans">
        <Providers>
          <Header />
          <main className="container py-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
