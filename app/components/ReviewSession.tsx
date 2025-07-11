import { useState } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

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

interface ReviewSessionProps {
  cards: MemoryCard[];
  onReviewComplete: (cardId: number, quality: number, responseTime: number) => void;
  onSessionComplete: () => void;
  onClose: () => void;
}

export default function ReviewSession({ cards, onReviewComplete, onSessionComplete, onClose }: ReviewSessionProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [reviewResults, setReviewResults] = useState<{ cardId: number; quality: number }[]>([]);

  const currentCard = cards[currentCardIndex];
  const isLastCard = currentCardIndex === cards.length - 1;
  const progress = Math.round(((currentCardIndex + 1) / cards.length) * 100);

  const handleFlip = () => {
    setIsFlipped(true);
  };

  const handleQualitySelect = (quality: number) => {
    const responseTime = Date.now() - startTime;
    
    onReviewComplete(currentCard.id, quality, responseTime);
    setReviewResults([...reviewResults, { cardId: currentCard.id, quality }]);

    if (isLastCard) {
      onSessionComplete();
    } else {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
      setStartTime(Date.now());
    }
  };

  const qualityOptions = [
    { value: 5, label: '完美', description: '立即回想起正確答案', color: 'bg-green-600 hover:bg-green-700' },
    { value: 4, label: '正確', description: '猜對後確認正確', color: 'bg-green-500 hover:bg-green-600' },
    { value: 3, label: '困難', description: '記起來了但很困難', color: 'bg-yellow-500 hover:bg-yellow-600' },
    { value: 2, label: '錯誤', description: '記起來了但答案錯誤', color: 'bg-orange-500 hover:bg-orange-600' },
    { value: 1, label: '模糊', description: '有印象但記不清楚', color: 'bg-red-500 hover:bg-red-600' },
    { value: 0, label: '忘記', description: '完全不記得', color: 'bg-red-600 hover:bg-red-700' },
  ];

  if (cards.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="glass-effect rounded-2xl p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-shadow-900 mb-4">沒有待複習的卡片</h2>
          <p className="text-shadow-600 mb-6">目前沒有需要複習的記憶卡片，繼續保持！</p>
          <button onClick={onClose} className="btn-primary">
            關閉
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-effect rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-shadow-900">複習模式</h2>
            <p className="text-shadow-600">
              進度：{currentCardIndex + 1}/{cards.length} ({progress}%)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-shadow-500 hover:text-shadow-700 hover:bg-shadow-100 rounded-lg transition-colors duration-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* 進度條 */}
        <div className="mb-8">
          <div className="w-full bg-shadow-200 rounded-full h-2">
            <div
              className="bg-focus-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 卡片內容 */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-8 min-h-[300px] flex items-center justify-center">
              <div className="text-center w-full">
                <div className="text-sm text-shadow-500 mb-4">
                  {isFlipped ? '背面 (答案)' : '正面 (問題)'}
                </div>
                <div className="text-2xl leading-relaxed text-shadow-900 mb-6">
                  {isFlipped ? currentCard.back : currentCard.front}
                </div>
                {!isFlipped && (
                  <button
                    onClick={handleFlip}
                    className="btn-primary text-lg px-8 py-3"
                  >
                    顯示答案
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 品質評分 */}
        {isFlipped && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-shadow-900 text-center mb-4">
              評估回憶品質
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {qualityOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleQualitySelect(option.value)}
                  className={`${option.color} text-white p-4 rounded-lg transition-colors duration-200 text-left`}
                >
                  <div className="font-semibold text-lg mb-1">{option.label}</div>
                  <div className="text-sm opacity-90">{option.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 卡片資訊 */}
        <div className="mt-6 pt-6 border-t border-shadow-200">
          <div className="flex justify-between items-center text-sm text-shadow-500">
            <div className="flex items-center gap-4">
              <span>分類：{currentCard.category}</span>
              <span>已複習 {currentCard.repetitions} 次</span>
              <span>間隔 {currentCard.interval_days} 天</span>
            </div>
            <div>
              難度係數：{currentCard.ease_factor}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}