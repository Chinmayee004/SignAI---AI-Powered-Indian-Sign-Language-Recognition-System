export interface HistoryItem {
  id: string;
  gesture: string;
  text: string;
  timestamp: string;
  confidence: number;
}

const STORAGE_KEY = 'signai_prediction_history';

export function getHistory(): HistoryItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function addHistoryEntry(item: Omit<HistoryItem, 'id' | 'timestamp'>) {
  const history = getHistory();
  const newEntry: HistoryItem = {
    ...item,
    id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
    timestamp: new Date().toISOString(),
  };
  const updated = [newEntry, ...history];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  
  // Dispatch custom event to sync history instantly if History page is open
  window.dispatchEvent(new Event('signai_history_updated'));
  return newEntry;
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('signai_history_updated'));
}