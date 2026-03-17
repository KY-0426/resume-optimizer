"use client";

import { exportToPdf, exportToWord, exportToTxt } from "@/lib/export-utils";

export default function ExportModal({
  isOpen,
  onClose,
  content,
}: {
  isOpen: boolean;
  onClose: () => void;
  content: string;
}) {
  if (!isOpen) return null;

  const options = [
    { name: "PDF", desc: "适合打印投递", color: "bg-red-500", action: () => { exportToPdf(content, "优化简历"); onClose(); } },
    { name: "Word", desc: "可继续编辑", color: "bg-blue-500", action: () => { exportToWord(content, "优化简历"); onClose(); } },
    { name: "TXT", desc: "纯文本格式", color: "bg-gray-500", action: () => { exportToTxt(content, "优化简历"); onClose(); } },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">导出简历</h2>
        </div>
        <div className="p-4 space-y-2">
          {options.map(opt => (
            <button key={opt.name} onClick={opt.action}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-indigo-200 hover:bg-gray-50 transition-all text-left">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold ${opt.color}`}>
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