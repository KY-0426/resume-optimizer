import Link from "next/link";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
  title: "AI简历优化 - 免费智能简历润色工具",
  description: "免费AI简历优化，智能润色简历语言，优化关键词，提高ATS通过率。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={cn("font-sans", geist.variable)}>
      <body className="min-h-screen bg-muted/30">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <svg className="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              AI简历优化
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/optimize" className="text-muted-foreground hover:text-foreground transition-colors">
                优化简历
              </Link>
              <Link href="/score" className="text-muted-foreground hover:text-foreground transition-colors">
                ATS评分
              </Link>
              <Link href="/templates" className="text-muted-foreground hover:text-foreground transition-colors">
                模板
              </Link>
              <Link href="/member" className="text-muted-foreground hover:text-foreground transition-colors">
                会员
              </Link>
            </nav>
          </div>
        </header>

        {children}

        {/* Footer */}
        <footer className="border-t py-6 mt-16">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            AI简历优化助手 · 免费使用 · 无需注册
          </div>
        </footer>
      </body>
    </html>
  );
}