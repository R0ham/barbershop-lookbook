const express = require('express');
const router = express.Router();
const db = require('./postgres-database');

// Get all favorites for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Ensure user exists
    await db.getOrCreateUser(userId);
    
    // Get user's favorites with full hairstyle data
    const result = await db.query(
      `SELECT h.* 
       FROM hairstyles h
       JOIN user_favorites uf ON h.id = uf.hairstyle_id
       WHERE uf.user_id = $1
       ORDER BY uf.created_at DESC`,
      [userId]
    );
    
    res.json({ favorites: result.rows });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Add a hairstyle to favorites
router.post('/:userId/:hairstyleId', async (req, res) => {
  try {
    const { userId, hairstyleId } = req.params;
    
    // Ensure user exists
    await db.getOrCreateUser(userId);
    
    // Check if the hairstyle exists
    const hairstyleCheck = await db.query('SELECT id FROM hairstyles WHERE id = $1', [hairstyleId]);
    if (hairstyleCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Hairstyle not found' });
    }
    
    // Add to favorites if not already favorited
    const result = await db.query(
      `INSERT INTO user_favorites (user_id, hairstyle_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, hairstyle_id) DO NOTHING
       RETURNING *`,
      [userId, hairstyleId]
    );
    
    res.json({ 
      success: true, 
      added: result.rowCount > 0 
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// Remove a hairstyle from favorites
router.delete('/:userId/:hairstyleId', async (req, res) => {
  try {
    const { userId, hairstyleId } = req.params;
    
    const result = await db.query(
      'DELETE FROM user_favorites WHERE user_id = $1 AND hairstyle_id = $2 RETURNING *',
      [userId, hairstyleId]
    );
    
    res.json({ 
      success: true, 
      removed: result.rowCount > 0 
    });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

// Check if a hairstyle is favorited
router.get('/:userId/:hairstyleId', async (req, res) => {
  try {
    const { userId, hairstyleId } = req.params;
    
    const result = await db.query(
      'SELECT 1 FROM user_favorites WHERE user_id = $1 AND hairstyle_id = $2',
      [userId, hairstyleId]
    );
    
    res.json({ isFavorite: result.rowCount > 0 });
  } catch (error) {
    console.error('Error checking favorite:', error);
    res.status(500).json({ error: 'Failed to check favorite status' });
  }
});

module.exports = router;
