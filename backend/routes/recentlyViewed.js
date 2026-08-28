const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/users/:userId/recently-viewed
router.get('/users/:userId/recently-viewed', async (req, res) => {
  const { userId } = req.params;
  try {
    const { rows } = await db.query(
      'SELECT scheme_id::text FROM recently_viewed WHERE user_id = $1 ORDER BY viewed_at DESC LIMIT 5;',
      [userId]
    );
    const schemeIds = rows.map(r => r.scheme_id);
    res.json({ success: true, recentlyViewed: schemeIds });
  } catch (err) {
    console.error('Error fetching recently viewed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/recently-viewed
router.post('/recently-viewed', async (req, res) => {
  const { user_id, scheme_id } = req.body;
  if (!user_id || !scheme_id) {
    return res.status(400).json({ success: false, message: 'Please provide user_id and scheme_id' });
  }

  try {
    // Prevent duplication by deleting any existing view for this user/scheme first
    await db.query('DELETE FROM recently_viewed WHERE user_id = $1 AND scheme_id = $2;', [user_id, scheme_id]);

    // Insert new view
    const { rows } = await db.query(
      'INSERT INTO recently_viewed (user_id, scheme_id, viewed_at) VALUES ($1, $2, NOW()) RETURNING *;',
      [user_id, scheme_id]
    );

    // Clean up to keep only top 5 (optional but good practice)
    // Find IDs of top 5 most recent views and delete anything older
    await db.query(`
      DELETE FROM recently_viewed
      WHERE user_id = $1 AND id NOT IN (
        SELECT id FROM recently_viewed
        WHERE user_id = $1
        ORDER BY viewed_at DESC
        LIMIT 5
      );
    `, [user_id]);

    res.status(201).json({ success: true, recentlyViewed: rows[0] });
  } catch (err) {
    console.error('Error adding recently viewed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
