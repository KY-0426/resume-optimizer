"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { scoreResume } from "@/lib/resume-scorer";
import { User, getUser } from "@/lib/user";
import AdBanner from "@/components/AdBanner";

function ScoreRing({ score }: { score: number }) {
  const size = 140;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return "hsl(var(--primary))";
    if (s >= 60) return "oklch(0.7 0.15 60)";
    return "oklch(0.6 0.2 25)";
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} />
        <circle
          cx={size/2}
          cy={size/2}
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold" style={{ color: getColor(score) }}>{score}</span>
        <span className="text-sm text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

export default function ScorePage() {
  const [user, setUser] = useState<User>({} as User);
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [result, setResult] = useState<ReturnType<typeof scoreResume> | null>(null);

  useEffect(() => { setUser(getUser()); }, []);
  useEffect(() => { setResult(resume.trim() ? scoreResume(resume, jd) : null); }, [resume, jd]);

  const labels: Record<string, { name: string }> = {
    keywords: { name: "关键词匹配" },
    format: { name: "格式规范" },
    quantification: { name: "量化成果" },
    actionVerbs: { name: "行为动词" },
    sections: { name: "模块完整" },
    length: { name: "篇幅适中" },
  };

  const tips = [
    "使用具体数字量化成果",
    "添加行业专业关键词",
    "用行为动词开头描述",
    "确保包含完整模块",
    "篇幅控制在300-1500字",
  ];

  return (
    <main className="container mx-auto px-4 py-6 md:py-8">
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">ATS简历评分</h1>
        <p className="text-sm md:text-base text-muted-foreground">智能评估简历质量，提高通过率</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
        {/* Input */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                你的简历 <span className="text-destructive">*</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                placeholder="粘贴简历内容..."
                className="min-h-48 md:min-h-64 resize-none"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                目标职位 <span className="text-muted-foreground font-normal">(可选)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="粘贴职位JD..."
                className="min-h-24 md:min-h-28 resize-none"
              />
            </CardContent>
          </Card>

          <Button variant="link" render={<Link href="/optimize" />} className="w-full">
            需要优化简历？去简历优化
          </Button>
        </div>

        {/* Result */}
        <div className="space-y-4">
          {result ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6">
                  <ScoreRing score={result.totalScore} />
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg md:text-xl font-bold">简历质量评分</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {result.totalScore >= 80 ? "优秀！简历质量很高" : result.totalScore >= 60 ? "良好，还有提升空间" : "需要改进"}
                    </p>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="space-y-4 mb-6">
                  {Object.entries(result.breakdown).map(([key, value]) => {
                    const { name } = labels[key];
                    const percent = Math.round((value.score / value.max) * 100);
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1 text-sm">
                          <span>{name}</span>
                          <span className="font-medium">{value.score}/{value.max}</span>
                        </div>
                        <Progress value={percent} className="h-2" />
                      </div>
                    );
                  })}
                </div>

                {/* Suggestions */}
                {result.suggestions.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-3">改进建议</h4>
                    <ul className="space-y-2">
                      {result.suggestions.map((s, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary">-</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-medium mb-2">输入简历开始评分</h3>
                <p className="text-sm text-muted-foreground">粘贴简历内容，系统将自动进行ATS评分分析</p>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">提高评分技巧</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary">-</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ad Banner */}
      <div className="max-w-4xl mx-auto mt-8">
        <AdBanner type="horizontal" />
      </div>
    </main>
  );
}