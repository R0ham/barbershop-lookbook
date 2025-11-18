// Netlify Function: API backed by Neon (Postgres)
// Requires env var: DATABASE_URL (Neon connection string)

const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

// One pool per function instance (reused across invocations)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

let initPromise;
async function init() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    // Create schema if not exists
    await pool.query(`
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
        unsplash_photo_id TEXT,
        description TEXT,
        tags TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_hairstyles_category ON hairstyles(category);
      CREATE INDEX IF NOT EXISTS idx_hairstyles_length ON hairstyles(length);
      CREATE INDEX IF NOT EXISTS idx_hairstyles_texture ON hairstyles(texture);
      CREATE INDEX IF NOT EXISTS idx_hairstyles_style_type ON hairstyles(style_type);
      CREATE INDEX IF NOT EXISTS idx_hairstyles_pose ON hairstyles(pose);
      CREATE INDEX IF NOT EXISTS idx_hairstyles_ethnicity ON hairstyles(ethnicity);
      CREATE INDEX IF NOT EXISTS idx_hairstyles_unsplash_photo_id ON hairstyles(unsplash_photo_id);
      
      -- Safe migrations for existing tables
      ALTER TABLE hairstyles ADD COLUMN IF NOT EXISTS artist_name TEXT;
      ALTER TABLE hairstyles ADD COLUMN IF NOT EXISTS artist_url TEXT;
      ALTER TABLE hairstyles ADD COLUMN IF NOT EXISTS unsplash_photo_id TEXT;
      
      -- Users table for favorites
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      -- User favorites (many-to-many)
      CREATE TABLE IF NOT EXISTS user_favorites (
        user_id TEXT NOT NULL,
        hairstyle_id TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, hairstyle_id),
        CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_hairstyle FOREIGN KEY(hairstyle_id) REFERENCES hairstyles(id) ON DELETE CASCADE
      );
      
      -- Only create the function if it doesn't exist
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_user_activity') THEN
          CREATE OR REPLACE FUNCTION update_user_activity() RETURNS TRIGGER AS $$
          BEGIN
            UPDATE users SET last_active = NOW() WHERE id = NEW.user_id;
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;
        END IF;
      END $$;
      
      -- Drop and recreate the trigger if it exists
      DROP TRIGGER IF EXISTS trigger_user_activity ON user_favorites;
      CREATE TRIGGER trigger_user_activity
      AFTER INSERT OR UPDATE OR DELETE ON user_favorites
      FOR EACH ROW
      EXECUTE FUNCTION update_user_activity();
    `);

    // Backfill/seed
    const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM hairstyles');
    if ((rows[0]?.count ?? 0) === 0) {
      const sample = [
        { name: 'Classic Bob', category: 'Short', length: 'Short', texture: 'Straight', face_shapes: ['Oval','Square'], style_type: 'Feminine', pose: 'Straight-on', ethnicity: 'Caucasian', image_url: 'https://images.unsplash.com/photo-1494790108755-2616c96d5e55?w=400&h=500&fit=crop&crop=face,focalpoint&fp-x=0.5&fp-y=0.3', description: 'A timeless short cut that hits just below the chin', tags: ['classic','professional','low-maintenance'] },
        { name: 'Beach Waves', category: 'Medium', length: 'Medium', texture: 'Wavy', face_shapes: ['Oval','Heart','Round'], style_type: 'Feminine', pose: 'Angled', ethnicity: 'Caucasian', image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop&crop=face,focalpoint&fp-x=0.5&fp-y=0.3', description: 'Effortless wavy style perfect for a casual look', tags: ['casual','beachy','textured'] },
        { name: 'Long Layers', category: 'Long', length: 'Long', texture: 'Straight', face_shapes: ['Oval','Long'], style_type: 'Feminine', pose: 'Side', ethnicity: 'Asian', image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop&crop=face,focalpoint&fp-x=0.5&fp-y=0.3', description: 'Flowing layers that add movement and dimension', tags: ['layered','voluminous','elegant'] },
        { name: 'Pixie Cut', category: 'Short', length: 'Short', texture: 'Straight', face_shapes: ['Oval','Heart'], style_type: 'Unisex', pose: 'Straight-on', ethnicity: 'Caucasian', image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face,focalpoint&fp-x=0.5&fp-y=0.3', description: "Bold and edgy short cut that's easy to maintain", tags: ['edgy','bold','low-maintenance'] },
        { name: 'Curly Shag', category: 'Medium', length: 'Medium', texture: 'Curly', face_shapes: ['Oval','Round'], style_type: 'Feminine', pose: 'Angled', ethnicity: 'Afro', image_url: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=400&h=500&fit=crop&crop=face,focalpoint&fp-x=0.5&fp-y=0.3', description: 'Textured layers that enhance natural curls', tags: ['curly','textured','bohemian'] },
        { name: 'Blunt Lob', category: 'Medium', length: 'Medium', texture: 'Straight', face_shapes: ['Oval','Square'], style_type: 'Feminine', pose: 'Straight-on', ethnicity: 'Caucasian', image_url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=500&fit=crop&crop=face,focalpoint&fp-x=0.5&fp-y=0.3', description: 'A sleek long bob with clean, straight lines', tags: ['sleek','modern','sophisticated'] },
        { name: 'Braided Crown', category: 'Long', length: 'Long', texture: 'Any', face_shapes: ['Oval','Heart','Round'], style_type: 'Feminine', pose: 'Angled', ethnicity: 'Afro', image_url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=500&fit=crop&crop=face,focalpoint&fp-x=0.5&fp-y=0.3', description: 'Elegant braided style perfect for special occasions', tags: ['braided','elegant','formal'] },
        { name: 'Asymmetrical Bob', category: 'Short', length: 'Short', texture: 'Straight', face_shapes: ['Oval','Square'], style_type: 'Feminine', pose: 'Side', ethnicity: 'Asian', image_url: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=500&fit=crop&crop=face,focalpoint&fp-x=0.5&fp-y=0.3', description: 'Modern bob with one side longer than the other', tags: ['asymmetrical','modern','trendy'] },
        { name: 'Sleek Straight', category: 'Long', length: 'Long', texture: 'Straight', face_shapes: ['Oval','Heart'], style_type: 'Feminine', pose: 'Straight-on', ethnicity: 'Asian', image_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop&crop=face,focalpoint&fp-x=0.5&fp-y=0.3', description: 'Ultra-smooth straight hair with a glossy finish', tags: ['sleek','glossy','elegant'] },
        { name: 'Textured Crop', category: 'Short', length: 'Short', texture: 'Textured', face_shapes: ['Round','Square'], style_type: 'Masculine', pose: 'Angled', ethnicity: 'Caucasian', image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=face,focalpoint&fp-x=0.5&fp-y=0.3', description: 'Modern textured crop with defined layers', tags: ['textured','modern','edgy'] },
        { name: 'Voluminous Curls', category: 'Medium', length: 'Medium', texture: 'Curly', face_shapes: ['Oval','Long'], style_type: 'Masculine', pose: 'Straight-on', ethnicity: 'Afro', image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&crop=face,focalpoint&fp-x=0.5&fp-y=0.3', description: 'Full, bouncy curls with natural volume', tags: ['voluminous','curly','natural'] },
        { name: 'Side Swept Bangs', category: 'Medium', length: 'Medium', texture: 'Straight', face_shapes: ['Heart','Long'], style_type: 'Feminine', pose: 'Side', ethnicity: 'Caucasian', image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop&crop=face,focalpoint&fp-x=0.5&fp-y=0.3', description: 'Elegant side-swept bangs with shoulder-length hair', tags: ['bangs','elegant','sophisticated'] }
      ];
      const text = `
        INSERT INTO hairstyles (id, name, category, length, texture, face_shapes, style_type, pose, ethnicity, image_url, description, tags)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      `;
      for (const s of sample) {
        await pool.query(text, [uuidv4(), s.name, s.category, s.length, s.texture, JSON.stringify(s.face_shapes), s.style_type, s.pose, s.ethnicity, s.image_url, s.description, JSON.stringify(s.tags)]);
      }
    }
  })();
  return initPromise;
}

function json(res, status, body) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

function parseQueryString(qs) {
  const out = {};
  if (!qs) return out;
  const url = new URL('https://x.x' + (qs.startsWith('?') ? qs : '?' + qs));
  url.searchParams.forEach((v, k) => { out[k] = v; });
  return out;
}

function splitCsv(val) {
  if (!val) return [];
  return String(val).split(',').map(s => s.trim()).filter(Boolean);
}

async function handleGetFilters() {
  const client = await pool.connect();
  try {
    // First get all the regular filters
    const [lengths, textures, styleTypes, poses, ethnicities] = await Promise.all([
      client.query('SELECT DISTINCT length FROM hairstyles WHERE length IS NOT NULL ORDER BY length'),
      client.query('SELECT DISTINCT texture FROM hairstyles WHERE texture IS NOT NULL ORDER BY texture'),
      client.query('SELECT DISTINCT style_type FROM hairstyles WHERE style_type IS NOT NULL ORDER BY style_type'),
      client.query('SELECT DISTINCT pose FROM hairstyles WHERE pose IS NOT NULL ORDER BY pose'),
      client.query('SELECT DISTINCT ethnicity FROM hairstyles WHERE ethnicity IS NOT NULL ORDER BY ethnicity')
    ]);
    
    // Get face shapes as a separate query since we need to handle the comma-separated values
    const faceShapesResult = await client.query(`
      SELECT DISTINCT trim(unnest(string_to_array(face_shapes, ','))) as shape 
      FROM hairstyles 
      WHERE face_shapes IS NOT NULL 
        AND face_shapes != ''
        AND face_shapes != '[]'
      ORDER BY shape
    `);
    return json(null, 200, {
      lengths: lengths.rows.map(r => r.length),
      textures: textures.rows.map(r => r.texture),
      style_types: styleTypes.rows.map(r => r.style_type),
      poses: poses.rows.map(r => r.pose),
      face_shapes: [...new Set(faceShapesResult.rows.map(r => r.shape.trim()))].filter(Boolean).sort(),
      ethnicities: (ethnicities.rows || []).map(r => r.ethnicity).filter(Boolean) || ['Caucasian', 'Asian', 'Afro']
    });
  } finally {
    client.release();
  }
}

async function handleGetHairstyles(query) {
  const client = await pool.connect();
  try {
    const where = [];
    const params = [];
    let i = 1;

    const addIn = (field, arr) => {
      if (arr.length === 1) { where.push(`${field} = $${i}`); params.push(arr[0]); i++; }
      else if (arr.length > 1) { where.push(`${field} = ANY($${i})`); params.push(arr); i++; }
    };

    addIn('length', splitCsv(query.length));
    addIn('texture', splitCsv(query.texture));
    addIn('style_type', splitCsv(query.style_type));
    addIn('pose', splitCsv(query.pose));
    addIn('ethnicity', splitCsv(query.ethnicity));

    const faces = splitCsv(query.face_shape);
    if (faces.length > 0) {
      // OR of jsonb @> [value]
      const ors = faces.map(() => `face_shapes @> $${i++}`).join(' OR ');
      where.push(`(${ors})`);
      faces.forEach(f => params.push(JSON.stringify([f])));
    }

    if (query.search) {
      const s = `%${query.search}%`;
      where.push(`(name ILIKE $${i} OR description ILIKE $${i+1} OR tags::text ILIKE $${i+2})`);
      params.push(s, s, s); i += 3;
    }

    const sql = `SELECT * FROM hairstyles ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY created_at DESC`;
    const { rows } = await client.query(sql, params);
    return json(null, 200, rows.map(r => ({
      ...r,
      face_shapes: r.face_shapes || [],
      tags: r.tags || []
    })));
  } finally {
    client.release();
  }
}

async function handleGetHairstyleById(id) {
  const { rows } = await pool.query('SELECT * FROM hairstyles WHERE id = $1', [id]);
  if (!rows[0]) return json(null, 404, { error: 'Not found' });
  const r = rows[0];
  return json(null, 200, { ...r, face_shapes: r.face_shapes || [], tags: r.tags || [] });
}

async function handleUpdateEthnicity(id, body) {
  let data = {};
  try { data = JSON.parse(body || '{}'); } catch {}
  const ethnicity = data.ethnicity ?? null;
  const { rowCount } = await pool.query(
    'UPDATE hairstyles SET ethnicity = $1, updated_at = NOW() WHERE id = $2',
    [ethnicity, id]
  );
  if (rowCount === 0) return json(null, 404, { error: 'Not found' });
  return json(null, 200, { updated: true });
}

async function handleGetFavorites(query) {
  const user = query.user || 'default';
  
  try {
    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Ensure user exists
      await client.query(
        'INSERT INTO users (user_key) VALUES ($1) ON CONFLICT (user_key) DO UPDATE SET last_active = NOW()',
        [user]
      );
      
      // Get favorites
      const { rows } = await client.query(
        'SELECT hairstyle_id FROM user_favorites WHERE user_key = $1',
        [user]
      );
      
      await client.query('COMMIT');
      
      return json(null, 200, {
        favorites: rows.map(row => row.hairstyle_id)
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database error:', error);
    return json(null, 500, { 
      error: 'Failed to fetch favorites',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

async function handlePutFavorite(body) {
  try {
    const { user: userKey, hairstyle_id, favorite } = JSON.parse(body);
    const user = userKey || 'default';
    
    // Validate UUID format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(hairstyle_id)) {
      return json(null, 400, { error: 'Invalid hairstyle ID format' });
    }
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Ensure user exists and update last_active
      await client.query(
        `INSERT INTO users (user_key) 
         VALUES ($1) 
         ON CONFLICT (user_key) 
         DO UPDATE SET last_active = NOW() 
         RETURNING user_key`,
        [user]
      );
      
      // Verify hairstyle exists
      const { rows } = await client.query(
        'SELECT 1 FROM hairstyles WHERE id = $1',
        [hairstyle_id]
      );
      
      if (rows.length === 0) {
        await client.query('ROLLBACK');
        return json(null, 404, { error: 'Hairstyle not found' });
      }
      
      // Update favorite status
      if (favorite) {
        await client.query(
          `INSERT INTO user_favorites (user_key, hairstyle_id) 
           VALUES ($1, $2) 
           ON CONFLICT (user_key, hairstyle_id) DO NOTHING`,
          [user, hairstyle_id]
        );
      } else {
        await client.query(
          'DELETE FROM user_favorites WHERE user_key = $1 AND hairstyle_id = $2',
          [user, hairstyle_id]
        );
      }
      
      await client.query('COMMIT');
      return json(null, 200, { 
        updated: true,
        user,
        hairstyle_id,
        favorite
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error updating favorite:', error);
    return json(null, 500, { 
      error: 'Failed to update favorite',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

exports.handler = async (event, context) => {
  if (!process.env.DATABASE_URL) {
    return json(null, 500, { error: 'DATABASE_URL not configured' });
  }
  await init();

  const method = event.httpMethod;
  const path = event.path || '';
  const base = '/.netlify/functions/api';
  const rel = path.startsWith(base) ? path.slice(base.length) : path;

  try {
    // Routing
    if (method === 'GET' && (rel === '/filters' || rel === '/api/filters')) {
      return await handleGetFilters();
    }
    if (method === 'GET' && (rel === '/hairstyles' || rel === '/api/hairstyles')) {
      return await handleGetHairstyles(parseQueryString(event.rawQuery || event.queryStringParameters));
    }
    if (method === 'GET' && (rel === '/favorites' || rel === '/api/favorites')) {
      return await handleGetFavorites(parseQueryString(event.rawQuery || event.queryStringParameters));
    }
    // GET by id
    const m1 = rel.match(/^\/hairstyles\/([a-f0-9\-]+)$/i) || rel.match(/^\/api\/hairstyles\/([a-f0-9\-]+)$/i);
    if (method === 'GET' && m1) {
      return await handleGetHairstyleById(m1[1]);
    }
    // PUT ethnicity
    const m2 = rel.match(/^\/hairstyles\/([a-f0-9\-]+)\/ethnicity$/i) || rel.match(/^\/api\/hairstyles\/([a-f0-9\-]+)\/ethnicity$/i);
    if (method === 'PUT' && m2) {
      return await handleUpdateEthnicity(m2[1], event.body);
    }
    if (method === 'PUT' && (rel === '/favorites' || rel === '/api/favorites')) {
      return await handlePutFavorite(event.body);
    }

    return json(null, 404, { error: 'Not found' });
  } catch (e) {
    console.error('API error', e);
    return json(null, 500, { error: 'Server error' });
  }
};
