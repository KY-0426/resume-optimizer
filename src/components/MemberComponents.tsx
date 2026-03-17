// 会员相关组件

"use client";

import { useState, useEffect } from "react";
import {
  User,
  getUser,
  saveUser,
  canOptimize,
  canGenerateVersions,
  canSignIn,
  doSignIn,
  exchangePointsForMember,
  activateMembership,
  formatMemberExpiry,
  FREE_LIMITS,
} from "@/lib/user";
import { validateCode, useCode } from "@/lib/activation-code";

// 用户状态栏组件
export function UserStatusBar({
  user,
  onOpenMember,
}: {
  user: User;
  onOpenMember: () => void;
}) {
  const [showSignInResult, setShowSignInResult] = useState<string | null>(null);

  const handleSignIn = () => {
    const result = doSignIn(user);
    if (result.success) {
      setShowSignInResult(result.message);
      setTimeout(() => setShowSignInResult(null), 3000);
    }
  };

  const canSign = canSignIn(user);

  return (
    <div className="flex items-center gap-3 text-sm">
      {/* 会员状态 */}
      {user.isMember ? (
        <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full">
          <span className="text-amber-600">👑</span>
          <span className="text-amber-700 text-xs font-medium">
            会员 {formatMemberExpiry(user.memberExpiresAt)}
          </span>
        </div>
      ) : (
        <button
          onClick={onOpenMember}
          className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-xs font-medium hover:shadow-md transition-shadow"
        >
          <span>👑</span>
          <span>开通会员</span>
        </button>
      )}

      {/* 积分 */}
      <div className="flex items-center gap-1 text-gray-600">
        <span>💎</span>
        <span className="text-xs">{user.points}积分</span>
      </div>

      {/* 签到按钮 */}
      {canSign ? (
        <button
          onClick={handleSignIn}
          className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs hover:bg-green-200 transition-colors"
        >
          签到+10
        </button>
      ) : (
        <span className="px-2 py-1 text-gray-400 text-xs">已签到</span>
      )}

      {/* 次数显示 */}
      {!user.isMember && (
        <span className="text-xs text-gray-500">
          今日: {FREE_LIMITS.dailyOptimize - user.dailyOptimizeCount}次
        </span>
      )}

      {/* 签到结果提示 */}
      {showSignInResult && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm shadow-lg z-50 animate-bounce">
          {showSignInResult}
        </div>
      )}
    </div>
  );
}

// 次数用完提示组件
export function LimitReachedNotice({
  type,
  onOpenMember,
}: {
  type: "optimize" | "version";
  onOpenMember: () => void;
}) {
  const messages = {
    optimize: "今日优化次数已用完",
    version: "今日多版本生成次数已用完",
  };

  return (
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
      <p className="text-amber-700 font-medium mb-2">{messages[type]}</p>
      <div className="flex justify-center gap-2">
        <button
          onClick={onOpenMember}
          className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm rounded-lg hover:shadow-md"
        >
          开通会员无限次
        </button>
        <span className="text-xs text-amber-600 self-center">或明天再来</span>
      </div>
    </div>
  );
}

// 会员弹窗组件
export function MemberModal({
  isOpen,
  onClose,
  user,
  onUserUpdate,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUserUpdate: (user: User) => void;
}) {
  const [tab, setTab] = useState<"intro" | "code" | "points">("intro");
  const [code, setCode] = useState("");
  const [codeMessage, setCodeMessage] = useState<string | null>(null);
  const [exchangeDays, setExchangeDays] = useState(1);

  const handleActivateCode = () => {
    if (!code.trim()) return;

    const result = useCode(code.trim(), user.id);
    setCodeMessage(result.message);

    if (result.success && result.days) {
      const updatedUser = activateMembership(user, result.days);
      onUserUpdate(updatedUser);
      setCode("");
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  const handleExchange = () => {
    const result = exchangePointsForMember(user, exchangeDays);
    setCodeMessage(result.message);

    if (result.success) {
      const updatedUser = getUser();
      onUserUpdate(updatedUser);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">👑</span>
            <h2 className="text-xl font-bold">会员中心</h2>
          </div>
          <p className="text-white/80 text-sm">解锁全部功能，畅享无限优化</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setTab("intro")}
            className={`flex-1 py-3 text-sm font-medium ${tab === "intro" ? "text-amber-600 border-b-2 border-amber-500" : "text-gray-500"}`}
          >
            会员权益
          </button>
          <button
            onClick={() => setTab("code")}
            className={`flex-1 py-3 text-sm font-medium ${tab === "code" ? "text-amber-600 border-b-2 border-amber-500" : "text-gray-500"}`}
          >
            激活码
          </button>
          <button
            onClick={() => setTab("points")}
            className={`flex-1 py-3 text-sm font-medium ${tab === "points" ? "text-amber-600 border-b-2 border-amber-500" : "text-gray-500"}`}
          >
            积分兑换
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {tab === "intro" && (
            <>
              {/* 当前状态 */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                {user.isMember ? (
                  <div className="flex items-center gap-2 text-amber-600">
                    <span>👑</span>
                    <span className="font-medium">会员用户</span>
                    <span className="text-sm text-gray-500 ml-auto">
                      {formatMemberExpiry(user.memberExpiresAt)}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">普通用户</span>
                    <span className="text-sm text-gray-500">
                      积分: {user.points}
                    </span>
                  </div>
                )}
              </div>

              {/* 权益对比 */}
              <div className="mb-4">
                <h3 className="font-medium text-gray-900 mb-3">会员权益对比</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b text-sm">
                    <span className="text-gray-600">每日优化次数</span>
                    <span className="text-gray-500">5次</span>
                    <span className="text-amber-600 font-medium">无限</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b text-sm">
                    <span className="text-gray-600">多版本生成</span>
                    <span className="text-gray-500">1次/天</span>
                    <span className="text-amber-600 font-medium">无限</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b text-sm">
                    <span className="text-gray-600">简历模板</span>
                    <span className="text-gray-500">基础</span>
                    <span className="text-amber-600 font-medium">全部</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b text-sm">
                    <span className="text-gray-600">历史记录</span>
                    <span className="text-gray-500">10条</span>
                    <span className="text-amber-600 font-medium">100条</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-sm">
                    <span className="text-gray-600">广告</span>
                    <span className="text-gray-500">有</span>
                    <span className="text-amber-600 font-medium">无</span>
                  </div>
                </div>
              </div>

              {/* 获取方式 */}
              <div className="bg-amber-50 rounded-lg p-4">
                <h4 className="font-medium text-amber-800 mb-2">如何获取会员？</h4>
                <ul className="space-y-2 text-sm text-amber-700">
                  <li className="flex items-start gap-2">
                    <span>1.</span>
                    <span>打赏任意金额，截图发送至邮箱获取激活码</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>2.</span>
                    <span>每日签到攒积分，100积分兑换1天会员</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>3.</span>
                    <span>分享给朋友使用，每邀请1人获得20积分</span>
                  </li>
                </ul>
              </div>
            </>
          )}

          {tab === "code" && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">激活会员</h3>
              <p className="text-sm text-gray-500 mb-4">
                打赏后获取激活码，输入即可激活会员
              </p>

              <div className="space-y-3">
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="请输入激活码"
                  className="w-full px-4 py-3 border rounded-lg text-center tracking-widest font-mono uppercase focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <button
                  onClick={handleActivateCode}
                  disabled={!code.trim()}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  激活会员
                </button>
              </div>

              {codeMessage && (
                <p className={`mt-3 text-center text-sm ${codeMessage.includes("成功") ? "text-green-600" : "text-red-600"}`}>
                  {codeMessage}
                </p>
              )}

              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-400 text-center">
                  打赏方式：点击页面底部"打赏支持"获取激活码
                </p>
              </div>
            </div>
          )}

          {tab === "points" && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">积分兑换</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">当前积分</span>
                  <span className="text-2xl font-bold text-amber-600">{user.points}</span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <p className="text-sm text-gray-500">选择兑换天数：</p>
                <div className="flex gap-2">
                  {[1, 3, 7, 30].map(days => (
                    <button
                      key={days}
                      onClick={() => setExchangeDays(days)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                        exchangeDays === days
                          ? "bg-amber-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {days}天
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 rounded-lg p-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-amber-700">需要积分</span>
                  <span className="font-medium text-amber-800">{exchangeDays * 100}积分</span>
                </div>
              </div>

              <button
                onClick={handleExchange}
                disabled={user.points < exchangeDays * 100}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {user.points >= exchangeDays * 100 ? "确认兑换" : "积分不足"}
              </button>

              {codeMessage && (
                <p className={`mt-3 text-center text-sm ${codeMessage.includes("成功") ? "text-green-600" : "text-red-600"}`}>
                  {codeMessage}
                </p>
              )}

              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500 text-center">
                  💡 每日签到可获得积分，连续签到奖励更多
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}