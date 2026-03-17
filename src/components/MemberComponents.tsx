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
        <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 rounded text-xs">
          <span className="text-orange-600">V</span>
          <span className="text-orange-700">
            会员
          </span>
        </div>
      ) : (
        <button
          onClick={onOpenMember}
          className="flex items-center gap-1 px-2 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600"
        >
          <span>开通会员</span>
        </button>
      )}

      {/* 积分 */}
      <div className="flex items-center gap-1 text-neutral-600 text-xs">
        <span>{user.points}积分</span>
      </div>

      {/* 签到按钮 */}
      {canSign ? (
        <button
          onClick={handleSignIn}
          className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs hover:bg-green-100"
        >
          签到+10
        </button>
      ) : (
        <span className="px-2 py-1 text-neutral-400 text-xs">已签到</span>
      )}

      {/* 签到结果提示 */}
      {showSignInResult && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 px-4 py-2 bg-green-500 text-white rounded text-sm z-50">
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
    <div className="p-4 bg-orange-50 text-center rounded">
      <p className="text-orange-700 font-medium mb-2">{messages[type]}</p>
      <button
        onClick={onOpenMember}
        className="px-4 py-1.5 bg-orange-500 text-white text-sm rounded hover:bg-orange-600"
      >
        开通会员无限次
      </button>
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
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="font-semibold text-neutral-900">会员中心</h2>
          <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200">
          <button
            onClick={() => setTab("intro")}
            className={`flex-1 py-3 text-sm ${tab === "intro" ? "text-neutral-900 border-b-2 border-neutral-900 font-medium" : "text-neutral-500"}`}
          >
            会员权益
          </button>
          <button
            onClick={() => setTab("code")}
            className={`flex-1 py-3 text-sm ${tab === "code" ? "text-neutral-900 border-b-2 border-neutral-900 font-medium" : "text-neutral-500"}`}
          >
            激活码
          </button>
          <button
            onClick={() => setTab("points")}
            className={`flex-1 py-3 text-sm ${tab === "points" ? "text-neutral-900 border-b-2 border-neutral-900 font-medium" : "text-neutral-500"}`}
          >
            积分兑换
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {tab === "intro" && (
            <>
              {/* 当前状态 */}
              <div className="mb-4 p-3 bg-neutral-50 rounded">
                {user.isMember ? (
                  <div className="flex items-center gap-2 text-orange-600">
                    <span>V</span>
                    <span className="font-medium">会员用户</span>
                    <span className="text-sm text-neutral-500 ml-auto">
                      {formatMemberExpiry(user.memberExpiresAt)}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">普通用户</span>
                    <span className="text-sm text-neutral-500">
                      积分: {user.points}
                    </span>
                  </div>
                )}
              </div>

              {/* 权益对比 */}
              <div className="mb-4">
                <h3 className="font-medium text-neutral-900 mb-3">会员权益对比</h3>
                <div className="space-y-0">
                  <div className="flex justify-between items-center py-2 border-b border-neutral-100 text-sm">
                    <span className="text-neutral-600">每日优化次数</span>
                    <span className="text-neutral-500">5次</span>
                    <span className="text-neutral-900 font-medium">无限</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-neutral-100 text-sm">
                    <span className="text-neutral-600">多版本生成</span>
                    <span className="text-neutral-500">1次/天</span>
                    <span className="text-neutral-900 font-medium">无限</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-neutral-100 text-sm">
                    <span className="text-neutral-600">简历模板</span>
                    <span className="text-neutral-500">基础</span>
                    <span className="text-neutral-900 font-medium">全部</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-sm">
                    <span className="text-neutral-600">广告</span>
                    <span className="text-neutral-500">有</span>
                    <span className="text-neutral-900 font-medium">无</span>
                  </div>
                </div>
              </div>

              {/* 获取方式 */}
              <div className="bg-blue-50 rounded p-3">
                <h4 className="font-medium text-neutral-900 mb-2">如何获取会员？</h4>
                <ul className="space-y-1 text-sm text-neutral-700">
                  <li>- 打赏任意金额，获取激活码</li>
                  <li>- 每日签到攒积分，100积分=1天会员</li>
                </ul>
              </div>
            </>
          )}

          {tab === "code" && (
            <div>
              <h3 className="font-medium text-neutral-900 mb-2">激活会员</h3>
              <p className="text-sm text-neutral-500 mb-4">
                打赏后获取激活码，输入即可激活会员
              </p>

              <div className="space-y-3">
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="请输入激活码"
                  className="input text-center tracking-widest font-mono uppercase"
                />
                <button
                  onClick={handleActivateCode}
                  disabled={!code.trim()}
                  className="btn btn-primary w-full"
                >
                  激活会员
                </button>
              </div>

              {codeMessage && (
                <p className={`mt-3 text-center text-sm ${codeMessage.includes("成功") ? "text-green-600" : "text-red-600"}`}>
                  {codeMessage}
                </p>
              )}
            </div>
          )}

          {tab === "points" && (
            <div>
              <h3 className="font-medium text-neutral-900 mb-3">积分兑换</h3>
              <div className="bg-neutral-50 rounded p-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">当前积分</span>
                  <span className="text-xl font-bold text-neutral-900">{user.points}</span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <p className="text-sm text-neutral-500">选择兑换天数：</p>
                <div className="flex gap-2">
                  {[1, 3, 7, 30].map(days => (
                    <button
                      key={days}
                      onClick={() => setExchangeDays(days)}
                      className={`flex-1 py-2 rounded text-sm ${
                        exchangeDays === days
                          ? "bg-neutral-900 text-white"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                      }`}
                    >
                      {days}天
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-neutral-50 rounded p-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">需要积分</span>
                  <span className="font-medium text-neutral-900">{exchangeDays * 100}积分</span>
                </div>
              </div>

              <button
                onClick={handleExchange}
                disabled={user.points < exchangeDays * 100}
                className="btn btn-primary w-full disabled:opacity-50"
              >
                {user.points >= exchangeDays * 100 ? "确认兑换" : "积分不足"}
              </button>

              {codeMessage && (
                <p className={`mt-3 text-center text-sm ${codeMessage.includes("成功") ? "text-green-600" : "text-red-600"}`}>
                  {codeMessage}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}