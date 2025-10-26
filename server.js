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
  // Get two random characters with different post counts
  const query = `
    SELECT c1.id, c1.name, c1.post_count, c1.image_url
    FROM characters c1
    WHERE c1.id IN (
      SELECT id FROM characters 
      ORDER BY RANDOM() 
      LIMIT 50
    )
    ORDER BY RANDOM()
    LIMIT 2
  `;
  
  db.all(query, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (rows.length < 2) {
      return res.status(500).json({ error: 'Not enough characters in database' });
    }
    
    // Ensure characters have different post counts
    if (rows[0].post_count === rows[1].post_count) {
      // Try again with a different query to avoid ties
      const antiTieQuery = `
        SELECT c1.id, c1.name, c1.post_count, c1.image_url
        FROM characters c1
        JOIN characters c2 ON c1.post_count != c2.post_count
        WHERE c1.id IN (
          SELECT id FROM characters 
          ORDER BY RANDOM() 
          LIMIT 1
        )
        AND c2.id IN (
          SELECT id FROM characters 
          WHERE post_count != c1.post_count
          ORDER BY RANDOM() 
          LIMIT 1
        )
        LIMIT 2
      `;
      
      db.all(antiTieQuery, (err2, rows2) => {
        if (err2 || rows2.length < 2) {
          // Fallback: just return the original rows
          return res.json(rows);
        }
        res.json(rows2);
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
