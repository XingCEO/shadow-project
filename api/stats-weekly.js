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
        const { week } = req.query;
        const targetWeek = week || getWeekString(new Date());
        
        db.get('SELECT * FROM weekly_stats WHERE week = ?', [targetWeek], (err, row) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          
          if (!row) {
            res.json({
              week: targetWeek,
              total_focus_time: 0,
              tasks_completed: 0,
              tasks_created: 0,
              reviews_completed: 0,
              average_review_accuracy: 0,
              cards_created: 0,
              achievements_earned: 0,
              most_productive_day: null,
              longest_focus_session: 0,
              focus_consistency: 0
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

function getWeekString(date) {
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `${year}-W${week.toString().padStart(2, '0')}`;
}

function getWeekNumber(date) {
  const start = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date - start) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + start.getDay() + 1) / 7);
}