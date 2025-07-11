import { useState } from 'react';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

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

interface MemoryCardProps {
  card: MemoryCard;
  onEdit: () => void;
  onDelete: () => void;
  showActions?: boolean;
}

export default function MemoryCardComponent({ card, onEdit, onDelete, showActions = true }: MemoryCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const getCategoryLabel = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'user_created': '自建卡片',
      'math': '數學',
      'english': '英文',
      'science': '科學',
      'history': '歷史',
      'other': '其他',
    };
    return categoryMap[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      'user_created': 'bg-shadow-100 text-shadow-700',
      'math': 'bg-blue-100 text-blue-700',
      'english': 'bg-green-100 text-green-700',
      'science': 'bg-purple-100 text-purple-700',
      'history': 'bg-orange-100 text-orange-700',
      'other': 'bg-gray-100 text-gray-700',
    };
    return colorMap[category] || 'bg-gray-100 text-gray-700';
  };

  const getNextReviewStatus = () => {
    const today = new Date();
    const reviewDate = new Date(card.next_review_date);
    const diffTime = reviewDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: '需要複習', color: 'text-danger-600' };
    } else if (diffDays === 0) {
      return { text: '今天複習', color: 'text-warning-600' };
    } else if (diffDays === 1) {
      return { text: '明天複習', color: 'text-focus-600' };
    } else {
      return { text: `${diffDays} 天後複習`, color: 'text-success-600' };
    }
  };

  const reviewStatus = getNextReviewStatus();

  return (
    <div className="glass-effect rounded-xl overflow-hidden card-shadow animate-fade-in">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(card.category)}`}>
              {getCategoryLabel(card.category)}
            </span>
            <span className={`text-sm font-medium ${reviewStatus.color}`}>
              {reviewStatus.text}
            </span>
          </div>
          {showActions && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="p-2 text-shadow-500 hover:text-focus-600 hover:bg-focus-50 rounded-lg transition-colors duration-200"
                title="翻轉卡片"
              >
                <EyeIcon className="w-5 h-5" />
              </button>
              <button
                onClick={onEdit}
                className="p-2 text-shadow-500 hover:text-focus-600 hover:bg-focus-50 rounded-lg transition-colors duration-200"
                title="編輯卡片"
              >
                <PencilIcon className="w-5 h-5" />
              </button>
              <button
                onClick={onDelete}
                className="p-2 text-shadow-500 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors duration-200"
                title="刪除卡片"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <div className="min-h-[120px] flex items-center justify-center">
          <div className="text-center w-full">
            <div className="text-xs text-shadow-500 mb-2">
              {isFlipped ? '背面 (答案)' : '正面 (問題)'}
            </div>
            <div className="text-lg leading-relaxed text-shadow-900">
              {isFlipped ? card.back : card.front}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-shadow-200">
          <div className="flex justify-between items-center text-xs text-shadow-500">
            <div className="flex items-center gap-4">
              <span>已複習 {card.repetitions} 次</span>
              <span>間隔 {card.interval_days} 天</span>
              <span>難度 {card.ease_factor}</span>
            </div>
            <div>
              建立於 {new Date(card.created_at).toLocaleDateString('zh-TW')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}