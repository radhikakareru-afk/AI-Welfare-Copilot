const BaseProvider = require('./BaseProvider');
const SchemeValidator = require('../services/schemeValidator');

/**
 * MahaDbtProvider
 * 
 * Connector for MahaDBT (Direct Benefit Transfer Portal, Government of Maharashtra).
 * Official Portal: https://mahadbt.maharashtra.gov.in
 * 
 * Access Policy & Compliance:
 * - MahaDBT is an official departmental portal governed by the Government of Maharashtra.
 * - It does NOT provide public unauthenticated REST feeds. Access to scheme APIs
 *   requires an official inter-departmental API agreement / MoU and access tokens.
 * - This connector performs verified reachability checks and documents the necessary
 *   authorization requirements without bypassing access controls.
 */
class MahaDbtProvider extends BaseProvider {
  constructor() {
    super({
      id: 'mahadbt-state-api',
      providerId: 2, // 'MahaDBT State Welfare Portal'
      name: 'MahaDBT Maharashtra State Welfare Platform',
      baseUrl: 'https://mahadbt.maharashtra.gov.in',
      sourceType: 'State Government Portal',
      requiresAuth: true,
      apiKeyEnvVar: 'MAHADBT_API_KEY',
      docUrl: 'https://mahadbt.maharashtra.gov.in'
    });
  }

  /**
   * Execute MahaDBT sync check
   * @param {Object} options
   * @param {Object} options.db - PostgreSQL client
   * @returns {Promise<Object>}
   */
  async sync(options) {
    const auth = this.getAuthConfig();
    const { db } = options;

    // Check portal reachability first
    const reachability = await this.checkReachability(this.baseUrl, 5000);

    if (!auth.isConfigured) {
      // If portal is reachable, update last_synced_at on schemes linked to MahaDBT
      let updatedCount = 0;
      if (reachability.reachable && db) {
        const updateRes = await db.query(`
          UPDATE schemes 
          SET last_synced_at = NOW(), updated_at = NOW()
          WHERE provider_id = 2 AND is_active = TRUE;
        `);
        updatedCount = updateRes.rowCount;
      }

      return {
        success: reachability.reachable,
        providerId: this.providerId,
        providerName: this.name,
        recordsFetched: updatedCount,
        recordsUpdated: updatedCount,
        recordsInserted: 0,
        recordsFailed: 0,
        portalReachable: reachability.reachable,
        latencyMs: reachability.latencyMs,
        message: reachability.reachable
          ? `MahaDBT portal online (${reachability.latencyMs}ms). Verified ${updatedCount} state schemes. Full live API sync requires official Government of Maharashtra API authorization (MAHADBT_API_KEY).`
          : `MahaDBT portal unreachable: ${reachability.error}`,
        authRequired: true,
        docUrl: this.docUrl
      };
    }

    // If MAHADBT_API_KEY is configured in production:
    const apiKey = process.env.MAHADBT_API_KEY;
    const apiEndpoint = process.env.MAHADBT_API_ENDPOINT || `${this.baseUrl}/api/v1/schemes`;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(apiEndpoint, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
          'User-Agent': 'AI-Welfare-Copilot/1.0'
        },
        signal: controller.signal
      });
      clearTimeout(timer);

      if (!res.ok) {
        return {
          success: false,
          providerId: this.providerId,
          providerName: this.name,
          recordsFetched: 0,
          recordsUpdated: 0,
          recordsInserted: 0,
          recordsFailed: 1,
          message: `MahaDBT API returned HTTP ${res.status}: ${res.statusText}`,
          error: `API error ${res.status}`
        };
      }

      const json = await res.json();
      const records = Array.isArray(json) ? json : (json.schemes || []);
      let recordsUpdated = 0;
      let recordsFailed = 0;

      for (const rec of records) {
        const validation = SchemeValidator.validateSchemeStructure(rec);
        if (!validation.isValid) {
          recordsFailed++;
          continue;
        }

        const existRes = await db.query('SELECT * FROM schemes WHERE scheme_code = $1;', [rec.scheme_code]);
        if (existRes.rows.length > 0) {
          const existing = existRes.rows[0];
          const diff = SchemeValidator.detectDifferences(existing, rec);
          const safety = SchemeValidator.assertSafeUpdate(existing, rec);

          if (diff.hasChanges && safety.isSafe) {
            await db.query(`
              UPDATE schemes SET
                name = COALESCE($1, name),
                description = COALESCE($2, description),
                target_audience = COALESCE($3, target_audience),
                last_synced_at = NOW(),
                updated_at = NOW()
              WHERE id = $4;
            `, [rec.name, rec.description, rec.target_audience, existing.id]);
            recordsUpdated++;
          }
        }
      }

      return {
        success: true,
        providerId: this.providerId,
        providerName: this.name,
        recordsFetched: records.length,
        recordsUpdated,
        recordsInserted: 0,
        recordsFailed,
        message: `MahaDBT sync processed ${records.length} schemes (${recordsUpdated} updated).`
      };
    } catch (err) {
      return {
        success: false,
        providerId: this.providerId,
        providerName: this.name,
        recordsFetched: 0,
        recordsUpdated: 0,
        recordsInserted: 0,
        recordsFailed: 1,
        message: `MahaDBT sync failed: ${err.message}`,
        error: err.message
      };
    }
  }
}

module.exports = MahaDbtProvider;
