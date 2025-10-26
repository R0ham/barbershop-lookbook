const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../hairstyles.db');
const db = new sqlite3.Database(dbPath);

console.log('Running migration: Adding users and favorites tables...');

db.serialize(() => {
  // Enable foreign key constraints
  db.run('PRAGMA foreign_keys = ON');

  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_active DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create user_favorites table
  db.run(`
    CREATE TABLE IF NOT EXISTS user_favorites (
      user_id TEXT NOT NULL,
      hairstyle_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, hairstyle_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (hairstyle_id) REFERENCES hairstyles(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  db.run('CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_user_favorites_hairstyle ON user_favorites(hairstyle_id)');

  console.log('Migration completed successfully!');
});

db.close();
