const path = require('path');

// Load environment variables first
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const PostgresDatabase = require('./postgres-database');
const favoritesRouter = require('./favorites-api-pg');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 5001;

// Initialize PostgreSQL database
let db;
try {
  db = new PostgresDatabase();
  console.log('Connected to PostgreSQL database');
} catch (error) {
  console.error('Failed to connect to PostgreSQL database:', error);
  process.exit(1);
}

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Favorites API - Update this to use the PostgreSQL database
const favoritesRouterPg = require('./favorites-api-pg');
app.use('/api/favorites', favoritesRouterPg);

// Helper function to resolve Unsplash image URLs
async function resolveUnsplashSource(u) {
  // ... (keep the same implementation as before)
}

// Image proxy endpoint
app.get('/api/proxy-image', async (req, res) => {
  // ... (keep the same implementation as before)
});

// Get all hairstyles with optional filters
app.get('/api/hairstyles', async (req, res) => {
  try {
    const { category, length, texture, face_shape, style_type, pose, ethnicity } = req.query;
    
    let query = 'SELECT * FROM hairstyles WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    // Add filters
    if (category) {
      query += ` AND category = $${paramIndex++}`;
      params.push(category);
    }
    if (length) {
      query += ` AND length = $${paramIndex++}`;
      params.push(length);
    }
    if (texture) {
      query += ` AND texture = $${paramIndex++}`;
      params.push(texture);
    }
    if (face_shape) {
      query += ` AND $${paramIndex++} = ANY(string_to_array(face_shapes, ','))`;
      params.push(face_shape);
    }
    if (style_type) {
      query += ` AND style_type = $${paramIndex++}`;
      params.push(style_type);
    }
    if (pose) {
      query += ` AND pose = $${paramIndex++}`;
      params.push(pose);
    }
    if (ethnicity) {
      query += ` AND ethnicity = $${paramIndex++}`;
      params.push(ethnicity);
    }
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching hairstyles:', error);
    res.status(500).json({ error: 'Failed to fetch hairstyles' });
  }
});

// Get a single hairstyle by ID
app.get('/api/hairstyles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM hairstyles WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hairstyle not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching hairstyle:', error);
    res.status(500).json({ error: 'Failed to fetch hairstyle' });
  }
});

// Add a new hairstyle
app.post('/api/hairstyles', upload.single('image'), async (req, res) => {
  try {
    const { 
      name, 
      category, 
      length, 
      texture, 
      face_shapes, 
      style_type = 'Unisex', 
      pose = 'Straight-on', 
      ethnicity,
      description,
      tags,
      image_url,
      artist_name,
      artist_url
    } = req.body;
    
    if (!name || !category || !length || !texture || !face_shapes) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const id = `hs_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const image_data = req.file ? req.file.buffer : null;
    
    const result = await db.query(
      `INSERT INTO hairstyles (
        id, name, category, length, texture, face_shapes, style_type, 
        pose, ethnicity, image_url, artist_name, artist_url, 
        image_data, description, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        id, name, category, length, texture, face_shapes, style_type,
        pose, ethnicity, image_url, artist_name, artist_url,
        image_data, description, tags
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding hairstyle:', error);
    res.status(500).json({ error: 'Failed to add hairstyle' });
  }
});

// Get image data
app.get('/api/images/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT image_data, image_url FROM hairstyles WHERE id = $1', [id]);
    
    if (result.rows.length === 0 || (!result.rows[0].image_data && !result.rows[0].image_url)) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    const { image_data, image_url } = result.rows[0];
    
    if (image_data) {
      res.set('Content-Type', 'image/jpeg');
      res.send(image_data);
    } else if (image_url) {
      // Proxy the image from the URL
      const response = await fetch(image_url);
      const buffer = await response.buffer();
      res.set('Content-Type', response.headers.get('content-type') || 'image/jpeg');
      res.send(buffer);
    }
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

// Get filter options
app.get('/api/filters', async (req, res) => {
  try {
    const [lengths, textures, styleTypes, poses, faceShapes, ethnicities] = await Promise.all([
      db.query('SELECT DISTINCT length FROM hairstyles WHERE length IS NOT NULL ORDER BY length'),
      db.query('SELECT DISTINCT texture FROM hairstyles WHERE texture IS NOT NULL ORDER BY texture'),
      db.query('SELECT DISTINCT style_type FROM hairstyles WHERE style_type IS NOT NULL ORDER BY style_type'),
      db.query('SELECT DISTINCT pose FROM hairstyles WHERE pose IS NOT NULL ORDER BY pose'),
      db.query(`
        SELECT DISTINCT unnest(string_to_array(face_shapes, ',')) as shape 
        FROM hairstyles 
        WHERE face_shapes IS NOT NULL 
        ORDER BY shape
      `),
      db.query('SELECT DISTINCT ethnicity FROM hairstyles WHERE ethnicity IS NOT NULL ORDER BY ethnicity')
    ]);
    
    res.json({
      lengths: lengths.rows.map(r => r.length),
      textures: textures.rows.map(r => r.texture),
      face_shapes: [...new Set(faceShapes.rows.map(r => r.shape.trim()))].filter(Boolean),
      style_types: styleTypes.rows.map(r => r.style_type),
      poses: poses.rows.map(r => r.pose),
      ethnicities: ethnicities.rows.map(r => r.ethnicity).filter(Boolean) || ['Caucasian', 'Asian', 'Afro']
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({ error: 'Failed to fetch filters' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'postgresql' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await db.pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await db.pool.end();
  process.exit(0);
});

module.exports = app;
