const express = require('express');
const router = express.Router();
const db = require('../db');

// Handler for public platform aggregate statistics
const getPlatformStatistics = async (req, res) => {
  try {
    const [
      schemesRes,
      statesRes,
      citizensRes,
      syncRes
    ] = await Promise.all([
      db.query(`
        SELECT 
          COUNT(*) FILTER (WHERE is_active = TRUE) AS active_schemes,
          COUNT(*) AS total_schemes,
          COUNT(*) FILTER (WHERE is_active = TRUE AND state IS NULL) AS central_schemes,
          COUNT(*) FILTER (WHERE is_active = TRUE AND state IS NOT NULL) AS state_schemes
        FROM schemes;
      `),
      db.query(`
        SELECT DISTINCT state 
        FROM schemes 
        WHERE is_active = TRUE AND state IS NOT NULL AND TRIM(state) != ''
        ORDER BY state;
      `),
      db.query(`
        SELECT 
          COUNT(*) AS total_citizens,
          COUNT(*) FILTER (WHERE is_active = TRUE) AS active_citizens,
          COUNT(*) FILTER (WHERE is_verified = TRUE) AS verified_citizens
        FROM users 
        WHERE role = 'citizen';
      `),
      db.query(`
        SELECT 
          COUNT(*) AS total_syncs,
          COUNT(*) FILTER (WHERE status = 'success') AS successful_syncs,
          MAX(started_at) AS last_sync_time
        FROM sync_logs;
      `)
    ]);

    const schemeRow = schemesRes.rows[0];
    const activeSchemes = parseInt(schemeRow.active_schemes, 10) || 0;
    const centralSchemes = parseInt(schemeRow.central_schemes, 10) || 0;
    const stateSchemes = parseInt(schemeRow.state_schemes, 10) || 0;

    const supportedStates = statesRes.rows.map(r => r.state);
    const distinctStatesCount = supportedStates.length;

    const citizenRow = citizensRes.rows[0];
    const totalCitizens = parseInt(citizenRow.total_citizens, 10) || 0;
    const activeCitizens = parseInt(citizenRow.active_citizens, 10) || 0;
    const verifiedCitizens = parseInt(citizenRow.verified_citizens, 10) || 0;

    const syncRow = syncRes.rows[0];
    const totalSyncs = parseInt(syncRow.total_syncs, 10) || 0;
    const successfulSyncs = parseInt(syncRow.successful_syncs, 10) || 0;
    const lastSyncTime = syncRow.last_sync_time;

    let syncStatus = 'Standby';
    let syncPercentage = null;
    let isSyncCalculated = false;
    let syncDetail = 'Automated background sync scheduler is not yet active (0 sync operations recorded).';

    if (totalSyncs > 0) {
      const pct = Math.round((successfulSyncs / totalSyncs) * 100);
      syncPercentage = pct;
      syncStatus = `${pct}%`;
      isSyncCalculated = true;
      syncDetail = `${successfulSyncs} of ${totalSyncs} sync operations successful.`;
    }

    res.json({
      success: true,
      data: {
        schemes: {
          count: activeSchemes,
          formatted: activeSchemes.toLocaleString(),
          label: "Welfare Schemes",
          active_count: activeSchemes,
          central_count: centralSchemes,
          state_specific_count: stateSchemes
        },
        states: {
          count: distinctStatesCount,
          formatted: distinctStatesCount.toLocaleString(),
          label: distinctStatesCount === 1 ? "State Supported" : "States Supported",
          supported_states: supportedStates,
          has_central_schemes: centralSchemes > 0
        },
        citizens: {
          count: totalCitizens,
          formatted: totalCitizens.toLocaleString(),
          label: "Registered Users",
          active_count: activeCitizens,
          verified_count: verifiedCitizens
        },
        synchronization: {
          status: syncStatus,
          formatted: syncStatus,
          label: "Auto-Synchronized",
          percentage: syncPercentage,
          is_calculated: isSyncCalculated,
          total_syncs: totalSyncs,
          successful_syncs: successfulSyncs,
          last_sync_time: lastSyncTime,
          detail: syncDetail
        }
      }
    });
  } catch (err) {
    console.error('Error calculating public statistics:', err.message);
    res.status(500).json({
      success: false,
      error: 'Unable to retrieve platform statistics at this time'
    });
  }
};

// Route mappings: /statistics, /public/statistics
router.get('/statistics', getPlatformStatistics);
router.get('/public/statistics', getPlatformStatistics);

module.exports = router;
