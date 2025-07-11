import { useEffect } from 'react';

interface AchievementSystemProps {
  onAchievementUnlocked: (achievement: {
    badge_type: string;
    badge_name: string;
    description: string;
    value?: number;
  }) => void;
}

export default function AchievementSystem({ onAchievementUnlocked }: AchievementSystemProps) {
  
  // 檢查專注時間成就
  const checkFocusAchievements = async (totalFocusTime: number, sessionDuration: number) => {
    const achievements = [];
    
    // 首次專注成就
    if (totalFocusTime === sessionDuration && sessionDuration >= 25) {
      achievements.push({
        badge_type: 'focus_milestone',
        badge_name: '專注新手',
        description: '完成第一次專注學習',
        value: 25
      });
    }
    
    // 專注時間里程碑
    if (sessionDuration >= 90) {
      achievements.push({
        badge_type: 'focus_milestone',
        badge_name: '專注大師',
        description: '單次專注時間達到90分鐘',
        value: 90
      });
    } else if (sessionDuration >= 60) {
      achievements.push({
        badge_type: 'focus_milestone',
        badge_name: '專注達人',
        description: '單次專注時間達到60分鐘',
        value: 60
      });
    } else if (sessionDuration >= 45) {
      achievements.push({
        badge_type: 'focus_milestone',
        badge_name: '專注進階',
        description: '單次專注時間達到45分鐘',
        value: 45
      });
    }
    
    // 總專注時間成就
    if (totalFocusTime >= 3000) {
      achievements.push({
        badge_type: 'total_focus',
        badge_name: '學習狂人',
        description: '累積專注時間達到50小時',
        value: 3000
      });
    } else if (totalFocusTime >= 1200) {
      achievements.push({
        badge_type: 'total_focus',
        badge_name: '學習達人',
        description: '累積專注時間達到20小時',
        value: 1200
      });
    } else if (totalFocusTime >= 600) {
      achievements.push({
        badge_type: 'total_focus',
        badge_name: '學習愛好者',
        description: '累積專注時間達到10小時',
        value: 600
      });
    }
    
    // 批量提交成就
    for (const achievement of achievements) {
      try {
        await submitAchievement(achievement);
        onAchievementUnlocked(achievement);
      } catch (error) {
        console.error('提交成就失敗:', error);
      }
    }
  };

  // 檢查任務完成成就
  const checkTaskAchievements = async (totalTasks: number, todayTasks: number) => {
    const achievements = [];
    
    // 首次完成任務
    if (totalTasks === 1) {
      achievements.push({
        badge_type: 'task_milestone',
        badge_name: '任務新手',
        description: '完成第一個學習任務',
        value: 1
      });
    }
    
    // 任務完成里程碑
    if (totalTasks >= 100) {
      achievements.push({
        badge_type: 'task_milestone',
        badge_name: '任務達人',
        description: '累積完成100個任務',
        value: 100
      });
    } else if (totalTasks >= 50) {
      achievements.push({
        badge_type: 'task_milestone',
        badge_name: '任務高手',
        description: '累積完成50個任務',
        value: 50
      });
    } else if (totalTasks >= 20) {
      achievements.push({
        badge_type: 'task_milestone',
        badge_name: '任務專家',
        description: '累積完成20個任務',
        value: 20
      });
    }
    
    // 單日任務成就
    if (todayTasks >= 10) {
      achievements.push({
        badge_type: 'daily_task',
        badge_name: '效率之王',
        description: '單日完成10個任務',
        value: 10
      });
    } else if (todayTasks >= 5) {
      achievements.push({
        badge_type: 'daily_task',
        badge_name: '高效學習者',
        description: '單日完成5個任務',
        value: 5
      });
    }
    
    // 批量提交成就
    for (const achievement of achievements) {
      try {
        await submitAchievement(achievement);
        onAchievementUnlocked(achievement);
      } catch (error) {
        console.error('提交成就失敗:', error);
      }
    }
  };

  // 檢查複習成就
  const checkReviewAchievements = async (totalReviews: number, accuracy: number, streak: number) => {
    const achievements = [];
    
    // 首次複習
    if (totalReviews === 1) {
      achievements.push({
        badge_type: 'review_milestone',
        badge_name: '複習新手',
        description: '完成第一次記憶複習',
        value: 1
      });
    }
    
    // 複習次數成就
    if (totalReviews >= 500) {
      achievements.push({
        badge_type: 'review_milestone',
        badge_name: '記憶大師',
        description: '累積複習500次',
        value: 500
      });
    } else if (totalReviews >= 100) {
      achievements.push({
        badge_type: 'review_milestone',
        badge_name: '記憶達人',
        description: '累積複習100次',
        value: 100
      });
    } else if (totalReviews >= 50) {
      achievements.push({
        badge_type: 'review_milestone',
        badge_name: '記憶高手',
        description: '累積複習50次',
        value: 50
      });
    }
    
    // 準確率成就
    if (accuracy >= 0.95 && totalReviews >= 20) {
      achievements.push({
        badge_type: 'accuracy',
        badge_name: '完美記憶',
        description: '複習準確率達到95%以上',
        value: 95
      });
    } else if (accuracy >= 0.85 && totalReviews >= 10) {
      achievements.push({
        badge_type: 'accuracy',
        badge_name: '優秀記憶',
        description: '複習準確率達到85%以上',
        value: 85
      });
    }
    
    // 連續複習成就
    if (streak >= 30) {
      achievements.push({
        badge_type: 'streak',
        badge_name: '堅持大師',
        description: '連續複習30天',
        value: 30
      });
    } else if (streak >= 14) {
      achievements.push({
        badge_type: 'streak',
        badge_name: '堅持達人',
        description: '連續複習14天',
        value: 14
      });
    } else if (streak >= 7) {
      achievements.push({
        badge_type: 'streak',
        badge_name: '堅持之星',
        description: '連續複習7天',
        value: 7
      });
    }
    
    // 批量提交成就
    for (const achievement of achievements) {
      try {
        await submitAchievement(achievement);
        onAchievementUnlocked(achievement);
      } catch (error) {
        console.error('提交成就失敗:', error);
      }
    }
  };

  // 檢查學習習慣成就
  const checkHabitAchievements = async (studyDays: number, longestStreak: number) => {
    const achievements = [];
    
    // 連續學習天數成就
    if (longestStreak >= 100) {
      achievements.push({
        badge_type: 'habit',
        badge_name: '學習傳奇',
        description: '連續學習100天',
        value: 100
      });
    } else if (longestStreak >= 50) {
      achievements.push({
        badge_type: 'habit',
        badge_name: '學習大師',
        description: '連續學習50天',
        value: 50
      });
    } else if (longestStreak >= 30) {
      achievements.push({
        badge_type: 'habit',
        badge_name: '習慣養成者',
        description: '連續學習30天',
        value: 30
      });
    } else if (longestStreak >= 14) {
      achievements.push({
        badge_type: 'habit',
        badge_name: '堅持學習者',
        description: '連續學習14天',
        value: 14
      });
    } else if (longestStreak >= 7) {
      achievements.push({
        badge_type: 'habit',
        badge_name: '週習慣',
        description: '連續學習7天',
        value: 7
      });
    }
    
    // 總學習天數成就
    if (studyDays >= 365) {
      achievements.push({
        badge_type: 'total_days',
        badge_name: '年度學習者',
        description: '累積學習365天',
        value: 365
      });
    } else if (studyDays >= 100) {
      achievements.push({
        badge_type: 'total_days',
        badge_name: '百日學習者',
        description: '累積學習100天',
        value: 100
      });
    } else if (studyDays >= 50) {
      achievements.push({
        badge_type: 'total_days',
        badge_name: '持續學習者',
        description: '累積學習50天',
        value: 50
      });
    }
    
    // 批量提交成就
    for (const achievement of achievements) {
      try {
        await submitAchievement(achievement);
        onAchievementUnlocked(achievement);
      } catch (error) {
        console.error('提交成就失敗:', error);
      }
    }
  };

  // 提交成就到伺服器
  const submitAchievement = async (achievement: {
    badge_type: string;
    badge_name: string;
    description: string;
    value?: number;
  }) => {
    const response = await fetch('http://localhost:3000/api/achievements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(achievement),
    });

    if (!response.ok) {
      const error = await response.json();
      if (error.error !== '已經獲得此徽章') {
        throw new Error(error.error || '提交成就失敗');
      }
    }
  };

  // 暴露檢查方法供外部使用
  useEffect(() => {
    // 將檢查方法綁定到 window 對象，供其他組件使用
    (window as any).achievementSystem = {
      checkFocusAchievements,
      checkTaskAchievements,
      checkReviewAchievements,
      checkHabitAchievements,
    };
  }, []);

  return null; // 這個組件不需要渲染任何 UI
}