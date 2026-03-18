// 会员相关组件

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  getUser,
  canSignIn,
  doSignIn,
  exchangePointsForMember,
  activateMembership,
  formatMemberExpiry,
  FREE_LIMITS,
} from "@/lib/user";
import { useCode } from "@/lib/activation-code";

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
    <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-3 text-sm">
      {/* 会员状态 */}
      {user.isMember ? (
        <Button variant="secondary" size="sm" onClick={onOpenMember}>
          会员 {formatMemberExpiry(user.memberExpiresAt)}
        </Button>
      ) : (
        <Button size="sm" onClick={onOpenMember}>
          开通会员
        </Button>
      )}

      {/* 积分 */}
      <span className="text-muted-foreground">{user.points}积分</span>

      {/* 签到按钮 */}
      {canSign ? (
        <Button variant="ghost" size="sm" onClick={handleSignIn}>
          签到+10
        </Button>
      ) : (
        <span className="text-muted-foreground text-xs">已签到</span>
      )}

      {/* 签到结果提示 */}
      {showSignInResult && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm z-50">
          {showSignInResult}
        </div>
      )}
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

  const features = [
    { free: "5次/天", member: "无限次", label: "每日优化" },
    { free: "1次/天", member: "无限次", label: "多版本生成" },
    { free: "基础", member: "全部", label: "简历模板" },
    { free: "有", member: "无", label: "广告" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle>会员中心</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="intro" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="intro" className="text-xs sm:text-sm">权益</TabsTrigger>
            <TabsTrigger value="code" className="text-xs sm:text-sm">激活码</TabsTrigger>
            <TabsTrigger value="points" className="text-xs sm:text-sm">积分</TabsTrigger>
          </TabsList>

          <TabsContent value="intro" className="mt-4 space-y-4">
            {/* 当前状态 */}
            <Card>
              <CardContent className="py-3">
                {user.isMember ? (
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-medium">会员用户</span>
                    <span className="text-sm text-muted-foreground">{formatMemberExpiry(user.memberExpiresAt)}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">普通用户</span>
                    <span className="text-sm text-muted-foreground">积分: {user.points}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 权益对比 */}
            <div className="divide-y rounded-lg border">
              {features.map((f, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 text-sm">
                  <span className="text-muted-foreground">{f.label}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">{f.free}</span>
                    <span className="font-medium">{f.member}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-muted text-sm">
              <p className="font-medium mb-1">如何获取会员？</p>
              <p className="text-muted-foreground">打赏任意金额获取激活码，或每日签到攒积分兑换</p>
            </div>
          </TabsContent>

          <TabsContent value="code" className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">打赏后获取激活码，输入即可激活会员</p>

            <Input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="请输入激活码"
              className="text-center tracking-widest font-mono uppercase"
            />

            <Button className="w-full" onClick={handleActivateCode} disabled={!code.trim()}>
              激活会员
            </Button>

            {codeMessage && (
              <p className={`text-center text-sm ${codeMessage.includes("成功") ? "text-green-600" : "text-destructive"}`}>
                {codeMessage}
              </p>
            )}
          </TabsContent>

          <TabsContent value="points" className="mt-4 space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span className="text-muted-foreground">当前积分</span>
              <span className="text-2xl font-bold">{user.points}</span>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">选择兑换天数：</p>
              <div className="grid grid-cols-4 gap-2">
                {[1, 3, 7, 30].map((d) => (
                  <Button
                    key={d}
                    variant={exchangeDays === d ? "default" : "outline"}
                    size="sm"
                    onClick={() => setExchangeDays(d)}
                  >
                    {d}天
                  </Button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">需要积分</span>
                <span className="font-medium">{exchangeDays * 100}</span>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleExchange}
              disabled={user.points < exchangeDays * 100}
            >
              {user.points >= exchangeDays * 100 ? "确认兑换" : "积分不足"}
            </Button>

            {codeMessage && (
              <p className={`text-center text-sm ${codeMessage.includes("成功") ? "text-green-600" : "text-destructive"}`}>
                {codeMessage}
              </p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}