const sqlite3 = require('sqlite3').verbose();

const DB_PATH = '/tmp/shadow-plan.db';

function initDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(err);
        return;
      }
      
      // 建立所有必要的表格
      db.serialize(() => {
        // 任務表
        db.run(`
          CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            estimated_time INTEGER DEFAULT 0,
            importance INTEGER DEFAULT 1 CHECK (importance BETWEEN 1 AND 5),
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // 記憶卡片表
        db.run(`
          CREATE TABLE IF NOT EXISTS memory_cards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            front TEXT NOT NULL,
            back TEXT NOT NULL,
            category TEXT DEFAULT 'user_created',
            source_task_id INTEGER,
            interval INTEGER DEFAULT 1,
            easiness_factor REAL DEFAULT 2.5,
            review_count INTEGER DEFAULT 0,
            next_review_date DATE DEFAULT CURRENT_DATE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (source_task_id) REFERENCES tasks(id)
          )
        `);
        
        // 專注會話表
        db.run(`
          CREATE TABLE IF NOT EXISTS focus_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_id INTEGER NOT NULL,
            start_time DATETIME NOT NULL,
            end_time DATETIME NOT NULL,
            duration INTEGER NOT NULL,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (task_id) REFERENCES tasks(id)
          )
        `);
        
        // 成就表
        db.run(`
          CREATE TABLE IF NOT EXISTS achievements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            badge_type TEXT NOT NULL,
            badge_name TEXT NOT NULL,
            description TEXT,
            value INTEGER DEFAULT 0,
            earned_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // 每日統計表
        db.run(`
          CREATE TABLE IF NOT EXISTS daily_stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATE NOT NULL UNIQUE,
            total_focus_time INTEGER DEFAULT 0,
            tasks_completed INTEGER DEFAULT 0,
            tasks_created INTEGER DEFAULT 0,
            reviews_completed INTEGER DEFAULT 0,
            review_accuracy REAL DEFAULT 0,
            cards_created INTEGER DEFAULT 0,
            peak_focus_hour INTEGER,
            longest_focus_session INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // 每週統計表
        db.run(`
          CREATE TABLE IF NOT EXISTS weekly_stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            week TEXT NOT NULL UNIQUE,
            total_focus_time INTEGER DEFAULT 0,
            tasks_completed INTEGER DEFAULT 0,
            tasks_created INTEGER DEFAULT 0,
            reviews_completed INTEGER DEFAULT 0,
            average_review_accuracy REAL DEFAULT 0,
            cards_created INTEGER DEFAULT 0,
            achievements_earned INTEGER DEFAULT 0,
            most_productive_day TEXT,
            longest_focus_session INTEGER DEFAULT 0,
            focus_consistency REAL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // 每月統計表
        db.run(`
          CREATE TABLE IF NOT EXISTS monthly_stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            month TEXT NOT NULL UNIQUE,
            total_focus_time INTEGER DEFAULT 0,
            tasks_completed INTEGER DEFAULT 0,
            tasks_created INTEGER DEFAULT 0,
            reviews_completed INTEGER DEFAULT 0,
            average_review_accuracy REAL DEFAULT 0,
            cards_created INTEGER DEFAULT 0,
            achievements_earned INTEGER DEFAULT 0,
            most_productive_week TEXT,
            longest_focus_session INTEGER DEFAULT 0,
            focus_consistency REAL DEFAULT 0,
            learning_streak INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // 教材庫表
        db.run(`
          CREATE TABLE IF NOT EXISTS material_library (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            subcategory TEXT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            tags TEXT,
            difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        resolve(db);
      });
    });
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    const db = await initDatabase();
    res.json({ message: '資料庫初始化成功', timestamp: new Date().toISOString() });
    db.close();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}