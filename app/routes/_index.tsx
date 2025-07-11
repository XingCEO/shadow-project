import { useState, useEffect } from 'react';
import { json } from '@remix-run/node';
import { useLoaderData, useFetcher, Link } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/node';
import TaskCard from '~/components/TaskCard';
import TaskForm from '~/components/TaskForm';
import TaskCompletionModal from '~/components/TaskCompletionModal';
import { PlusIcon, AcademicCapIcon, ClockIcon, BookOpenIcon, ChartBarIcon } from '@heroicons/react/24/outline';

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

export const loader: LoaderFunction = async () => {
  try {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://your-vercel-app.vercel.app' 
      : 'http://localhost:3000';
    
    const [tasksResponse, dueCardsResponse] = await Promise.all([
      fetch(`${baseUrl}/api/tasks`),
      fetch(`${baseUrl}/api/memory-cards`)
    ]);
    
    const [tasks, dueCards] = await Promise.all([
      tasksResponse.json(),
      dueCardsResponse.json()
    ]);
    
    return json({ tasks, dueCards });
  } catch (error) {
    console.error('Error fetching data:', error);
    return json({ tasks: [], dueCards: [] });
  }
};

export default function Index() {
  const { tasks: initialTasks, dueCards } = useLoaderData<{ tasks: Task[], dueCards: any[] }>();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [completedTask, setCompletedTask] = useState<Task | null>(null);
  const fetcher = useFetcher();

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const handleAddTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
    try {
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://your-vercel-app.vercel.app' 
        : 'http://localhost:3000';
      
      const response = await fetch(`${baseUrl}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        const result = await response.json();
        const newTask: Task = {
          id: result.id,
          ...taskData,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setTasks([newTask, ...tasks]);
        setIsFormOpen(false);
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleEditTask = async (id: number, taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://your-vercel-app.vercel.app' 
        : 'http://localhost:3000';
      
      const response = await fetch(`${baseUrl}/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        const updatedTask = { ...tasks.find(task => task.id === id)!, ...taskData, updated_at: new Date().toISOString() };
        setTasks(tasks.map(task => 
          task.id === id ? updatedTask : task
        ));
        setEditingTask(null);
        
        // 如果任務變成已完成，顯示完成對話框
        if (taskData.status === 'completed' && tasks.find(task => task.id === id)?.status !== 'completed') {
          setCompletedTask(updatedTask);
        }
      }
    } catch (error) {
      console.error('Error editing task:', error);
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://your-vercel-app.vercel.app' 
        : 'http://localhost:3000';
      
      const response = await fetch(`${baseUrl}/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTasks(tasks.filter(task => task.id !== id));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const getPriorityLabel = (priority: number) => {
    const labels = ['', '低', '中', '高', '很高', '極高'];
    return labels[priority] || '未知';
  };

  const getPriorityColor = (priority: number) => {
    const colors = ['', 'priority-1', 'priority-2', 'priority-3', 'priority-4', 'priority-5'];
    return colors[priority] || 'priority-1';
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} 分鐘`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours} 小時 ${remainingMinutes} 分鐘` : `${hours} 小時`;
  };

  const handleAddMemoryCard = async (cardData: { front: string; back: string; category: string; source_task_id: number }) => {
    try {
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://your-vercel-app.vercel.app' 
        : 'http://localhost:3000';
      
      const response = await fetch(`${baseUrl}/api/memory-cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cardData),
      });

      if (response.ok) {
        setCompletedTask(null);
      }
    } catch (error) {
      console.error('Error adding memory card:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-shadow-50 to-shadow-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-shadow-900 mb-2">
            影子計劃
          </h1>
          <p className="text-shadow-600 text-lg">
            專注學習，成就未來
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-effect rounded-xl p-6">
            <div className="text-2xl font-bold text-shadow-900">
              {tasks.filter(task => task.status === 'pending').length}
            </div>
            <div className="text-shadow-600">待完成任務</div>
          </div>
          <div className="glass-effect rounded-xl p-6">
            <div className="text-2xl font-bold text-focus-600">
              {tasks.filter(task => task.status === 'in_progress').length}
            </div>
            <div className="text-shadow-600">進行中</div>
          </div>
          <div className="glass-effect rounded-xl p-6">
            <div className="text-2xl font-bold text-success-600">
              {tasks.filter(task => task.status === 'completed').length}
            </div>
            <div className="text-shadow-600">已完成</div>
          </div>
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
              <Link to="/memory" className="text-sm text-focus-600 hover:text-focus-700 underline">
                立即複習
              </Link>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={() => setIsFormOpen(true)}
            className="btn-primary flex items-center gap-2 card-shadow"
          >
            <PlusIcon className="w-5 h-5" />
            新增任務
          </button>
          <Link
            to="/memory"
            className="btn-secondary flex items-center gap-2 card-shadow text-center"
          >
            <AcademicCapIcon className="w-5 h-5" />
            智慧記憶
          </Link>
          <Link
            to="/library"
            className="btn-secondary flex items-center gap-2 card-shadow text-center"
          >
            <BookOpenIcon className="w-5 h-5" />
            教材庫
          </Link>
          <Link
            to="/stats"
            className="btn-secondary flex items-center gap-2 card-shadow text-center"
          >
            <ChartBarIcon className="w-5 h-5" />
            學習統計
          </Link>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-shadow-400 text-lg mb-4">
                還沒有任務，開始新增第一個任務吧！
              </div>
              <button
                onClick={() => setIsFormOpen(true)}
                className="btn-primary"
              >
                新增任務
              </button>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => setEditingTask(task)}
                onDelete={() => handleDeleteTask(task.id)}
                formatTime={formatTime}
                getPriorityLabel={getPriorityLabel}
                getPriorityColor={getPriorityColor}
              />
            ))
          )}
        </div>

        {/* Task Form Modal */}
        {isFormOpen && (
          <TaskForm
            onSubmit={handleAddTask}
            onClose={() => setIsFormOpen(false)}
          />
        )}

        {/* Edit Task Modal */}
        {editingTask && (
          <TaskForm
            task={editingTask}
            onSubmit={(taskData) => handleEditTask(editingTask.id, taskData)}
            onClose={() => setEditingTask(null)}
          />
        )}

        {/* Task Completion Modal */}
        {completedTask && (
          <TaskCompletionModal
            taskTitle={completedTask.title}
            taskId={completedTask.id}
            onClose={() => setCompletedTask(null)}
            onAddMemoryCard={handleAddMemoryCard}
            onSkip={() => setCompletedTask(null)}
          />
        )}
      </div>
    </div>
  );
}