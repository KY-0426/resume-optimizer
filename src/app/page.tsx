"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import AdBanner from "@/components/AdBanner";
import { scoreResume } from "@/lib/resume-scorer";
import { resumeTemplates, ResumeTemplate } from "@/lib/resume-templates";
import { exportToPdf, exportToWord, exportToTxt, copyToClipboard } from "@/lib/export-utils";
import { getHistory, addToHistory, deleteFromHistory, clearHistory, formatDate, HistoryItem } from "@/lib/history";

// 示例简历模板
const SAMPLE_RESUME = `张三
电话：138-1234-5678
邮箱：zhangsan@email.com
GitHub：github.com/zhangsan

工作经历：
- 2021.06-至今 ABC科技有限公司 前端开发工程师
  负责公司核心产品的Web端开发
  参与前端架构设计，提升首屏加载速度50%
  编写可复用组件库，被3个项目采用

- 2019.07-2021.05 XYZ互联网公司 初级前端工程师
  参与电商平台H5页面开发
  使用Vue.js重构老旧模块，代码量减少30%

项目经验：
- 企业管理系统
  技术栈：React + TypeScript + Ant Design
  独立负责权限管理模块开发
  实现动态路由和按钮级权限控制

教育背景：
- 2015-2019 XX大学 计算机科学与技术 本科

技能：
- 熟悉React、Vue.js框架
- 熟悉TypeScript、JavaScript
- 了解Node.js、Webpack`;

const SAMPLE_JD = `职位：高级前端工程师

岗位职责：
1. 负责公司核心产品的前端架构设计与开发
2. 优化前端性能，提升用户体验
3. 参与技术方案评审，指导初中级工程师

任职要求：
- 5年以上前端开发经验
- 精通React或Vue框架，有大型项目经验
- 熟悉前端工程化，了解性能优化
- 良好的沟通能力和团队协作精神
- 有技术热情，关注前端技术发展`;

// 评分展示组件
function ScoreDisplay({ score, breakdown, suggestions }: {
  score: number;
  breakdown: ReturnType<typeof scoreResume>['breakdown'];
  suggestions: string[];
}) {
  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-green-600";
    if (s >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (s: number) => {
    if (s >= 80) return "优秀";
    if (s >= 60) return "良好";
    if (s >= 40) return "一般";
    return "待改进";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">简历评分</h3>
        <div className="text-right">
          <div className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</div>
          <div className="text-xs text-gray-500">/ 100</div>
        </div>
      </div>

      {/* 分数环 */}
      <div className="flex justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="#e5e7eb"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke={score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : "#ef4444"}
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${score * 3.52} 352`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xl font-bold ${getScoreColor(score)}`}>
              {getScoreLabel(score)}
            </span>
          </div>
        </div>
      </div>

      {/* 分项得分 */}
      <div className="space-y-3 mb-6">
        {Object.entries(breakdown).map(([key, value]) => {
          const labels: Record<string, string> = {
            keywords: "关键词匹配",
            format: "格式规范",
            quantification: "量化成果",
            actionVerbs: "行为动词",
            sections: "模块完整",
            length: "篇幅适中"
          };
          const percent = Math.round((value.score / value.max) * 100);

          return (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{labels[key]}</span>
                <span className="font-medium">{value.score}/{value.max}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    percent >= 80 ? "bg-green-500" : percent >= 50 ? "bg-yellow-500" : "bg-red-500"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 详细建议 */}
      {suggestions.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="font-medium text-sm text-gray-700 mb-2">改进建议</h4>
          <ul className="space-y-2">
            {suggestions.map((s, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// 关键词分析组件
function KeywordAnalysis({ resume, jobDescription }: { resume: string; jobDescription?: string }) {
  const techKeywords = ["React", "Vue", "JavaScript", "TypeScript", "Python", "Java", "Node.js", "Docker", "K8s", "AWS", "Git"];
  const actionKeywords = ["主导", "负责", "推动", "实现", "优化", "设计", "开发", "管理", "领导", "分析"];

  const foundTech = techKeywords.filter(k => resume.toLowerCase().includes(k.toLowerCase()));
  const foundAction = actionKeywords.filter(k => resume.includes(k));

  return (
    <div className="bg-white rounded-xl shadow-sm border p-5">
      <h3 className="text-lg font-semibold mb-4">关键词分析</h3>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">技术关键词 ({foundTech.length})</p>
          <div className="flex flex-wrap gap-2">
            {foundTech.map(k => (
              <span key={k} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">{k}</span>
            ))}
            {foundTech.length === 0 && (
              <span className="text-xs text-gray-400">未检测到</span>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">行为动词 ({foundAction.length})</p>
          <div className="flex flex-wrap gap-2">
            {foundAction.map(k => (
              <span key={k} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">{k}</span>
            ))}
            {foundAction.length === 0 && (
              <span className="text-xs text-gray-400">未检测到</span>
            )}
          </div>
        </div>

        {jobDescription && (
          <div className="pt-3 border-t">
            <p className="text-sm text-gray-600 mb-2">JD关键词匹配</p>
            <p className="text-xs text-gray-500">
              已添加职位描述，优化时会针对性匹配关键词
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// 对比视图组件
function DiffView({ original, optimized }: { original: string; optimized: string }) {
  const [viewMode, setViewMode] = useState<"side" | "unified">("side");

  if (!optimized) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">优化前后对比</h3>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode("side")}
            className={`px-3 py-1 text-xs rounded-md ${viewMode === "side" ? "bg-white shadow" : ""}`}
          >
            左右对比
          </button>
          <button
            onClick={() => setViewMode("unified")}
            className={`px-3 py-1 text-xs rounded-md ${viewMode === "unified" ? "bg-white shadow" : ""}`}
          >
            仅优化后
          </button>
        </div>
      </div>

      {viewMode === "side" ? (
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">原始简历</p>
            <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 h-64 overflow-auto whitespace-pre-wrap">
              {original}
            </div>
          </div>
          <div>
            <p className="text-xs text-green-600 mb-2 font-medium">优化后</p>
            <div className="p-3 bg-green-50 rounded-lg text-sm text-gray-800 h-64 overflow-auto">
              <ReactMarkdown>{optimized}</ReactMarkdown>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-gray-50 rounded-lg text-sm max-h-96 overflow-auto">
          <ReactMarkdown>{optimized}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

// 模板选择弹窗
function TemplateModal({
  isOpen,
  onClose,
  onSelect
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: ResumeTemplate) => void;
}) {
  const [category, setCategory] = useState("全部");
  const categories = ["全部", "技术", "产品", "运营", "应届生", "管理"];

  const filtered = category === "全部"
    ? resumeTemplates
    : resumeTemplates.filter(t => t.category === category);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">选择简历模板</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                category === c ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(template => (
            <div
              key={template.id}
              className="border rounded-xl p-4 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all"
              onClick={() => { onSelect(template); onClose(); }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium">{template.name}</h4>
                  <p className="text-xs text-gray-500">{template.category}</p>
                </div>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{template.preview}</span>
              </div>
              <p className="text-sm text-gray-600">{template.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 历史记录弹窗
function HistoryModal({
  isOpen,
  onClose,
  onSelect,
  onDelete
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
}) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      setHistory(getHistory());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">历史记录</h3>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={() => { clearHistory(); setHistory([]); }}
                className="text-xs text-red-500 hover:text-red-600"
              >
                清空
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {history.length === 0 ? (
          <p className="text-center text-gray-400 py-8">暂无历史记录</p>
        ) : (
          <div className="space-y-3">
            {history.map(item => (
              <div key={item.id} className="border rounded-lg p-3 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">{formatDate(item.timestamp)}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { onSelect(item); onClose(); }}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      加载
                    </button>
                    <button
                      onClick={() => { onDelete(item.id); setHistory(getHistory()); }}
                      className="text-xs text-red-500 hover:text-red-600"
                    >
                      删除
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{item.originalResume.slice(0, 100)}...</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 导出弹窗
function ExportModal({
  isOpen,
  onClose,
  content
}: {
  isOpen: boolean;
  onClose: () => void;
  content: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">导出简历</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => { exportToPdf(content, "优化简历"); onClose(); }}
            className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
          >
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-medium">PDF格式</p>
              <p className="text-xs text-gray-500">适合打印和正式投递</p>
            </div>
          </button>

          <button
            onClick={() => { exportToWord(content, "优化简历"); onClose(); }}
            className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-medium">Word格式</p>
              <p className="text-xs text-gray-500">可继续编辑修改</p>
            </div>
          </button>

          <button
            onClick={() => { exportToTxt(content, "优化简历"); onClose(); }}
            className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-medium">纯文本</p>
              <p className="text-xs text-gray-500">简单文本格式</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// 分享弹窗组件
function ShareModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const shareUrl = "https://resume-optimizer-orcin.vercel.app";
  const shareText = "发现一个免费的AI简历优化工具，可以智能润色简历、优化关键词，对求职很有帮助！";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("链接已复制！");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">分享给朋友</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <a
            href={`https://service.weibo.com/share/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 p-3 hover:bg-gray-50 rounded-lg"
          >
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">微博</span>
            </div>
            <span className="text-xs text-gray-600">微博</span>
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 p-3 hover:bg-gray-50 rounded-lg"
          >
            <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">X</span>
            </div>
            <span className="text-xs text-gray-600">Twitter</span>
          </a>
          <button
            onClick={handleCopyLink}
            className="flex flex-col items-center gap-1 p-3 hover:bg-gray-50 rounded-lg"
          >
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs text-gray-600">复制链接</span>
          </button>
          <div className="flex flex-col items-center gap-1 p-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">微信</span>
            </div>
            <span className="text-xs text-gray-600">扫码分享</span>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400">分享给正在求职的朋友，帮他们优化简历</p>
      </div>
    </div>
  );
}

// 打赏弹窗组件
function DonateModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">支持开发者</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-gray-600 text-center mb-4">
          如果这个工具对你有帮助，欢迎打赏支持，让项目持续运营
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <img src="/weixin.png" alt="微信收款码" className="w-32 h-32 mx-auto rounded-lg" />
            <p className="text-xs text-gray-500 mt-2">微信扫码</p>
          </div>
          <div className="text-center">
            <img src="/zfb.jpg" alt="支付宝收款码" className="w-32 h-32 mx-auto rounded-lg" />
            <p className="text-xs text-gray-500 mt-2">支付宝扫码</p>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center">
          感谢你的支持！
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [optimizedResume, setOptimizedResume] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [useCount, setUseCount] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [showDonate, setShowDonate] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showExport, setShowExport] = useState(false);

  // 新增状态
  const [scoreResult, setScoreResult] = useState<ReturnType<typeof scoreResume> | null>(null);
  const [activeTab, setActiveTab] = useState<"optimize" | "score">("optimize");
  const [multipleVersions, setMultipleVersions] = useState<string[]>([]);
  const [showVersions, setShowVersions] = useState(false);

  // 计算实时评分
  useEffect(() => {
    if (resume.trim()) {
      const result = scoreResume(resume, jobDescription);
      setScoreResult(result);
    } else {
      setScoreResult(null);
    }
  }, [resume, jobDescription]);

  const handleOptimize = async () => {
    if (!resume.trim()) {
      setError("请输入你的简历内容");
      return;
    }

    setLoading(true);
    setError("");
    setOptimizedResume("");
    setMultipleVersions([]);

    try {
      const response = await fetch("/api/optimize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume: resume.trim(),
          jobDescription: jobDescription.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "优化失败，请重试");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("无法读取响应");
      }

      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(line => line.trim() !== "");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              break;
            }
            try {
              const json = JSON.parse(data);
              if (json.content) {
                fullContent += json.content;
                setOptimizedResume(fullContent);
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }

      // 保存到历史
      addToHistory({
        originalResume: resume,
        jobDescription,
        optimizedResume: fullContent,
        score: scoreResult?.totalScore
      });

      setUseCount(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "优化失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  // 生成多版本
  const handleGenerateVersions = async () => {
    if (!resume.trim()) return;

    setLoading(true);
    setMultipleVersions([]);

    try {
      const prompts = [
        "请优化这份简历，重点突出技术能力和项目成果：",
        "请优化这份简历，使用更简洁有力的表达：",
        "请优化这份简历，强调团队协作和领导力："
      ];

      const versions: string[] = [];

      for (const prompt of prompts) {
        const response = await fetch("/api/optimize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resume: prompt + "\n\n" + resume,
            jobDescription
          }),
        });

        if (response.ok) {
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let content = "";

          while (reader) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            const lines = chunk.split("\n").filter(l => l.trim());
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data !== "[DONE]") {
                  try {
                    const json = JSON.parse(data);
                    content += json.content || "";
                  } catch {}
                }
              }
            }
          }
          versions.push(content);
        }
      }

      setMultipleVersions(versions);
      setShowVersions(true);
    } catch (err) {
      setError("生成多版本失败");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(optimizedResume);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setResume("");
    setJobDescription("");
    setOptimizedResume("");
    setError("");
    setScoreResult(null);
    setMultipleVersions([]);
  };

  const handleLoadSample = () => {
    setResume(SAMPLE_RESUME);
    setJobDescription(SAMPLE_JD);
  };

  const handleSelectTemplate = (template: ResumeTemplate) => {
    setResume(template.content);
  };

  const handleLoadHistory = (item: HistoryItem) => {
    setResume(item.originalResume);
    setJobDescription(item.jobDescription);
    setOptimizedResume(item.optimizedResume);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">AI简历优化助手</h1>
              <p className="text-xs text-gray-500 hidden sm:block">让简历脱颖而出</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(true)}
              className="text-sm px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              历史
            </button>
            <button
              onClick={() => setShowShare(true)}
              className="text-sm px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              分享
            </button>
            <button
              onClick={() => setShowDonate(true)}
              className="text-sm px-3 py-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            >
              打赏
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="max-w-6xl mx-auto px-4 pt-4">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("optimize")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "optimize"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            简历优化
          </button>
          <button
            onClick={() => setActiveTab("score")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "score"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            ATS评分
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === "optimize" ? (
          <>
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={handleLoadSample}
                className="text-sm px-3 py-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                加载示例
              </button>
              <button
                onClick={() => setShowTemplates(true)}
                className="text-sm px-3 py-1.5 text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                选择模板
              </button>
              <button
                onClick={handleClear}
                className="text-sm px-3 py-1.5 text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                清空
              </button>
            </div>

            {/* Input Section */}
            <div className="grid lg:grid-cols-3 gap-4 mb-6">
              {/* Resume Input */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  你的简历 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                  placeholder="粘贴你的简历内容..."
                  className="w-full h-64 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-400">{resume.length} 字符</p>
                  {scoreResult && (
                    <button
                      onClick={() => setActiveTab("score")}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      当前评分: {scoreResult.totalScore}分
                    </button>
                  )}
                </div>
              </div>

              {/* Sidebar - Keyword Analysis */}
              <div className="space-y-4">
                <KeywordAnalysis resume={resume} jobDescription={jobDescription} />

                {/* Job Description */}
                <div className="bg-white rounded-xl shadow-sm border p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    目标职位 <span className="text-gray-400">(可选)</span>
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="粘贴JD可针对性优化..."
                    className="w-full h-24 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Optimize Buttons */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <button
                onClick={handleOptimize}
                disabled={loading || !resume.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    AI生成中...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    开始优化
                  </span>
                )}
              </button>
              <button
                onClick={handleGenerateVersions}
                disabled={loading || !resume.trim()}
                className="px-6 py-3 border-2 border-blue-600 text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                生成多版本
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="max-w-2xl mx-auto mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center text-sm">
                {error}
              </div>
            )}

            {/* Result - Diff View */}
            {(optimizedResume || loading) && (
              <DiffView original={resume} optimized={optimizedResume} />
            )}

            {/* Action Buttons for Result */}
            {optimizedResume && (
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-1 px-4 py-2 text-sm rounded-lg transition-colors ${
                    copied ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {copied ? "已复制" : "复制内容"}
                </button>
                <button
                  onClick={() => setShowExport(true)}
                  className="flex items-center gap-1 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  导出文件
                </button>
              </div>
            )}

            {/* Multiple Versions */}
            {showVersions && multipleVersions.length > 0 && (
              <div className="mt-6 bg-white rounded-xl shadow-sm border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">多版本选择</h3>
                  <button
                    onClick={() => setShowVersions(false)}
                    className="text-sm text-gray-500"
                  >
                    关闭
                  </button>
                </div>
                <div className="space-y-4">
                  {multipleVersions.map((version, i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          版本 {i + 1}: {["技术导向", "简洁有力", "团队协作"][i]}
                        </span>
                        <button
                          onClick={() => {
                            setOptimizedResume(version);
                            setShowVersions(false);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          使用此版本
                        </button>
                      </div>
                      <div className="text-sm text-gray-600 max-h-32 overflow-auto">
                        <ReactMarkdown>{version.slice(0, 500)}...</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Score Tab */
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {scoreResult ? (
                <div className="space-y-4">
                  <ScoreDisplay
                    score={scoreResult.totalScore}
                    breakdown={scoreResult.breakdown}
                    suggestions={scoreResult.suggestions}
                  />

                  {/* Score Details */}
                  <div className="bg-white rounded-xl shadow-sm border p-5">
                    <h3 className="text-lg font-semibold mb-4">详细分析</h3>
                    <div className="space-y-4">
                      {Object.entries(scoreResult.breakdown).map(([key, value]) => {
                        const labels: Record<string, string> = {
                          keywords: "关键词匹配",
                          format: "格式规范",
                          quantification: "量化成果",
                          actionVerbs: "行为动词",
                          sections: "模块完整",
                          length: "篇幅适中"
                        };
                        return (
                          <div key={key}>
                            <h4 className="font-medium text-sm text-gray-700 mb-2">{labels[key]}</h4>
                            <ul className="space-y-1">
                              {value.details.map((detail, i) => (
                                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                  <span className={
                                    detail.startsWith("✓") ? "text-green-500" :
                                    detail.startsWith("△") ? "text-yellow-500" :
                                    "text-red-500"
                                  }>
                                    {detail[0]}
                                  </span>
                                  <span>{detail.slice(2)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">输入简历开始评分</h3>
                  <p className="text-sm text-gray-500">在"简历优化"标签页输入你的简历，系统将自动进行ATS评分分析</p>
                  <button
                    onClick={() => setActiveTab("optimize")}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                  >
                    去输入简历
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <KeywordAnalysis resume={resume} jobDescription={jobDescription} />

              {/* Tips */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border">
                <h4 className="font-medium text-sm text-gray-700 mb-2">提高评分技巧</h4>
                <ul className="space-y-2 text-xs text-gray-600">
                  <li>• 使用具体数字量化成果</li>
                  <li>• 添加行业专业关键词</li>
                  <li>• 用行为动词开头描述</li>
                  <li>• 确保包含完整模块</li>
                  <li>• 篇幅控制在300-1500字</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 广告位 */}
        <div className="mt-8">
          <AdBanner type="horizontal" />
        </div>

        {/* Features */}
        <div className="mt-12 grid md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white rounded-xl shadow-sm border">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-medium text-sm text-gray-900">ATS评分</h3>
            <p className="text-xs text-gray-500 mt-1">智能评估简历质量</p>
          </div>
          <div className="text-center p-4 bg-white rounded-xl shadow-sm border">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <h3 className="font-medium text-sm text-gray-900">多版本生成</h3>
            <p className="text-xs text-gray-500 mt-1">一次生成多个版本</p>
          </div>
          <div className="text-center p-4 bg-white rounded-xl shadow-sm border">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-medium text-sm text-gray-900">模板库</h3>
            <p className="text-xs text-gray-500 mt-1">专业简历模板</p>
          </div>
          <div className="text-center p-4 bg-white rounded-xl shadow-sm border">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <h3 className="font-medium text-sm text-gray-900">多格式导出</h3>
            <p className="text-xs text-gray-500 mt-1">PDF/Word/TXT</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6 text-center text-sm text-gray-500">
        <p>AI简历优化助手 - 帮助每一位求职者找到理想工作</p>
        <p className="mt-1 text-xs text-gray-400">Powered by DeepSeek AI</p>
      </footer>

      {/* Modals */}
      <ShareModal isOpen={showShare} onClose={() => setShowShare(false)} />
      <DonateModal isOpen={showDonate} onClose={() => setShowDonate(false)} />
      <TemplateModal isOpen={showTemplates} onClose={() => setShowTemplates(false)} onSelect={handleSelectTemplate} />
      <HistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onSelect={handleLoadHistory}
        onDelete={deleteFromHistory}
      />
      <ExportModal isOpen={showExport} onClose={() => setShowExport(false)} content={optimizedResume} />
    </div>
  );
}