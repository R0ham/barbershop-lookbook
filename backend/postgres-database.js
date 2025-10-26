const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

class PostgresDatabase {
  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    // Initialize the database
    this.init().catch(err => {
      console.error('Failed to initialize database:', err);
      process.exit(1);
    });
  }

  async query(text, params) {
    const client = await this.pool.connect();
    try {
      return await client.query(text, params);
    } finally {
      client.release();
    }
  }

  async init() {
    try {
      // Create users table
      await this.query(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create hairstyles table first (referenced by favorites)
      await this.query(`
        CREATE TABLE IF NOT EXISTS hairstyles (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          length TEXT NOT NULL,
          texture TEXT NOT NULL,
          face_shapes TEXT NOT NULL,
          style_type TEXT DEFAULT 'Unisex',
          pose TEXT DEFAULT 'Straight-on',
          ethnicity TEXT,
          image_url TEXT NOT NULL,
          artist_name TEXT,
          artist_url TEXT,
          image_data BYTEA,
          description TEXT,
          tags TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          unsplash_photo_id TEXT
        )
      `);

      // Create user_favorites table with proper foreign keys
      await this.query(`
        CREATE TABLE IF NOT EXISTS user_favorites (
          user_id TEXT NOT NULL,
          hairstyle_id TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (user_id, hairstyle_id),
          CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
          CONSTRAINT fk_hairstyle FOREIGN KEY(hairstyle_id) REFERENCES hairstyles(id) ON DELETE CASCADE
        )
      `);

      // Create indexes
      await this.createIndexes();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  async createIndexes() {
    try {
      // Indexes for hairstyles
      await this.query('CREATE INDEX IF NOT EXISTS idx_hairstyles_category ON hairstyles(category)');
      await this.query('CREATE INDEX IF NOT EXISTS idx_hairstyles_length ON hairstyles(length)');
      await this.query('CREATE INDEX IF NOT EXISTS idx_hairstyles_texture ON hairstyles(texture)');
      await this.query('CREATE INDEX IF NOT EXISTS idx_hairstyles_style_type ON hairstyles(style_type)');
      await this.query('CREATE INDEX IF NOT EXISTS idx_hairstyles_pose ON hairstyles(pose)');
      await this.query('CREATE INDEX IF NOT EXISTS idx_hairstyles_ethnicity ON hairstyles(ethnicity)');
      
      // Indexes for favorites
      await this.query('CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id)');
      await this.query('CREATE INDEX IF NOT EXISTS idx_user_favorites_hairstyle ON user_favorites(hairstyle_id)');
    } catch (error) {
      console.error('Error creating indexes:', error);
      throw error;
    }
  }

  // Example method - you'll need to implement the rest of the methods from database.js
  async getOrCreateUser(userId) {
    try {
      // Try to get existing user
      const result = await this.query('SELECT * FROM users WHERE id = $1', [userId]);
      
      if (result.rows.length === 0) {
        // User doesn't exist, create new user
        await this.query(
          'INSERT INTO users (id) VALUES ($1) RETURNING *',
          [userId]
        );
        return { id: userId, created_at: new Date(), last_active: new Date() };
      }
      
      // Update last_active for existing user
      await this.query(
        'UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = $1',
        [userId]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error in getOrCreateUser:', error);
      throw error;
    }
  }

  // Add other methods from database.js here...
  // For each method, you'll need to convert the SQLite syntax to PostgreSQL
  // and update the parameter binding from ? to $1, $2, etc.
}

module.exports = PostgresDatabase;
