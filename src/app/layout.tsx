import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header, Footer } from "@/components/layout";
import { CookieConsent } from "@/components/cookie-consent";
import { getSiteConfig } from "@/config/site-config";
import { LocaleProvider } from "@/i18n/locale-context";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import Providers from './providers'

import { SpeedInsights } from "@vercel/speed-insights/next";
import { OrganizationSchema, WebsiteSchema, LocalBusinessSchema } from "@/components/seo/structured-data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bestarcca.com";

// SEO优化的Viewport配置
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Bestar Service CCA | 加拿大专业跨境物流服务",
    template: `%s | Bestar Service CCA`,
  },
  description: "Bestar Service CCA是加拿大卡尔加里专业跨境物流服务商，提供FBA尾程提拆派服务、卡派服务、北美跨境物流、Amazon FBA、仓储管理、一件代发、退货换标等全方位物流解决方案。",
  keywords: [
    "Bestar Service CCA",
    "加拿大物流",
    "卡尔加里物流",
    "跨境物流",
    "FBA尾程提拆派服务",
    "FBA Last Mile",
    "卡派服务",
    "Truck Freight",
    "北美跨境物流",
    "Cross-border logistics",
    "Amazon FBA",
    "仓储管理",
    "Warehouse Management",
    "一件代发",
    "Dropshipping",
    "退货换标",
    "Returns and Relabeling",
    "跨境电商物流",
    "e-commerce logistics",
    "Canada logistics",
    "Calgary warehouse",
    "bestarcca"
  ],
  authors: [{ name: "Bestar Service CCA", url: siteUrl }],
  creator: "Bestar Service CCA",
  publisher: "Bestar Service CCA",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    alternateLocale: ["en_US", "fr_CA"],
    url: siteUrl,
    title: "Bestar Service CCA | 加拿大专业跨境物流服务",
    description: "Bestar Service CCA是加拿大卡尔加里专业跨境物流服务商，提供FBA、卡派服务、北美跨境物流、Amazon FBA、仓储管理、一件代发、退货换标等全方位物流解决方案。",
    siteName: "Bestar Service CCA",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Bestar Service CCA - 加拿大专业跨境物流服务",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bestar Service CCA | 加拿大专业跨境物流服务",
    description: "Bestar Service CCA是加拿大卡尔加里专业跨境物流服务商，提供FBA尾程提拆派服务、卡派服务、北美跨境物流、Amazon FBA、仓储管理、一件代发、退货换标等全方位物流解决方案。",
    images: ["/images/og-image.jpg"],
    creator: "@BestarCCA",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    // Bing Webmaster Tools验证
    // 在Bing Webmaster中添加网站后，获取验证代码并设置环境变量
    other: {
      "msvalidate.01": process.env.BING_SITE_VERIFICATION || "",
      // 百度搜索资源平台验证
      // 在百度站长平台添加网站后，获取验证代码并设置环境变量
      "baidu-site-verification": process.env.BAIDU_SITE_VERIFICATION || "",
      // Yandex (俄罗斯搜索引擎)
      "yandex-verification": process.env.YANDEX_SITE_VERIFICATION || "",
    },
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      "zh-CN": `${siteUrl}/zh`,
      "en-US": `${siteUrl}/en`,
      "fr-CA": `${siteUrl}/fr`,
    },
  },
  icons: {
    icon: [
      { url: "/images/logo/favicon.ico" },
      { url: "/images/logo/favicon-16.ico", sizes: "16x16", type: "image/png" },
      { url: "/images/logo/favicon-32.ico", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/images/logo/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  category: "logistics",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 获取服务端Session（必须传入authOptions以正确解析自定义字段如role）
  const session = await getServerSession(authOptions);
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Providers session={session}>
          {/* SEO结构化数据 */}
          <OrganizationSchema />
          <WebsiteSchema />
          <LocalBusinessSchema />
          <LocaleProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <CookieConsent />
          </LocaleProvider>
        </Providers>
      </body>
    </html>
  );
}