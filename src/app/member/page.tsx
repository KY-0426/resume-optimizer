"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, getUser, doSignIn, canSignIn, exchangePointsForMember, formatMemberExpiry } from "@/lib/user";
import { useCode } from "@/lib/activation-code";

export default function MemberPage() {
  const [user, setUser] = useState<User>({} as User);
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
    <main className="container mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">会员中心</h1>
        <p className="text-sm md:text-base text-muted-foreground">解锁全部功能，畅享无限优化</p>
      </div>

      {/* User Status */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${user.isMember ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                {user.isMember ? "V" : "U"}
              </div>
              <div>
                <h3 className="font-medium">
                  {user.isMember ? "会员用户" : "普通用户"}
                </h3>
                {user.isMember ? (
                  <p className="text-sm text-primary">{formatMemberExpiry(user.memberExpiresAt)}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">积分: {user.points}</p>
                )}
              </div>
            </div>
            {!user.isMember && canSignIn(user) && (
              <Button variant="secondary" onClick={handleSignIn} className="w-full sm:w-auto">
                签到 +10积分
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Message */}
      {message && (
        <Card className={`mb-6 ${message.type === "success" ? "border-green-500 bg-green-50" : "border-destructive bg-destructive/10"}`}>
          <CardContent className="py-3 text-center">
            <span className={message.type === "success" ? "text-green-700" : "text-destructive"}>{message.text}</span>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="intro" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="intro" className="text-xs sm:text-sm">会员权益</TabsTrigger>
          <TabsTrigger value="code" className="text-xs sm:text-sm">激活码</TabsTrigger>
          <TabsTrigger value="points" className="text-xs sm:text-sm">积分兑换</TabsTrigger>
        </TabsList>

        <TabsContent value="intro" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">权益对比</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {features.map((f, i) => (
                  <div key={i} className="flex items-center justify-between py-3">
                    <span className="text-muted-foreground">{f.label}</span>
                    <div className="flex items-center gap-8 text-sm">
                      <span className="text-muted-foreground">{f.free}</span>
                      <span className="font-medium">{f.member}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-lg bg-primary/5">
                <h4 className="font-medium mb-2">如何获取会员？</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>- 打赏任意金额，获取激活码</li>
                  <li>- 每日签到攒积分，100积分=1天会员</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">激活会员</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">打赏后获取激活码，输入即可激活</p>

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

              <p className="text-xs text-center text-muted-foreground">
                打赏方式：点击页面顶部按钮
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="points" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">积分兑换</CardTitle>
                <div className="text-right">
                  <p className="text-2xl font-bold">{user.points}</p>
                  <p className="text-xs text-muted-foreground">当前积分</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">选择兑换天数：</p>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 3, 7, 30].map((d) => (
                    <Button
                      key={d}
                      variant={exchangeDays === d ? "default" : "outline"}
                      size="sm"
                      onClick={() => setExchangeDays(d)}
                      className="text-xs sm:text-sm"
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}