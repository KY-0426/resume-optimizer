"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Navbar, Footer } from "@/components/Layout";
import { User, getUser, canOptimize, canGenerateVersions, recordOptimize, recordVersionGenerate, FREE_LIMITS } from "@/lib/user";
import { scoreResume } from "@/lib/resume-scorer";
import { exportToPdf, exportToWord, exportToTxt, copyToClipboard } from "@/lib/export-utils";
import { addToHistory } from "@/lib/history";
import { MemberModal } from "@/components/MemberComponents";
import TemplateModal from "./TemplateModal";
import HistoryModal from "./HistoryModal";
import ExportModal from "./ExportModal";

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

export default function OptimizePage() {
  const [user, setUser] = useState<User>({} as User);
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [optimizedResume, setOptimizedResume] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // 弹窗
  const [showTemplates, setShowTemplates] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showMember, setShowMember] = useState(false);

  // 多版本
  const [versions, setVersions] = useState<string[]>([]);
  const [showVersions, setShowVersions] = useState(false);

  useEffect(() => { setUser(getUser()); }, []);

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

      const score = scoreResume(resume, jobDescription);
      setUser(recordOptimize(user));
      addToHistory({ originalResume: resume, jobDescription, optimizedResume: content, score: score.totalScore });
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
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">简历优化</h1>
          <p className="text-neutral-600">AI智能润色，提升简历质量</p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          <button onClick={() => { setResume(SAMPLE_RESUME); setJobDescription(SAMPLE_JD); }} className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded">加载示例</button>
          <button onClick={() => setShowTemplates(true)} className="px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100 rounded">选择模板</button>
          <button onClick={() => setShowHistory(true)} className="px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100 rounded">历史记录</button>
          <button onClick={() => { setResume(""); setJobDescription(""); setOptimizedResume(""); }} className="px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100 rounded">清空</button>
        </div>

        {/* Input */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="card p-5">
            <label className="block text-sm font-medium text-neutral-700 mb-2">你的简历 <span className="text-red-500">*</span></label>
            <textarea value={resume} onChange={e => setResume(e.target.value)} placeholder="粘贴你的简历内容..." className="input h-72 resize-none text-sm" />
            <p className="text-xs text-neutral-400 mt-2">{resume.length} 字符</p>
          </div>

          <div className="card p-5">
            <label className="block text-sm font-medium text-neutral-700 mb-2">目标职位 <span className="text-neutral-400">(可选)</span></label>
            <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="粘贴职位JD，AI会针对性优化..." className="input h-72 resize-none text-sm" />
            <p className="text-xs text-neutral-400 mt-2">{jobDescription.length} 字符</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <button onClick={handleOptimize} disabled={loading || !resume.trim()} className="btn btn-primary">
            {loading ? "AI生成中..." : "开始优化"}
          </button>
          <button onClick={handleGenerateVersions} disabled={loading || !resume.trim()} className="btn btn-outline">
            生成多版本
          </button>
        </div>

        {/* Usage Info */}
        {!user.isMember && (
          <p className="text-center text-sm text-neutral-500 mb-6">
            今日剩余: {FREE_LIMITS.dailyOptimize - (user.dailyOptimizeCount || 0)} 次
            <button onClick={() => setShowMember(true)} className="text-blue-600 ml-2 hover:underline">开通会员无限次</button>
          </p>
        )}

        {/* Error */}
        {error && <div className="max-w-xl mx-auto mb-6 p-4 bg-red-50 text-red-700 text-center text-sm rounded-lg">{error}</div>}

        {/* Result */}
        {optimizedResume && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-neutral-900">优化结果</h3>
              <div className="flex gap-2">
                <button onClick={async () => { await copyToClipboard(optimizedResume); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className={`px-3 py-1.5 text-sm rounded ${copied ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"}`}>
                  {copied ? "已复制" : "复制"}
                </button>
                <button onClick={() => setShowExport(true)} className="px-3 py-1.5 text-sm bg-neutral-100 text-neutral-700 rounded hover:bg-neutral-200">导出</button>
              </div>
            </div>
            <div className="markdown p-4 bg-neutral-50 rounded-lg max-h-96 overflow-auto text-sm">
              <ReactMarkdown>{optimizedResume}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Versions */}
        {showVersions && versions.length > 0 && (
          <div className="card p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-neutral-900">多版本选择</h3>
              <button onClick={() => setShowVersions(false)} className="text-sm text-neutral-500 hover:text-neutral-700">关闭</button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {versions.map((v, i) => (
                <div key={i} className="border border-neutral-200 rounded-lg p-4 hover:border-blue-300">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-neutral-700">{["技术导向", "简洁有力", "团队协作"][i]}</span>
                    <button onClick={() => { setOptimizedResume(v); setShowVersions(false); }} className="text-xs text-blue-600 font-medium hover:underline">使用</button>
                  </div>
                  <p className="text-xs text-neutral-500 line-clamp-4">{v.slice(0, 200)}...</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Modals */}
      <TemplateModal isOpen={showTemplates} onClose={() => setShowTemplates(false)} onSelect={t => setResume(t.content)} user={user} />
      <HistoryModal isOpen={showHistory} onClose={() => setShowHistory(false)} onSelect={item => { setResume(item.originalResume); setJobDescription(item.jobDescription); setOptimizedResume(item.optimizedResume); }} />
      <ExportModal isOpen={showExport} onClose={() => setShowExport(false)} content={optimizedResume} />
      <MemberModal isOpen={showMember} onClose={() => setShowMember(false)} user={user} onUserUpdate={setUser} />
    </div>
  );
}