const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// 資料庫設定
const DB_PATH = path.join(__dirname, 'data', 'shadow-plan.db');

// 確保 data 目錄存在
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

// 初始化資料庫
const db = new sqlite3.Database(DB_PATH);

// 建立資料表
db.serialize(() => {
  // 任務資料表
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

  // 專注記錄資料表
  db.run(`
    CREATE TABLE IF NOT EXISTS focus_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER,
      duration INTEGER NOT NULL,
      started_at DATETIME NOT NULL,
      completed_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks (id)
    )
  `);

  // SRS 記憶卡片資料表
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

  // 複習記錄資料表
  db.run(`
    CREATE TABLE IF NOT EXISTS review_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      card_id INTEGER NOT NULL,
      quality INTEGER NOT NULL CHECK (quality BETWEEN 0 AND 5),
      response_time INTEGER,
      previous_ease_factor REAL,
      new_ease_factor REAL,
      previous_interval INTEGER,
      new_interval INTEGER,
      reviewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (card_id) REFERENCES memory_cards (id)
    )
  `);

  // 預建教材庫資料表
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
  `, () => {
    // 插入示例資料
    db.get("SELECT COUNT(*) as count FROM material_library", (err, row) => {
      if (err) {
        console.error('檢查教材庫資料時發生錯誤:', err);
        return;
      }
      
      if (row.count === 0) {
        console.log('初始化教材庫資料...');
        insertSampleMaterials();
      }
    });
  });

  // 成就徽章資料表
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

  // 每日統計資料表
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

  // 學習會話詳細記錄
  db.run(`
    CREATE TABLE IF NOT EXISTS study_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER DEFAULT 1,
      session_type TEXT NOT NULL, -- 'focus', 'review', 'learning'
      subject TEXT,
      duration INTEGER NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      performance_score REAL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// 中介軟體
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API 路由
app.get('/api/tasks', (req, res) => {
  db.all('SELECT * FROM tasks ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post('/api/tasks', (req, res) => {
  const { title, description, estimated_time, importance } = req.body;
  
  if (!title || !estimated_time || !importance) {
    return res.status(400).json({ error: '標題、預估時間和重要程度為必填欄位' });
  }

  db.run(
    'INSERT INTO tasks (title, description, estimated_time, importance) VALUES (?, ?, ?, ?)',
    [title, description, estimated_time, importance],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, message: '任務新增成功' });
    }
  );
});

app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, estimated_time, importance, status } = req.body;

  db.run(
    'UPDATE tasks SET title = ?, description = ?, estimated_time = ?, importance = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [title, description, estimated_time, importance, status, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: '任務未找到' });
      }
      res.json({ message: '任務更新成功' });
    }
  );
});

app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: '任務未找到' });
    }
    res.json({ message: '任務刪除成功' });
  });
});

// 專注記錄 API
app.post('/api/focus-sessions', (req, res) => {
  const { task_id, duration, started_at, completed_at } = req.body;
  
  db.run(
    'INSERT INTO focus_sessions (task_id, duration, started_at, completed_at) VALUES (?, ?, ?, ?)',
    [task_id, duration, started_at, completed_at],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, message: '專注記錄新增成功' });
    }
  );
});

// SRS 記憶卡片 API
app.get('/api/memory-cards', (req, res) => {
  db.all('SELECT * FROM memory_cards ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post('/api/memory-cards', (req, res) => {
  const { front, back, category, source_task_id } = req.body;
  
  if (!front || !back) {
    return res.status(400).json({ error: '正面和背面內容為必填欄位' });
  }

  db.run(
    'INSERT INTO memory_cards (front, back, category, source_task_id) VALUES (?, ?, ?, ?)',
    [front, back, category || 'user_created', source_task_id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, message: '記憶卡片新增成功' });
    }
  );
});

app.put('/api/memory-cards/:id', (req, res) => {
  const { id } = req.params;
  const { front, back, category } = req.body;

  db.run(
    'UPDATE memory_cards SET front = ?, back = ?, category = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [front, back, category, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: '記憶卡片未找到' });
      }
      res.json({ message: '記憶卡片更新成功' });
    }
  );
});

app.delete('/api/memory-cards/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM memory_cards WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: '記憶卡片未找到' });
    }
    res.json({ message: '記憶卡片刪除成功' });
  });
});

// 獲取待複習的卡片
app.get('/api/memory-cards/due', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  db.all(
    'SELECT * FROM memory_cards WHERE next_review_date <= ? ORDER BY next_review_date ASC',
    [today],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// 記錄複習結果並更新 SRS 參數
app.post('/api/memory-cards/:id/review', (req, res) => {
  const { id } = req.params;
  const { quality, response_time } = req.body;
  
  if (quality < 0 || quality > 5) {
    return res.status(400).json({ error: '品質評分必須在 0-5 之間' });
  }

  // 先獲取當前卡片資訊
  db.get('SELECT * FROM memory_cards WHERE id = ?', [id], (err, card) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!card) {
      return res.status(404).json({ error: '記憶卡片未找到' });
    }

    // 計算新的 SRS 參數
    const srsResult = calculateSRS(card, quality);
    
    // 更新記憶卡片
    db.run(
      `UPDATE memory_cards SET 
       ease_factor = ?, 
       interval_days = ?, 
       repetitions = ?, 
       next_review_date = ?, 
       last_review_date = CURRENT_TIMESTAMP,
       updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [srsResult.ease_factor, srsResult.interval_days, srsResult.repetitions, srsResult.next_review_date, id],
      function(updateErr) {
        if (updateErr) {
          return res.status(500).json({ error: updateErr.message });
        }

        // 記錄複習歷史
        db.run(
          `INSERT INTO review_records 
           (card_id, quality, response_time, previous_ease_factor, new_ease_factor, previous_interval, new_interval) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [id, quality, response_time, card.ease_factor, srsResult.ease_factor, card.interval_days, srsResult.interval_days],
          function(recordErr) {
            if (recordErr) {
              console.error('記錄複習歷史時發生錯誤:', recordErr.message);
            }
            res.json({ 
              message: '複習記錄成功',
              next_review_date: srsResult.next_review_date,
              interval_days: srsResult.interval_days
            });
          }
        );
      }
    );
  });
});

// 預建教材庫 API
app.get('/api/material-library', (req, res) => {
  const { category, subcategory } = req.query;
  let query = 'SELECT * FROM material_library WHERE is_active = 1';
  let params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (subcategory) {
    query += ' AND subcategory = ?';
    params.push(subcategory);
  }

  query += ' ORDER BY category, subcategory, title';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.get('/api/material-library/categories', (req, res) => {
  db.all(`
    SELECT DISTINCT category, subcategory 
    FROM material_library 
    WHERE is_active = 1 
    ORDER BY category, subcategory
  `, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// 將教材庫內容加入記憶卡片
app.post('/api/material-library/:id/add-to-memory', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM material_library WHERE id = ?', [id], (err, material) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!material) {
      return res.status(404).json({ error: '教材未找到' });
    }

    // 將教材內容轉換為記憶卡片
    db.run(
      'INSERT INTO memory_cards (front, back, category, source_task_id) VALUES (?, ?, ?, NULL)',
      [material.title, material.content, `library_${material.category}`],
      function(insertErr) {
        if (insertErr) {
          return res.status(500).json({ error: insertErr.message });
        }
        res.json({ 
          id: this.lastID, 
          message: '已加入記憶卡片',
          card_id: this.lastID
        });
      }
    );
  });
});

// SRS 演算法實作
function calculateSRS(card, quality) {
  let { ease_factor, interval_days, repetitions } = card;
  
  // SM-2 演算法實作
  if (quality >= 3) {
    if (repetitions === 0) {
      interval_days = 1;
    } else if (repetitions === 1) {
      interval_days = 6;
    } else {
      interval_days = Math.round(interval_days * ease_factor);
    }
    repetitions += 1;
  } else {
    repetitions = 0;
    interval_days = 1;
  }
  
  // 更新 ease_factor
  ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (ease_factor < 1.3) {
    ease_factor = 1.3;
  }
  
  // 計算下次複習日期
  const next_review_date = new Date();
  next_review_date.setDate(next_review_date.getDate() + interval_days);
  
  return {
    ease_factor: Math.round(ease_factor * 100) / 100,
    interval_days,
    repetitions,
    next_review_date: next_review_date.toISOString().split('T')[0]
  };
}

// 插入示例教材資料
function insertSampleMaterials() {
  const sampleMaterials = [
    // 高中數學 - 三角函數
    {
      category: '高中數學',
      subcategory: '三角函數',
      title: '正弦定理',
      content: 'a/sin(A) = b/sin(B) = c/sin(C) = 2R\n其中 a, b, c 為三角形的三邊長，A, B, C 為對應的角，R 為外接圓半徑。',
      tags: '三角函數,定理,幾何',
      difficulty_level: 3
    },
    {
      category: '高中數學',
      subcategory: '三角函數',
      title: '餘弦定理',
      content: 'c² = a² + b² - 2ab·cos(C)\n用於計算三角形中任一邊長或角度。',
      tags: '三角函數,定理,幾何',
      difficulty_level: 3
    },
    {
      category: '高中數學',
      subcategory: '三角函數',
      title: '三角函數恆等式',
      content: 'sin²θ + cos²θ = 1\ntan θ = sin θ / cos θ\n1 + tan²θ = sec²θ',
      tags: '三角函數,恆等式',
      difficulty_level: 2
    },
    
    // 高中數學 - 圓與直線
    {
      category: '高中數學',
      subcategory: '圓與直線',
      title: '圓的標準式',
      content: '(x - h)² + (y - k)² = r²\n其中 (h, k) 為圓心，r 為半徑。',
      tags: '圓,幾何,座標',
      difficulty_level: 2
    },
    {
      category: '高中數學',
      subcategory: '圓與直線',
      title: '直線方程式',
      content: '點斜式：y - y₁ = m(x - x₁)\n斜截式：y = mx + b\n一般式：ax + by + c = 0',
      tags: '直線,方程式,座標',
      difficulty_level: 2
    },
    
    // 高中數學 - 指數與對數
    {
      category: '高中數學',
      subcategory: '指數與對數',
      title: '指數律',
      content: 'aᵐ · aⁿ = aᵐ⁺ⁿ\n(aᵐ)ⁿ = aᵐⁿ\naᵐ / aⁿ = aᵐ⁻ⁿ',
      tags: '指數,運算法則',
      difficulty_level: 2
    },
    {
      category: '高中數學',
      subcategory: '指數與對數',
      title: '對數性質',
      content: 'log(ab) = log a + log b\nlog(a/b) = log a - log b\nlog(aⁿ) = n log a',
      tags: '對數,運算法則',
      difficulty_level: 3
    },
    
    // 英文 7000 字
    {
      category: '英文 7000 字',
      subcategory: '基礎 1000 字',
      title: 'achieve',
      content: '[動詞] 達成、完成、實現\n例句：She achieved her goal of becoming a doctor.\n(她達成了成為醫生的目標。)',
      tags: '動詞,目標,成就',
      difficulty_level: 2
    },
    {
      category: '英文 7000 字',
      subcategory: '基礎 1000 字',
      title: 'develop',
      content: '[動詞] 發展、開發、培養\n例句：The company plans to develop new products.\n(公司計劃開發新產品。)',
      tags: '動詞,發展,進步',
      difficulty_level: 2
    },
    {
      category: '英文 7000 字',
      subcategory: '基礎 1000 字',
      title: 'environment',
      content: '[名詞] 環境、周圍環境\n例句：We should protect our environment.\n(我們應該保護環境。)',
      tags: '名詞,環境,自然',
      difficulty_level: 2
    },
    {
      category: '英文 7000 字',
      subcategory: '基礎 1000 字',
      title: 'analysis',
      content: '[名詞] 分析、解析\n例句：The analysis shows positive results.\n(分析顯示正面的結果。)',
      tags: '名詞,分析,研究',
      difficulty_level: 3
    },
    
    // 物理
    {
      category: '高中物理',
      subcategory: '力學',
      title: '牛頓第二定律',
      content: 'F = ma\n力 = 質量 × 加速度\n當物體受到淨力作用時，會產生與力同方向的加速度。',
      tags: '力學,運動,定律',
      difficulty_level: 3
    },
    {
      category: '高中物理',
      subcategory: '力學',
      title: '動能定理',
      content: 'Ek = ½mv²\n物體的動能等於½乘以質量乘以速度的平方。',
      tags: '力學,能量,運動',
      difficulty_level: 3
    },
    {
      category: '高中物理',
      subcategory: '電磁學',
      title: '歐姆定律',
      content: 'V = IR\n電壓 = 電流 × 電阻\n描述電路中電壓、電流與電阻之間的關係。',
      tags: '電磁學,電路,定律',
      difficulty_level: 2
    },
    
    // 化學
    {
      category: '高中化學',
      subcategory: '基礎化學',
      title: '原子結構',
      content: '原子由質子、中子和電子組成\n質子帶正電，中子不帶電，電子帶負電\n質子和中子位於原子核，電子繞原子核運動。',
      tags: '原子,結構,基礎',
      difficulty_level: 2
    },
    {
      category: '高中化學',
      subcategory: '基礎化學',
      title: '化學鍵',
      content: '離子鍵：金屬與非金屬之間的電子轉移\n共價鍵：非金屬之間的電子共用\n金屬鍵：金屬原子之間的電子海',
      tags: '化學鍵,結合,分子',
      difficulty_level: 3
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO material_library (category, subcategory, title, content, tags, difficulty_level)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  sampleMaterials.forEach(material => {
    stmt.run(
      material.category,
      material.subcategory,
      material.title,
      material.content,
      material.tags,
      material.difficulty_level
    );
  });

  stmt.finalize();
  console.log('教材庫示例資料初始化完成！');
}

// 統計與分析 API
app.get('/api/stats/daily', (req, res) => {
  const { date } = req.query;
  const targetDate = date || new Date().toISOString().split('T')[0];
  
  db.get('SELECT * FROM daily_stats WHERE date = ?', [targetDate], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!row) {
      // 如果沒有當天資料，返回空的統計
      return res.json({
        date: targetDate,
        total_focus_time: 0,
        tasks_completed: 0,
        tasks_created: 0,
        reviews_completed: 0,
        review_accuracy: 0,
        cards_created: 0,
        peak_focus_hour: null,
        longest_focus_session: 0
      });
    }
    
    res.json(row);
  });
});

app.get('/api/stats/weekly', (req, res) => {
  const { startDate, endDate } = req.query;
  
  db.all(
    `SELECT * FROM daily_stats 
     WHERE date >= ? AND date <= ? 
     ORDER BY date ASC`,
    [startDate, endDate],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      const weeklyStats = {
        daily_breakdown: rows,
        total_focus_time: rows.reduce((sum, day) => sum + day.total_focus_time, 0),
        total_tasks_completed: rows.reduce((sum, day) => sum + day.tasks_completed, 0),
        total_reviews: rows.reduce((sum, day) => sum + day.reviews_completed, 0),
        average_accuracy: rows.length > 0 ? 
          rows.reduce((sum, day) => sum + day.review_accuracy, 0) / rows.length : 0,
        study_days: rows.filter(day => day.total_focus_time > 0).length
      };
      
      res.json(weeklyStats);
    }
  );
});

app.get('/api/stats/monthly', (req, res) => {
  const { year, month } = req.query;
  
  db.all(
    `SELECT * FROM daily_stats 
     WHERE strftime('%Y', date) = ? AND strftime('%m', date) = ?
     ORDER BY date ASC`,
    [year, month],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      const monthlyStats = {
        daily_breakdown: rows,
        total_focus_time: rows.reduce((sum, day) => sum + day.total_focus_time, 0),
        total_tasks_completed: rows.reduce((sum, day) => sum + day.tasks_completed, 0),
        total_reviews: rows.reduce((sum, day) => sum + day.reviews_completed, 0),
        average_accuracy: rows.length > 0 ? 
          rows.reduce((sum, day) => sum + day.review_accuracy, 0) / rows.length : 0,
        study_days: rows.filter(day => day.total_focus_time > 0).length,
        longest_streak: calculateStreak(rows)
      };
      
      res.json(monthlyStats);
    }
  );
});

// 更新每日統計
app.post('/api/stats/daily/update', (req, res) => {
  const { date, updates } = req.body;
  const targetDate = date || new Date().toISOString().split('T')[0];
  
  // 使用 INSERT OR REPLACE 確保資料存在
  db.run(
    `INSERT OR REPLACE INTO daily_stats 
     (user_id, date, total_focus_time, tasks_completed, tasks_created, 
      reviews_completed, review_accuracy, cards_created, peak_focus_hour, 
      longest_focus_session, updated_at)
     VALUES (1, ?, 
             COALESCE((SELECT total_focus_time FROM daily_stats WHERE date = ?) + ?, ?),
             COALESCE((SELECT tasks_completed FROM daily_stats WHERE date = ?) + ?, ?),
             COALESCE((SELECT tasks_created FROM daily_stats WHERE date = ?) + ?, ?),
             COALESCE((SELECT reviews_completed FROM daily_stats WHERE date = ?) + ?, ?),
             COALESCE(?, (SELECT review_accuracy FROM daily_stats WHERE date = ?)),
             COALESCE((SELECT cards_created FROM daily_stats WHERE date = ?) + ?, ?),
             COALESCE(?, (SELECT peak_focus_hour FROM daily_stats WHERE date = ?)),
             COALESCE(?, (SELECT longest_focus_session FROM daily_stats WHERE date = ?)),
             CURRENT_TIMESTAMP)`,
    [
      targetDate, 
      targetDate, updates.total_focus_time || 0, updates.total_focus_time || 0,
      targetDate, updates.tasks_completed || 0, updates.tasks_completed || 0,
      targetDate, updates.tasks_created || 0, updates.tasks_created || 0,
      targetDate, updates.reviews_completed || 0, updates.reviews_completed || 0,
      updates.review_accuracy, targetDate,
      targetDate, updates.cards_created || 0, updates.cards_created || 0,
      updates.peak_focus_hour, targetDate,
      updates.longest_focus_session, targetDate
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: '統計更新成功' });
    }
  );
});

// 成就徽章 API
app.get('/api/achievements', (req, res) => {
  db.all(
    'SELECT * FROM achievements ORDER BY earned_at DESC',
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

app.post('/api/achievements', (req, res) => {
  const { badge_type, badge_name, description, value } = req.body;
  
  // 檢查是否已經有相同的徽章
  db.get(
    'SELECT * FROM achievements WHERE badge_type = ? AND badge_name = ?',
    [badge_type, badge_name],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (row) {
        return res.status(400).json({ error: '已經獲得此徽章' });
      }
      
      // 新增徽章
      db.run(
        'INSERT INTO achievements (badge_type, badge_name, description, value) VALUES (?, ?, ?, ?)',
        [badge_type, badge_name, description, value || 0],
        function(insertErr) {
          if (insertErr) {
            return res.status(500).json({ error: insertErr.message });
          }
          res.json({ 
            id: this.lastID, 
            message: '成就徽章獲得！',
            badge_name 
          });
        }
      );
    }
  );
});

// 學習會話記錄 API
app.post('/api/study-sessions', (req, res) => {
  const { session_type, subject, duration, start_time, end_time, performance_score, notes } = req.body;
  
  db.run(
    `INSERT INTO study_sessions 
     (session_type, subject, duration, start_time, end_time, performance_score, notes) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [session_type, subject, duration, start_time, end_time, performance_score, notes],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, message: '學習會話記錄成功' });
    }
  );
});

// 個人化分析 API
app.get('/api/analysis/personal', (req, res) => {
  const { days = 30 } = req.query;
  
  // 獲取最近 N 天的學習會話
  db.all(
    `SELECT * FROM study_sessions 
     WHERE start_time >= datetime('now', '-${days} days')
     ORDER BY start_time DESC`,
    (err, sessions) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      const analysis = analyzePersonalData(sessions);
      res.json(analysis);
    }
  );
});

// 計算連續學習天數
function calculateStreak(dailyStats) {
  let currentStreak = 0;
  let maxStreak = 0;
  
  for (let i = dailyStats.length - 1; i >= 0; i--) {
    if (dailyStats[i].total_focus_time > 0) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  
  return maxStreak;
}

// 個人化數據分析
function analyzePersonalData(sessions) {
  if (sessions.length === 0) {
    return {
      peak_hours: [],
      best_subjects: [],
      focus_patterns: {},
      recommendations: []
    };
  }
  
  // 分析最佳專注時段
  const hourlyPerformance = {};
  sessions.forEach(session => {
    const hour = new Date(session.start_time).getHours();
    if (!hourlyPerformance[hour]) {
      hourlyPerformance[hour] = { total_duration: 0, count: 0 };
    }
    hourlyPerformance[hour].total_duration += session.duration;
    hourlyPerformance[hour].count++;
  });
  
  const peakHours = Object.entries(hourlyPerformance)
    .map(([hour, data]) => ({
      hour: parseInt(hour),
      avg_duration: data.total_duration / data.count,
      sessions: data.count
    }))
    .sort((a, b) => b.avg_duration - a.avg_duration)
    .slice(0, 3);
  
  // 分析最佳學科
  const subjectPerformance = {};
  sessions.forEach(session => {
    if (session.subject) {
      if (!subjectPerformance[session.subject]) {
        subjectPerformance[session.subject] = { 
          total_duration: 0, 
          count: 0, 
          avg_score: 0 
        };
      }
      subjectPerformance[session.subject].total_duration += session.duration;
      subjectPerformance[session.subject].count++;
      if (session.performance_score) {
        subjectPerformance[session.subject].avg_score += session.performance_score;
      }
    }
  });
  
  const bestSubjects = Object.entries(subjectPerformance)
    .map(([subject, data]) => ({
      subject,
      avg_duration: data.total_duration / data.count,
      sessions: data.count,
      avg_score: data.avg_score / data.count || 0
    }))
    .sort((a, b) => b.avg_duration - a.avg_duration)
    .slice(0, 3);
  
  // 生成個人化建議
  const recommendations = [];
  
  if (peakHours.length > 0) {
    const bestHour = peakHours[0].hour;
    const timeLabel = bestHour < 12 ? '上午' : bestHour < 18 ? '下午' : '晚上';
    recommendations.push(`你的黃金專注時段是${timeLabel}${bestHour}點，建議安排重要任務在此時間`);
  }
  
  if (bestSubjects.length > 0) {
    recommendations.push(`${bestSubjects[0].subject}是你的最高效學習科目，可以作為每日學習的開始`);
  }
  
  return {
    peak_hours: peakHours,
    best_subjects: bestSubjects,
    focus_patterns: {
      total_sessions: sessions.length,
      avg_session_duration: sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length,
      most_active_hour: peakHours[0]?.hour || null
    },
    recommendations
  };
}

// 處理 SPA 路由
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`影子計劃伺服器運行於 http://localhost:${PORT}`);
});

// 優雅關閉
process.on('SIGINT', () => {
  console.log('\n正在關閉伺服器...');
  db.close((err) => {
    if (err) {
      console.error('關閉資料庫時發生錯誤:', err.message);
    } else {
      console.log('資料庫連接已關閉');
    }
    process.exit(0);
  });
});