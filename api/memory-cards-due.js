const sqlite3 = require('sqlite3').verbose();

const DB_PATH = '/tmp/shadow-plan.db';

function initDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(db);
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
    
    switch (req.method) {
      case 'GET':
        const currentDate = new Date().toISOString().split('T')[0];
        db.all(
          'SELECT * FROM memory_cards WHERE next_review_date <= ? ORDER BY next_review_date ASC',
          [currentDate],
          (err, rows) => {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            res.json(rows);
          }
        );
        break;
        
      case 'PUT':
        const { id, quality } = req.body;
        
        if (!id || typeof quality !== 'number') {
          res.status(400).json({ error: '無效的請求參數' });
          return;
        }
        
        // 計算下次復習時間 (簡化的 SRS 算法)
        const intervals = [1, 6, 25, 150];
        const factor = quality >= 3 ? 1.3 : 0.8;
        
        db.get('SELECT * FROM memory_cards WHERE id = ?', [id], (err, card) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          
          if (!card) {
            res.status(404).json({ error: '找不到指定的記憶卡片' });
            return;
          }
          
          const currentInterval = card.interval || 1;
          const newInterval = Math.max(1, Math.round(currentInterval * factor));
          const nextReviewDate = new Date();
          nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);
          
          db.run(
            'UPDATE memory_cards SET interval = ?, next_review_date = ?, easiness_factor = ?, review_count = review_count + 1 WHERE id = ?',
            [newInterval, nextReviewDate.toISOString().split('T')[0], factor, id],
            function(err) {
              if (err) {
                res.status(500).json({ error: err.message });
                return;
              }
              res.json({ message: '復習記錄更新成功' });
            }
          );
        });
        break;
        
      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}