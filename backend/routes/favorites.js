import express from 'express';
import { getFavoritesByUsername, upsertFavorites, deleteFavorites } from '../data/favorites.js';

const router = express.Router();

// GET /api/favorites/:username - get favorites for a user
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const result = await getFavoritesByUsername(username);
    res.setHeader('Content-Type', 'application/json');
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ 
      error: true,
      message: err.message || 'Failed to fetch favorites' 
    });
  }
});

// PUT /api/favorites/:username - update favorites for a user
router.put('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { favorites } = req.body;
    const result = await upsertFavorites(username, favorites);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// DELETE /api/favorites/:username - delete favorites for a user
router.delete('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const result = await deleteFavorites(username);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

export default router;
