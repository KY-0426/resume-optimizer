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

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">简历模板库</h1>
          <p className="text-gray-600">专业简历模板，一键套用</p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                category === c ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-white text-gray-600 border border-gray-200 hover:border-indigo-200"
              }`}>
              {c}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(template => {
            const locked = !user.isMember && !FREE_LIMITS.templates.includes(template.id);
            return (
              <div key={template.id}
                className={`glass-card overflow-hidden ${locked ? "opacity-70" : ""}`}>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      <p className="text-xs text-gray-500">{template.category}</p>
                    </div>
                    <span className="text-3xl">{template.preview}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{template.description}</p>

                  {locked && (
                    <div className="mb-3 inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                      👑 会员专属
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => handleSelect(template.id)}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                        locked ? "bg-gray-100 text-gray-500" : "bg-indigo-600 text-white hover:bg-indigo-700"
                      }`}>
                      {locked ? "开通会员" : "查看详情"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Template Detail Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedTemplate(null)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selected.name}</h2>
                  <p className="text-sm text-gray-500">{selected.category}</p>
                </div>
                <button onClick={() => setSelectedTemplate(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {selected.content}
                </pre>
              </div>
              <div className="p-4 border-t border-gray-100 flex gap-3">
                <a href="/optimize" className="flex-1 py-3 bg-indigo-600 text-white text-center font-medium rounded-lg hover:bg-indigo-700">
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