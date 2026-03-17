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
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="font-semibold text-neutral-900">选择简历模板</h2>
          <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-3 border-b border-neutral-200 flex gap-2 overflow-x-auto">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded text-sm ${
                category === c ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}>
              {c}
            </button>
          ))}
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(template => {
              const locked = !user.isMember && !FREE_LIMITS.templates.includes(template.id);
              return (
                <div key={template.id}
                  className={`relative group border border-neutral-200 hover:border-blue-300 p-4 cursor-pointer ${locked ? "opacity-60" : ""}`}
                  onClick={() => { if (!locked) { onSelect(template); onClose(); } }}>
                  {locked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">会员专属</span>
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-neutral-900">{template.name}</h4>
                      <p className="text-xs text-neutral-500">{template.category}</p>
                    </div>
                    <span className="text-xl">{template.preview}</span>
                  </div>
                  <p className="text-sm text-neutral-600">{template.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}