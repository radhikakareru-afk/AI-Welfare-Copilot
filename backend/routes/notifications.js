const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/users/:userId/notifications
router.get('/users/:userId/notifications', async (req, res) => {
  const { userId } = req.params;
  try {
    const { rows } = await db.query(
      `SELECT 
        id, 
        user_id, 
        title, 
        message, 
        type, 
        is_read, 
        related_scheme_id AS deadline_scheme_id, 
        created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC;`,
      [userId]
    );

    res.json({ success: true, notifications: rows });
  } catch (err) {
    console.error('Error fetching notifications:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/notifications/:id/read
router.put('/notifications/:id/read', async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = $1;',
      [id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    console.error('Error marking notification as read:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Extra endpoint to mark all as read: PUT /api/users/:userId/notifications/read-all
router.put('/users/:userId/notifications/read-all', async (req, res) => {
  const { userId } = req.params;
  try {
    await db.query('UPDATE notifications SET is_read = TRUE WHERE user_id = $1;', [userId]);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Error marking all notifications as read:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
