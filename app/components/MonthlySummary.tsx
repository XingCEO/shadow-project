import { useState, useEffect } from 'react';
import { XMarkIcon, TrophyIcon, ChartBarIcon, ClockIcon, CheckCircleIcon, CalendarDaysIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

interface MonthlySummaryProps {
  isOpen: boolean;
  onClose: () => void;
  year: string;
  month: string;
}

interface MonthlyStats {
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
  longest_streak: number;
}

interface Achievement {
  id: number;
  badge_type: string;
  badge_name: string;
  description: string;
  earned_at: string;
  value: number;
}

export default function MonthlySummary({ isOpen, onClose, year, month }: MonthlySummaryProps) {
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null);
  const [monthlyAchievements, setMonthlyAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchMonthlySummary();
    }
  }, [isOpen, year, month]);

  const fetchMonthlySummary = async () => {
    try {
      const [statsResponse, achievementsResponse] = await Promise.all([
        fetch(`http://localhost:3000/api/stats/monthly?year=${year}&month=${month}`),
        fetch('http://localhost:3000/api/achievements')
      ]);

      const [statsData, achievementsData] = await Promise.all([
        statsResponse.json(),
        achievementsResponse.json()
      ]);

      setMonthlyStats(statsData);
      
      // 只顯示本月獲得的成就
      setMonthlyAchievements(
        achievementsData.filter((achievement: Achievement) => {
          const earnedDate = new Date(achievement.earned_at);
          return earnedDate.getFullYear().toString() === year && 
                 (earnedDate.getMonth() + 1).toString().padStart(2, '0') === month;
        })
      );
    } catch (error) {
      console.error('Error fetching monthly summary:', error);
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

  const getMonthName = (month: string) => {
    const months = [
      '一月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月'
    ];
    return months[parseInt(month) - 1];
  };

  const getProgressPhase = () => {
    if (!monthlyStats) return '起步階段';
    
    const avgDailyFocus = monthlyStats.total_focus_time / 30;
    const studyRate = monthlyStats.study_days / 30;
    
    if (avgDailyFocus >= 120 && studyRate >= 0.8) return '學習大師';
    if (avgDailyFocus >= 90 && studyRate >= 0.7) return '專注達人';
    if (avgDailyFocus >= 60 && studyRate >= 0.6) return '穩定進步';
    if (avgDailyFocus >= 30 && studyRate >= 0.4) return '持續成長';
    return '努力累積';
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case '學習大師': return 'text-purple-600';
      case '專注達人': return 'text-blue-600';
      case '穩定進步': return 'text-green-600';
      case '持續成長': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getMonthlyInsights = () => {
    if (!monthlyStats) return [];
    
    const insights = [];
    
    // 學習天數分析
    const studyRate = monthlyStats.study_days / 30;
    if (studyRate >= 0.8) {
      insights.push('🎯 本月幾乎每天都有學習，習慣養成得很好！');
    } else if (studyRate >= 0.6) {
      insights.push('📚 本月學習頻率不錯，可以朝著每天學習的目標努力');
    } else {
      insights.push('⚡ 本月學習頻率有提升空間，建議設定固定的學習時間');
    }
    
    // 連續天數分析
    if (monthlyStats.longest_streak >= 7) {
      insights.push(`🔥 最長連續學習 ${monthlyStats.longest_streak} 天，堅持的力量很強！`);
    } else if (monthlyStats.longest_streak >= 3) {
      insights.push(`💪 最長連續學習 ${monthlyStats.longest_streak} 天，可以挑戰更長的連續紀錄`);
    }
    
    // 複習表現分析
    if (monthlyStats.average_accuracy >= 0.85) {
      insights.push('🧠 複習正確率優秀，知識掌握得很紮實');
    } else if (monthlyStats.average_accuracy >= 0.7) {
      insights.push('📖 複習表現良好，繼續保持');
    } else {
      insights.push('🔄 複習正確率有進步空間，建議增加複習頻率');
    }
    
    return insights;
  };

  const getGoalAchievementRate = () => {
    if (!monthlyStats) return 0;
    
    // 模擬目標達成率計算
    const targetDailyFocus = 90; // 目標每天90分鐘
    const actualDailyFocus = monthlyStats.total_focus_time / 30;
    
    return Math.min(Math.round((actualDailyFocus / targetDailyFocus) * 100), 100);
  };

  const getWeeklyBreakdown = () => {
    if (!monthlyStats) return [];
    
    const weeks = [];
    const daily = monthlyStats.daily_breakdown;
    
    for (let i = 0; i < daily.length; i += 7) {
      const weekData = daily.slice(i, i + 7);
      const totalFocus = weekData.reduce((sum, day) => sum + day.total_focus_time, 0);
      const totalTasks = weekData.reduce((sum, day) => sum + day.tasks_completed, 0);
      
      weeks.push({
        week: Math.floor(i / 7) + 1,
        totalFocus,
        totalTasks,
        studyDays: weekData.filter(day => day.total_focus_time > 0).length
      });
    }
    
    return weeks;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-effect rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-4xl font-bold text-shadow-900 mb-2">
                月度成就報告
              </h2>
              <p className="text-shadow-600 text-lg">
                {year} 年 {getMonthName(month)} - 你的學習蛻變歷程
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
              {/* 月度階段 */}
              <div className="text-center py-12 bg-gradient-to-r from-purple-50 via-focus-50 to-success-50 rounded-xl">
                <div className="mb-6">
                  <AcademicCapIcon className="w-20 h-20 mx-auto text-purple-600 mb-4" />
                  <h3 className="text-2xl font-bold text-shadow-900 mb-2">學習階段</h3>
                  <div className={`text-5xl font-bold ${getPhaseColor(getProgressPhase())} mb-4`}>
                    {getProgressPhase()}
                  </div>
                  <p className="text-shadow-600 text-lg">
                    本月學習 {monthlyStats?.study_days || 0} 天，累積專注 {formatTime(monthlyStats?.total_focus_time || 0)}
                  </p>
                </div>
              </div>

              {/* 進步軌跡 */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-shadow-900 mb-4">進步軌跡</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* 每週專注時間趨勢 */}
                  <div>
                    <h4 className="font-semibold text-shadow-800 mb-3">每週專注時間</h4>
                    <div className="flex items-end gap-3 h-32">
                      {getWeeklyBreakdown().map((week, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div 
                            className="w-full bg-gradient-to-t from-focus-600 to-focus-400 rounded-t-lg transition-all duration-300"
                            style={{ 
                              height: `${Math.max((week.totalFocus / Math.max(...getWeeklyBreakdown().map(w => w.totalFocus), 1)) * 100, 5)}%` 
                            }}
                          />
                          <div className="text-xs text-shadow-600 mt-2">
                            第{week.week}週
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 目標達成率 */}
                  <div>
                    <h4 className="font-semibold text-shadow-800 mb-3">目標達成率</h4>
                    <div className="flex items-center justify-center h-32">
                      <div className="relative w-24 h-24">
                        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-gray-200"
                          />
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeDasharray={`${getGoalAchievementRate()} 100`}
                            className="text-success-500"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xl font-bold text-shadow-900">
                            {getGoalAchievementRate()}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 月度統計 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <ClockIcon className="w-8 h-8 text-focus-600" />
                    <div>
                      <h3 className="font-semibold text-shadow-900">總專注時間</h3>
                      <p className="text-2xl font-bold text-focus-600">
                        {formatTime(monthlyStats?.total_focus_time || 0)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-shadow-600">
                    日均 {formatTime(Math.round((monthlyStats?.total_focus_time || 0) / 30))}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircleIcon className="w-8 h-8 text-success-600" />
                    <div>
                      <h3 className="font-semibold text-shadow-900">完成任務</h3>
                      <p className="text-2xl font-bold text-success-600">
                        {monthlyStats?.total_tasks_completed || 0} 個
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-shadow-600">
                    日均 {Math.round((monthlyStats?.total_tasks_completed || 0) / 30)} 個
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <ChartBarIcon className="w-8 h-8 text-warning-600" />
                    <div>
                      <h3 className="font-semibold text-shadow-900">複習正確率</h3>
                      <p className="text-2xl font-bold text-warning-600">
                        {monthlyStats?.average_accuracy ? `${Math.round(monthlyStats.average_accuracy * 100)}%` : '0%'}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-shadow-600">
                    總複習 {monthlyStats?.total_reviews || 0} 次
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <CalendarDaysIcon className="w-8 h-8 text-purple-600" />
                    <div>
                      <h3 className="font-semibold text-shadow-900">連續學習</h3>
                      <p className="text-2xl font-bold text-purple-600">
                        {monthlyStats?.longest_streak || 0} 天
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-shadow-600">
                    學習 {monthlyStats?.study_days || 0} 天
                  </p>
                </div>
              </div>

              {/* 月度成就 */}
              {monthlyAchievements.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-shadow-900 mb-4 flex items-center gap-2">
                    <TrophyIcon className="w-6 h-6 text-warning-600" />
                    月度榮譽榜
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {monthlyAchievements.map((achievement) => (
                      <div key={achievement.id} className="flex items-center gap-3 p-4 bg-gradient-to-r from-warning-50 to-orange-50 rounded-lg">
                        <div className="w-14 h-14 bg-gradient-to-br from-warning-500 to-orange-500 rounded-full flex items-center justify-center">
                          <TrophyIcon className="w-8 h-8 text-white" />
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

              {/* 質的飛躍 */}
              <div className="bg-gradient-to-r from-purple-50 to-focus-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-shadow-900 mb-4">質的飛躍</h3>
                <div className="space-y-3">
                  {getMonthlyInsights().map((insight, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-focus-600 rounded-full mt-2"></div>
                      <p className="text-shadow-700 leading-relaxed flex-1">
                        {insight}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 下月展望 */}
              <div className="bg-gradient-to-r from-success-50 to-focus-50 rounded-xl p-6 text-center">
                <h3 className="text-xl font-bold text-shadow-900 mb-4">下月展望</h3>
                <p className="text-shadow-700 leading-relaxed text-lg mb-6">
                  經過一個月的努力，你已經成長為「{getProgressPhase()}」。
                  繼續保持這份熱忱，下個月讓我們朝著更高的目標前進！
                </p>
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-lg shadow-sm">
                  <span className="text-shadow-900 font-semibold">下月目標：</span>
                  <span className="text-focus-600 font-bold">每日專注 2 小時</span>
                </div>
              </div>

              {/* 關閉按鈕 */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={onClose}
                  className="btn-primary px-8 py-3 text-lg"
                >
                  邁向下個月的成長之路
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}