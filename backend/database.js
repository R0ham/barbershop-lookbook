const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class Database {
  constructor() {
    this.db = new sqlite3.Database(path.join(__dirname, 'hairstyles.db'));
    this.init();
  }

  init() {
    this.db.serialize(() => {
      // Create hairstyles table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS hairstyles (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          length TEXT NOT NULL,
          texture TEXT NOT NULL,
          face_shapes TEXT NOT NULL,
          style_type TEXT DEFAULT 'Unisex',
          pose TEXT DEFAULT 'Straight-on',
          image_url TEXT NOT NULL,
          image_data BLOB,
          description TEXT,
          tags TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create indexes for better query performance
      this.db.run(`CREATE INDEX IF NOT EXISTS idx_category ON hairstyles(category)`);
      this.db.run(`CREATE INDEX IF NOT EXISTS idx_length ON hairstyles(length)`);
      this.db.run(`CREATE INDEX IF NOT EXISTS idx_texture ON hairstyles(texture)`);
      this.db.run(`CREATE INDEX IF NOT EXISTS idx_style_type ON hairstyles(style_type)`);
      this.db.run(`CREATE INDEX IF NOT EXISTS idx_pose ON hairstyles(pose)`);

      // Insert sample data if table is empty
      this.db.get("SELECT COUNT(*) as count FROM hairstyles", (err, row) => {
        if (err) {
          console.error('Error checking hairstyles count:', err);
          return;
        }
        
        if (row.count === 0) {
          this.insertSampleData();
        }
      });
    });
  }

  insertSampleData() {
    const sampleHairstyles = [
      {
        name: "Classic Bob",
        category: "Short",
        length: "Short",
        texture: "Straight",
        face_shapes: JSON.stringify(["Oval", "Square"]),
        style_type: "Feminine",
        pose: "Straight-on",
        image_url: "https://images.unsplash.com/photo-1494790108755-2616c96d5e55?w=400&h=500&fit=crop&crop=face,focalpoint&fp-x=0.5&fp-y=0.3",
        description: "A timeless short cut that hits just below the chin",
        tags: JSON.stringify(["classic", "professional", "low-maintenance"])
      },
      {
        name: "Beach Waves",
        category: "Medium",
        length: "Medium",
        texture: "Wavy",
        face_shapes: JSON.stringify(["Oval", "Heart", "Round"]),
        style_type: "Feminine",
        pose: "Angled",
        image_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop&crop=face,focalpoint&fp-x=0.5&fp-y=0.3",
        description: "Effortless wavy style perfect for a casual look",
        tags: JSON.stringify(["casual", "beachy", "textured"])
      },
      {
        name: "Long Layers",
        category: "Long",
        length: "Long",
        texture: "Straight",
        face_shapes: JSON.stringify(["Oval", "Long"]),
        style_type: "Feminine",
        pose: "Side",
        image_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop&crop=face,focalpoint&fp-x=0.5&fp-y=0.3",
        description: "Flowing layers that add movement and dimension",
        tags: JSON.stringify(["layered", "voluminous", "elegant"])
      },
      {
        name: "Pixie Cut",
        category: "Short",
        length: "Short",
        texture: "Straight",
        face_shapes: JSON.stringify(["Oval", "Heart"]),
        style_type: "Unisex",
        pose: "Straight-on",
        image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face,focalpoint&fp-x=0.5&fp-y=0.3",
        description: "Bold and edgy short cut that's easy to maintain",
        tags: JSON.stringify(["edgy", "bold", "low-maintenance"])
      },
      {
        name: "Curly Shag",
        category: "Medium",
        length: "Medium",
        texture: "Curly",
        face_shapes: JSON.stringify(["Oval", "Round"]),
        style_type: "Feminine",
        pose: "Angled",
        image_url: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=400&h=500&fit=crop&crop=face,focalpoint&fp-x=0.5&fp-y=0.3",
        description: "Textured layers that enhance natural curls",
        tags: JSON.stringify(["curly", "textured", "bohemian"])
      },
      {
        name: "Blunt Lob",
        category: "Medium",
        length: "Medium",
        texture: "Straight",
        face_shapes: JSON.stringify(["Oval", "Square"]),
        style_type: "Feminine",
        pose: "Straight-on",
        image_url: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=500&fit=crop&crop=face,focalpoint&fp-x=0.5&fp-y=0.3",
        description: "A sleek long bob with clean, straight lines",
        tags: JSON.stringify(["sleek", "modern", "sophisticated"])
      },
      {
        name: "Braided Crown",
        category: "Long",
        length: "Long",
        texture: "Any",
        face_shapes: JSON.stringify(["Oval", "Heart", "Round"]),
        style_type: "Feminine",
        pose: "Angled",
        image_url: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=500&fit=crop&crop=face,focalpoint&fp-x=0.5&fp-y=0.3",
        description: "Elegant braided style perfect for special occasions",
        tags: JSON.stringify(["braided", "elegant", "formal"])
      },
      {
        name: "Asymmetrical Bob",
        category: "Short",
        length: "Short",
        texture: "Straight",
        face_shapes: JSON.stringify(["Oval", "Square"]),
        style_type: "Feminine",
        pose: "Side",
        image_url: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=500&fit=crop&crop=face,focalpoint&fp-x=0.5&fp-y=0.3",
        description: "Modern bob with one side longer than the other",
        tags: JSON.stringify(["asymmetrical", "modern", "trendy"])
      },
      {
        name: "Sleek Straight",
        category: "Long",
        length: "Long",
        texture: "Straight",
        face_shapes: JSON.stringify(["Oval", "Heart"]),
        style_type: "Feminine",
        pose: "Straight-on",
        image_url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop&crop=face,focalpoint&fp-x=0.5&fp-y=0.3",
        description: "Ultra-smooth straight hair with a glossy finish",
        tags: JSON.stringify(["sleek", "glossy", "elegant"])
      },
      {
        name: "Textured Crop",
        category: "Short",
        length: "Short",
        texture: "Textured",
        face_shapes: JSON.stringify(["Round", "Square"]),
        style_type: "Masculine",
        pose: "Angled",
        image_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=face,focalpoint&fp-x=0.5&fp-y=0.3",
        description: "Modern textured crop with defined layers",
        tags: JSON.stringify(["textured", "modern", "edgy"])
      },
      {
        name: "Voluminous Curls",
        category: "Medium",
        length: "Medium",
        texture: "Curly",
        face_shapes: JSON.stringify(["Oval", "Long"]),
        style_type: "Masculine",
        pose: "Straight-on",
        image_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&crop=face,focalpoint&fp-x=0.5&fp-y=0.3",
        description: "Full, bouncy curls with natural volume",
        tags: JSON.stringify(["voluminous", "curly", "natural"])
      },
      {
        name: "Side Swept Bangs",
        category: "Medium",
        length: "Medium",
        texture: "Straight",
        face_shapes: JSON.stringify(["Heart", "Long"]),
        style_type: "Feminine",
        pose: "Side",
        image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop&crop=face,focalpoint&fp-x=0.5&fp-y=0.3",
        description: "Elegant side-swept bangs with shoulder-length hair",
        tags: JSON.stringify(["bangs", "elegant", "sophisticated"])
      }
    ];

    const stmt = this.db.prepare(`
      INSERT INTO hairstyles (id, name, category, length, texture, face_shapes, style_type, pose, image_url, description, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    sampleHairstyles.forEach(style => {
      stmt.run([
        uuidv4(),
        style.name,
        style.category,
        style.length,
        style.texture,
        style.face_shapes,
        style.style_type,
        style.pose,
        style.image_url,
        style.description,
        style.tags
      ]);
    });

    stmt.finalize();
    console.log('Sample hairstyles data inserted successfully');
  }

  getAllHairstyles(filters = {}) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM hairstyles WHERE 1=1';
      const params = [];

      // category filter removed from API surface

      if (filters.length) {
        if (Array.isArray(filters.length) && filters.length.length > 0) {
          const placeholders = filters.length.map(() => '?').join(',');
          query += ` AND length IN (${placeholders})`;
          params.push(...filters.length);
        } else if (typeof filters.length === 'string') {
          query += ' AND length = ?';
          params.push(filters.length);
        }
      }

      if (filters.texture) {
        if (Array.isArray(filters.texture) && filters.texture.length > 0) {
          const placeholders = filters.texture.map(() => '?').join(',');
          query += ` AND texture IN (${placeholders})`;
          params.push(...filters.texture);
        } else if (typeof filters.texture === 'string') {
          query += ' AND texture = ?';
          params.push(filters.texture);
        }
      }

      if (filters.face_shape) {
        if (Array.isArray(filters.face_shape) && filters.face_shape.length > 0) {
          const ors = filters.face_shape.map(() => 'face_shapes LIKE ?').join(' OR ');
          query += ` AND (${ors})`;
          filters.face_shape.forEach(v => params.push(`%"${v}"%`));
        } else if (typeof filters.face_shape === 'string') {
          query += ' AND face_shapes LIKE ?';
          params.push(`%"${filters.face_shape}"%`);
        }
      }

      if (filters.style_type) {
        if (Array.isArray(filters.style_type) && filters.style_type.length > 0) {
          const placeholders = filters.style_type.map(() => '?').join(',');
          query += ` AND style_type IN (${placeholders})`;
          params.push(...filters.style_type);
        } else if (typeof filters.style_type === 'string') {
          query += ' AND style_type = ?';
          params.push(filters.style_type);
        }
      }

      if (filters.pose) {
        if (Array.isArray(filters.pose) && filters.pose.length > 0) {
          const placeholders = filters.pose.map(() => '?').join(',');
          query += ` AND pose IN (${placeholders})`;
          params.push(...filters.pose);
        } else if (typeof filters.pose === 'string') {
          query += ' AND pose = ?';
          params.push(filters.pose);
        }
      }

      if (filters.search) {
        query += ' AND (name LIKE ? OR description LIKE ? OR tags LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      query += ' ORDER BY created_at DESC';

      this.db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Parse JSON fields
          const hairstyles = rows.map(row => ({
            ...row,
            face_shapes: JSON.parse(row.face_shapes),
            tags: JSON.parse(row.tags || '[]')
          }));
          resolve(hairstyles);
        }
      });
    });
  }

  getHairstyleById(id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM hairstyles WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve({
            ...row,
            face_shapes: JSON.parse(row.face_shapes),
            tags: JSON.parse(row.tags || '[]')
          });
        } else {
          resolve(null);
        }
      });
    });
  }

  addHairstyle(hairstyle) {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      const stmt = this.db.prepare(`
        INSERT INTO hairstyles (id, name, category, length, texture, face_shapes, image_url, image_data, description, tags)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run([
        id,
        hairstyle.name,
        hairstyle.category,
        hairstyle.length,
        hairstyle.texture,
        JSON.stringify(hairstyle.face_shapes),
        hairstyle.image_url,
        hairstyle.image_data || null,
        hairstyle.description,
        JSON.stringify(hairstyle.tags || [])
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, ...hairstyle });
        }
      });

      stmt.finalize();
    });
  }

  getFilters() {
    return new Promise((resolve, reject) => {
      const queries = [
        'SELECT DISTINCT length FROM hairstyles ORDER BY length',
        'SELECT DISTINCT texture FROM hairstyles ORDER BY texture',
        'SELECT DISTINCT style_type FROM hairstyles ORDER BY style_type',
        'SELECT DISTINCT pose FROM hairstyles ORDER BY pose',
        'SELECT face_shapes FROM hairstyles'
      ];

      Promise.all(queries.map(query => 
        new Promise((res, rej) => {
          this.db.all(query, (err, rows) => {
            if (err) rej(err);
            else res(rows);
          });
        })
      )).then(results => {
        const [lengths, textures, styleTypes, poses, faceShapesRows] = results;
        
        // Extract unique face shapes from JSON arrays
        const faceShapesSet = new Set();
        faceShapesRows.forEach(row => {
          const shapes = JSON.parse(row.face_shapes);
          shapes.forEach(shape => faceShapesSet.add(shape));
        });

        resolve({
          lengths: lengths.map(row => row.length),
          textures: textures.map(row => row.texture),
          style_types: styleTypes.map(row => row.style_type),
          poses: poses.map(row => row.pose),
          face_shapes: Array.from(faceShapesSet).sort()
        });
      }).catch(reject);
    });
  }

  close() {
    this.db.close();
  }
}

module.exports = Database;
