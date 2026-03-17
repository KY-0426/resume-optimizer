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
    { name: "PDF", desc: "适合打印投递", action: () => { exportToPdf(content, "优化简历"); onClose(); } },
    { name: "Word", desc: "可继续编辑", action: () => { exportToWord(content, "优化简历"); onClose(); } },
    { name: "TXT", desc: "纯文本格式", action: () => { exportToTxt(content, "优化简历"); onClose(); } },
  ];

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-neutral-200">
          <h2 className="font-semibold text-neutral-900">导出简历</h2>
        </div>
        <div className="p-3 space-y-2">
          {options.map(opt => (
            <button key={opt.name} onClick={opt.action}
              className="w-full flex items-center gap-3 p-3 border border-neutral-200 hover:border-blue-300 hover:bg-neutral-50 text-left">
              <div className="w-10 h-10 bg-neutral-900 flex items-center justify-center text-white text-sm font-medium">
                {opt.name}
              </div>
              <div>
                <p className="font-medium text-neutral-900">{opt.name}格式</p>
                <p className="text-sm text-neutral-500">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}