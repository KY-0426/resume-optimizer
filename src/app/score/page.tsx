"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar, Footer } from "@/components/Layout";
import { scoreResume } from "@/lib/resume-scorer";
import { User, getUser } from "@/lib/user";

// 评分环
function ScoreRing({ score }: { score: number }) {
  const size = 140;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return "#10b981";
    if (s >= 60) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={getColor(score)} strokeWidth={strokeWidth}
          strokeLinecap="round" style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
          className="transition-all duration-1000" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold" style={{ color: getColor(score) }}>{score}</span>
        <span className="text-sm text-gray-400">/ 100</span>
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

  const labels: Record<string, { name: string; icon: string }> = {
    keywords: { name: "关键词匹配", icon: "🎯" },
    format: { name: "格式规范", icon: "📐" },
    quantification: { name: "量化成果", icon: "📊" },
    actionVerbs: { name: "行为动词", icon: "✨" },
    sections: { name: "模块完整", icon: "📋" },
    length: { name: "篇幅适中", icon: "📏" },
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ATS简历评分</h1>
          <p className="text-gray-600">智能评估简历质量，提高通过率</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input */}
          <div className="space-y-4">
            <div className="glass-card p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-3">你的简历 <span className="text-red-500">*</span></label>
              <textarea value={resume} onChange={e => setResume(e.target.value)} placeholder="粘贴简历内容..." className="modern-input h-64 resize-none" />
            </div>

            <div className="glass-card p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-3">目标职位 <span className="text-gray-400 font-normal">(可选)</span></label>
              <textarea value={jd} onChange={e => setJd(e.target.value)} placeholder="粘贴职位JD..." className="modern-input h-28 resize-none" />
            </div>

            <Link href="/optimize" className="block text-center text-sm text-indigo-600 hover:text-indigo-700">
              需要优化简历？去简历优化 →
            </Link>
          </div>

          {/* Result */}
          <div>
            {result ? (
              <div className="glass-card p-6 animate-fade-in">
                <div className="flex items-center gap-6 mb-6">
                  <ScoreRing score={result.totalScore} />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">简历质量评分</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {result.totalScore >= 80 ? "优秀！简历质量很高" : result.totalScore >= 60 ? "良好，还有提升空间" : "需要改进"}
                    </p>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="space-y-4 mb-6">
                  {Object.entries(result.breakdown).map(([key, value]) => {
                    const { name, icon } = labels[key];
                    const percent = Math.round((value.score / value.max) * 100);
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-700">{icon} {name}</span>
                          <span className="text-sm font-semibold" style={{ color: percent >= 70 ? "#10b981" : percent >= 40 ? "#f59e0b" : "#ef4444" }}>
                            {value.score}/{value.max}
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Suggestions */}
                {result.suggestions.length > 0 && (
                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">💡 改进建议</h4>
                    <ul className="space-y-2">
                      {result.suggestions.map((s, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-indigo-500">→</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📊</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">输入简历开始评分</h3>
                <p className="text-sm text-gray-500 mb-4">粘贴简历内容，系统将自动进行ATS评分分析</p>
              </div>
            )}

            {/* Tips */}
            <div className="glass-card p-5 mt-4">
              <h4 className="font-semibold text-gray-900 mb-3">💡 提高评分技巧</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2"><span className="text-indigo-500">•</span>使用具体数字量化成果</li>
                <li className="flex items-start gap-2"><span className="text-indigo-500">•</span>添加行业专业关键词</li>
                <li className="flex items-start gap-2"><span className="text-indigo-500">•</span>用行为动词开头描述</li>
                <li className="flex items-start gap-2"><span className="text-indigo-500">•</span>确保包含完整模块</li>
                <li className="flex items-start gap-2"><span className="text-indigo-500">•</span>篇幅控制在300-1500字</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}