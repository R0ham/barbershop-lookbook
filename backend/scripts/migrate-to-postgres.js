#!/usr/bin/env node
/*
  Migrate data from SQLite to PostgreSQL
  Requirements:
    - env DATABASE_URL: PostgreSQL connection string
    - SQLite database file at backend/hairstyles.db
  Usage:
    node backend/scripts/migrate-to-postgres.js
*/

const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Check for required environment variables
if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is required');
  process.exit(1);
}

const sqlitePath = path.join(__dirname, '..', 'hairstyles.db');
const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
const sqliteDb = new sqlite3.Database(sqlitePath);

// Helper function to run a query and return all results
const query = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Helper function to run a query that doesn't return results
const run = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

// Migrate hairstyles
async function migrateHairstyles() {
  console.log('Migrating hairstyles...');
  const hairstyles = await query(sqliteDb, 'SELECT * FROM hairstyles');
  
  for (const row of hairstyles) {
    try {
      await pgPool.query(
        `INSERT INTO hairstyles (
          id, name, category, length, texture, face_shapes, style_type, 
          pose, ethnicity, image_url, artist_name, artist_url, 
          image_data, description, tags, created_at, updated_at, unsplash_photo_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT (id) DO NOTHING`,
        [
          row.id, row.name, row.category, row.length, row.texture, row.face_shapes,
          row.style_type, row.pose, row.ethnicity, row.image_url, row.artist_name,
          row.artist_url, row.image_data, row.description, row.tags, row.created_at,
          row.updated_at, row.unsplash_photo_id
        ]
      );
    } catch (error) {
      console.error(`Error migrating hairstyle ${row.id}:`, error);
    }
  }
  console.log(`Migrated ${hairstyles.length} hairstyles`);
}

// Migrate users
async function migrateUsers() {
  console.log('Migrating users...');
  const users = await query(sqliteDb, 'SELECT * FROM users');
  
  for (const row of users) {
    try {
      await pgPool.query(
        'INSERT INTO users (id, created_at, last_active) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
        [row.id, row.created_at, row.last_active]
      );
    } catch (error) {
      console.error(`Error migrating user ${row.id}:`, error);
    }
  }
  console.log(`Migrated ${users.length} users`);
}

// Migrate favorites
async function migrateFavorites() {
  console.log('Migrating favorites...');
  const favorites = await query(sqliteDb, 'SELECT * FROM user_favorites');
  
  for (const row of favorites) {
    try {
      await pgPool.query(
        'INSERT INTO user_favorites (user_id, hairstyle_id, created_at) VALUES ($1, $2, $3) ON CONFLICT (user_id, hairstyle_id) DO NOTHING',
        [row.user_id, row.hairstyle_id, row.created_at]
      );
    } catch (error) {
      console.error(`Error migrating favorite ${row.user_id}-${row.hairstyle_id}:`, error);
    }
  }
  console.log(`Migrated ${favorites.length} favorites`);
}

// Main migration function
async function migrate() {
  const client = await pgPool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('Starting migration...');
    
    await migrateHairstyles();
    await migrateUsers();
    await migrateFavorites();
    
    await client.query('COMMIT');
    console.log('Migration completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    sqliteDb.close();
    await pgPool.end();
  }
}

// Run the migration
migrate().catch(console.error);
