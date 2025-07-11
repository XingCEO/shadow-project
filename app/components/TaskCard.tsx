import { PencilIcon, TrashIcon, PlayIcon } from '@heroicons/react/24/outline';

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

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  formatTime: (minutes: number) => string;
  getPriorityLabel: (priority: number) => string;
  getPriorityColor: (priority: number) => string;
}

export default function TaskCard({ 
  task, 
  onEdit, 
  onDelete, 
  formatTime, 
  getPriorityLabel, 
  getPriorityColor 
}: TaskCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-shadow-100 text-shadow-700';
      case 'in_progress':
        return 'bg-focus-100 text-focus-700';
      case 'completed':
        return 'bg-success-100 text-success-700';
      default:
        return 'bg-shadow-100 text-shadow-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '待完成';
      case 'in_progress':
        return '進行中';
      case 'completed':
        return '已完成';
      default:
        return '未知';
    }
  };

  return (
    <div className="glass-effect rounded-xl p-6 card-shadow animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-shadow-900 mb-2">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-shadow-600 mb-3 leading-relaxed">
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(task.importance)}`}>
              {getPriorityLabel(task.importance)}重要
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
              {getStatusLabel(task.status)}
            </span>
            <span className="text-shadow-500 text-sm">
              預估 {formatTime(task.estimated_time)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={onEdit}
            className="p-2 text-shadow-500 hover:text-focus-600 hover:bg-focus-50 rounded-lg transition-colors duration-200"
            title="編輯任務"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-shadow-500 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors duration-200"
            title="刪除任務"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
          {task.status === 'pending' && (
            <button
              className="p-2 text-shadow-500 hover:text-success-600 hover:bg-success-50 rounded-lg transition-colors duration-200"
              title="開始專注"
            >
              <PlayIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      <div className="text-xs text-shadow-400 flex justify-between">
        <span>建立於 {new Date(task.created_at).toLocaleString('zh-TW')}</span>
        {task.updated_at !== task.created_at && (
          <span>更新於 {new Date(task.updated_at).toLocaleString('zh-TW')}</span>
        )}
      </div>
    </div>
  );
}