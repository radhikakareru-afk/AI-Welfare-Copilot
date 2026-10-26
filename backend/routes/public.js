const express = require('express');
const router = express.Router();
const db = require('../db');
const syncScheduler = require('../app/scheduler/syncScheduler');

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
          COUNT(*) FILTER (WHERE status = 'failed') AS failed_syncs,
          COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress_syncs,
          MAX(started_at) AS last_sync_time
        FROM sync_logs;
      `),
      db.query(`
        SELECT status, started_at, ended_at, error_message, duration_seconds
        FROM sync_logs
        ORDER BY started_at DESC
        LIMIT 1;
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
    const inProgressSyncs = parseInt(syncRow.in_progress_syncs, 10) || 0;
    const lastSyncTime = syncRow.last_sync_time;
    
    // Check latest log from second query
    const latestLogRes = await db.query(`
      SELECT status, started_at, ended_at, error_message, duration_seconds
      FROM sync_logs
      ORDER BY started_at DESC
      LIMIT 1;
    `);
    const latestSync = latestLogRes.rows[0] || null;

    const schedulerTelemetry = syncScheduler.getStatus();

    let syncStatus = 'Inactive';
    let syncPercentage = null;
    let isSyncCalculated = false;
    let syncDetail = 'Automatic background synchronization is not active (0 sync operations recorded).';
    let isImplemented = schedulerTelemetry.schedulerRunning;

    if (schedulerTelemetry.isSyncing || inProgressSyncs > 0) {
      syncStatus = 'Syncing';
      isImplemented = true;
      syncDetail = 'A catalog synchronization job is currently in progress.';
    } else if (totalSyncs > 0 && latestSync) {
      isSyncCalculated = true;
      isImplemented = true;
      const pct = Math.round((successfulSyncs / totalSyncs) * 100);
      syncPercentage = pct;

      if (latestSync.status === 'failed') {
        syncStatus = 'Error';
        syncDetail = latestSync.error_message 
          ? `Last synchronization encountered an error: ${latestSync.error_message}`
          : 'Last synchronization run encountered an error.';
      } else if (latestSync.status === 'success') {
        const lastSyncDate = new Date(latestSync.started_at);
        const hoursSinceLastSync = (Date.now() - lastSyncDate.getTime()) / (1000 * 60 * 60);

        if (hoursSinceLastSync <= 24) {
          syncStatus = 'Active';
          syncDetail = `Catalog synchronized successfully (${pct}% success rate, last run ${Math.round(hoursSinceLastSync)}h ago).`;
        } else {
          syncStatus = 'Standby';
          syncDetail = `Last sync completed successfully (${pct}% success rate). Waiting for next scheduled trigger.`;
        }
      } else {
        syncStatus = 'Standby';
        syncDetail = `${successfulSyncs} of ${totalSyncs} sync operations successful.`;
      }
    } else {
      // 0 sync operations: Scheduler is not active or not implemented
      syncStatus = 'Inactive';
      isImplemented = schedulerTelemetry.schedulerRunning;
      syncDetail = schedulerTelemetry.schedulerRunning
        ? 'Automatic background synchronization is scheduled and awaiting its first run.'
        : 'Automatic background synchronization is not active (0 sync operations recorded).';
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
          is_implemented: isImplemented,
          scheduler_active: schedulerTelemetry.schedulerRunning,
          cron_schedule: schedulerTelemetry.cronSchedule,
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
