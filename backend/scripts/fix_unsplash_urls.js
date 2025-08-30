/*
  Fix existing records that have source.unsplash.com URLs by resolving to final images.unsplash.com
*/
const fetch = require('node-fetch');
const Database = require('../database');

async function resolveFinal(startUrl, maxHops = 8) {
  // Fast path: try with automatic redirect following to capture final res.url
  try {
    const resFollow = await fetch(startUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'Referer': 'https://unsplash.com/'
      },
    });
    if (resFollow && resFollow.url) {
      return resFollow.url;
    }
  } catch (e) {
    // fall through to manual mode
  }

  // Manual redirect following as a fallback
  let url = startUrl;
  for (let i = 0; i < maxHops; i++) {
    try {
      const res = await fetch(url, {
        redirect: 'manual',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
          'Referer': 'https://unsplash.com/'
        },
      });
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get('location');
        if (!loc) break;
        url = new URL(loc, url).toString();
        try {
          const host = new URL(url).hostname;
          if (host === 'images.unsplash.com') return url;
        } catch {}
        continue;
      }
      return res.url || url;
    } catch (e) {
      console.warn('Resolve failed:', e.message);
      break;
    }
  }
  return url;
}

async function main(limit = Infinity) {
  const db = new Database();
  try {
    const rows = await db.getAllHairstyles({});
    let updated = 0;
    for (const r of rows) {
      if (!r?.image_url) continue;
      let host = '';
      try { host = new URL(r.image_url).hostname; } catch {}
      if (host !== 'source.unsplash.com') continue;
      const finalUrl = await resolveFinal(r.image_url);
      // Only update when the final host is images.unsplash.com
      try {
        const h2 = new URL(finalUrl).hostname;
        if (h2 !== 'images.unsplash.com') {
          continue;
        }
      } catch {}
      if (finalUrl && finalUrl !== r.image_url) {
        await db.updateImageUrl(r.id, finalUrl);
        updated++;
        if (updated % 10 === 0) console.log(`Updated ${updated}`);
        if (updated >= limit) break;
      }
    }
    console.log(`Done. Updated ${updated} records.`);
  } catch (e) {
    console.error('Fix script error:', e);
    process.exitCode = 1;
  } finally {
    try { db.close(); } catch {}
  }
}

if (require.main === module) {
  const n = Number(process.argv[2]) || Infinity;
  main(n);
}
