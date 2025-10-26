const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class DatabaseWithFavorites {
  constructor(dbPath) {
    this.db = new sqlite3.Database(dbPath);
    this.init();
  }

  init() {
    this.db.serialize(() => {
      // Create users table if it doesn't exist
      this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_active DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create user_favorites table if it doesn't exist
      this.db.run(`
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
      this.db.run('CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id)');
      this.db.run('CREATE INDEX IF NOT EXISTS idx_user_favorites_hairstyle ON user_favorites(hairstyle_id)');
    });
  }

  // Get or create a user
  getOrCreateUser(userId, callback) {
    this.db.serialize(() => {
      // First try to get the user
      this.db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) return callback(err);
        
        if (row) {
          // Update last_active for existing user
          this.db.run(
            'UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ?',
            [userId],
            (err) => {
              if (err) return callback(err);
              callback(null, { id: userId });
            }
          );
        } else {
          // Create new user
          this.db.run(
            'INSERT INTO users (id) VALUES (?)',
            [userId],
            function(err) {
              if (err) return callback(err);
              callback(null, { id: userId });
            }
          );
        }
      });
    });
  }

  // Get user's favorite hairstyles
  getUserFavorites(userId, callback) {
    this.db.all(
      `SELECT h.* 
       FROM hairstyles h
       JOIN user_favorites uf ON h.id = uf.hairstyle_id
       WHERE uf.user_id = ?
       ORDER BY uf.created_at DESC`,
      [userId],
      (err, rows) => {
        if (err) return callback(err);
        callback(null, rows || []);
      }
    );
  }

  // Add hairstyle to user's favorites
  addFavorite(userId, hairstyleId, callback) {
    this.db.serialize(() => {
      // First ensure the user exists
      this.getOrCreateUser(userId, (err) => {
        if (err) return callback(err);
        
        // Check if already favorited
        this.db.get(
          'SELECT 1 FROM user_favorites WHERE user_id = ? AND hairstyle_id = ?',
          [userId, hairstyleId],
          (err, row) => {
            if (err) return callback(err);
            
            if (row) {
              // Already favorited
              return callback(null, false);
            }
            
            // Add to favorites
            this.db.run(
              'INSERT INTO user_favorites (user_id, hairstyle_id) VALUES (?, ?)',
              [userId, hairstyleId],
              function(err) {
                if (err) return callback(err);
                callback(null, true);
              }
            );
          }
        );
      });
    });
  }

  // Remove hairstyle from user's favorites
  removeFavorite(userId, hairstyleId, callback) {
    this.db.run(
      'DELETE FROM user_favorites WHERE user_id = ? AND hairstyle_id = ?',
      [userId, hairstyleId],
      function(err) {
        if (err) return callback(err);
        callback(null, this.changes > 0);
      }
    );
  }

  // Check if a hairstyle is favorited by user
  isFavorite(userId, hairstyleId, callback) {
    this.db.get(
      'SELECT 1 FROM user_favorites WHERE user_id = ? AND hairstyle_id = ?',
      [userId, hairstyleId],
      (err, row) => {
        if (err) return callback(err);
        callback(null, !!row);
      }
    );
  }

  // Close the database connection
  close() {
    this.db.close();
  }
}

module.exports = DatabaseWithFavorites;
