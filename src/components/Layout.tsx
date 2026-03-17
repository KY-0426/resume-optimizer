// 共享组件

"use client";

import Link from "next/link";
import { useState } from "react";
import { User, getUser } from "@/lib/user";
import { UserStatusBar } from "@/components/MemberComponents";

// 图标
export const Icons = {
  Logo: () => (
    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Menu: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  X: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

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
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <Icons.Logo />
          </div>
          <span className="font-semibold text-neutral-900">AI简历优化</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-neutral-600 hover:text-neutral-900"
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
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-neutral-600"
        >
          {mobileMenuOpen ? <Icons.X /> : <Icons.Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white">
          <nav className="p-4 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-neutral-700 hover:text-neutral-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

// 页脚组件
export function Footer() {
  return (
    <footer className="border-t border-neutral-200 py-6 mt-16">
      <div className="max-w-5xl mx-auto px-4 text-center text-sm text-neutral-500">
        <p>AI简历优化助手 · 免费使用 · 无需注册</p>
      </div>
    </footer>
  );
}