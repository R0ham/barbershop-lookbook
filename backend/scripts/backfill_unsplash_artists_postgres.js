#!/usr/bin/env node
/*
  Backfill artist_name and artist_url for hairstyles in Postgres (Neon).
  Requirements:
    - env DATABASE_URL: Postgres connection string
    - env UNSPLASH_ACCESS_KEY: Unsplash API access key
  Usage:
    node backend/scripts/backfill_unsplash_artists_postgres.js [--dry]
*/

const path = require('path');
// Load env from backend/.env
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;
const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const DRY = process.argv.includes('--dry');

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is required');
  process.exit(1);
}
if (!ACCESS_KEY) {
  console.error('ERROR: UNSPLASH_ACCESS_KEY is required');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

function extractPhotoId(imageUrl) {
  if (!imageUrl) return null;
  try {
    const u = new URL(imageUrl);
    // handle /photo-<id>
    const m = u.pathname.match(/\/photo-([a-zA-Z0-9_-]+)/);
    if (m) return m[1];
  } catch {}
  return null;
}

async function fetchPhoto(id, attempt = 1) {
  try {
    const res = await fetch(`https://api.unsplash.com/photos/${id}`, {
      headers: {
        Authorization: `Client-ID ${ACCESS_KEY}`,
        'Accept-Version': 'v1'
      }
    });
    if (res.status === 429 && attempt <= 3) {
      const wait = 500 * attempt;
      console.warn(`Rate limited by Unsplash (429). Retrying in ${wait}ms...`);
      await new Promise(r => setTimeout(r, wait));
      return fetchPhoto(id, attempt + 1);
    }
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.warn(`Unsplash fetch failed for ${id}: ${res.status} ${res.statusText} ${text.slice(0,200)}`);
      return null;
    }
    return await res.json();
  } catch (e) {
    console.warn('Unsplash fetch error for', id, e.message);
    return null;
  }
}

function deriveArtistUrl(user) {
  if (!user) return null;
  if (user.username) return `https://unsplash.com/@${user.username}`;
  if (user.links && user.links.html) return user.links.html;
  return null;
}

async function main() {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(`
      SELECT id, image_url, unsplash_photo_id, artist_name, artist_url
      FROM hairstyles
      ORDER BY created_at ASC
    `);

    let updated = 0;
    for (const r of rows) {
      if (r.artist_name && r.artist_url && r.unsplash_photo_id) continue;
      let pid = r.unsplash_photo_id || extractPhotoId(r.image_url);
      if (!pid) {
        console.log(`[skip] ${r.id} no photo id`);
        continue;
      }
      const photo = await fetchPhoto(pid);
      // soft rate limit
      await new Promise(res => setTimeout(res, 200));
      let artistName, artistUrl, ensuredPid;
      if (!photo || !photo.user) {
        console.log(`[no-user] ${r.id} pid=${pid} -> defaulting to Unknown/Unsplash`);
        artistName = 'Unknown';
        artistUrl = 'https://unsplash.com';
        ensuredPid = pid;
      } else {
        artistName = photo.user.name || photo.user.username || null;
        artistUrl = deriveArtistUrl(photo.user);
        ensuredPid = photo.id || pid;
      }

      if (DRY) {
        console.log(`[dry] would update ${r.id} -> artist_name='${artistName}', artist_url='${artistUrl}', unsplash_photo_id='${ensuredPid}'`);
        continue;
      }

      const { rowCount } = await client.query(
        `UPDATE hairstyles
         SET artist_name = COALESCE($1, artist_name),
             artist_url = COALESCE($2, artist_url),
             unsplash_photo_id = COALESCE($3, unsplash_photo_id),
             updated_at = NOW()
         WHERE id = $4`,
        [artistName, artistUrl, ensuredPid, r.id]
      );
      if (rowCount > 0) {
        updated++;
        console.log(`[ok] updated ${r.id}`);
      }
    }
    console.log(`Done. Updated ${updated} rows.`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
