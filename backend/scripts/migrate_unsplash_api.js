/*
  Migrate source.unsplash.com URLs to stable images using the Unsplash API.
  Usage:
    UNSPLASH_ACCESS_KEY=YOUR_KEY node scripts/migrate_unsplash_api.js [limit]
*/
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const fetch = require('node-fetch');
const Database = require('../database');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function buildQueryFromSourceUrl(urlStr) {
  try {
    const u = new URL(urlStr);
    const q = u.searchParams.get('') || u.searchParams.toString();
    // Unsplash Source uses `?<keywords separated by commas>` form as well as `?query=...`
    // Example: ?layered hair, woman, portrait OR ?layered%20hair%2C%20woman%2C%20portrait
    // Normalize commas to spaces for API search
    let query = q;
    if (!query && u.search) {
      query = decodeURIComponent(u.search.replace(/^\?/, ''));
    }
    if (!query) return '';
    // If the API-like form `?query=...` was used, extract that value
    const sp = new URLSearchParams(u.search);
    const qParam = sp.get('query');
    if (qParam) return qParam.trim();
    return query.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
  } catch { return ''; }
}

async function searchUnsplashMany(query, orientation = 'portrait') {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) throw new Error('UNSPLASH_ACCESS_KEY is required');
  const url = new URL('https://api.unsplash.com/search/photos');
  url.searchParams.set('query', query || 'hairstyle portrait');
  url.searchParams.set('per_page', '10');
  url.searchParams.set('orientation', orientation);
  url.searchParams.set('order_by', 'relevant');
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Client-ID ${key}` }
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Unsplash API ${res.status}: ${text}`);
  }
  const data = await res.json();
  if (!data || !data.results) return [];
  return data.results;
}

function buildStableImageUrl(photo) {
  // Prefer raw with our own transform to a consistent 400x500 crop of the face/center
  // Fall back to photo.urls.regular if raw missing
  const base = (photo.urls && (photo.urls.raw || photo.urls.full || photo.urls.regular)) || '';
  if (!base) return '';
  const u = new URL(base);
  // Ensure we hit images CDN with deterministic sizing
  const sp = u.searchParams;
  sp.set('w', '400');
  sp.set('h', '500');
  sp.set('fit', 'crop');
  // Use Unsplash focal parameters when available (not always present). Center crop otherwise.
  if (!sp.has('crop')) sp.set('crop', 'faces,entropy');
  return u.toString();
}

async function main(limit = Infinity) {
  const db = new Database();
  let updated = 0;
  try {
    const rows = await db.getAllHairstyles({});
    // Build a set of already-used Unsplash IDs from DB (column and URL pattern)
    const usedIds = new Set();
    const photoIdFromUrl = (u) => {
      try {
        const url = new URL(u);
        // images.unsplash.com/photo-<id>
        const m = url.pathname.match(/\/photo-([A-Za-z0-9_-]+)/);
        return m ? m[1] : null;
      } catch { return null; }
    };
    rows.forEach(r => {
      if (r.unsplash_photo_id) usedIds.add(r.unsplash_photo_id);
      const pid = photoIdFromUrl(r.image_url);
      if (pid) usedIds.add(pid);
    });
    for (const r of rows) {
      if (!r?.image_url) continue;
      let host = '';
      try { host = new URL(r.image_url).hostname; } catch {}
      if (host !== 'source.unsplash.com') continue;

      const baseQ = buildQueryFromSourceUrl(r.image_url);
      const enriched = [r.name, r.style_type, r.length, r.texture, 'hair hairstyle portrait headshot facing']
        .filter(Boolean)
        .join(' ');
      const query = [baseQ, enriched].filter(Boolean).join(' ');
      let photo = null;
      try {
        const results = await searchUnsplashMany(query || `${r.name} portrait hairstyle`);
        photo = (results || []).find(p => !usedIds.has(p.id)) || results?.[0] || null;
      } catch (e) {
        console.warn(`Unsplash search failed for id=${r.id}`, e.message);
        await sleep(200); // tiny backoff
        continue;
      }
      if (!photo) {
        console.warn(`No results for query="${query}" (id=${r.id})`);
        continue;
      }
      const finalUrl = buildStableImageUrl(photo);
      if (!finalUrl) continue;

      try {
        await db.updateImageAndUnsplashId(r.id, finalUrl, photo.id);
        usedIds.add(photo.id);
        updated++;
        if (updated % 10 === 0) console.log(`Updated ${updated}`);
        if (updated >= limit) break;
        // Respect gentle rate limits
        await sleep(120);
      } catch (e) {
        console.warn('DB update failed:', e.message);
      }
    }
    console.log(`Done. Updated ${updated} records.`);
  } catch (e) {
    console.error('Migration error:', e);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  const n = Number(process.argv[2]) || Infinity;
  main(n);
}
