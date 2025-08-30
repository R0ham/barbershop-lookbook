#!/usr/bin/env node
/*
  Prune DB to keep only first N rows in `hairstyles` and delete the rest.
  Usage:
    node scripts/prune_keep_first_n.js [N] [--dry-run]
  Defaults:
    N = 12
*/

const path = require('path');
const Database = require('../database');

async function main() {
  const args = process.argv.slice(2);
  const n = Math.max(0, parseInt(args[0] || '12', 10) || 12);
  const dryRun = args.includes('--dry-run');

  const db = new Database();
  try {
    const keepRows = await new Promise((resolve, reject) => {
      db.db.all(
        `SELECT id, name FROM hairstyles ORDER BY created_at ASC, id ASC LIMIT ?`,
        [n],
        (err, rows) => (err ? reject(err) : resolve(rows || []))
      );
    });

    const keepIds = new Set(keepRows.map(r => r.id));

    const allRows = await new Promise((resolve, reject) => {
      db.db.all(
        `SELECT id, name FROM hairstyles ORDER BY created_at ASC, id ASC`,
        (err, rows) => (err ? reject(err) : resolve(rows || []))
      );
    });

    const deleteIds = allRows.filter(r => !keepIds.has(r.id)).map(r => r.id);

    if (dryRun) {
      console.log(`[DRY RUN] Will keep ${keepRows.length} rows (first ${n}). Will delete ${deleteIds.length} rows.`);
      if (deleteIds.length) console.log(`[DRY RUN] IDs to delete:`, deleteIds.join(','));
      return;
    }

    await new Promise((resolve, reject) => {
      db.db.run('BEGIN', (e) => (e ? reject(e) : resolve()));
    });

    try {
      await new Promise((resolve, reject) => {
        const placeholders = deleteIds.map(() => '?').join(',');
        if (!placeholders) return resolve();
        db.db.run(
          `DELETE FROM hairstyles WHERE id IN (${placeholders})`,
          deleteIds,
          function (err) {
            if (err) return reject(err);
            resolve();
          }
        );
      });

      await new Promise((resolve, reject) => {
        db.db.run('COMMIT', (e) => (e ? reject(e) : resolve()));
      });
      console.log(`Deleted ${deleteIds.length} rows. Kept ${keepRows.length}.`);
    } catch (e) {
      await new Promise((resolve) => db.db.run('ROLLBACK', () => resolve()));
      throw e;
    }
  } catch (e) {
    console.error('Prune failed:', e.message);
    process.exitCode = 1;
  } finally {
    db.close();
  }
}

main();
