"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import AdBanner from "@/components/AdBanner";
import { scoreResume } from "@/lib/resume-scorer";
import { resumeTemplates, ResumeTemplate } from "@/lib/resume-templates";
import { exportToPdf, exportToWord, exportToTxt, copyToClipboard } from "@/lib/export-utils";
import { getHistory, addToHistory, deleteFromHistory, clearHistory, formatDate, HistoryItem } from "@/lib/history";
import {
  User,
  getUser,
  canOptimize,
  canGenerateVersions,
  recordOptimize,
  recordVersionGenerate,
  FREE_LIMITS,
} from "@/lib/user";
import { UserStatusBar, MemberModal } from "@/components/MemberComponents";

// 示例数据
const SAMPLE_RESUME = `张三
电话：138-1234-5678 | 邮箱：zhangsan@email.com

工作经历：
- 2021.06-至今 ABC科技有限公司 前端开发工程师
  负责公司核心产品的Web端开发，提升首屏加载速度50%

- 2019.07-2021.05 XYZ互联网公司 初级前端工程师
  使用Vue.js重构老旧模块，代码量减少30%

项目经验：
- 企业管理系统 (React + TypeScript)
  独立负责权限管理模块开发

教育背景：
- 2015-2019 XX大学 计算机科学与技术 本科

技能：React、Vue.js、TypeScript、Node.js`;

const SAMPLE_JD = `职位：高级前端工程师

任职要求：
- 5年以上前端开发经验
- 精通React或Vue框架
- 熟悉前端工程化`;

// 图标组件
const Icons = {
  Sparkles: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  Document: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Chart: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Download: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  Copy: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  X: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Template: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  ),
  History: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Crown: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l3.5 7L12 7l3.5 3L19 3M5 21h14M5 17h14M5 13h14" />
    </svg>
  ),
};

// 评分环组件
function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const strokeWidth = size * 0.1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return { stroke: "#10b981", bg: "rgba(16, 185, 129, 0.1)" };
    if (s >= 60) return { stroke: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" };
    return { stroke: "#ef4444", bg: "rgba(239, 68, 68, 0.1)" };
  };

  const { stroke, bg } = getColor(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={stroke} strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color: stroke }}>{score}</span>
        <span className="text-xs text-gray-400">/ 100</span>
      </div>
    </div>
  );
}

// 评分卡片
function ScoreCard({ score, breakdown, suggestions }: {
  score: number;
  breakdown: ReturnType<typeof scoreResume>['breakdown'];
  suggestions: string[];
}) {
  const labels: Record<string, { name: string; icon: string }> = {
    keywords: { name: "关键词匹配", icon: "🎯" },
    format: { name: "格式规范", icon: "📐" },
    quantification: { name: "量化成果", icon: "📊" },
    actionVerbs: { name: "行为动词", icon: "✨" },
    sections: { name: "模块完整", icon: "📋" },
    length: { name: "篇幅适中", icon: "📏" },
  };

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <ScoreRing score={score} />
        <div>
          <h3 className="text-xl font-bold text-gray-900">简历质量评分</h3>
          <p className="text-sm text-gray-500 mt-1">
            {score >= 80 ? "优秀！简历质量很高" : score >= 60 ? "良好，还有提升空间" : "需要改进，参考下方建议"}
          </p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {Object.entries(breakdown).map(([key, value]) => {
          const { name, icon } = labels[key];
          const percent = Math.round((value.score / value.max) * 100);
          return (
            <div key={key} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <span>{icon}</span>
                  {name}
                </span>
                <span className="text-sm font-semibold" style={{ color: percent >= 70 ? "#10b981" : percent >= 40 ? "#f59e0b" : "#ef4444" }}>
                  {value.score}/{value.max}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${percent}%`,
                    background: percent >= 70 ? "linear-gradient(90deg, #10b981, #059669)" : percent >= 40 ? "linear-gradient(90deg, #f59e0b, #d97706)" : "linear-gradient(90deg, #ef4444, #dc2626)"
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {suggestions.length > 0 && (
        <div className="border-t border-gray-100 pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>💡</span> 改进建议
          </h4>
          <ul className="space-y-2">
            {suggestions.map((s, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-indigo-500 mt-0.5">→</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// 关键词卡片
function KeywordsCard({ resume }: { resume: string }) {
  const techKeywords = ["React", "Vue", "JavaScript", "TypeScript", "Python", "Java", "Node.js", "Docker", "Git"];
  const actionKeywords = ["主导", "负责", "推动", "实现", "优化", "设计", "开发", "管理"];

  const foundTech = techKeywords.filter(k => resume.toLowerCase().includes(k.toLowerCase()));
  const foundAction = actionKeywords.filter(k => resume.includes(k));

  return (
    <div className="glass-card p-5">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span>🔍</span> 关键词分析
      </h3>

      <div className="space-y-4">
        <div>
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">技术关键词 ({foundTech.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {foundTech.length > 0 ? foundTech.map(k => (
              <span key={k} className="tag tag-primary">{k}</span>
            )) : <span className="text-xs text-gray-400">未检测到</span>}
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">行为动词 ({foundAction.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {foundAction.length > 0 ? foundAction.map(k => (
              <span key={k} className="tag tag-success">{k}</span>
            )) : <span className="text-xs text-gray-400">未检测到</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

// 模板弹窗
function TemplateModal({ isOpen, onClose, onSelect, user }: {
  isOpen: boolean; onClose: () => void; onSelect: (t: ResumeTemplate) => void; user: User;
}) {
  const [category, setCategory] = useState("全部");
  const categories = ["全部", "技术", "产品", "运营", "应届生", "管理"];
  const filtered = category === "全部" ? resumeTemplates : resumeTemplates.filter(t => t.category === category);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">选择简历模板</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><Icons.X /></button>
        </div>

        <div className="p-4 border-b border-gray-100 flex gap-2 overflow-x-auto">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                category === c ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              {c}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(template => {
              const locked = !user.isMember && !FREE_LIMITS.templates.includes(template.id);
              return (
                <div key={template.id}
                  className={`relative group rounded-xl border-2 border-gray-100 hover:border-indigo-200 p-5 cursor-pointer transition-all hover:shadow-lg ${locked ? "opacity-60" : ""}`}
                  onClick={() => { if (!locked) { onSelect(template); onClose(); } }}>
                  {locked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl backdrop-blur-sm">
                      <span className="tag bg-amber-100 text-amber-700 border-amber-200"><Icons.Crown /> 会员专属</span>
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{template.name}</h4>
                      <p className="text-xs text-gray-500">{template.category}</p>
                    </div>
                    <span className="text-2xl">{template.preview}</span>
                  </div>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// 历史记录弹窗
function HistoryModal({ isOpen, onClose, onSelect, onDelete }: {
  isOpen: boolean; onClose: () => void; onSelect: (item: HistoryItem) => void; onDelete: (id: string) => void;
}) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  useEffect(() => { if (isOpen) setHistory(getHistory()); }, [isOpen]);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Icons.History /> 历史记录</h2>
          <div className="flex items-center gap-2">
            {history.length > 0 && <button onClick={() => { clearHistory(); setHistory([]); }} className="text-sm text-red-500 hover:text-red-600">清空</button>}
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><Icons.X /></button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.History />
              </div>
              <p className="text-gray-500">暂无历史记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map(item => (
                <div key={item.id} className="group rounded-xl border border-gray-100 hover:border-indigo-200 p-4 transition-all hover:shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">{formatDate(item.timestamp)}</span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { onSelect(item); onClose(); }} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">加载</button>
                      <button onClick={() => { onDelete(item.id); setHistory(getHistory()); }} className="text-xs text-red-500 hover:text-red-600">删除</button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{item.originalResume.slice(0, 100)}...</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 导出弹窗
function ExportModal({ isOpen, onClose, content }: { isOpen: boolean; onClose: () => void; content: string }) {
  if (!isOpen) return null;

  const options = [
    { name: "PDF", desc: "适合打印投递", color: "red", action: () => { exportToPdf(content, "优化简历"); onClose(); } },
    { name: "Word", desc: "可继续编辑", color: "blue", action: () => { exportToWord(content, "优化简历"); onClose(); } },
    { name: "TXT", desc: "纯文本格式", color: "gray", action: () => { exportToTxt(content, "优化简历"); onClose(); } },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900"><Icons.Download /> 导出简历</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><Icons.X /></button>
        </div>
        <div className="p-4 space-y-2">
          {options.map(opt => (
            <button key={opt.name} onClick={opt.action}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-indigo-200 hover:bg-gray-50 transition-all text-left">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold bg-${opt.color}-500`}>
                {opt.name}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{opt.name}格式</p>
                <p className="text-sm text-gray-500">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// 打赏弹窗
function DonateModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="p-6 text-center border-b border-gray-100">
          <span className="text-4xl">☕</span>
          <h2 className="text-xl font-bold text-gray-900 mt-2">支持开发者</h2>
          <p className="text-sm text-gray-500 mt-1">打赏可获取会员激活码</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <img src="/weixin.png" alt="微信" className="w-28 h-28 mx-auto rounded-xl shadow-md" />
              <p className="text-xs text-gray-500 mt-2 font-medium">微信扫码</p>
            </div>
            <div className="text-center">
              <img src="/zfb.jpg" alt="支付宝" className="w-28 h-28 mx-auto rounded-xl shadow-md" />
              <p className="text-xs text-gray-500 mt-2 font-medium">支付宝扫码</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl text-center">
            <p className="text-xs text-indigo-700">打赏后截图发送至邮箱获取激活码</p>
          </div>
        </div>
        <button onClick={onClose} className="w-full p-4 text-sm text-gray-500 hover:bg-gray-50 border-t">关闭</button>
      </div>
    </div>
  );
}

// 主页面
export default function Home() {
  const [user, setUser] = useState<User>({} as User);
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [optimizedResume, setOptimizedResume] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"optimize" | "score">("optimize");
  const [scoreResult, setScoreResult] = useState<ReturnType<typeof scoreResume> | null>(null);
  const [versions, setVersions] = useState<string[]>([]);
  const [showVersions, setShowVersions] = useState(false);

  // 弹窗状态
  const [showTemplates, setShowTemplates] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showDonate, setShowDonate] = useState(false);
  const [showMember, setShowMember] = useState(false);

  useEffect(() => { setUser(getUser()); }, []);
  useEffect(() => { setScoreResult(resume.trim() ? scoreResume(resume, jobDescription) : null); }, [resume, jobDescription]);

  const handleOptimize = async () => {
    if (!resume.trim()) { setError("请输入简历内容"); return; }
    const check = canOptimize(user);
    if (!check.can) { setShowMember(true); return; }

    setLoading(true); setError(""); setOptimizedResume("");
    try {
      const res = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: resume.trim(), jobDescription: jobDescription.trim() }),
      });
      if (!res.ok) throw new Error("优化失败");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let content = "";
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split("\n").filter(l => l.trim())) {
          if (line.startsWith("data: ") && line.slice(6) !== "[DONE]") {
            try { content += JSON.parse(line.slice(6)).content || ""; setOptimizedResume(content); } catch {}
          }
        }
      }

      setUser(recordOptimize(user));
      addToHistory({ originalResume: resume, jobDescription, optimizedResume: content, score: scoreResult?.totalScore });
    } catch { setError("优化失败，请重试"); }
    finally { setLoading(false); }
  };

  const handleGenerateVersions = async () => {
    if (!resume.trim()) return;
    const check = canGenerateVersions(user);
    if (!check.can) { setShowMember(true); return; }

    setLoading(true); setVersions([]);
    try {
      const prompts = ["重点突出技术能力：", "简洁有力的表达：", "强调团队协作能力："];
      const results: string[] = [];
      for (const p of prompts) {
        const res = await fetch("/api/optimize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume: p + "\n" + resume, jobDescription }),
        });
        if (res.ok) {
          const reader = res.body?.getReader();
          const decoder = new TextDecoder();
          let content = "";
          while (reader) {
            const { done, value } = await reader.read();
            if (done) break;
            for (const line of decoder.decode(value).split("\n").filter(l => l.trim())) {
              if (line.startsWith("data: ") && line.slice(6) !== "[DONE]") {
                try { content += JSON.parse(line.slice(6)).content || ""; } catch {}
              }
            }
          }
          results.push(content);
        }
      }
      setUser(recordVersionGenerate(user));
      setVersions(results);
      setShowVersions(true);
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Icons.Document />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">AI简历优化</h1>
              <p className="text-xs text-gray-500 hidden sm:block">智能润色 · ATS评分</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <UserStatusBar user={user} onOpenMember={() => setShowMember(true)} />
            <button onClick={() => setShowHistory(true)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="历史记录"><Icons.History /></button>
            <button onClick={() => setShowDonate(true)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg" title="打赏"><Icons.Crown /></button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-12 pb-8 text-center px-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 rounded-full shadow-sm border border-gray-100 mb-6">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-sm text-gray-600">免费使用 · 无需注册</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="gradient-text">AI驱动</span>，让简历脱颖而出
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto">智能润色简历语言，优化关键词匹配，提高ATS筛选通过率</p>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 pb-16">
        {/* Tab */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white/80 rounded-xl p-1.5 shadow-sm border border-gray-100">
            <button onClick={() => setActiveTab("optimize")} className={`px-6 py-2.5 rounded-lg font-medium transition-all ${activeTab === "optimize" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
              <span className="flex items-center gap-2"><Icons.Sparkles /> 简历优化</span>
            </button>
            <button onClick={() => setActiveTab("score")} className={`px-6 py-2.5 rounded-lg font-medium transition-all ${activeTab === "score" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
              <span className="flex items-center gap-2"><Icons.Chart /> ATS评分</span>
            </button>
          </div>
        </div>

        {activeTab === "optimize" ? (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 justify-center">
              <button onClick={() => { setResume(SAMPLE_RESUME); setJobDescription(SAMPLE_JD); }} className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">加载示例</button>
              <button onClick={() => setShowTemplates(true)} className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-1"><Icons.Template /> 选择模板</button>
              <button onClick={() => { setResume(""); setJobDescription(""); setOptimizedResume(""); }} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">清空</button>
            </div>

            {/* Input Area */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="glass-card p-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">你的简历 <span className="text-red-500">*</span></label>
                  <textarea value={resume} onChange={e => setResume(e.target.value)} placeholder="粘贴你的简历内容..." className="modern-input h-64 resize-none" />
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-400">{resume.length} 字符</span>
                    {scoreResult && <button onClick={() => setActiveTab("score")} className="text-xs text-indigo-600 font-medium hover:text-indigo-700">当前评分: {scoreResult.totalScore}分 →</button>}
                  </div>
                </div>

                <div className="glass-card p-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">目标职位 <span className="text-gray-400 font-normal">(可选，提高匹配度)</span></label>
                  <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="粘贴职位JD..." className="modern-input h-28 resize-none" />
                </div>
              </div>

              <div className="space-y-4">
                <KeywordsCard resume={resume} />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={handleOptimize} disabled={loading || !resume.trim()} className="btn-primary flex items-center gap-2">
                {loading ? <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span> : <Icons.Sparkles />}
                {loading ? "AI生成中..." : "开始优化"}
              </button>
              <button onClick={handleGenerateVersions} disabled={loading || !resume.trim()} className="btn-secondary flex items-center gap-2">
                <Icons.Template /> 生成多版本
              </button>
            </div>

            {/* Error */}
            {error && <div className="max-w-xl mx-auto p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-center text-sm animate-fade-in">{error}</div>}

            {/* Result */}
            {optimizedResume && (
              <div className="glass-card p-6 animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Icons.Document /> 优化结果</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={async () => { await copyToClipboard(optimizedResume); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                      className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 ${copied ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                      {copied ? <Icons.Check /> : <Icons.Copy />} {copied ? "已复制" : "复制"}
                    </button>
                    <button onClick={() => setShowExport(true)} className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-1">
                      <Icons.Download /> 导出
                    </button>
                  </div>
                </div>
                <div className="markdown-content p-4 bg-gray-50 rounded-xl max-h-96 overflow-auto">
                  <ReactMarkdown>{optimizedResume}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Versions */}
            {showVersions && versions.length > 0 && (
              <div className="glass-card p-6 animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">多版本选择</h3>
                  <button onClick={() => setShowVersions(false)} className="text-sm text-gray-500 hover:text-gray-700">关闭</button>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {versions.map((v, i) => (
                    <div key={i} className="border border-gray-100 rounded-xl p-4 hover:border-indigo-200 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{["技术导向", "简洁有力", "团队协作"][i]}</span>
                        <button onClick={() => { setOptimizedResume(v); setShowVersions(false); }} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">使用</button>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-4">{v.slice(0, 200)}...</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Score Tab */
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {scoreResult ? (
                <ScoreCard score={scoreResult.totalScore} breakdown={scoreResult.breakdown} suggestions={scoreResult.suggestions} />
              ) : (
                <div className="glass-card p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icons.Chart />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">输入简历开始评分</h3>
                  <p className="text-sm text-gray-500 mb-4">在"简历优化"页输入简历后可查看评分</p>
                  <button onClick={() => setActiveTab("optimize")} className="btn-primary">去输入简历</button>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <KeywordsCard resume={resume} />
              <div className="glass-card p-5">
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
        )}

        {/* Ad */}
        {!user.isMember && <div className="mt-8"><AdBanner type="horizontal" /></div>}

        {/* Features */}
        <section className="mt-16">
          <h3 className="text-xl font-bold text-center text-gray-900 mb-8">核心功能</h3>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: "🎯", title: "ATS评分", desc: "智能评估简历质量" },
              { icon: "✨", title: "AI优化", desc: "一键润色简历语言" },
              { icon: "📋", title: "模板库", desc: "专业简历模板" },
              { icon: "📥", title: "多格式导出", desc: "PDF/Word/TXT" },
            ].map((f, i) => (
              <div key={i} className="glass-card p-6 text-center">
                <span className="text-3xl mb-3 block">{f.icon}</span>
                <h4 className="font-semibold text-gray-900">{f.title}</h4>
                <p className="text-sm text-gray-500 mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/50 py-8 text-center text-sm text-gray-500">
        <p>AI简历优化助手 · 帮助每一位求职者找到理想工作</p>
        <p className="mt-1 text-xs text-gray-400">Powered by DeepSeek AI</p>
      </footer>

      {/* Modals */}
      <TemplateModal isOpen={showTemplates} onClose={() => setShowTemplates(false)} onSelect={t => setResume(t.content)} user={user} />
      <HistoryModal isOpen={showHistory} onClose={() => setShowHistory(false)} onSelect={item => { setResume(item.originalResume); setJobDescription(item.jobDescription); setOptimizedResume(item.optimizedResume); }} onDelete={deleteFromHistory} />
      <ExportModal isOpen={showExport} onClose={() => setShowExport(false)} content={optimizedResume} />
      <DonateModal isOpen={showDonate} onClose={() => setShowDonate(false)} />
      <MemberModal isOpen={showMember} onClose={() => setShowMember(false)} user={user} onUserUpdate={setUser} />
    </div>
  );
}