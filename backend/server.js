const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const Database = require('./database');
const fetch = require('node-fetch');

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
// Local proxy for Unsplash images to mirror Netlify function in dev
// Helper: resolve source.unsplash.com to final images.unsplash.com URL via manual redirects
async function resolveUnsplashSource(u) {
  try {
    let current = new URL(u.toString());
    for (let i = 0; i < 5; i++) {
      const res = await fetch(current.toString(), {
        redirect: 'manual',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://unsplash.com/'
        },
      });
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get('location');
        if (!loc) break;
        current = new URL(loc, current);
        if (current.hostname === 'images.unsplash.com') {
          return current.toString();
        }
        continue;
      }
      // If 503 on /random, try /featured once
      if (res.status === 503 && /\/random\//.test(current.pathname)) {
        const fallback = new URL(current.toString());
        fallback.pathname = fallback.pathname.replace('/random/', '/featured/');
        current = fallback;
        // loop continues to attempt manual redirect resolution again
        continue;
      }
      // If OK or other status, give up and return as-is
      return current.toString();
    }
    return current.toString();
  } catch {
    return u.toString();
  }
}
app.get('/api/proxy-image', async (req, res) => {
  try {
    const target = req.query.url;
    if (!target) return res.status(400).send('Missing url');
    // Normalize protocol-relative URLs like //images.unsplash.com/... -> https://images.unsplash.com/...
    const normalized = /^\/\//.test(String(target)) ? `https:${target}` : String(target);
    let u;
    try { u = new URL(normalized); } catch { return res.status(400).send('Invalid url'); }
    const allowed = new Set(['images.unsplash.com', 'source.unsplash.com', 'unsplash.com']);
    if (!allowed.has(u.hostname)) return res.status(400).send('Disallowed host');

    // If requesting via source.unsplash.com, resolve to the final images.unsplash.com URL first
    if (u.hostname === 'source.unsplash.com') {
      const resolved = await resolveUnsplashSource(u);
      try {
        const rh = new URL(resolved).hostname;
        if (allowed.has(rh)) {
          u = new URL(resolved);
        }
      } catch {}
    }

    const makeReq = (referer) => fetch(u.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': referer
      },
      redirect: 'follow'
    });
    let upstream = await makeReq('https://unsplash.com/');
    if (!upstream.ok && upstream.status === 403) {
      const altRef = req.headers.referer || 'http://localhost:3000/';
      console.warn('proxy-image 403, retrying with alt referer', { url: u.toString(), altRef });
      upstream = await makeReq(altRef);
    }
    // If Unsplash Source is returning 503 for /random, try /featured as a fallback
    if (!upstream.ok && upstream.status === 503 && u.hostname === 'source.unsplash.com' && /\/random\//.test(u.pathname)) {
      const fallbackUrl = new URL(u.toString());
      fallbackUrl.pathname = fallbackUrl.pathname.replace('/random/', '/featured/');
      console.warn('proxy-image 503, retrying with featured', { original: u.toString(), fallback: fallbackUrl.toString() });
      const prevU = u; // keep for logging
      u = fallbackUrl;
      upstream = await makeReq('https://unsplash.com/');
      if (!upstream.ok && upstream.status === 403) {
        const altRef = req.headers.referer || 'http://localhost:3000/';
        upstream = await makeReq(altRef);
      }
    }
    if (!upstream.ok) {
      console.warn('proxy-image upstream error', {
        url: u.toString(),
        status: upstream.status,
        statusText: upstream.statusText,
      });
      return res.status(upstream.status).send('Upstream error');
    }
    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=86400');
    upstream.body.pipe(res);
  } catch (e) {
    console.error('proxy-image error', e);
    res.status(500).send('Proxy error');
  }
});
app.get('/api/hairstyles', async (req, res) => {
  try {
    const { length, texture, face_shape, style_type, pose, ethnicity, search } = req.query;
    const splitOrPass = (val) => typeof val === 'string' && val.includes(',') ? val.split(',').map(v => v.trim()).filter(Boolean) : val;
    const filters = {
      length: splitOrPass(length),
      texture: splitOrPass(texture),
      face_shape: splitOrPass(face_shape),
      style_type: splitOrPass(style_type),
      pose: splitOrPass(pose),
      ethnicity: splitOrPass(ethnicity),
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

// Update a hairstyle's ethnicity
app.put('/api/hairstyles/:id/ethnicity', async (req, res) => {
  try {
    const { id } = req.params;
    const { ethnicity } = req.body || {};
    const result = await db.updateHairstyleEthnicity(id, ethnicity);
    if (!result.updated) return res.status(404).json({ error: 'Hairstyle not found' });
    res.json({ ok: true });
  } catch (error) {
    console.error('Error updating ethnicity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload new hairstyle with image
app.post('/api/hairstyles', upload.single('image'), async (req, res) => {
  try {
    const { name, category, length, texture, face_shapes, style_type, pose, ethnicity, description, tags, image_url } = req.body;
    
    const hairstyleData = {
      name,
      category,
      length,
      texture,
      face_shapes: JSON.parse(face_shapes || '[]'),
      style_type,
      pose,
      ethnicity,
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
