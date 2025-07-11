const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 使用 /tmp 目錄存儲 SQLite 資料庫（Vercel 唯一可寫目錄）
const DB_PATH = '/tmp/shadow-plan.db';

// 初始化資料庫
function initDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(err);
        return;
      }
      
      // 建立資料表
      db.serialize(() => {
        db.run(`
          CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            estimated_time INTEGER NOT NULL,
            importance INTEGER NOT NULL CHECK (importance BETWEEN 1 AND 5),
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        db.run(`
          CREATE TABLE IF NOT EXISTS memory_cards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            front TEXT NOT NULL,
            back TEXT NOT NULL,
            category TEXT DEFAULT 'user_created',
            source_task_id INTEGER,
            ease_factor REAL DEFAULT 2.5,
            interval_days INTEGER DEFAULT 1,
            repetitions INTEGER DEFAULT 0,
            next_review_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_review_date DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (source_task_id) REFERENCES tasks (id)
          )
        `);
        
        db.run(`
          CREATE TABLE IF NOT EXISTS achievements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER DEFAULT 1,
            badge_type TEXT NOT NULL,
            badge_name TEXT NOT NULL,
            description TEXT,
            earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            value INTEGER DEFAULT 0
          )
        `);
        
        db.run(`
          CREATE TABLE IF NOT EXISTS daily_stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER DEFAULT 1,
            date DATE NOT NULL,
            total_focus_time INTEGER DEFAULT 0,
            tasks_completed INTEGER DEFAULT 0,
            tasks_created INTEGER DEFAULT 0,
            reviews_completed INTEGER DEFAULT 0,
            review_accuracy REAL DEFAULT 0.0,
            cards_created INTEGER DEFAULT 0,
            peak_focus_hour INTEGER,
            longest_focus_session INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, date)
          )
        `);
        
        resolve(db);
      });
    });
  });
}

// Vercel Serverless Function
export default async function handler(req, res) {
  // 設定 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    const db = await initDatabase();
    
    switch (req.method) {
      case 'GET':
        db.all('SELECT * FROM tasks ORDER BY created_at DESC', (err, rows) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json(rows);
        });
        break;
        
      case 'POST':
        const { title, description, estimated_time, importance } = req.body;
        
        if (!title || !estimated_time || !importance) {
          res.status(400).json({ error: '標題、預估時間和重要程度為必填欄位' });
          return;
        }
        
        db.run(
          'INSERT INTO tasks (title, description, estimated_time, importance) VALUES (?, ?, ?, ?)',
          [title, description, estimated_time, importance],
          function(err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            res.json({ id: this.lastID, message: '任務新增成功' });
          }
        );
        break;
        
      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}