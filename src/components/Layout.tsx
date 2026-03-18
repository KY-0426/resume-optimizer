// 共享组件

"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { User, getUser } from "@/lib/user";
import { UserStatusBar } from "@/components/MemberComponents";

// 导航链接
const navLinks = [
  { href: "/optimize", label: "优化简历" },
  { href: "/score", label: "ATS评分" },
  { href: "/templates", label: "模板" },
  { href: "/member", label: "会员" },
];

// 导航栏组件
export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showMember, setShowMember] = useState(false);

  useState(() => {
    setUser(getUser());
  });

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-base md:text-lg">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-primary flex items-center justify-center">
            <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="hidden sm:inline">AI简历优化</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* User Area */}
        <div className="hidden md:flex items-center">
          {user && <UserStatusBar user={user} onOpenMember={() => setShowMember(true)} />}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <span className="text-xs text-muted-foreground">
              {user.isMember ? "会员" : `${user.points}积分`}
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container mx-auto px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <div className="pt-2 border-t mt-2">
                <UserStatusBar user={user} onOpenMember={() => { setShowMember(true); setMobileMenuOpen(false); }} />
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

// 页脚组件
export function Footer() {
  return (
    <footer className="border-t py-6 mt-16">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        AI简历优化助手 · 免费使用 · 无需注册
      </div>
    </footer>
  );
}