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
        db.all('SELECT * FROM achievements ORDER BY earned_at DESC', (err, rows) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json(rows);
        });
        break;
        
      case 'POST':
        const { badge_type, badge_name, description, value } = req.body;
        
        db.run(
          'INSERT INTO achievements (badge_type, badge_name, description, value) VALUES (?, ?, ?, ?)',
          [badge_type, badge_name, description, value || 0],
          function(err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            res.json({ 
              id: this.lastID, 
              message: '成就徽章獲得！',
              badge_name 
            });
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