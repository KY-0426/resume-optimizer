// 简历优化历史记录

export interface HistoryItem {
  id: string;
  timestamp: number;
  originalResume: string;
  jobDescription: string;
  optimizedResume: string;
  score?: number;
}

const STORAGE_KEY = "resume_optimizer_history";
const MAX_HISTORY = 20;

export function getHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function addToHistory(item: Omit<HistoryItem, 'id' | 'timestamp'>): HistoryItem {
  const history = getHistory();

  const newItem: HistoryItem = {
    ...item,
    id: `history_${Date.now()}`,
    timestamp: Date.now(),
  };

  // 添加到开头
  history.unshift(newItem);

  // 限制数量
  if (history.length > MAX_HISTORY) {
    history.pop();
  }

  saveHistory(history);
  return newItem;
}

export function deleteFromHistory(id: string): void {
  const history = getHistory();
  const filtered = history.filter(item => item.id !== id);
  saveHistory(filtered);
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

function saveHistory(history: HistoryItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "刚刚";
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;

  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}