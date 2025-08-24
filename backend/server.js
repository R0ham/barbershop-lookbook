const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const Database = require('./database');

const app = express();
const PORT = process.env.PORT || 5001;
const db = new Database();

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

// Routes
app.get('/api/hairstyles', async (req, res) => {
  try {
    const { length, texture, face_shape, style_type, pose, search } = req.query;
    const splitOrPass = (val) => typeof val === 'string' && val.includes(',') ? val.split(',').map(v => v.trim()).filter(Boolean) : val;
    const filters = {
      length: splitOrPass(length),
      texture: splitOrPass(texture),
      face_shape: splitOrPass(face_shape),
      style_type: splitOrPass(style_type),
      pose: splitOrPass(pose),
      search
    };
    const hairstyles = await db.getAllHairstyles(filters);
    res.json(hairstyles);
  } catch (error) {
    console.error('Error fetching hairstyles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/hairstyles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const hairstyle = await db.getHairstyleById(id);
    
    if (!hairstyle) {
      return res.status(404).json({ error: 'Hairstyle not found' });
    }
    
    res.json(hairstyle);
  } catch (error) {
    console.error('Error fetching hairstyle:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/filters', async (req, res) => {
  try {
    const filters = await db.getFilters();
    res.json(filters);
  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload new hairstyle with image
app.post('/api/hairstyles', upload.single('image'), async (req, res) => {
  try {
    const { name, category, length, texture, face_shapes, description, tags, image_url } = req.body;
    
    const hairstyleData = {
      name,
      category,
      length,
      texture,
      face_shapes: JSON.parse(face_shapes || '[]'),
      description,
      tags: JSON.parse(tags || '[]'),
      image_url: image_url || null,
      image_data: req.file ? req.file.buffer : null
    };

    const newHairstyle = await db.addHairstyle(hairstyleData);
    res.status(201).json(newHairstyle);
  } catch (error) {
    console.error('Error adding hairstyle:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve image data from database
app.get('/api/images/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const hairstyle = await db.getHairstyleById(id);
    
    if (!hairstyle || !hairstyle.image_data) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    res.set('Content-Type', 'image/jpeg');
    res.send(hairstyle.image_data);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
