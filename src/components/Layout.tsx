// 共享组件

"use client";

import Link from "next/link";
import { useState } from "react";
import { User, getUser } from "@/lib/user";
import { UserStatusBar } from "@/components/MemberComponents";

// 图标
export const Icons = {
  Logo: () => (
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Sparkles: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  Chart: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Template: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  ),
  Crown: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l3.5 7L12 7l3.5 3L19 3M5 21h14M5 17h14M5 13h14" />
    </svg>
  ),
  Menu: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  X: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

// 导航链接
const navLinks = [
  { href: "/optimize", label: "简历优化", icon: <Icons.Sparkles /> },
  { href: "/score", label: "ATS评分", icon: <Icons.Chart /> },
  { href: "/templates", label: "模板库", icon: <Icons.Template /> },
  { href: "/member", label: "会员中心", icon: <Icons.Crown /> },
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
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-gray-200/50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <Icons.Logo />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">AI简历优化</h1>
            <p className="text-xs text-gray-500 hidden sm:block">智能润色 · ATS评分</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* User Area */}
        <div className="hidden md:flex items-center gap-2">
          {user && <UserStatusBar user={user} onOpenMember={() => setShowMember(true)} />}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          {mobileMenuOpen ? <Icons.X /> : <Icons.Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <nav className="p-4 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
              >
                {link.icon}
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
    <footer className="border-t border-gray-200/50 py-8 mt-16">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="text-sm text-gray-600">AI简历优化助手 · 帮助每一位求职者找到理想工作</p>
        <p className="mt-2 text-xs text-gray-400">Powered by DeepSeek AI</p>
        <div className="mt-4 flex justify-center gap-6 text-xs text-gray-500">
          <Link href="/optimize" className="hover:text-indigo-600">简历优化</Link>
          <Link href="/score" className="hover:text-indigo-600">ATS评分</Link>
          <Link href="/templates" className="hover:text-indigo-600">模板库</Link>
          <Link href="/member" className="hover:text-indigo-600">会员中心</Link>
        </div>
      </div>
    </footer>
  );
}

// 功能卡片
export function FeatureCard({ icon, title, desc, href }: { icon: string; title: string; desc: string; href: string }) {
  return (
    <Link href={href} className="glass-card p-6 text-center group cursor-pointer">
      <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform">{icon}</span>
      <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{title}</h3>
      <p className="text-sm text-gray-500 mt-2">{desc}</p>
    </Link>
  );
}

// CTA按钮
export function CTAButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transform hover:-translate-y-0.5 transition-all"
    >
      {children}
    </Link>
  );
}