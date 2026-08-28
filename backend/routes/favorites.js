const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/users/:userId/favorites
router.get('/users/:userId/favorites', async (req, res) => {
  const { userId } = req.params;
  try {
    const { rows } = await db.query('SELECT scheme_id::text FROM favorites WHERE user_id = $1;', [userId]);
    const schemeIds = rows.map(r => r.scheme_id);
    res.json({ success: true, favorites: schemeIds });
  } catch (err) {
    console.error('Error fetching favorites:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/favorites
router.post('/favorites', async (req, res) => {
  const { user_id, scheme_id } = req.body;
  if (!user_id || !scheme_id) {
    return res.status(400).json({ success: false, message: 'Please provide user_id and scheme_id' });
  }

  try {
    // Check if already favorited
    const check = await db.query('SELECT id FROM favorites WHERE user_id = $1 AND scheme_id = $2;', [user_id, scheme_id]);
    if (check.rows.length > 0) {
      return res.json({ success: true, message: 'Already favorited', favorite: check.rows[0] });
    }

    const { rows } = await db.query(
      'INSERT INTO favorites (user_id, scheme_id, created_at) VALUES ($1, $2, NOW()) RETURNING *;',
      [user_id, scheme_id]
    );

    res.status(201).json({ success: true, favorite: rows[0] });
  } catch (err) {
    console.error('Error adding favorite:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/favorites/:id
router.delete('/favorites/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM favorites WHERE id = $1;', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Favorite not found' });
    }
    res.json({ success: true, message: 'Favorite deleted successfully' });
  } catch (err) {
    console.error('Error deleting favorite:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Extra helper for easy toggling: DELETE /api/users/:userId/favorites/:schemeId
router.delete('/users/:userId/schemes/:schemeId', async (req, res) => {
  const { userId, schemeId } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM favorites WHERE user_id = $1 AND scheme_id = $2;', [userId, schemeId]);
    if (rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Favorite not found' });
    }
    res.json({ success: true, message: 'Favorite removed successfully' });
  } catch (err) {
    console.error('Error removing favorite:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
