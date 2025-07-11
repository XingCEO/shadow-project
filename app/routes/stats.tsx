import { useState, useEffect } from 'react';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/node';
import DailySummary from '~/components/DailySummary';
import WeeklySummary from '~/components/WeeklySummary';
import MonthlySummary from '~/components/MonthlySummary';
import { 
  ChartBarIcon, 
  ClockIcon, 
  TrophyIcon, 
  CalendarDaysIcon,
  FireIcon,
  BoltIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

interface PersonalAnalysis {
  peak_hours: Array<{
    hour: number;
    avg_duration: number;
    sessions: number;
  }>;
  best_subjects: Array<{
    subject: string;
    avg_duration: number;
    sessions: number;
    avg_score: number;
  }>;
  focus_patterns: {
    total_sessions: number;
    avg_session_duration: number;
    most_active_hour: number | null;
  };
  recommendations: string[];
}

interface Achievement {
  id: number;
  badge_type: string;
  badge_name: string;
  description: string;
  earned_at: string;
  value: number;
}

interface DailyStats {
  date: string;
  total_focus_time: number;
  tasks_completed: number;
  reviews_completed: number;
  review_accuracy: number;
}

export const loader: LoaderFunction = async () => {
  try {
    const [analysisResponse, achievementsResponse, todayStatsResponse] = await Promise.all([
      fetch('http://localhost:3000/api/analysis/personal?days=30'),
      fetch('http://localhost:3000/api/achievements'),
      fetch(`http://localhost:3000/api/stats/daily?date=${new Date().toISOString().split('T')[0]}`)
    ]);

    const [analysis, achievements, todayStats] = await Promise.all([
      analysisResponse.json(),
      achievementsResponse.json(),
      todayStatsResponse.json()
    ]);

    return json({ analysis, achievements, todayStats });
  } catch (error) {
    console.error('Error fetching stats data:', error);
    return json({ 
      analysis: { 
        peak_hours: [], 
        best_subjects: [], 
        focus_patterns: {}, 
        recommendations: [] 
      }, 
      achievements: [], 
      todayStats: {} 
    });
  }
};

export default function Stats() {
  const { analysis, achievements, todayStats } = useLoaderData<{ 
    analysis: PersonalAnalysis, 
    achievements: Achievement[], 
    todayStats: DailyStats 
  }>();
  
  const [isDailySummaryOpen, setIsDailySummaryOpen] = useState(false);
  const [isWeeklySummaryOpen, setIsWeeklySummaryOpen] = useState(false);
  const [isMonthlySummaryOpen, setIsMonthlySummaryOpen] = useState(false);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} 分鐘`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}小時${remainingMinutes}分` : `${hours}小時`;
  };

  const getTimeLabel = (hour: number) => {
    if (hour < 12) return `上午${hour}點`;
    if (hour < 18) return `下午${hour}點`;
    return `晚上${hour}點`;
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

  const getWeekRange = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return {
      start: startOfWeek.toISOString().split('T')[0],
      end: endOfWeek.toISOString().split('T')[0]
    };
  };

  const getCurrentMonth = () => {
    const today = new Date();
    return {
      year: today.getFullYear().toString(),
      month: (today.getMonth() + 1).toString().padStart(2, '0')
    };
  };

  const weekRange = getWeekRange();
  const currentMonth = getCurrentMonth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-shadow-50 to-shadow-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-shadow-900 mb-2">
            學習統計
          </h1>
          <p className="text-shadow-600 text-lg">
            深度分析你的學習習慣，發現進步軌跡
          </p>
        </div>

        {/* 今日快覽 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-effect rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <ClockIcon className="w-8 h-8 text-focus-600" />
              <div>
                <h3 className="font-semibold text-shadow-900">今日專注</h3>
                <p className="text-2xl font-bold text-focus-600">
                  {formatTime(todayStats.total_focus_time || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-effect rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <TrophyIcon className="w-8 h-8 text-warning-600" />
              <div>
                <h3 className="font-semibold text-shadow-900">今日任務</h3>
                <p className="text-2xl font-bold text-warning-600">
                  {todayStats.tasks_completed || 0} 個
                </p>
              </div>
            </div>
          </div>

          <div className="glass-effect rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <AcademicCapIcon className="w-8 h-8 text-success-600" />
              <div>
                <h3 className="font-semibold text-shadow-900">今日複習</h3>
                <p className="text-2xl font-bold text-success-600">
                  {todayStats.reviews_completed || 0} 次
                </p>
              </div>
            </div>
          </div>

          <div className="glass-effect rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <FireIcon className="w-8 h-8 text-red-600" />
              <div>
                <h3 className="font-semibold text-shadow-900">正確率</h3>
                <p className="text-2xl font-bold text-red-600">
                  {todayStats.review_accuracy ? `${Math.round(todayStats.review_accuracy * 100)}%` : '0%'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 總結報告 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => setIsDailySummaryOpen(true)}
            className="glass-effect rounded-xl p-6 hover:shadow-lg transition-shadow duration-200 text-left"
          >
            <div className="flex items-center gap-3 mb-3">
              <CalendarDaysIcon className="w-8 h-8 text-focus-600" />
              <div>
                <h3 className="font-semibold text-shadow-900">今日總結</h3>
                <p className="text-shadow-600">查看今天的學習報告</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setIsWeeklySummaryOpen(true)}
            className="glass-effect rounded-xl p-6 hover:shadow-lg transition-shadow duration-200 text-left"
          >
            <div className="flex items-center gap-3 mb-3">
              <ChartBarIcon className="w-8 h-8 text-success-600" />
              <div>
                <h3 className="font-semibold text-shadow-900">本週報告</h3>
                <p className="text-shadow-600">查看本週的學習統計</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setIsMonthlySummaryOpen(true)}
            className="glass-effect rounded-xl p-6 hover:shadow-lg transition-shadow duration-200 text-left"
          >
            <div className="flex items-center gap-3 mb-3">
              <TrophyIcon className="w-8 h-8 text-warning-600" />
              <div>
                <h3 className="font-semibold text-shadow-900">月度報告</h3>
                <p className="text-shadow-600">查看本月的成就總結</p>
              </div>
            </div>
          </button>
        </div>

        {/* 個人化分析 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 黃金專注時段 */}
          <div className="glass-effect rounded-xl p-6">
            <h3 className="text-xl font-bold text-shadow-900 mb-4 flex items-center gap-2">
              <BoltIcon className="w-6 h-6 text-warning-600" />
              黃金專注時段
            </h3>
            {analysis.peak_hours.length > 0 ? (
              <div className="space-y-3">
                {analysis.peak_hours.map((hour, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-shadow-900">
                        {getTimeLabel(hour.hour)}
                      </div>
                      <div className="text-sm text-shadow-600">
                        {hour.sessions} 次學習
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-warning-600">
                        {formatTime(Math.round(hour.avg_duration))}
                      </div>
                      <div className="text-sm text-shadow-600">
                        平均時長
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-shadow-600">還沒有足夠的數據進行分析</p>
            )}
          </div>

          {/* 最佳學科 */}
          <div className="glass-effect rounded-xl p-6">
            <h3 className="text-xl font-bold text-shadow-900 mb-4 flex items-center gap-2">
              <AcademicCapIcon className="w-6 h-6 text-success-600" />
              最佳學科表現
            </h3>
            {analysis.best_subjects.length > 0 ? (
              <div className="space-y-3">
                {analysis.best_subjects.map((subject, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-shadow-900">
                        {subject.subject}
                      </div>
                      <div className="text-sm text-shadow-600">
                        {subject.sessions} 次學習
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-success-600">
                        {formatTime(Math.round(subject.avg_duration))}
                      </div>
                      <div className="text-sm text-shadow-600">
                        平均時長
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-shadow-600">還沒有足夠的數據進行分析</p>
            )}
          </div>
        </div>

        {/* 個人化建議 */}
        {analysis.recommendations.length > 0 && (
          <div className="glass-effect rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-shadow-900 mb-4">個人化建議</h3>
            <div className="space-y-3">
              {analysis.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-focus-50 rounded-lg">
                  <div className="w-2 h-2 bg-focus-600 rounded-full mt-2"></div>
                  <p className="text-shadow-700 leading-relaxed">
                    {recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 成就徽章 */}
        <div className="glass-effect rounded-xl p-6">
          <h3 className="text-xl font-bold text-shadow-900 mb-4 flex items-center gap-2">
            <TrophyIcon className="w-6 h-6 text-warning-600" />
            成就徽章 ({achievements.length})
          </h3>
          {achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getBadgeColor(achievement.badge_type)} flex items-center justify-center shadow-lg`}>
                    <span className="text-2xl">{getBadgeIcon(achievement.badge_type)}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-shadow-900">{achievement.badge_name}</h4>
                    <p className="text-sm text-shadow-600">{achievement.description}</p>
                    <p className="text-xs text-shadow-500 mt-1">
                      {new Date(achievement.earned_at).toLocaleDateString('zh-TW')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-shadow-600">還沒有獲得任何成就，繼續努力學習吧！</p>
          )}
        </div>

        {/* 總結對話框 */}
        <DailySummary
          isOpen={isDailySummaryOpen}
          onClose={() => setIsDailySummaryOpen(false)}
          date={new Date().toISOString().split('T')[0]}
        />

        <WeeklySummary
          isOpen={isWeeklySummaryOpen}
          onClose={() => setIsWeeklySummaryOpen(false)}
          startDate={weekRange.start}
          endDate={weekRange.end}
        />

        <MonthlySummary
          isOpen={isMonthlySummaryOpen}
          onClose={() => setIsMonthlySummaryOpen(false)}
          year={currentMonth.year}
          month={currentMonth.month}
        />
      </div>
    </div>
  );
}