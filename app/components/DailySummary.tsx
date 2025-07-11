import { useState, useEffect } from 'react';
import { XMarkIcon, TrophyIcon, ChartBarIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface DailySummaryProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
}

interface DailyStats {
  date: string;
  total_focus_time: number;
  tasks_completed: number;
  tasks_created: number;
  reviews_completed: number;
  review_accuracy: number;
  cards_created: number;
  peak_focus_hour: number | null;
  longest_focus_session: number;
}

interface Achievement {
  id: number;
  badge_type: string;
  badge_name: string;
  description: string;
  earned_at: string;
  value: number;
}

export default function DailySummary({ isOpen, onClose, date }: DailySummaryProps) {
  const [todayStats, setTodayStats] = useState<DailyStats | null>(null);
  const [yesterdayStats, setYesterdayStats] = useState<DailyStats | null>(null);
  const [todayAchievements, setTodayAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchDailySummary();
    }
  }, [isOpen, date]);

  const fetchDailySummary = async () => {
    try {
      const yesterday = new Date(date);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const [todayResponse, yesterdayResponse, achievementsResponse] = await Promise.all([
        fetch(`http://localhost:3000/api/stats/daily?date=${date}`),
        fetch(`http://localhost:3000/api/stats/daily?date=${yesterdayStr}`),
        fetch('http://localhost:3000/api/achievements')
      ]);

      const [todayData, yesterdayData, achievementsData] = await Promise.all([
        todayResponse.json(),
        yesterdayResponse.json(),
        achievementsResponse.json()
      ]);

      setTodayStats(todayData);
      setYesterdayStats(yesterdayData);
      
      // 只顯示今天獲得的成就
      const today = new Date(date).toISOString().split('T')[0];
      setTodayAchievements(
        achievementsData.filter((achievement: Achievement) => 
          achievement.earned_at.split('T')[0] === today
        )
      );
    } catch (error) {
      console.error('Error fetching daily summary:', error);
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

  const getComparisonText = (today: number, yesterday: number) => {
    if (today === yesterday) return '與昨天相同';
    const diff = today - yesterday;
    const percentage = yesterday === 0 ? 100 : Math.round((diff / yesterday) * 100);
    return diff > 0 ? `比昨天多${Math.abs(percentage)}%` : `比昨天少${Math.abs(percentage)}%`;
  };

  const getComparisonColor = (today: number, yesterday: number) => {
    if (today === yesterday) return 'text-shadow-600';
    return today > yesterday ? 'text-success-600' : 'text-warning-600';
  };

  const getTimeLabel = (hour: number | null) => {
    if (hour === null) return '無資料';
    if (hour < 12) return `上午${hour}點`;
    if (hour < 18) return `下午${hour}點`;
    return `晚上${hour}點`;
  };

  const getMotivationalMessage = () => {
    if (!todayStats) return '';
    
    const messages = [
      '你的專注，點亮整個世界 ✨',
      '每一分鐘的努力都在塑造更好的你 🌟',
      '堅持的力量，讓夢想成為現實 💪',
      '今天的你，比昨天更強 🚀',
      '學習的路上，你從不孤單 🌙'
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getTomorrowSuggestion = () => {
    if (!todayStats) return '繼續保持學習的熱忱！';
    
    const suggestions = [];
    
    if (todayStats.total_focus_time < 60) {
      suggestions.push('明天試著延長專注時間到1小時以上');
    }
    
    if (todayStats.reviews_completed === 0) {
      suggestions.push('別忘了複習記憶卡片，鞏固學過的知識');
    }
    
    if (todayStats.tasks_completed === 0) {
      suggestions.push('設定一個小目標，完成一個學習任務');
    }
    
    if (suggestions.length === 0) {
      return '保持現在的節奏，你做得很棒！';
    }
    
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-effect rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-shadow-900 mb-2">
                今日學習總結
              </h2>
              <p className="text-shadow-600">
                {new Date(date).toLocaleDateString('zh-TW', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  weekday: 'long' 
                })}
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
              {/* 激勵訊息 */}
              <div className="text-center py-6 bg-gradient-to-r from-focus-50 to-success-50 rounded-xl">
                <div className="text-2xl font-bold text-shadow-900 mb-2">
                  {getMotivationalMessage()}
                </div>
                <p className="text-shadow-600">
                  你已經連續學習了 {todayStats?.total_focus_time || 0} 分鐘
                </p>
              </div>

              {/* 今日數據 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <ClockIcon className="w-8 h-8 text-focus-600" />
                    <div>
                      <h3 className="font-semibold text-shadow-900">專注時間</h3>
                      <p className="text-2xl font-bold text-focus-600">
                        {formatTime(todayStats?.total_focus_time || 0)}
                      </p>
                    </div>
                  </div>
                  <p className={`text-sm ${getComparisonColor(todayStats?.total_focus_time || 0, yesterdayStats?.total_focus_time || 0)}`}>
                    {getComparisonText(todayStats?.total_focus_time || 0, yesterdayStats?.total_focus_time || 0)}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircleIcon className="w-8 h-8 text-success-600" />
                    <div>
                      <h3 className="font-semibold text-shadow-900">完成任務</h3>
                      <p className="text-2xl font-bold text-success-600">
                        {todayStats?.tasks_completed || 0} 個
                      </p>
                    </div>
                  </div>
                  <p className={`text-sm ${getComparisonColor(todayStats?.tasks_completed || 0, yesterdayStats?.tasks_completed || 0)}`}>
                    {getComparisonText(todayStats?.tasks_completed || 0, yesterdayStats?.tasks_completed || 0)}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <ChartBarIcon className="w-8 h-8 text-warning-600" />
                    <div>
                      <h3 className="font-semibold text-shadow-900">複習正確率</h3>
                      <p className="text-2xl font-bold text-warning-600">
                        {todayStats?.review_accuracy ? `${Math.round(todayStats.review_accuracy * 100)}%` : '0%'}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-shadow-600">
                    複習了 {todayStats?.reviews_completed || 0} 張卡片
                  </p>
                </div>
              </div>

              {/* 今日亮點 */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-shadow-900 mb-4">今日亮點</h3>
                <div className="space-y-3">
                  {todayStats?.longest_focus_session > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-focus-600 rounded-full"></div>
                      <span className="text-shadow-700">
                        最長專注時間：{formatTime(todayStats.longest_focus_session)}
                      </span>
                    </div>
                  )}
                  {todayStats?.peak_focus_hour !== null && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-success-600 rounded-full"></div>
                      <span className="text-shadow-700">
                        專注高峰時段：{getTimeLabel(todayStats.peak_focus_hour)}
                      </span>
                    </div>
                  )}
                  {todayStats?.cards_created > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-warning-600 rounded-full"></div>
                      <span className="text-shadow-700">
                        建立了 {todayStats.cards_created} 張記憶卡片
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 今日成就 */}
              {todayAchievements.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-shadow-900 mb-4 flex items-center gap-2">
                    <TrophyIcon className="w-6 h-6 text-warning-600" />
                    今日成就
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {todayAchievements.map((achievement) => (
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

              {/* 明日建議 */}
              <div className="bg-gradient-to-r from-focus-50 to-success-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-shadow-900 mb-4">明日建議</h3>
                <p className="text-shadow-700 leading-relaxed">
                  {getTomorrowSuggestion()}
                </p>
              </div>

              {/* 關閉按鈕 */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={onClose}
                  className="btn-primary px-8 py-3 text-lg"
                >
                  開始明天的學習旅程
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}