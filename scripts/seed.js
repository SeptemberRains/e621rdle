const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const charactersCSV = path.join(__dirname, '..', 'characters.csv');
const imagesCSV = path.join(__dirname, '..', 'top_img.csv');

console.log('Starting database seeding...');

// Initialize database
const db = new sqlite3.Database(dbPath);

// Function to parse CSV file
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const row = {};
    headers.forEach((header, index) => {
      row[header.trim()] = values[index] || '';
    });
    return row;
  });
}

db.serialize(() => {
  console.log('Creating characters table...');
  
  // Create table
  db.run(`
    CREATE TABLE IF NOT EXISTS characters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL,
      post_count INTEGER NOT NULL,
      image_url TEXT
    )
  `);
  
  // Create index
  db.run(`CREATE INDEX IF NOT EXISTS idx_post_count ON characters(post_count)`);
  
  // Clear existing data
  db.run('DELETE FROM characters', (err) => {
    if (err) {
      console.error('Error clearing table:', err);
      return;
    }
    
    console.log('Reading CSV files...');
    
    try {
      // Parse CSV files
      const charactersData = parseCSV(charactersCSV);
      const imagesData = parseCSV(imagesCSV);
      
      console.log(`Found ${charactersData.length} characters and ${imagesData.length} images`);
      
      // Create a map of character names to image URLs for faster lookup
      const imageMap = {};
      imagesData.forEach(row => {
        imageMap[row.name] = row.image_url;
      });
      
      // Prepare insert statement
      const stmt = db.prepare(`
        INSERT INTO characters (name, post_count, image_url) 
        VALUES (?, ?, ?)
      `);
      
      let inserted = 0;
      let skipped = 0;
      
      charactersData.forEach(row => {
        const name = row.name;
        const postCount = parseInt(row.post_count);
        const imageUrl = imageMap[name] || null;
        
        if (name && !isNaN(postCount)) {
          stmt.run(name, postCount, imageUrl, (err) => {
            if (err) {
              console.error(`Error inserting ${name}:`, err);
              skipped++;
            } else {
              inserted++;
              if (inserted % 100 === 0) {
                console.log(`Inserted ${inserted} characters...`);
              }
            }
          });
        } else {
          console.warn(`Skipping invalid row: ${JSON.stringify(row)}`);
          skipped++;
        }
      });
      
      stmt.finalize((err) => {
        if (err) {
          console.error('Error finalizing statement:', err);
        } else {
          console.log(`\nSeeding completed!`);
          console.log(`Inserted: ${inserted} characters`);
          console.log(`Skipped: ${skipped} characters`);
          
          // Verify the data
          db.get('SELECT COUNT(*) as count FROM characters', (err, row) => {
            if (err) {
              console.error('Error verifying data:', err);
            } else {
              console.log(`Total characters in database: ${row.count}`);
            }
            
            // Show some sample data
            db.all('SELECT name, post_count, image_url FROM characters ORDER BY post_count DESC LIMIT 5', (err, rows) => {
              if (err) {
                console.error('Error fetching sample data:', err);
              } else {
                console.log('\nTop 5 characters by post count:');
                rows.forEach(row => {
                  console.log(`- ${row.name}: ${row.post_count} posts, image: ${row.image_url ? 'Yes' : 'No'}`);
                });
              }
              
              db.close((err) => {
                if (err) {
                  console.error('Error closing database:', err);
                } else {
                  console.log('\nDatabase connection closed.');
                }
                process.exit(0);
              });
            });
          });
        }
      });
      
    } catch (error) {
      console.error('Error reading CSV files:', error);
      process.exit(1);
    }
  });
});
