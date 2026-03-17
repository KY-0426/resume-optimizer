"use client";

import { useState, useEffect } from "react";
import { getHistory, deleteFromHistory, clearHistory, formatDate, HistoryItem } from "@/lib/history";

export default function HistoryModal({
  isOpen,
  onClose,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: HistoryItem) => void;
}) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (isOpen) setHistory(getHistory());
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="font-semibold text-neutral-900">历史记录</h2>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button onClick={() => { clearHistory(); setHistory([]); }} className="text-sm text-red-500 hover:text-red-600">
                清空
              </button>
            )}
            <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-500">暂无历史记录</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map(item => (
                <div key={item.id} className="group border border-neutral-200 hover:border-blue-300 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-neutral-500">{formatDate(item.timestamp)}</span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100">
                      <button onClick={() => { onSelect(item); onClose(); }} className="text-xs text-blue-600">加载</button>
                      <button onClick={() => { deleteFromHistory(item.id); setHistory(getHistory()); }} className="text-xs text-red-500">删除</button>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 line-clamp-2">{item.originalResume.slice(0, 100)}...</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}