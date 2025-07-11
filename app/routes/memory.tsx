import { useState, useEffect } from 'react';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/node';
import MemoryCardComponent from '~/components/MemoryCard';
import MemoryCardForm from '~/components/MemoryCardForm';
import ReviewSession from '~/components/ReviewSession';
import { PlusIcon, AcademicCapIcon, ClockIcon } from '@heroicons/react/24/outline';

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

export const loader: LoaderFunction = async () => {
  try {
    const [cardsResponse, dueCardsResponse] = await Promise.all([
      fetch('http://localhost:3000/api/memory-cards'),
      fetch('http://localhost:3000/api/memory-cards/due')
    ]);

    const [cards, dueCards] = await Promise.all([
      cardsResponse.json(),
      dueCardsResponse.json()
    ]);

    return json({ cards, dueCards });
  } catch (error) {
    console.error('Error fetching memory cards:', error);
    return json({ cards: [], dueCards: [] });
  }
};

export default function Memory() {
  const { cards: initialCards, dueCards: initialDueCards } = useLoaderData<{ cards: MemoryCard[], dueCards: MemoryCard[] }>();
  const [cards, setCards] = useState<MemoryCard[]>(initialCards);
  const [dueCards, setDueCards] = useState<MemoryCard[]>(initialDueCards);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<MemoryCard | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    setCards(initialCards);
    setDueCards(initialDueCards);
  }, [initialCards, initialDueCards]);

  const handleAddCard = async (cardData: { front: string; back: string; category: string; source_task_id?: number }) => {
    try {
      const response = await fetch('http://localhost:3000/api/memory-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cardData),
      });

      if (response.ok) {
        const result = await response.json();
        const newCard: MemoryCard = {
          id: result.id,
          ...cardData,
          ease_factor: 2.5,
          interval_days: 1,
          repetitions: 0,
          next_review_date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setCards([newCard, ...cards]);
        setIsFormOpen(false);
      }
    } catch (error) {
      console.error('Error adding memory card:', error);
    }
  };

  const handleEditCard = async (id: number, cardData: { front: string; back: string; category: string; source_task_id?: number }) => {
    try {
      const response = await fetch(`http://localhost:3000/api/memory-cards/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cardData),
      });

      if (response.ok) {
        setCards(cards.map(card => 
          card.id === id 
            ? { ...card, ...cardData, updated_at: new Date().toISOString() }
            : card
        ));
        setEditingCard(null);
      }
    } catch (error) {
      console.error('Error editing memory card:', error);
    }
  };

  const handleDeleteCard = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/memory-cards/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCards(cards.filter(card => card.id !== id));
        setDueCards(dueCards.filter(card => card.id !== id));
      }
    } catch (error) {
      console.error('Error deleting memory card:', error);
    }
  };

  const handleReviewComplete = async (cardId: number, quality: number, responseTime: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/memory-cards/${cardId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quality, response_time: responseTime }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // 更新卡片列表
        setCards(cards.map(card => 
          card.id === cardId 
            ? { ...card, next_review_date: result.next_review_date, interval_days: result.interval_days }
            : card
        ));
        
        // 從待複習列表移除
        setDueCards(dueCards.filter(card => card.id !== cardId));
      }
    } catch (error) {
      console.error('Error reviewing card:', error);
    }
  };

  const handleSessionComplete = () => {
    setIsReviewOpen(false);
  };

  const getFilteredCards = () => {
    if (selectedCategory === 'all') {
      return cards;
    }
    return cards.filter(card => card.category === selectedCategory);
  };

  const categories = [
    { value: 'all', label: '全部卡片' },
    { value: 'user_created', label: '自建卡片' },
    { value: 'math', label: '數學' },
    { value: 'english', label: '英文' },
    { value: 'science', label: '科學' },
    { value: 'history', label: '歷史' },
    { value: 'other', label: '其他' },
  ];

  const filteredCards = getFilteredCards();

  return (
    <div className="min-h-screen bg-gradient-to-br from-shadow-50 to-shadow-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-shadow-900 mb-2">
            智慧記憶
          </h1>
          <p className="text-shadow-600 text-lg">
            使用間隔重複系統，讓知識深深印在腦海中
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-effect rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <ClockIcon className="w-8 h-8 text-danger-600" />
              <div>
                <div className="text-2xl font-bold text-danger-600">
                  {dueCards.length}
                </div>
                <div className="text-shadow-600">待複習</div>
              </div>
            </div>
            {dueCards.length > 0 && (
              <button
                onClick={() => setIsReviewOpen(true)}
                className="btn-primary w-full mt-3"
              >
                開始複習
              </button>
            )}
          </div>
          <div className="glass-effect rounded-xl p-6">
            <div className="flex items-center gap-3">
              <AcademicCapIcon className="w-8 h-8 text-focus-600" />
              <div>
                <div className="text-2xl font-bold text-focus-600">
                  {cards.length}
                </div>
                <div className="text-shadow-600">總卡片數</div>
              </div>
            </div>
          </div>
          <div className="glass-effect rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-success-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">%</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-success-600">
                  {cards.length > 0 ? Math.round(((cards.length - dueCards.length) / cards.length) * 100) : 0}%
                </div>
                <div className="text-shadow-600">掌握率</div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={() => setIsFormOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            新增記憶卡片
          </button>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-lg border border-shadow-300 focus:border-focus-500 focus:ring-2 focus:ring-focus-500 focus:ring-offset-2 transition-colors duration-200"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Memory Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-shadow-400 text-lg mb-4">
                {selectedCategory === 'all' ? '還沒有記憶卡片' : '這個分類還沒有卡片'}
              </div>
              <button
                onClick={() => setIsFormOpen(true)}
                className="btn-primary"
              >
                新增第一張卡片
              </button>
            </div>
          ) : (
            filteredCards.map((card) => (
              <MemoryCardComponent
                key={card.id}
                card={card}
                onEdit={() => setEditingCard(card)}
                onDelete={() => handleDeleteCard(card.id)}
              />
            ))
          )}
        </div>

        {/* Memory Card Form Modal */}
        {isFormOpen && (
          <MemoryCardForm
            onSubmit={handleAddCard}
            onClose={() => setIsFormOpen(false)}
          />
        )}

        {/* Edit Memory Card Modal */}
        {editingCard && (
          <MemoryCardForm
            card={editingCard}
            onSubmit={(cardData) => handleEditCard(editingCard.id, cardData)}
            onClose={() => setEditingCard(null)}
          />
        )}

        {/* Review Session Modal */}
        {isReviewOpen && (
          <ReviewSession
            cards={dueCards}
            onReviewComplete={handleReviewComplete}
            onSessionComplete={handleSessionComplete}
            onClose={() => setIsReviewOpen(false)}
          />
        )}
      </div>
    </div>
  );
}