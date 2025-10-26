const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database setup
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS characters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL,
      post_count INTEGER NOT NULL,
      image_url TEXT
    )
  `);
  
  // Create index on post_count for better performance
  db.run(`CREATE INDEX IF NOT EXISTS idx_post_count ON characters(post_count)`);
});

// API Routes

/**
 * GET /api/get-round
 * Returns two random characters with different post counts
 */
app.get('/api/get-round', (req, res) => {
  // More robust query to ensure different post counts
  const query = `
    WITH RandomPair AS (
      SELECT c1.id as id1, c1.name as name1, c1.post_count as count1, c1.image_url as img1,
             c2.id as id2, c2.name as name2, c2.post_count as count2, c2.image_url as img2
      FROM characters c1
      JOIN characters c2 ON c1.post_count != c2.post_count AND c1.id != c2.id
      ORDER BY RANDOM()
      LIMIT 1
    )
    SELECT id1 as id, name1 as name, count1 as post_count, img1 as image_url FROM RandomPair
    UNION ALL
    SELECT id2 as id, name2 as name, count2 as post_count, img2 as image_url FROM RandomPair
  `;
  
  db.all(query, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (rows.length < 2) {
      // Fallback to simple random selection if complex query fails
      const fallbackQuery = `
        SELECT id, name, post_count, image_url
        FROM characters 
        ORDER BY RANDOM() 
        LIMIT 2
      `;
      
      db.all(fallbackQuery, (err2, fallbackRows) => {
        if (err2 || fallbackRows.length < 2) {
          return res.status(500).json({ error: 'Not enough characters in database' });
        }
        res.json(fallbackRows);
      });
    } else {
      res.json(rows);
    }
  });
});

/**
 * GET /api/stats
 * Returns database statistics
 */
app.get('/api/stats', (req, res) => {
  db.get('SELECT COUNT(*) as total FROM characters', (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ totalCharacters: row.total });
  });
});

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database location: ${dbPath}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});
