const express = require('express');
const Database = require('./database');

const router = express.Router();
const db = new Database();

// Get user's favorites
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  
  db.getUserFavorites(userId, (err, favorites) => {
    if (err) {
      console.error('Error fetching favorites:', err);
      return res.status(500).json({ error: 'Failed to fetch favorites' });
    }
    res.json({ favorites });
  });
});

// Add to favorites
router.post('/:userId/:hairstyleId', (req, res) => {
  const { userId, hairstyleId } = req.params;
  
  db.addFavorite(userId, hairstyleId, (err, added) => {
    if (err) {
      console.error('Error adding favorite:', err);
      return res.status(500).json({ error: 'Failed to add favorite' });
    }
    res.json({ success: true, added });
  });
});

// Remove from favorites
router.delete('/:userId/:hairstyleId', (req, res) => {
  const { userId, hairstyleId } = req.params;
  
  db.removeFavorite(userId, hairstyleId, (err, removed) => {
    if (err) {
      console.error('Error removing favorite:', err);
      return res.status(500).json({ error: 'Failed to remove favorite' });
    }
    res.json({ success: true, removed });
  });
});

// Check if favorited
router.get('/:userId/:hairstyleId', (req, res) => {
  const { userId, hairstyleId } = req.params;
  
  db.isFavorite(userId, hairstyleId, (err, isFavorite) => {
    if (err) {
      console.error('Error checking favorite:', err);
      return res.status(500).json({ error: 'Failed to check favorite status' });
    }
    res.json({ isFavorite });
  });
});

module.exports = router;
