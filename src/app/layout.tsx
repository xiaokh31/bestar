import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header, Footer } from "@/components/layout";
import { getSiteConfig } from "@/config/site-config";
import { LocaleProvider } from "@/i18n/locale-context";

import { SessionProvider } from "next-auth/react";
import { getServerSession } from "next-auth";

import Providers from './providers'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Bestar Service CCA",
    template: `%s | Bestar Service CCA`,
  },
  description: "专业的跨境物流解决方案提供商 - FBA头程、一件代发、退货换标服务",
  keywords: [
    "跨境物流",
    "FBA头程",
    "一件代发",
    "退货换标",
    "仓储物流",
    "跨境电商",
    "加拿大物流",
  ],
  authors: [{ name: "Bestar Service CCA" }],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://bestarca.com",
    title: "Bestar Service CCA",
    description: "专业的跨境物流解决方案提供商 - FBA头程、一件代发、退货换标服务",
    siteName: "Bestar Service CCA",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  //  获取服务端Session
  const session = await getServerSession();
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Providers session={session}>
          <LocaleProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </LocaleProvider>
        </Providers>
      </body>
    </html>
  );
}