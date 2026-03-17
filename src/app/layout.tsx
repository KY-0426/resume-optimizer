import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI简历优化助手 - 免费智能简历润色工具",
  description: "免费AI简历优化工具，智能润色简历语言、优化关键词、匹配职位要求。提高ATS筛选通过率，让简历脱颖而出。无需注册，直接使用。",
  keywords: "简历优化, AI简历, 简历润色, 求职, 面试, 简历模板, ATS优化, 免费简历工具",
  authors: [{ name: "AI简历优化助手" }],
  creator: "AI简历优化助手",
  publisher: "AI简历优化助手",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://resume-optimizer-orcin.vercel.app",
    siteName: "AI简历优化助手",
    title: "AI简历优化助手 - 免费智能简历润色工具",
    description: "免费AI简历优化工具，智能润色简历语言、优化关键词、匹配职位要求。提高ATS筛选通过率，让简历脱颖而出。",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI简历优化助手",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI简历优化助手 - 免费智能简历润色工具",
    description: "免费AI简历优化工具，智能润色简历语言、优化关键词、匹配职位要求。",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://resume-optimizer-orcin.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="theme-color" content="#3b82f6" />
        <meta name="google-adsense-account" content="ca-pub-7808063546241923" />
        <link rel="icon" href="/favicon.ico" />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7808063546241923"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}