"use client";

import { useState, useEffect } from "react";
import { Navbar, Footer } from "@/components/Layout";
import { User, getUser, doSignIn, canSignIn, exchangePointsForMember, formatMemberExpiry } from "@/lib/user";
import { validateCode, useCode } from "@/lib/activation-code";

export default function MemberPage() {
  const [user, setUser] = useState<User>({} as User);
  const [tab, setTab] = useState<"intro" | "code" | "points">("intro");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [exchangeDays, setExchangeDays] = useState(1);

  useEffect(() => { setUser(getUser()); }, []);

  const handleSignIn = () => {
    const result = doSignIn(user);
    if (result.success) {
      setUser(getUser());
      setMessage({ type: "success", text: result.message });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleActivateCode = () => {
    if (!code.trim()) return;
    const result = useCode(code.trim(), user.id);
    if (result.success) {
      setUser(getUser());
      setCode("");
    }
    setMessage({ type: result.success ? "success" : "error", text: result.message });
  };

  const handleExchange = () => {
    const result = exchangePointsForMember(user, exchangeDays);
    if (result.success) {
      setUser(getUser());
    }
    setMessage({ type: result.success ? "success" : "error", text: result.message });
  };

  const features = [
    { free: "5次/天", member: "无限次", label: "每日优化" },
    { free: "1次/天", member: "无限次", label: "多版本生成" },
    { free: "基础模板", member: "全部模板", label: "简历模板" },
    { free: "10条", member: "100条", label: "历史记录" },
    { free: "有广告", member: "无广告", label: "广告" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">会员中心</h1>
          <p className="text-gray-600">解锁全部功能，畅享无限优化</p>
        </div>

        {/* User Status */}
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${user.isMember ? "bg-gradient-to-br from-amber-400 to-orange-500" : "bg-gray-100"}`}>
                <span className="text-2xl">{user.isMember ? "👑" : "👤"}</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {user.isMember ? "会员用户" : "普通用户"}
                </h3>
                {user.isMember ? (
                  <p className="text-sm text-amber-600">{formatMemberExpiry(user.memberExpiresAt)}</p>
                ) : (
                  <p className="text-sm text-gray-500">积分: {user.points}</p>
                )}
              </div>
            </div>
            {!user.isMember && canSignIn(user) && (
              <button onClick={handleSignIn} className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium text-sm">
                签到 +10积分
              </button>
            )}
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl text-center ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {[
            { key: "intro", label: "会员权益" },
            { key: "code", label: "激活码" },
            { key: "points", label: "积分兑换" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
              className={`flex-1 py-3 text-sm font-medium ${tab === t.key ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === "intro" && (
          <div className="glass-card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">权益对比</h3>
            <div className="space-y-3">
              {features.map((f, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <span className="text-gray-600">{f.label}</span>
                  <div className="flex items-center gap-8">
                    <span className="text-sm text-gray-500">{f.free}</span>
                    <span className="text-sm font-medium text-indigo-600">{f.member}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-indigo-50 rounded-xl">
              <h4 className="font-medium text-indigo-900 mb-2">如何获取会员？</h4>
              <ul className="text-sm text-indigo-700 space-y-1">
                <li>• 打赏任意金额，获取激活码</li>
                <li>• 每日签到攒积分，100积分=1天会员</li>
              </ul>
            </div>
          </div>
        )}

        {tab === "code" && (
          <div className="glass-card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">激活会员</h3>
            <p className="text-sm text-gray-500 mb-4">打赏后获取激活码，输入即可激活</p>

            <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="请输入激活码"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center tracking-widest font-mono uppercase focus:border-indigo-500 focus:outline-none" />

            <button onClick={handleActivateCode} disabled={!code.trim()}
              className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl disabled:opacity-50">
              激活会员
            </button>

            <div className="mt-4 text-center text-xs text-gray-400">
              打赏方式：点击页面顶部"👑"按钮
            </div>
          </div>
        )}

        {tab === "points" && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">积分兑换</h3>
              <div className="text-right">
                <p className="text-2xl font-bold text-indigo-600">{user.points}</p>
                <p className="text-xs text-gray-500">当前积分</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">选择兑换天数：</p>
              <div className="flex gap-2">
                {[1, 3, 7, 30].map(d => (
                  <button key={d} onClick={() => setExchangeDays(d)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium ${exchangeDays === d ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                    {d}天
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-indigo-50 rounded-xl mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-indigo-700">需要积分</span>
                <span className="font-semibold text-indigo-800">{exchangeDays * 100}</span>
              </div>
            </div>

            <button onClick={handleExchange} disabled={user.points < exchangeDays * 100}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl disabled:opacity-50">
              {user.points >= exchangeDays * 100 ? "确认兑换" : "积分不足"}
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}