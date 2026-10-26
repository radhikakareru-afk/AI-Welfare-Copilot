const cron = require('node-cron');
const db = require('../../db');
const providerRegistry = require('../providers');

/**
 * SyncScheduler
 * 
 * Scheduled synchronization engine for AI Welfare Copilot:
 * - Runs once daily at a configured cron time (default 02:00 AM)
 * - Strict duplicate / overlap prevention via atomic in-memory lock
 * - Graceful shutdown and signal handling (SIGTERM, SIGINT)
 * - Writes comprehensive audit records to PostgreSQL sync_logs
 * - Feeds real-time operational status to /api/public/statistics
 */
class SyncScheduler {
  constructor() {
    this.isSyncing = false;
    this.activeJobStartTime = null;
    this.cronTask = null;
    this.cronSchedule = process.env.SYNC_CRON_SCHEDULE || '0 2 * * *'; // Daily at 02:00 AM
    this.autoEnabled = process.env.SYNC_AUTO_ENABLED !== 'false';
    this.lastRunSummary = null;
    this.isInitialized = false;
  }

  /**
   * Initialize scheduler service on server startup
   */
  init() {
    if (this.isInitialized) {
      return;
    }

    if (!this.autoEnabled) {
      console.log('[SyncScheduler] Automatic daily synchronization is disabled via SYNC_AUTO_ENABLED=false.');
      this.isInitialized = true;
      return;
    }

    if (!cron.validate(this.cronSchedule)) {
      console.error(`[SyncScheduler] Invalid cron expression: "${this.cronSchedule}". Defaulting to "0 2 * * *".`);
      this.cronSchedule = '0 2 * * *';
    }

    console.log(`[SyncScheduler] Initializing daily automatic synchronization (schedule: "${this.cronSchedule}")...`);

    this.cronTask = cron.schedule(this.cronSchedule, async () => {
      console.log('[SyncScheduler] Triggering scheduled daily scheme synchronization...');
      try {
        await this.runSync({ syncType: 'scheduled', triggeredBy: 'scheduler' });
      } catch (err) {
        console.error('[SyncScheduler] Error during scheduled sync execution:', err.message);
      }
    });

    // Register safe process exit handlers
    this._registerSignalHandlers();
    this.isInitialized = true;
    console.log('[SyncScheduler] Daily synchronization scheduler active.');
  }

  /**
   * Safe graceful shutdown
   */
  stop() {
    if (this.cronTask) {
      console.log('[SyncScheduler] Stopping cron schedule task...');
      this.cronTask.stop();
      this.cronTask = null;
    }
    this.isInitialized = false;
  }

  /**
   * Execute synchronization cycle (either scheduled daily or manually triggered by admin)
   * 
   * @param {Object} options
   * @param {'scheduled'|'manual'} [options.syncType='scheduled']
   * @param {string|number} [options.triggeredBy='scheduler']
   * @returns {Promise<Object>}
   */
  async runSync(options = {}) {
    const syncType = options.syncType || 'scheduled';
    const triggeredBy = options.triggeredBy || 'scheduler';

    // 1. Strict overlap / duplicate prevention
    if (this.isSyncing) {
      return {
        success: false,
        code: 'SYNC_IN_PROGRESS',
        message: 'A synchronization operation is already in progress. Overlapping runs are prevented.',
        startedAt: this.activeJobStartTime
      };
    }

    this.isSyncing = true;
    this.activeJobStartTime = new Date();
    const startTimeMs = Date.now();
    let syncLogId = null;

    try {
      // 2. Select default provider ID (1: National Portal of India)
      let primaryProviderId = 1;
      const provRes = await db.query('SELECT id, name FROM data_providers WHERE is_active = TRUE ORDER BY id ASC LIMIT 1;');
      let providerName = 'Government Welfare Platforms';
      if (provRes.rows.length > 0) {
        primaryProviderId = provRes.rows[0].id;
        providerName = provRes.rows[0].name;
      }

      // 3. Create initial in_progress audit log in PostgreSQL
      const insertLogRes = await db.query(`
        INSERT INTO sync_logs (
          provider_id, sync_type, status, records_fetched, records_inserted, 
          records_updated, records_failed, started_at
        ) VALUES ($1, $2, 'in_progress', 0, 0, 0, 0, NOW())
        RETURNING id;
      `, [primaryProviderId, syncType]);
      syncLogId = insertLogRes.rows[0].id;

      // 4. Run through registered providers safely
      const providers = providerRegistry.getAll();
      let totalFetched = 0;
      let totalUpdated = 0;
      let totalInserted = 0;
      let totalFailed = 0;
      const providerResults = [];
      const errorMessages = [];

      for (const provider of providers) {
        try {
          const res = await provider.sync({ db, syncType });
          providerResults.push({
            id: provider.id,
            name: provider.name,
            result: res
          });

          if (res.recordsFetched) totalFetched += res.recordsFetched;
          if (res.recordsUpdated) totalUpdated += res.recordsUpdated;
          if (res.recordsInserted) totalInserted += res.recordsInserted;
          if (res.recordsFailed) totalFailed += res.recordsFailed;

          if (res.error) {
            errorMessages.push(`${provider.name}: ${res.error}`);
          }
        } catch (provErr) {
          errorMessages.push(`${provider.name}: ${provErr.message}`);
          providerResults.push({
            id: provider.id,
            name: provider.name,
            error: provErr.message
          });
        }
      }

      // 5. Determine overall cycle status
      const durationSeconds = Math.max(1, Math.round((Date.now() - startTimeMs) / 1000));
      const isSuccess = totalUpdated > 0 || (errorMessages.length === 0 && totalFetched > 0);
      const finalStatus = isSuccess ? 'success' : (errorMessages.length > 0 ? 'failed' : 'success');
      const combinedErrorMessage = errorMessages.length > 0 ? errorMessages.join('; ') : null;

      // 6. Update sync_logs in PostgreSQL with completed execution metrics
      await db.query(`
        UPDATE sync_logs SET
          status = $1,
          records_fetched = $2,
          records_inserted = $3,
          records_updated = $4,
          records_failed = $5,
          error_message = $6,
          ended_at = NOW(),
          duration_seconds = $7
        WHERE id = $8;
      `, [
        finalStatus,
        totalFetched,
        totalInserted,
        totalUpdated,
        totalFailed,
        combinedErrorMessage,
        durationSeconds,
        syncLogId
      ]);

      const executionSummary = {
        syncLogId,
        status: finalStatus,
        syncType,
        triggeredBy,
        durationSeconds,
        recordsFetched: totalFetched,
        recordsUpdated: totalUpdated,
        recordsInserted: totalInserted,
        recordsFailed: totalFailed,
        errorMessage: combinedErrorMessage,
        completedAt: new Date().toISOString(),
        providerResults
      };

      this.lastRunSummary = executionSummary;

      return {
        success: isSuccess,
        message: isSuccess
          ? `Successfully synchronized ${totalUpdated} scheme records across official portals.`
          : `Synchronization completed with warnings: ${combinedErrorMessage || 'Partial sync'}`,
        ...executionSummary
      };
    } catch (err) {
      console.error('[SyncScheduler] Critical error during sync run:', err);
      const durationSeconds = Math.max(1, Math.round((Date.now() - startTimeMs) / 1000));

      if (syncLogId) {
        try {
          await db.query(`
            UPDATE sync_logs SET
              status = 'failed',
              error_message = $1,
              ended_at = NOW(),
              duration_seconds = $2
            WHERE id = $3;
          `, [err.message, durationSeconds, syncLogId]);
        } catch (logErr) {
          console.error('[SyncScheduler] Failed to update error in sync_logs:', logErr.message);
        }
      }

      this.lastRunSummary = {
        syncLogId,
        status: 'failed',
        syncType,
        errorMessage: err.message,
        durationSeconds,
        completedAt: new Date().toISOString()
      };

      return {
        success: false,
        error: err.message,
        syncLogId,
        durationSeconds
      };
    } finally {
      // Guaranteed lock release
      this.isSyncing = false;
      this.activeJobStartTime = null;
    }
  }

  /**
   * Get real-time scheduler state and telemetry
   */
  getStatus() {
    return {
      isSyncing: this.isSyncing,
      activeJobStartTime: this.activeJobStartTime,
      schedulerRunning: Boolean(this.cronTask),
      cronSchedule: this.cronSchedule,
      autoEnabled: this.autoEnabled,
      lastRunSummary: this.lastRunSummary
    };
  }

  _registerSignalHandlers() {
    const handleExit = (signal) => {
      console.log(`[SyncScheduler] Received ${signal}. Safely stopping scheduler...`);
      this.stop();
    };

    process.once('SIGINT', () => handleExit('SIGINT'));
    process.once('SIGTERM', () => handleExit('SIGTERM'));
  }
}

// Export singleton instance
module.exports = new SyncScheduler();
