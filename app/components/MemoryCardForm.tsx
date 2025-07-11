import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface MemoryCard {
  id: number;
  front: string;
  back: string;
  category: string;
  source_task_id?: number;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_date: string;
  last_review_date?: string;
  created_at: string;
  updated_at: string;
}

interface MemoryCardFormProps {
  card?: MemoryCard;
  onSubmit: (cardData: { front: string; back: string; category: string; source_task_id?: number }) => void;
  onClose: () => void;
  sourceTaskId?: number;
}

export default function MemoryCardForm({ card, onSubmit, onClose, sourceTaskId }: MemoryCardFormProps) {
  const [front, setFront] = useState(card?.front || '');
  const [back, setBack] = useState(card?.back || '');
  const [category, setCategory] = useState(card?.category || 'user_created');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;

    onSubmit({
      front: front.trim(),
      back: back.trim(),
      category,
      source_task_id: sourceTaskId,
    });
  };

  const categories = [
    { value: 'user_created', label: '自建卡片' },
    { value: 'math', label: '數學' },
    { value: 'english', label: '英文' },
    { value: 'science', label: '科學' },
    { value: 'history', label: '歷史' },
    { value: 'other', label: '其他' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-effect rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-shadow-900">
            {card ? '編輯記憶卡片' : '新增記憶卡片'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-shadow-500 hover:text-shadow-700 hover:bg-shadow-100 rounded-lg transition-colors duration-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="front" className="block text-sm font-medium text-shadow-700 mb-2">
              正面內容 (問題) *
            </label>
            <textarea
              id="front"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              rows={3}
              className="input-field resize-none"
              placeholder="例如：圓的標準式..."
              required
            />
          </div>

          <div>
            <label htmlFor="back" className="block text-sm font-medium text-shadow-700 mb-2">
              背面內容 (答案) *
            </label>
            <textarea
              id="back"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              rows={4}
              className="input-field resize-none"
              placeholder="例如：(x-h)² + (y-k)² = r²"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-shadow-700 mb-2">
              分類
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-focus-50 rounded-lg p-4">
            <h3 className="font-medium text-focus-800 mb-2">💡 記憶卡片小技巧</h3>
            <ul className="text-sm text-focus-700 space-y-1">
              <li>• 正面內容：寫下你要記住的問題或關鍵字</li>
              <li>• 背面內容：寫下完整的答案或解釋</li>
              <li>• 保持簡潔：一張卡片只記錄一個概念</li>
              <li>• 使用自己的話：更容易記住</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              取消
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!front.trim() || !back.trim()}
            >
              {card ? '更新卡片' : '新增卡片'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}