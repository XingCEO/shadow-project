import { useState, useEffect } from 'react';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/node';
import { BookOpenIcon, PlusIcon, StarIcon } from '@heroicons/react/24/outline';

interface Material {
  id: number;
  category: string;
  subcategory: string;
  title: string;
  content: string;
  tags: string;
  difficulty_level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Category {
  category: string;
  subcategory: string;
}

export const loader: LoaderFunction = async () => {
  try {
    const [materialsResponse, categoriesResponse] = await Promise.all([
      fetch('http://localhost:3000/api/material-library'),
      fetch('http://localhost:3000/api/material-library/categories')
    ]);

    const [materials, categories] = await Promise.all([
      materialsResponse.json(),
      categoriesResponse.json()
    ]);

    return json({ materials, categories });
  } catch (error) {
    console.error('Error fetching library data:', error);
    return json({ materials: [], categories: [] });
  }
};

export default function Library() {
  const { materials: initialMaterials, categories } = useLoaderData<{ materials: Material[], categories: Category[] }>();
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [addedCards, setAddedCards] = useState<Set<number>>(new Set());

  useEffect(() => {
    setMaterials(initialMaterials);
  }, [initialMaterials]);

  const handleAddToMemory = async (material: Material) => {
    try {
      const response = await fetch(`http://localhost:3000/api/material-library/${material.id}/add-to-memory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setAddedCards(new Set([...addedCards, material.id]));
      }
    } catch (error) {
      console.error('Error adding to memory:', error);
    }
  };

  const getFilteredMaterials = () => {
    let filtered = materials;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(material => material.category === selectedCategory);
    }

    if (selectedSubcategory !== 'all') {
      filtered = filtered.filter(material => material.subcategory === selectedSubcategory);
    }

    return filtered;
  };

  const getSubcategories = () => {
    if (selectedCategory === 'all') {
      return [];
    }
    return categories
      .filter(cat => cat.category === selectedCategory)
      .map(cat => cat.subcategory)
      .filter((sub, index, self) => self.indexOf(sub) === index);
  };

  const getDifficultyLabel = (level: number) => {
    const labels = ['', '基礎', '中級', '進階', '高級', '專家'];
    return labels[level] || '未知';
  };

  const getDifficultyColor = (level: number) => {
    const colors = ['', 'bg-green-100 text-green-700', 'bg-blue-100 text-blue-700', 'bg-yellow-100 text-yellow-700', 'bg-orange-100 text-orange-700', 'bg-red-100 text-red-700'];
    return colors[level] || 'bg-gray-100 text-gray-700';
  };

  const uniqueCategories = [...new Set(categories.map(cat => cat.category))];
  const filteredMaterials = getFilteredMaterials();
  const subcategories = getSubcategories();

  return (
    <div className="min-h-screen bg-gradient-to-br from-shadow-50 to-shadow-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-shadow-900 mb-2">
            預建教材庫
          </h1>
          <p className="text-shadow-600 text-lg">
            台灣高品質教材，一鍵加入記憶庫
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-effect rounded-xl p-6">
            <div className="flex items-center gap-3">
              <BookOpenIcon className="w-8 h-8 text-focus-600" />
              <div>
                <div className="text-2xl font-bold text-focus-600">
                  {materials.length}
                </div>
                <div className="text-shadow-600">教材總數</div>
              </div>
            </div>
          </div>
          <div className="glass-effect rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-success-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">📚</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-success-600">
                  {uniqueCategories.length}
                </div>
                <div className="text-shadow-600">學科類別</div>
              </div>
            </div>
          </div>
          <div className="glass-effect rounded-xl p-6">
            <div className="flex items-center gap-3">
              <StarIcon className="w-8 h-8 text-warning-600" />
              <div>
                <div className="text-2xl font-bold text-warning-600">
                  {addedCards.size}
                </div>
                <div className="text-shadow-600">已加入記憶庫</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedSubcategory('all');
            }}
            className="px-4 py-2 rounded-lg border border-shadow-300 focus:border-focus-500 focus:ring-2 focus:ring-focus-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <option value="all">全部類別</option>
            {uniqueCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {subcategories.length > 0 && (
            <select
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              className="px-4 py-2 rounded-lg border border-shadow-300 focus:border-focus-500 focus:ring-2 focus:ring-focus-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <option value="all">全部子類別</option>
              {subcategories.map((subcategory) => (
                <option key={subcategory} value={subcategory}>
                  {subcategory}
                </option>
              ))}
            </select>
          )}

          <div className="text-sm text-shadow-600 flex items-center">
            共找到 {filteredMaterials.length} 項教材
          </div>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-shadow-400 text-lg mb-4">
                沒有找到符合條件的教材
              </div>
            </div>
          ) : (
            filteredMaterials.map((material) => (
              <div key={material.id} className="glass-effect rounded-xl p-6 card-shadow animate-fade-in">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-shadow-500">{material.category}</span>
                      {material.subcategory && (
                        <>
                          <span className="text-xs text-shadow-400">›</span>
                          <span className="text-xs text-shadow-500">{material.subcategory}</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-shadow-900 mb-2">
                      {material.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(material.difficulty_level)}`}>
                        {getDifficultyLabel(material.difficulty_level)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddToMemory(material)}
                    disabled={addedCards.has(material.id)}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      addedCards.has(material.id)
                        ? 'bg-success-100 text-success-600 cursor-not-allowed'
                        : 'text-shadow-500 hover:text-focus-600 hover:bg-focus-50'
                    }`}
                    title={addedCards.has(material.id) ? '已加入記憶庫' : '加入記憶庫'}
                  >
                    {addedCards.has(material.id) ? (
                      <StarIcon className="w-5 h-5" />
                    ) : (
                      <PlusIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <div className="mb-4">
                  <div className="text-sm text-shadow-700 leading-relaxed whitespace-pre-line">
                    {material.content}
                  </div>
                </div>

                {material.tags && (
                  <div className="flex flex-wrap gap-1">
                    {material.tags.split(',').map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-shadow-100 text-shadow-600 rounded-full"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}