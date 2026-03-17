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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">历史记录</h2>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button onClick={() => { clearHistory(); setHistory([]); }} className="text-sm text-red-500 hover:text-red-600">
                清空
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500">暂无历史记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map(item => (
                <div key={item.id} className="group rounded-xl border border-gray-100 hover:border-indigo-200 p-4 transition-all hover:shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">{formatDate(item.timestamp)}</span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { onSelect(item); onClose(); }} className="text-xs text-indigo-600 font-medium">加载</button>
                      <button onClick={() => { deleteFromHistory(item.id); setHistory(getHistory()); }} className="text-xs text-red-500">删除</button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{item.originalResume.slice(0, 100)}...</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}