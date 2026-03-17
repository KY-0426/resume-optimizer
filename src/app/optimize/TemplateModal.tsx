"use client";

import { useState } from "react";
import { resumeTemplates, ResumeTemplate } from "@/lib/resume-templates";
import { User, FREE_LIMITS } from "@/lib/user";

export default function TemplateModal({
  isOpen,
  onClose,
  onSelect,
  user,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (t: ResumeTemplate) => void;
  user: User;
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
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 border-b border-gray-100 flex gap-2 overflow-x-auto">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                category === c ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">👑 会员专属</span>
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