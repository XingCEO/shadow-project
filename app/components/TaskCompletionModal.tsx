import { useState } from 'react';
import { XMarkIcon, AcademicCapIcon, ClockIcon } from '@heroicons/react/24/outline';

interface TaskCompletionModalProps {
  taskTitle: string;
  taskId: number;
  onClose: () => void;
  onAddMemoryCard: (cardData: { front: string; back: string; category: string; source_task_id: number }) => void;
  onSkip: () => void;
}

export default function TaskCompletionModal({ taskTitle, taskId, onClose, onAddMemoryCard, onSkip }: TaskCompletionModalProps) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [category, setCategory] = useState('user_created');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;

    onAddMemoryCard({
      front: front.trim(),
      back: back.trim(),
      category,
      source_task_id: taskId,
    });

    onClose();
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
          <div className="flex items-center gap-3">
            <AcademicCapIcon className="w-8 h-8 text-success-600" />
            <div>
              <h2 className="text-2xl font-bold text-shadow-900">任務完成！</h2>
              <p className="text-shadow-600">「{taskTitle}」</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-shadow-500 hover:text-shadow-700 hover:bg-shadow-100 rounded-lg transition-colors duration-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {!showForm ? (
          <div className="text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="w-10 h-10 text-success-600" />
              </div>
              <h3 className="text-xl font-semibold text-shadow-900 mb-2">
                專注完成！
              </h3>
              <p className="text-shadow-600">
                有什麼重要概念要記住嗎？
              </p>
            </div>

            <div className="bg-focus-50 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-focus-800 mb-3">💡 為什麼要建立記憶卡片？</h4>
              <ul className="text-sm text-focus-700 space-y-2 text-left">
                <li>• <strong>鞏固學習</strong>：將剛學到的知識轉化為長期記憶</li>
                <li>• <strong>防止遺忘</strong>：利用間隔重複系統對抗遺忘曲線</li>
                <li>• <strong>提升效率</strong>：在最佳時機複習，事半功倍</li>
                <li>• <strong>建立知識庫</strong>：累積個人專屬的學習資源</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary flex-1"
              >
                建立記憶卡片
              </button>
              <button
                onClick={onSkip}
                className="btn-secondary flex-1"
              >
                稍後再說
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="front" className="block text-sm font-medium text-shadow-700 mb-2">
                正面內容 (問題或關鍵字) *
              </label>
              <textarea
                id="front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                rows={3}
                className="input-field resize-none"
                placeholder="例如：圓的標準式、英文單字 'achieve'、牛頓第二定律..."
                required
              />
            </div>

            <div>
              <label htmlFor="back" className="block text-sm font-medium text-shadow-700 mb-2">
                背面內容 (答案或解釋) *
              </label>
              <textarea
                id="back"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                rows={4}
                className="input-field resize-none"
                placeholder="例如：(x-h)² + (y-k)² = r²、達成、完成、F = ma..."
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

            <div className="bg-warning-50 rounded-lg p-4">
              <h4 className="font-medium text-warning-800 mb-2">✨ 製作卡片小技巧</h4>
              <ul className="text-sm text-warning-700 space-y-1">
                <li>• 一張卡片只記錄一個概念</li>
                <li>• 正面用簡潔的問題或關鍵字</li>
                <li>• 背面用自己的話解釋</li>
                <li>• 避免過於複雜的內容</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary flex-1"
              >
                返回
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={!front.trim() || !back.trim()}
              >
                建立卡片
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}