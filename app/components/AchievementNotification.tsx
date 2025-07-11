import { useState, useEffect } from 'react';
import { TrophyIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Achievement {
  badge_type: string;
  badge_name: string;
  description: string;
  value?: number;
}

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export default function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      // 5秒後自動關閉
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [achievement]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // 等待動畫完成
  };

  const getBadgeIcon = (badgeType: string) => {
    switch (badgeType) {
      case 'focus_milestone':
        return '🎯';
      case 'total_focus':
        return '⏰';
      case 'task_milestone':
        return '✅';
      case 'daily_task':
        return '🚀';
      case 'review_milestone':
        return '🧠';
      case 'accuracy':
        return '🎯';
      case 'streak':
        return '🔥';
      case 'habit':
        return '💪';
      case 'total_days':
        return '📅';
      default:
        return '🏆';
    }
  };

  const getBadgeColor = (badgeType: string) => {
    switch (badgeType) {
      case 'focus_milestone':
        return 'from-blue-500 to-blue-600';
      case 'total_focus':
        return 'from-purple-500 to-purple-600';
      case 'task_milestone':
        return 'from-green-500 to-green-600';
      case 'daily_task':
        return 'from-orange-500 to-orange-600';
      case 'review_milestone':
        return 'from-indigo-500 to-indigo-600';
      case 'accuracy':
        return 'from-pink-500 to-pink-600';
      case 'streak':
        return 'from-red-500 to-red-600';
      case 'habit':
        return 'from-teal-500 to-teal-600';
      case 'total_days':
        return 'from-yellow-500 to-yellow-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (!achievement) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm border border-gray-200 animate-bounce">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getBadgeColor(achievement.badge_type)} flex items-center justify-center shadow-lg`}>
              <span className="text-2xl">{getBadgeIcon(achievement.badge_type)}</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">成就解鎖！</h3>
              <p className="text-sm text-gray-600">恭喜你獲得新徽章</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 text-xl mb-2">
            {achievement.badge_name}
          </h4>
          <p className="text-gray-600 leading-relaxed">
            {achievement.description}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrophyIcon className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">
              {achievement.value ? `+${achievement.value} 點` : '新徽章'}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium"
          >
            太棒了！
          </button>
        </div>

        {/* 慶祝特效 */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 left-2 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
          <div className="absolute top-4 right-6 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-4 left-6 w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-2 right-2 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }} />
        </div>
      </div>
    </div>
  );
}