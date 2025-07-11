const sqlite3 = require('sqlite3').verbose();

const DB_PATH = '/tmp/shadow-plan.db';

function initDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(err);
        return;
      }
      
      // 建立並填入教材庫資料
      db.serialize(() => {
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
          // 檢查是否需要插入示例資料
          db.get("SELECT COUNT(*) as count FROM material_library", (err, row) => {
            if (err || row.count === 0) {
              insertSampleMaterials(db);
            }
          });
        });
      });
      
      resolve(db);
    });
  });
}

function insertSampleMaterials(db) {
  const sampleMaterials = [
    {
      category: '高中數學',
      subcategory: '三角函數',
      title: '正弦定理',
      content: 'a/sin(A) = b/sin(B) = c/sin(C) = 2R\\n其中 a, b, c 為三角形的三邊長，A, B, C 為對應的角，R 為外接圓半徑。',
      tags: '三角函數,定理,幾何',
      difficulty_level: 3
    },
    {
      category: '高中數學',
      subcategory: '三角函數',
      title: '餘弦定理',
      content: 'c² = a² + b² - 2ab·cos(C)\\n用於計算三角形中任一邊長或角度。',
      tags: '三角函數,定理,幾何',
      difficulty_level: 3
    },
    {
      category: '高中數學',
      subcategory: '圓與直線',
      title: '圓的標準式',
      content: '(x - h)² + (y - k)² = r²\\n其中 (h, k) 為圓心，r 為半徑。',
      tags: '圓,幾何,座標',
      difficulty_level: 2
    },
    {
      category: '英文 7000 字',
      subcategory: '基礎 1000 字',
      title: 'achieve',
      content: '[動詞] 達成、完成、實現\\n例句：She achieved her goal of becoming a doctor.\\n(她達成了成為醫生的目標。)',
      tags: '動詞,目標,成就',
      difficulty_level: 2
    },
    {
      category: '英文 7000 字',
      subcategory: '基礎 1000 字',
      title: 'develop',
      content: '[動詞] 發展、開發、培養\\n例句：The company plans to develop new products.\\n(公司計劃開發新產品。)',
      tags: '動詞,發展,進步',
      difficulty_level: 2
    },
    {
      category: '高中物理',
      subcategory: '力學',
      title: '牛頓第二定律',
      content: 'F = ma\\n力 = 質量 × 加速度\\n當物體受到淨力作用時，會產生與力同方向的加速度。',
      tags: '力學,運動,定律',
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
            res.status(500).json({ error: err.message });
            return;
          }
          res.json(rows);
        });
        break;
        
      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}