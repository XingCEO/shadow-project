import { useState, useEffect } from 'react';
import { XMarkIcon, TrophyIcon, ChartBarIcon, ClockIcon, CheckCircleIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

interface WeeklySummaryProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: string;
  endDate: string;
}

interface WeeklyStats {
  daily_breakdown: Array<{
    date: string;
    total_focus_time: number;
    tasks_completed: number;
    reviews_completed: number;
    review_accuracy: number;
  }>;
  total_focus_time: number;
  total_tasks_completed: number;
  total_reviews: number;
  average_accuracy: number;
  study_days: number;
}

interface Achievement {
  id: number;
  badge_type: string;
  badge_name: string;
  description: string;
  earned_at: string;
  value: number;
}

export default function WeeklySummary({ isOpen, onClose, startDate, endDate }: WeeklySummaryProps) {
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [weeklyAchievements, setWeeklyAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchWeeklySummary();
    }
  }, [isOpen, startDate, endDate]);

  const fetchWeeklySummary = async () => {
    try {
      const [statsResponse, achievementsResponse] = await Promise.all([
        fetch(`http://localhost:3000/api/stats/weekly?startDate=${startDate}&endDate=${endDate}`),
        fetch('http://localhost:3000/api/achievements')
      ]);

      const [statsData, achievementsData] = await Promise.all([
        statsResponse.json(),
        achievementsResponse.json()
      ]);

      setWeeklyStats(statsData);
      
      // 只顯示本週獲得的成就
      const weekStart = new Date(startDate);
      const weekEnd = new Date(endDate);
      setWeeklyAchievements(
        achievementsData.filter((achievement: Achievement) => {
          const earnedDate = new Date(achievement.earned_at);
          return earnedDate >= weekStart && earnedDate <= weekEnd;
        })
      );
    } catch (error) {
      console.error('Error fetching weekly summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} 分鐘`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}小時${remainingMinutes}分` : `${hours}小時`;
  };

  const getPerformanceGrade = () => {
    if (!weeklyStats) return 'F';
    
    const avgDailyFocus = weeklyStats.total_focus_time / 7;
    const completionRate = weeklyStats.study_days / 7;
    
    if (avgDailyFocus >= 120 && completionRate >= 0.8) return 'A+';
    if (avgDailyFocus >= 90 && completionRate >= 0.7) return 'A';
    if (avgDailyFocus >= 60 && completionRate >= 0.6) return 'B';
    if (avgDailyFocus >= 30 && completionRate >= 0.4) return 'C';
    return 'D';
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'text-green-600';
      case 'A': return 'text-green-500';
      case 'B': return 'text-blue-500';
      case 'C': return 'text-yellow-500';
      case 'D': return 'text-orange-500';
      default: return 'text-red-500';
    }
  };

  const getSubjectProgress = () => {
    // 這裡可以根據實際的學科數據來計算
    // 目前使用模擬數據
    return [
      { subject: '數學', progress: 85, color: 'bg-blue-500' },
      { subject: '英文', progress: 72, color: 'bg-green-500' },
      { subject: '物理', progress: 68, color: 'bg-purple-500' },
      { subject: '化學', progress: 91, color: 'bg-orange-500' },
    ];
  };

  const getWeeklyInsights = () => {
    if (!weeklyStats) return [];
    
    const insights = [];
    
    if (weeklyStats.study_days >= 6) {
      insights.push('🎯 幾乎每天都有學習，保持得很好！');
    } else if (weeklyStats.study_days >= 4) {
      insights.push('📚 本週學習天數不錯，試著再增加一天');
    } else {
      insights.push('⚡ 本週學習天數較少，下週加油！');
    }
    
    if (weeklyStats.average_accuracy >= 0.8) {
      insights.push('🧠 複習正確率很高，知識掌握得很好');
    } else if (weeklyStats.average_accuracy >= 0.6) {
      insights.push('📖 複習表現不錯，繼續加強');
    } else {
      insights.push('🔄 複習正確率有提升空間');
    }
    
    const avgDailyFocus = weeklyStats.total_focus_time / 7;
    if (avgDailyFocus >= 90) {
      insights.push('⏰ 每日專注時間充足，學習效率很高');
    } else {
      insights.push('🎯 可以試著增加每日專注時間');
    }
    
    return insights;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-effect rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-shadow-900 mb-2">
                週學習報告
              </h2>
              <p className="text-shadow-600">
                {new Date(startDate).toLocaleDateString('zh-TW')} - {new Date(endDate).toLocaleDateString('zh-TW')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-shadow-500 hover:text-shadow-700 hover:bg-shadow-100 rounded-lg transition-colors duration-200"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-focus-600 mx-auto"></div>
              <p className="mt-4 text-shadow-600">載入中...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* 週成績 */}
              <div className="text-center py-8 bg-gradient-to-r from-focus-50 to-success-50 rounded-xl">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <TrophyIcon className="w-12 h-12 text-warning-600" />
                  <div>
                    <h3 className="text-2xl font-bold text-shadow-900">本週表現評級</h3>
                    <div className={`text-6xl font-bold ${getGradeColor(getPerformanceGrade())}`}>
                      {getPerformanceGrade()}
                    </div>
                  </div>
                </div>
                <p className="text-shadow-600 text-lg">
                  總計學習 {weeklyStats?.study_days || 0} 天，專注 {formatTime(weeklyStats?.total_focus_time || 0)}
                </p>
              </div>

              {/* 週統計 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <ClockIcon className="w-8 h-8 text-focus-600" />
                    <div>
                      <h3 className="font-semibold text-shadow-900">總專注時間</h3>
                      <p className="text-2xl font-bold text-focus-600">
                        {formatTime(weeklyStats?.total_focus_time || 0)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-shadow-600">
                    日均 {formatTime(Math.round((weeklyStats?.total_focus_time || 0) / 7))}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircleIcon className="w-8 h-8 text-success-600" />
                    <div>
                      <h3 className="font-semibold text-shadow-900">完成任務</h3>
                      <p className="text-2xl font-bold text-success-600">
                        {weeklyStats?.total_tasks_completed || 0} 個
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-shadow-600">
                    日均 {Math.round((weeklyStats?.total_tasks_completed || 0) / 7)} 個
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <ChartBarIcon className="w-8 h-8 text-warning-600" />
                    <div>
                      <h3 className="font-semibold text-shadow-900">複習正確率</h3>
                      <p className="text-2xl font-bold text-warning-600">
                        {weeklyStats?.average_accuracy ? `${Math.round(weeklyStats.average_accuracy * 100)}%` : '0%'}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-shadow-600">
                    總複習 {weeklyStats?.total_reviews || 0} 次
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <CalendarDaysIcon className="w-8 h-8 text-purple-600" />
                    <div>
                      <h3 className="font-semibold text-shadow-900">學習天數</h3>
                      <p className="text-2xl font-bold text-purple-600">
                        {weeklyStats?.study_days || 0} 天
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-shadow-600">
                    堅持率 {Math.round(((weeklyStats?.study_days || 0) / 7) * 100)}%
                  </p>
                </div>
              </div>

              {/* 每日專注時間圖表 */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-shadow-900 mb-4">每日專注時間</h3>
                <div className="flex items-end gap-2 h-32">
                  {weeklyStats?.daily_breakdown.map((day, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-focus-600 rounded-t-sm transition-all duration-300"
                        style={{ 
                          height: `${Math.max((day.total_focus_time / Math.max(...weeklyStats.daily_breakdown.map(d => d.total_focus_time), 1)) * 100, 2)}%` 
                        }}
                      />
                      <div className="text-xs text-shadow-600 mt-2">
                        {new Date(day.date).toLocaleDateString('zh-TW', { weekday: 'short' })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 學科進度 */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-shadow-900 mb-4">各科目進度</h3>
                <div className="space-y-4">
                  {getSubjectProgress().map((subject, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-16 text-sm font-medium text-shadow-700">
                        {subject.subject}
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-300 ${subject.color}`}
                          style={{ width: `${subject.progress}%` }}
                        />
                      </div>
                      <div className="w-12 text-sm font-medium text-shadow-700">
                        {subject.progress}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 本週成就 */}
              {weeklyAchievements.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-shadow-900 mb-4 flex items-center gap-2">
                    <TrophyIcon className="w-6 h-6 text-warning-600" />
                    本週成就
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {weeklyAchievements.map((achievement) => (
                      <div key={achievement.id} className="flex items-center gap-3 p-3 bg-warning-50 rounded-lg">
                        <div className="w-12 h-12 bg-warning-600 rounded-full flex items-center justify-center">
                          <TrophyIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-shadow-900">{achievement.badge_name}</h4>
                          <p className="text-sm text-shadow-600">{achievement.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 本週洞察 */}
              <div className="bg-gradient-to-r from-focus-50 to-success-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-shadow-900 mb-4">本週洞察</h3>
                <div className="space-y-2">
                  {getWeeklyInsights().map((insight, index) => (
                    <p key={index} className="text-shadow-700 leading-relaxed">
                      {insight}
                    </p>
                  ))}
                </div>
              </div>

              {/* 關閉按鈕 */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={onClose}
                  className="btn-primary px-8 py-3 text-lg"
                >
                  繼續下週的學習挑戰
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}