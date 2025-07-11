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
        db.all('SELECT * FROM focus_sessions ORDER BY created_at DESC', (err, rows) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json(rows);
        });
        break;
        
      case 'POST':
        const { task_id, start_time, end_time, duration, notes } = req.body;
        
        if (!task_id || !start_time || !end_time || !duration) {
          res.status(400).json({ error: '必填欄位不可為空' });
          return;
        }
        
        db.run(
          'INSERT INTO focus_sessions (task_id, start_time, end_time, duration, notes) VALUES (?, ?, ?, ?, ?)',
          [task_id, start_time, end_time, duration, notes],
          function(err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            res.json({ id: this.lastID, message: '專注會話記錄成功' });
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