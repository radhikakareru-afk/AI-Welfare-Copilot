const express = require('express');
const router = express.Router();
const db = require('../db');

// Middleware to authorize admin requests securely using database lookup
const requireAdmin = async (req, res, next) => {
  const adminId = req.headers['x-user-id'];
  if (!adminId) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing administrator user ID' });
  }

  try {
    const { rows } = await db.query('SELECT role, is_active FROM users WHERE id = $1;', [adminId]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Administrator account not found' });
    }
    
    const admin = rows[0];
    if (!admin.is_active) {
      return res.status(403).json({ success: false, message: 'Forbidden: Administrator account is suspended' });
    }
    
    if (admin.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Admin privilege required' });
    }

    next();
  } catch (err) {
    console.error('Admin middleware error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/admin/users (Retrieve all citizens/users joined with profiles)
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT u.id, u.full_name, u.email, u.role, u.is_active, u.created_at, p.state
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       ORDER BY u.created_at DESC;`
    );
    res.json({ success: true, users: rows });
  } catch (err) {
    console.error('Error fetching admin users:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/admin/users/:id/status (Suspend or Activate a user)
router.put('/users/:id/status', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  if (is_active === undefined) {
    return res.status(400).json({ success: false, message: 'Please provide is_active status' });
  }

  try {
    const { rowCount } = await db.query(
      'UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2;',
      [is_active, id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: `User status updated to ${is_active ? 'Active' : 'Inactive'}` });
  } catch (err) {
    console.error('Error updating user status:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
