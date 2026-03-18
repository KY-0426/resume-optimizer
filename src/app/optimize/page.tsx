"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, getUser, canOptimize, canGenerateVersions, recordOptimize, recordVersionGenerate, FREE_LIMITS } from "@/lib/user";
import { scoreResume } from "@/lib/resume-scorer";
import { exportToPdf, exportToWord, exportToTxt, copyToClipboard } from "@/lib/export-utils";
import { addToHistory } from "@/lib/history";
import { resumeTemplates, ResumeTemplate } from "@/lib/resume-templates";
import { getHistory, deleteFromHistory, clearHistory, formatDate, HistoryItem } from "@/lib/history";
import { MemberModal } from "@/components/MemberComponents";
import AdBanner from "@/components/AdBanner";

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

  const [showTemplates, setShowTemplates] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showMember, setShowMember] = useState(false);

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
    <main className="container mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">简历优化</h1>
        <p className="text-sm md:text-base text-muted-foreground">AI智能润色，提升简历质量</p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        <Button variant="outline" size="sm" onClick={() => { setResume(SAMPLE_RESUME); setJobDescription(SAMPLE_JD); }}>
          加载示例
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowTemplates(true)}>
          选择模板
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowHistory(true)}>
          历史记录
        </Button>
        <Button variant="ghost" size="sm" onClick={() => { setResume(""); setJobDescription(""); setOptimizedResume(""); }}>
          清空
        </Button>
      </div>

      {/* Input */}
      <div className="grid lg:grid-cols-2 gap-4 md:gap-6 mb-6">
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
              placeholder="粘贴你的简历内容..."
              className="min-h-48 md:min-h-72 resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">{resume.length} 字符</p>
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
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="粘贴职位JD，AI会针对性优化..."
              className="min-h-48 md:min-h-72 resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">{jobDescription.length} 字符</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        <Button size="lg" onClick={handleOptimize} disabled={loading || !resume.trim()}>
          {loading ? "AI生成中..." : "开始优化"}
        </Button>
        <Button variant="outline" size="lg" onClick={handleGenerateVersions} disabled={loading || !resume.trim()}>
          生成多版本
        </Button>
      </div>

      {/* Usage Info */}
      {!user.isMember && (
        <p className="text-center text-sm text-muted-foreground mb-6">
          今日剩余: {FREE_LIMITS.dailyOptimize - (user.dailyOptimizeCount || 0)} 次
          <Button variant="link" className="px-1 h-auto" onClick={() => setShowMember(true)}>开通会员无限次</Button>
        </p>
      )}

      {/* Error */}
      {error && (
        <Card className="max-w-xl mx-auto mb-6 border-destructive bg-destructive/10">
          <CardContent className="py-4 text-center text-destructive">{error}</CardContent>
        </Card>
      )}

      {/* Result */}
      {optimizedResume && (
        <Card className="mb-6">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3">
            <CardTitle className="text-base">优化结果</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant={copied ? "default" : "outline"}
                size="sm"
                className="flex-1 sm:flex-initial"
                onClick={async () => {
                  await copyToClipboard(optimizedResume);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? "已复制" : "复制"}
              </Button>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-initial" onClick={() => setShowExport(true)}>
                导出
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="markdown bg-muted/50 rounded-lg p-4 max-h-96 overflow-auto">
              <ReactMarkdown>{optimizedResume}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Versions */}
      {showVersions && versions.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3">
            <CardTitle className="text-base">多版本选择</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowVersions(false)}>关闭</Button>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {versions.map((v, i) => (
                <Card key={i} className="cursor-pointer hover:border-primary" onClick={() => { setOptimizedResume(v); setShowVersions(false); }}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm">{["技术导向", "简洁有力", "团队协作"][i]}</CardTitle>
                      <Button variant="link" size="sm" className="h-auto p-0">使用</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground line-clamp-4">{v.slice(0, 200)}...</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-[60vw] w-full max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>选择简历模板</DialogTitle>
          </DialogHeader>
          <TemplateSelector onSelect={(t) => { setResume(t.content); setShowTemplates(false); }} user={user} />
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-hidden w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>历史记录</DialogTitle>
          </DialogHeader>
          <HistoryList onSelect={(item) => { setResume(item.originalResume); setJobDescription(item.jobDescription); setOptimizedResume(item.optimizedResume); setShowHistory(false); }} />
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExport} onOpenChange={setShowExport}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>导出简历</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <Button variant="outline" className="justify-start" onClick={() => { exportToPdf(optimizedResume, "优化简历"); setShowExport(false); }}>
              PDF格式 - 适合打印投递
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => { exportToWord(optimizedResume, "优化简历"); setShowExport(false); }}>
              Word格式 - 可继续编辑
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => { exportToTxt(optimizedResume, "优化简历"); setShowExport(false); }}>
              TXT格式 - 纯文本
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ad Banner */}
      <div className="max-w-4xl mx-auto mt-8">
        <AdBanner type="horizontal" />
      </div>

      <MemberModal isOpen={showMember} onClose={() => setShowMember(false)} user={user} onUserUpdate={setUser} />
    </main>
  );
}

function TemplateSelector({ onSelect, user }: { onSelect: (t: ResumeTemplate) => void; user: User }) {
  const [category, setCategory] = useState("全部");
  const [previewTemplate, setPreviewTemplate] = useState<ResumeTemplate | null>(null);
  const categories = ["全部", "技术", "产品", "运营", "应届生", "管理"];
  const filtered = category === "全部" ? resumeTemplates : resumeTemplates.filter(t => t.category === category);

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-lg overflow-x-auto">
        {categories.map(c => (
          <Button
            key={c}
            variant={category === c ? "default" : "ghost"}
            size="sm"
            onClick={() => setCategory(c)}
            className="min-w-fit"
          >
            {c}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[55vh] pr-1">
        {filtered.map(template => {
          const locked = !user.isMember && !FREE_LIMITS.templates.includes(template.id);
          return (
            <Card
              key={template.id}
              className={`group relative overflow-hidden cursor-pointer transition-all duration-200 ${
                locked
                  ? "opacity-60"
                  : "hover:shadow-lg hover:border-primary/50 hover:-translate-y-0.5"
              }`}
            >
              {/* Preview Icon Background */}
              <div className="absolute top-0 right-0 text-6xl opacity-5 pointer-events-none">
                {template.preview}
              </div>

              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-base mb-1">{template.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{template.category}</p>
                  </div>
                  <span className="text-2xl">{template.preview}</span>
                </div>
              </CardHeader>

              <CardContent className="pb-4">
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{template.description}</p>
                {locked ? (
                  <Badge variant="secondary" className="text-xs">会员专属</Badge>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={(e) => { e.stopPropagation(); setPreviewTemplate(template); }}
                    >
                      预览
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => onSelect(template)}
                    >
                      使用
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden w-[95vw]">
          {previewTemplate && (
            <>
              <DialogHeader>
                <DialogTitle>{previewTemplate.name}</DialogTitle>
                <p className="text-sm text-muted-foreground">{previewTemplate.category}</p>
              </DialogHeader>
              <div className="overflow-y-auto max-h-[55vh] bg-muted/30 rounded-lg p-4">
                <pre className="text-sm whitespace-pre-wrap leading-relaxed font-sans">
                  {previewTemplate.content}
                </pre>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                  取消
                </Button>
                <Button onClick={() => { onSelect(previewTemplate); setPreviewTemplate(null); }}>
                  使用此模板
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function HistoryList({ onSelect }: { onSelect: (item: HistoryItem) => void }) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  if (history.length === 0) {
    return <p className="text-center text-muted-foreground py-12">暂无历史记录</p>;
  }

  return (
    <div className="space-y-2 max-h-[50vh] overflow-y-auto">
      {history.map(item => (
        <Card key={item.id} className="cursor-pointer hover:border-primary" onClick={() => onSelect(item)}>
          <CardContent className="py-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-muted-foreground">{formatDate(item.timestamp)}</span>
              <div className="flex gap-2">
                <Button variant="link" size="sm" className="h-auto p-0">加载</Button>
                <Button variant="link" size="sm" className="h-auto p-0 text-destructive" onClick={(e) => { e.stopPropagation(); deleteFromHistory(item.id); setHistory(getHistory()); }}>删除</Button>
              </div>
            </div>
            <p className="text-sm line-clamp-2">{item.originalResume.slice(0, 100)}...</p>
          </CardContent>
        </Card>
      ))}
      {history.length > 0 && (
        <Button variant="ghost" size="sm" className="w-full text-destructive" onClick={() => { clearHistory(); setHistory([]); }}>
          清空历史
        </Button>
      )}
    </div>
  );
}