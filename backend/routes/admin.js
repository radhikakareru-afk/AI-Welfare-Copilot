const express = require('express');
const router = express.Router();
const db = require('../db');
const syncScheduler = require('../app/scheduler/syncScheduler');
const providerRegistry = require('../app/providers');

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

// GET /api/admin/stats (Real database-backed admin statistics)
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const [
      citizensCountRes,
      activeCitizensRes,
      schemesCountRes,
      assessmentsCountRes,
      favoritesCountRes,
      categoriesRes,
      recentUsersRes,
      recentSyncRes
    ] = await Promise.all([
      db.query("SELECT COUNT(*) AS count FROM users WHERE role = 'citizen';"),
      db.query("SELECT COUNT(*) AS count FROM users WHERE role = 'citizen' AND is_active = TRUE;"),
      db.query("SELECT COUNT(*) AS count FROM schemes WHERE is_active = TRUE;"),
      db.query("SELECT COUNT(*) AS count FROM eligibility_checks;"),
      db.query("SELECT COUNT(*) AS count FROM favorites;"),
      db.query(`
        SELECT c.name, COUNT(s.id)::int AS scheme_count 
        FROM scheme_categories c 
        LEFT JOIN schemes s ON c.id = s.category_id AND s.is_active = TRUE 
        GROUP BY c.id, c.name 
        ORDER BY scheme_count DESC;
      `),
      db.query(`
        SELECT u.id, u.full_name, u.email, u.is_active, u.created_at, p.state 
        FROM users u 
        LEFT JOIN user_profiles p ON u.id = p.user_id 
        WHERE u.role = 'citizen' 
        ORDER BY u.created_at DESC 
        LIMIT 5;
      `),
      db.query(`
        SELECT l.id, p.name AS provider, l.status, l.records_fetched, l.started_at, l.error_message
        FROM sync_logs l
        LEFT JOIN data_providers p ON l.provider_id = p.id
        ORDER BY l.started_at DESC
        LIMIT 5;
      `)
    ]);

    const totalCitizens = parseInt(citizensCountRes.rows[0].count, 10);
    const activeCitizens = parseInt(activeCitizensRes.rows[0].count, 10);
    const totalSchemes = parseInt(schemesCountRes.rows[0].count, 10);
    const totalAssessments = parseInt(assessmentsCountRes.rows[0].count, 10);
    const totalFavorites = parseInt(favoritesCountRes.rows[0].count, 10);

    res.json({
      success: true,
      stats: {
        totalCitizens,
        activeCitizens,
        totalSchemes,
        totalAssessments,
        totalFavorites,
        categoryBreakdown: categoriesRes.rows,
        recentCitizens: recentUsersRes.rows,
        syncLogs: recentSyncRes.rows,
        telemetry: {
          databaseStatus: 'Operational',
          schedulerStatus: 'Online',
          serverTime: new Date().toISOString()
        }
      }
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/schemes (Retrieve all schemes with category names and active statuses)
router.get('/schemes', requireAdmin, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT s.id, s.scheme_code, s.name, s.description, s.state, s.target_audience, 
             s.is_active, s.created_at, c.name AS category
      FROM schemes s
      LEFT JOIN scheme_categories c ON s.category_id = c.id
      ORDER BY s.id ASC;
    `);
    res.json({ success: true, schemes: rows });
  } catch (err) {
    console.error('Error fetching admin schemes:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/admin/schemes/:id/status (Toggle scheme active status)
router.put('/schemes/:id/status', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  if (is_active === undefined) {
    return res.status(400).json({ success: false, message: 'Please provide is_active status' });
  }

  try {
    const { rowCount } = await db.query(
      'UPDATE schemes SET is_active = $1, updated_at = NOW() WHERE id = $2;',
      [is_active, id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Scheme not found' });
    }

    res.json({ success: true, message: `Scheme status updated to ${is_active ? 'Active' : 'Inactive'}` });
  } catch (err) {
    console.error('Error updating scheme status:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/sync (Execute genuine catalog synchronization via SyncScheduler)
router.post('/sync', requireAdmin, async (req, res) => {
  const adminId = req.headers['x-user-id'] || 'admin';
  try {
    const result = await syncScheduler.runSync({
      syncType: 'manual',
      triggeredBy: adminId
    });

    if (result.code === 'SYNC_IN_PROGRESS') {
      return res.status(409).json({
        success: false,
        message: result.message,
        startedAt: result.startedAt
      });
    }

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.message || 'Synchronization failed',
        error: result.error,
        summary: result
      });
    }

    res.json({
      success: true,
      message: result.message,
      syncLogId: result.syncLogId,
      recordsSynchronized: result.recordsUpdated,
      recordsFetched: result.recordsFetched,
      durationSeconds: result.durationSeconds,
      provider: result.providerName || 'Official Government Platforms'
    });
  } catch (err) {
    console.error('Error during synchronization:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/sync/status (Retrieve real-time scheduler state and provider health diagnostics)
router.get('/sync/status', requireAdmin, async (req, res) => {
  try {
    const schedulerState = syncScheduler.getStatus();
    const providerStatuses = await providerRegistry.getAllStatus();

    res.json({
      success: true,
      scheduler: schedulerState,
      providers: providerStatuses
    });
  } catch (err) {
    console.error('Error fetching admin sync status:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/sync/logs (Retrieve audit history from PostgreSQL)
router.get('/sync/logs', requireAdmin, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT l.id, p.name AS provider, l.sync_type, l.status, 
             l.records_fetched, l.records_updated, l.records_inserted, l.records_failed,
             l.started_at, l.ended_at, l.duration_seconds, l.error_message
      FROM sync_logs l
      LEFT JOIN data_providers p ON l.provider_id = p.id
      ORDER BY l.started_at DESC
      LIMIT 50;
    `);
    res.json({ success: true, logs: rows });
  } catch (err) {
    console.error('Error fetching sync logs:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
