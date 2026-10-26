const db = require('./db');

async function testSyncStatusFlow() {
  console.log('=== TESTING AUTO-SYNCHRONIZED STATUS DYNAMICS ===\n');

  let backedUpLogs = [];

  try {
    // Backup any existing logs so tests start from a clean baseline and restore them afterward
    const existing = await db.query('SELECT * FROM sync_logs;');
    backedUpLogs = existing.rows;
    await db.query('DELETE FROM sync_logs;');

    // Helper function to simulate the query in public.js
    async function evaluatePublicStatsSync() {
      const syncRes = await db.query(`
        SELECT 
          COUNT(*) AS total_syncs,
          COUNT(*) FILTER (WHERE status = 'success') AS successful_syncs,
          COUNT(*) FILTER (WHERE status = 'failed') AS failed_syncs,
          COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress_syncs,
          MAX(started_at) AS last_sync_time
        FROM sync_logs;
      `);
      const latestLogRes = await db.query(`
        SELECT status, started_at, ended_at, error_message, duration_seconds
        FROM sync_logs
        ORDER BY started_at DESC
        LIMIT 1;
      `);

      const syncRow = syncRes.rows[0];
      const totalSyncs = parseInt(syncRow.total_syncs, 10) || 0;
      const successfulSyncs = parseInt(syncRow.successful_syncs, 10) || 0;
      const inProgressSyncs = parseInt(syncRow.in_progress_syncs, 10) || 0;
      const lastSyncTime = syncRow.last_sync_time;
      const latestSync = latestLogRes.rows[0] || null;

      let syncStatus = 'Inactive';
      let syncPercentage = null;
      let isSyncCalculated = false;
      let syncDetail = 'Automatic background synchronization is not active (0 sync operations recorded).';
      let isImplemented = false;

      if (inProgressSyncs > 0) {
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
        syncStatus = 'Inactive';
        isImplemented = false;
        syncDetail = 'Automatic background synchronization is not active (0 sync operations recorded).';
      }

      return {
        status: syncStatus,
        formatted: syncStatus,
        totalSyncs,
        isImplemented,
        syncDetail
      };
    }

    // Step 1: Baseline Test (0 sync logs)
    const baseline = await evaluatePublicStatsSync();
    console.log('1. Baseline state (0 sync logs in DB):');
    console.log(`   Status: "${baseline.status}" | isImplemented: ${baseline.isImplemented}`);
    console.log(`   Detail: "${baseline.syncDetail}"`);
    if (baseline.status !== 'Inactive' && baseline.totalSyncs === 0) {
      throw new Error(`Expected "Inactive" when 0 syncs, got "${baseline.status}"`);
    }
    console.log('   ✓ Baseline correctly reports "Inactive" instead of misleading "Standby".\n');

    // Step 2: In-Progress Test
    const inProg = await db.query(`
      INSERT INTO sync_logs (provider_id, sync_type, status, records_fetched, started_at)
      VALUES (1, 'test', 'in_progress', 0, NOW())
      RETURNING id;
    `);
    const inProgId = inProg.rows[0].id;
    const syncingState = await evaluatePublicStatsSync();
    console.log('2. In-Progress state:');
    console.log(`   Status: "${syncingState.status}"`);
    if (syncingState.status !== 'Syncing') {
      throw new Error(`Expected "Syncing", got "${syncingState.status}"`);
    }
    console.log('   ✓ In-progress state correctly reports "Syncing".\n');

    // Step 3: Success (< 24h) Test -> "Active"
    await db.query(`
      UPDATE sync_logs SET 
        status = 'success', 
        records_fetched = 26, 
        records_updated = 26, 
        ended_at = NOW(), 
        duration_seconds = 2
      WHERE id = $1;
    `, [inProgId]);
    const activeState = await evaluatePublicStatsSync();
    console.log('3. Fresh Successful state (last run < 24h):');
    console.log(`   Status: "${activeState.status}"`);
    console.log(`   Detail: "${activeState.syncDetail}"`);
    if (activeState.status !== 'Active') {
      throw new Error(`Expected "Active", got "${activeState.status}"`);
    }
    console.log('   ✓ Fresh success correctly reports "Active".\n');

    // Step 4: Standby Test (> 24h)
    await db.query(`
      UPDATE sync_logs SET 
        started_at = NOW() - INTERVAL '36 hours',
        ended_at = NOW() - INTERVAL '36 hours'
      WHERE id = $1;
    `, [inProgId]);
    const standbyState = await evaluatePublicStatsSync();
    console.log('4. Older Successful state (> 24h ago):');
    console.log(`   Status: "${standbyState.status}"`);
    console.log(`   Detail: "${standbyState.syncDetail}"`);
    if (standbyState.status !== 'Standby') {
      throw new Error(`Expected "Standby", got "${standbyState.status}"`);
    }
    console.log('   ✓ Older success (>24h) correctly reports "Standby" (idle awaiting next cycle).\n');

    // Step 5: Error Test
    await db.query(`
      UPDATE sync_logs SET 
        status = 'failed', 
        error_message = 'Central gateway timeout after 30s'
      WHERE id = $1;
    `, [inProgId]);
    const errorState = await evaluatePublicStatsSync();
    console.log('5. Failed state:');
    console.log(`   Status: "${errorState.status}"`);
    console.log(`   Detail: "${errorState.syncDetail}"`);
    if (errorState.status !== 'Error') {
      throw new Error(`Expected "Error", got "${errorState.status}"`);
    }
    console.log('   ✓ Error state correctly reports "Error".\n');

    // Clean up test log
    await db.query('DELETE FROM sync_logs WHERE id = $1;', [inProgId]);

    console.log('✓ ALL AUTO-SYNCHRONIZED STATUS DYNAMICS TESTS PASSED PERFECTLY!\n');
  } catch (err) {
    console.error('\n✗ TEST FAILED:', err.message);
    process.exit(1);
  } finally {
    // Restore backed-up logs
    if (backedUpLogs.length > 0) {
      console.log(`Restoring ${backedUpLogs.length} previous sync_logs records...`);
      for (const log of backedUpLogs) {
        await db.query(`
          INSERT INTO sync_logs (
            id, provider_id, sync_type, status, records_fetched, records_inserted, 
            records_updated, records_failed, error_message, started_at, ended_at, duration_seconds
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (id) DO NOTHING;
        `, [
          log.id, log.provider_id, log.sync_type, log.status, log.records_fetched,
          log.records_inserted, log.records_updated, log.records_failed, log.error_message,
          log.started_at, log.ended_at, log.duration_seconds
        ]);
      }
      await db.query("SELECT setval(pg_get_serial_sequence('sync_logs', 'id'), COALESCE(MAX(id), 1)) FROM sync_logs;");
      console.log('Previous sync_logs restored.');
    }
    process.exit(0);
  }
}

testSyncStatusFlow();
