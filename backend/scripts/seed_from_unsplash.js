/*
  Seed 100 haircut photos into SQLite with tags/attributes.
  - Uses Unsplash Source (no API key) to get random haircut portraits
  - Resolves redirect to stable images.unsplash.com URL for consistency
  - Inserts via existing Database.addHairstyle()
*/

const fetch = require('node-fetch');
const Database = require('../database');

const db = new Database();

const lengths = ['Short', 'Medium', 'Long'];
const textures = ['Straight', 'Wavy', 'Curly', 'Coily', 'Textured'];
const styleTypes = ['Feminine', 'Masculine', 'Unisex'];
const poses = ['Straight-on', 'Angled', 'Side', 'Three-quarter'];
const ethnicities = ['Caucasian', 'Asian', 'Afro', 'Latinx', 'Middle Eastern', 'South Asian'];
const faceShapeOptions = ['Oval', 'Round', 'Square', 'Heart', 'Long', 'Diamond'];

const baseQueries = [
  'haircut', 'hairstyle', 'barber', 'barbershop', 'braid', 'braids', 'fade haircut',
  'taper fade', 'pixie cut', 'bob haircut', 'lob haircut', 'curly hair', 'wavy hair',
  'straight hair', 'layered hair', 'updo', 'bun hairstyle', 'ponytail hairstyle',
  'undercut', 'quiff', 'pompadour', 'buzz cut', 'afro hair', 'box braids', 'cornrows'
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickMany(arr, min = 1, max = 3) {
  const n = Math.max(min, Math.min(max, Math.floor(Math.random() * (max - min + 1)) + min));
  const copy = [...arr];
  const out = [];
  while (out.length < n && copy.length) {
    const i = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(i, 1)[0]);
  }
  return out;
}

// Build a descriptive name from attributes and query
function buildName({ query, length, texture }) {
  const parts = [];
  if (length) parts.push(length);
  if (texture && Math.random() < 0.8) parts.push(texture);
  const q = query.replace(/\b(haircut|hairstyle)\b/gi, '').trim();
  if (q) parts.push(q);
  parts.push('Style');
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

// Resolve a stable Unsplash image URL by following redirects and using the final response.url
async function resolveUnsplashUrl(query) {
  const w = 400, h = 500;
  const url = `https://source.unsplash.com/random/${w}x${h}/?${encodeURIComponent(query)}`;
  // Follow redirects to reach images.unsplash.com and take the final URL
  const res = await fetch(url, { redirect: 'follow' });
  if (res && typeof res.url === 'string' && res.url) {
    return res.url;
  }
  // Fallback: original Source URL
  return url;
}

async function seed(count = 100) {
  let inserted = 0;
  const usedImages = new Set();
  const genderHints = ['', 'woman', 'man', 'female', 'male'];

  for (let i = 0; i < count; i++) {
    try {
      const length = pick(lengths);
      const texture = pick(textures);
      const style_type = pick(styleTypes);
      const pose = pick(poses);
      const ethnicity = Math.random() < 0.85 ? pick(ethnicities) : null;
      const face_shapes = pickMany(faceShapeOptions, 2, 3);

      const q = [pick(baseQueries), pick(genderHints), 'portrait']
        .filter(Boolean)
        .join(', ');

      const image_url = await resolveUnsplashUrl(q);
      if (usedImages.has(image_url)) { i--; continue; }
      usedImages.add(image_url);

      const name = buildName({ query: q, length, texture });

      const tags = Array.from(new Set([
        ...q.split(/[,\s]+/).map(s => s.toLowerCase()).filter(Boolean),
        length.toLowerCase(),
        texture.toLowerCase(),
        pose.toLowerCase().replace(/\s+/g, '-'),
        style_type.toLowerCase(),
      ])).slice(0, 8);

      const category = length; // keep category aligned with existing data

      await db.addHairstyle({
        name,
        category,
        length,
        texture,
        face_shapes,
        style_type,
        pose,
        ethnicity,
        image_url,
        image_data: null,
        description: `${name} featuring ${texture.toLowerCase()} texture in a ${length.toLowerCase()} length.`,
        tags,
      });

      inserted++;
      if (i % 10 === 0) console.log(`Inserted ${inserted}/${count}`);
    } catch (e) {
      console.warn('Seed item failed, retrying...', e.message);
      // retry this index with a new attempt
      i--;
      await new Promise(r => setTimeout(r, 200));
    }
  }

  console.log(`Done. Inserted ${inserted} hairstyles.`);
  db.close();
}

if (require.main === module) {
  const n = Number(process.argv[2]) || 100;
  seed(n).catch(err => { console.error(err); process.exit(1); });
}
