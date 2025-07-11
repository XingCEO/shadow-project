import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Task {
  id: number;
  title: string;
  description: string;
  estimated_time: number;
  importance: number;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

interface TaskFormProps {
  task?: Task;
  onSubmit: (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'status'>) => void;
  onClose: () => void;
}

export default function TaskForm({ task, onSubmit, onClose }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [estimatedTime, setEstimatedTime] = useState(task?.estimated_time || 25);
  const [importance, setImportance] = useState(task?.importance || 3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      estimated_time: estimatedTime,
      importance,
    });
  };

  const getPriorityLabel = (priority: number) => {
    const labels = ['', '低', '中', '高', '很高', '極高'];
    return labels[priority] || '未知';
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} 分鐘`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours} 小時 ${remainingMinutes} 分鐘` : `${hours} 小時`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-effect rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-shadow-900">
            {task ? '編輯任務' : '新增任務'}
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
            <label htmlFor="title" className="block text-sm font-medium text-shadow-700 mb-2">
              任務標題 *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              placeholder="輸入任務標題..."
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-shadow-700 mb-2">
              任務描述
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="input-field resize-none"
              placeholder="詳細描述這個任務..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="estimated_time" className="block text-sm font-medium text-shadow-700 mb-2">
                預估時間 *
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  id="estimated_time"
                  min="5"
                  max="480"
                  step="5"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(Number(e.target.value))}
                  className="w-full h-2 bg-shadow-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="text-center text-focus-600 font-semibold">
                  {formatTime(estimatedTime)}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="importance" className="block text-sm font-medium text-shadow-700 mb-2">
                重要程度 *
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  id="importance"
                  min="1"
                  max="5"
                  step="1"
                  value={importance}
                  onChange={(e) => setImportance(Number(e.target.value))}
                  className="w-full h-2 bg-shadow-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="text-center font-semibold">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    importance === 1 ? 'bg-shadow-100 text-shadow-700' :
                    importance === 2 ? 'bg-blue-100 text-blue-700' :
                    importance === 3 ? 'bg-warning-100 text-warning-700' :
                    importance === 4 ? 'bg-orange-100 text-orange-700' :
                    'bg-danger-100 text-danger-700'
                  }`}>
                    {getPriorityLabel(importance)}重要
                  </span>
                </div>
              </div>
            </div>
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
              disabled={!title.trim()}
            >
              {task ? '更新任務' : '新增任務'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}