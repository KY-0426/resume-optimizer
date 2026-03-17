"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import AdBanner from "@/components/AdBanner";

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

// 高级功能弹窗
function PremiumModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">高级功能</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">多套简历模板</p>
              <p className="text-xs text-gray-500">专业设计，一键套用</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">AI深度优化</p>
              <p className="text-xs text-gray-500">更详细的修改建议</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">导出PDF/Word</p>
              <p className="text-xs text-gray-500">格式美观，直接投递</p>
            </div>
          </div>
        </div>

        <div className="text-center mb-4">
          <p className="text-3xl font-bold text-gray-900">¥9.9<span className="text-sm font-normal text-gray-500">/月</span></p>
          <p className="text-xs text-gray-400 mt-1">首批用户限时优惠</p>
        </div>

        <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transition-shadow">
          开通会员
        </button>
        <p className="text-center text-xs text-gray-400 mt-3">功能开发中，敬请期待</p>
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
          如果这个工具对你有帮助，欢迎打赏支持，让项目持续运营 ☕
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-2">
              <span className="text-xs text-gray-400">微信收款码</span>
            </div>
            <p className="text-xs text-gray-500">微信扫码</p>
          </div>
          <div className="text-center">
            <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-2">
              <span className="text-xs text-gray-400">支付宝收款码</span>
            </div>
            <p className="text-xs text-gray-500">支付宝扫码</p>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center">
          感谢你的支持！❤️
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
  const [showPremium, setShowPremium] = useState(false);
  const [showDonate, setShowDonate] = useState(false);

  const handleOptimize = async () => {
    if (!resume.trim()) {
      setError("请输入你的简历内容");
      return;
    }

    setLoading(true);
    setError("");
    setOptimizedResume("");

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

      setUseCount(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "优化失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(optimizedResume);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = optimizedResume;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([optimizedResume], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `优化简历_${new Date().toLocaleDateString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setResume("");
    setJobDescription("");
    setOptimizedResume("");
    setError("");
  };

  const handleLoadSample = () => {
    setResume(SAMPLE_RESUME);
    setJobDescription(SAMPLE_JD);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI简历优化助手</h1>
              <p className="text-xs text-gray-500">让简历脱颖而出</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowShare(true)}
              className="text-sm px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              分享
            </button>
            <button
              onClick={() => setShowPremium(true)}
              className="text-sm px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:shadow transition-shadow"
            >
              高级版
            </button>
            {useCount > 0 && (
              <span className="text-xs text-gray-500 hidden sm:inline">已优化 {useCount} 次</span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            AI驱动，智能优化你的简历
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            粘贴你的简历，AI帮你润色、优化关键词、提升专业度。
            可选粘贴目标职位JD，AI会针对性优化，提高匹配度。
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center gap-3 mb-6">
          <button
            onClick={handleLoadSample}
            className="text-sm px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            加载示例
          </button>
          <button
            onClick={handleClear}
            className="text-sm px-4 py-2 text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            清空内容
          </button>
        </div>

        {/* Input Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Resume Input */}
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              你的简历 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="粘贴你的简历内容..."
              className="w-full h-80 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-400">{resume.length} 字符</p>
              {resume.length > 0 && resume.length < 100 && (
                <p className="text-xs text-amber-500">简历内容较少</p>
              )}
            </div>
          </div>

          {/* Job Description Input */}
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              目标职位描述 <span className="text-gray-400 text-xs">(可选)</span>
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="粘贴目标职位的JD..."
              className="w-full h-80 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <p className="text-xs text-gray-400 mt-2">{jobDescription.length} 字符</p>
          </div>
        </div>

        {/* Optimize Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleOptimize}
            disabled={loading || !resume.trim()}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                AI正在生成...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                开始优化简历
              </span>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
            {error}
          </div>
        )}

        {/* Result Section */}
        {(optimizedResume || loading) && (
          <div className="bg-white rounded-xl shadow-sm border p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">优化后的简历</h3>
              {optimizedResume && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      copied ? "bg-green-100 text-green-700" : "text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    {copied ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        已复制
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        复制
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    下载
                  </button>
                </div>
              )}
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-800 leading-relaxed markdown-content">
              <ReactMarkdown>{optimizedResume}</ReactMarkdown>
              {loading && <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-0.5" />}
            </div>
          </div>
        )}

        {/* 广告位 */}
        <div className="mb-8">
          <AdBanner type="horizontal" />
        </div>

        {/* Tips Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">使用技巧</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-blue-600 font-medium">1</span>
              </div>
              <p className="text-sm text-gray-600">粘贴完整简历，包括工作经历、项目经验、教育背景等</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-blue-600 font-medium">2</span>
              </div>
              <p className="text-sm text-gray-600">添加目标职位JD，AI会针对性优化关键词</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-purple-600 font-medium">3</span>
              </div>
              <p className="text-sm text-gray-600">量化成果更有说服力，如"提升30%"、"节省50万"</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-purple-600 font-medium">4</span>
              </div>
              <p className="text-sm text-gray-600">使用行为动词开头，如"主导"、"推动"、"优化"</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">智能润色</h3>
            <p className="text-sm text-gray-600">AI优化语言表达，让简历更专业、更有说服力</p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">关键词优化</h3>
            <p className="text-sm text-gray-600">自动提取并优化岗位关键词，提高ATS筛选通过率</p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">100%免费</h3>
            <p className="text-sm text-gray-600">无需注册，直接使用，保护你的隐私</p>
          </div>
        </div>

        {/* 推荐资源区 - 变现 */}
        <div className="mt-12 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">求职必备资源</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="https://www.lagou.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">拉勾</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">拉勾网</p>
                <p className="text-xs text-gray-500">互联网求职</p>
              </div>
            </a>
            <a
              href="https://www.zhipin.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">Boss</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">BOSS直聘</p>
                <p className="text-xs text-gray-500">直接沟通HR</p>
              </div>
            </a>
            <a
              href="https://www.500d.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">简历</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">五百丁简历</p>
                <p className="text-xs text-gray-500">专业简历模板</p>
              </div>
            </a>
            <a
              href="https://www.qcc.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <span className="text-amber-600 font-bold text-sm">企查</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">企查查</p>
                <p className="text-xs text-gray-500">了解公司背景</p>
              </div>
            </a>
          </div>
        </div>

        {/* 打赏支持 */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-3">觉得有用？请我喝杯咖啡 ☕</p>
          <button
            onClick={() => setShowDonate(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            打赏支持
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-6 text-center text-sm text-gray-500">
        <p>AI简历优化助手 - 帮助每一位求职者找到理想工作</p>
        <p className="mt-1 text-xs text-gray-400">Powered by DeepSeek AI</p>
      </footer>

      {/* Modals */}
      <ShareModal isOpen={showShare} onClose={() => setShowShare(false)} />
      <PremiumModal isOpen={showPremium} onClose={() => setShowPremium(false)} />
      <DonateModal isOpen={showDonate} onClose={() => setShowDonate(false)} />
    </div>
  );
}