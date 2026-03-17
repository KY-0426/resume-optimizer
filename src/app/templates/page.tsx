"use client";

import { useState } from "react";
import { Navbar, Footer } from "@/components/Layout";
import { resumeTemplates } from "@/lib/resume-templates";
import { User, getUser } from "@/lib/user";
import { MemberModal } from "@/components/MemberComponents";
import { FREE_LIMITS } from "@/lib/user";

export default function TemplatesPage() {
  const [user] = useState<User>(() => getUser());
  const [category, setCategory] = useState("全部");
  const [showMember, setShowMember] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const categories = ["全部", "技术", "产品", "运营", "应届生", "管理"];
  const filtered = category === "全部" ? resumeTemplates : resumeTemplates.filter(t => t.category === category);

  const handleSelect = (templateId: string) => {
    const locked = !user.isMember && !FREE_LIMITS.templates.includes(templateId);
    if (locked) {
      setShowMember(true);
      return;
    }
    setSelectedTemplate(templateId);
  };

  const selected = selectedTemplate ? resumeTemplates.find(t => t.id === selectedTemplate) : null;

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">简历模板库</h1>
          <p className="text-neutral-600">专业简历模板，一键套用</p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-4 py-1.5 rounded text-sm ${
                category === c ? "bg-neutral-900 text-white" : "bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-400"
              }`}>
              {c}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(template => {
            const locked = !user.isMember && !FREE_LIMITS.templates.includes(template.id);
            return (
              <div key={template.id}
                className={`card p-5 ${locked ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-neutral-900">{template.name}</h3>
                    <p className="text-xs text-neutral-500">{template.category}</p>
                  </div>
                  <span className="text-2xl">{template.preview}</span>
                </div>
                <p className="text-sm text-neutral-600 mb-3">{template.description}</p>

                {locked && (
                  <div className="mb-3 text-xs text-orange-600">
                    会员专属
                  </div>
                )}

                <button onClick={() => handleSelect(template.id)}
                  className={`w-full py-2 text-sm font-medium rounded ${
                    locked ? "bg-neutral-100 text-neutral-500" : "bg-neutral-900 text-white hover:bg-neutral-800"
                  }`}>
                  {locked ? "开通会员" : "查看详情"}
                </button>
              </div>
            );
          })}
        </div>

        {/* Template Detail Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTemplate(null)}>
            <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">{selected.name}</h2>
                  <p className="text-sm text-neutral-500">{selected.category}</p>
                </div>
                <button onClick={() => setSelectedTemplate(null)} className="p-1 hover:bg-neutral-100 rounded">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[60vh]">
                <pre className="text-sm text-neutral-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {selected.content}
                </pre>
              </div>
              <div className="p-4 border-t border-neutral-200">
                <a href="/optimize" className="block w-full py-2.5 bg-neutral-900 text-white text-center font-medium rounded hover:bg-neutral-800">
                  使用此模板
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <MemberModal isOpen={showMember} onClose={() => setShowMember(false)} user={user} onUserUpdate={() => {}} />
    </div>
  );
}