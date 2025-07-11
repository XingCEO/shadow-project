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
        const { date } = req.query;
        const targetDate = date || new Date().toISOString().split('T')[0];
        
        db.get('SELECT * FROM daily_stats WHERE date = ?', [targetDate], (err, row) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          
          if (!row) {
            res.json({
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
            return;
          }
          
          res.json(row);
        });
        break;
        
      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}