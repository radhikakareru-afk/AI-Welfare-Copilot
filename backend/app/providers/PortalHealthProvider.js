const BaseProvider = require('./BaseProvider');

/**
 * PortalHealthProvider
 * 
 * Verifies public accessibility and live uptime of official government portals
 * for each of the 26 welfare schemes currently in the database.
 * 
 * Safety & Privacy Guarantees:
 * - Employs lightweight HTTP HEAD checks with 5s timeout.
 * - Deduplicates checks per unique domain so no government host is flooded.
 * - Does not scrape or attempt to bypass CAPTCHA/authentication.
 * - Updates `last_synced_at = NOW()` for verified accessible schemes.
 * - Never deletes or invalidates existing database records if an external server is temporarily down.
 */
class PortalHealthProvider extends BaseProvider {
  constructor() {
    super({
      id: 'portal-health-verifier',
      providerId: 1, // 'National Portal of India & Open Government Data'
      name: 'Official Government Portal Reachability Verifier',
      baseUrl: 'https://data.gov.in',
      sourceType: 'Government Portal Verification',
      requiresAuth: false,
      docUrl: 'https://data.gov.in'
    });
  }

  /**
   * Execute portal verification across all active schemes
   * @param {Object} options
   * @param {Object} options.db - PostgreSQL database connection
   * @returns {Promise<Object>}
   */
  async sync(options) {
    const { db } = options;
    if (!db) {
      throw new Error('Database handle is required for portal sync');
    }

    // 1. Fetch active schemes and their official websites
    const { rows: schemes } = await db.query(`
      SELECT id, scheme_code, name, official_website 
      FROM schemes 
      WHERE is_active = TRUE 
      ORDER BY id ASC;
    `);

    const totalSchemes = schemes.length;
    let recordsUpdated = 0;
    let recordsFailed = 0;
    const verifiedDetails = [];
    const unreachableWarnings = [];

    // 2. Deduplicate URLs to avoid hammering portals
    const uniqueUrls = new Map();
    for (const s of schemes) {
      const url = s.official_website ? s.official_website.trim() : null;
      if (url) {
        if (!uniqueUrls.has(url)) {
          uniqueUrls.set(url, []);
        }
        uniqueUrls.get(url).push(s);
      } else {
        recordsFailed++;
        unreachableWarnings.push({
          scheme_code: s.scheme_code,
          name: s.name,
          reason: 'No official website configured'
        });
      }
    }

    // 3. Verify each unique URL safely with batching
    for (const [url, mappedSchemes] of uniqueUrls.entries()) {
      const result = await this.checkReachability(url, 5000);

      if (result.reachable) {
        // Mark verified schemes as synced in PostgreSQL
        const schemeIds = mappedSchemes.map(s => s.id);
        await db.query(`
          UPDATE schemes 
          SET last_synced_at = NOW(), updated_at = NOW()
          WHERE id = ANY($1::bigint[]);
        `, [schemeIds]);

        recordsUpdated += mappedSchemes.length;
        verifiedDetails.push({
          url,
          status: result.statusCode,
          latencyMs: result.latencyMs,
          schemesCount: mappedSchemes.length
        });
      } else {
        recordsFailed += mappedSchemes.length;
        unreachableWarnings.push({
          url,
          error: result.error,
          affectedSchemes: mappedSchemes.map(s => s.scheme_code)
        });
      }
    }

    const success = recordsUpdated > 0;
    const message = success
      ? `Verified ${recordsUpdated} of ${totalSchemes} schemes via official portals (${unreachableWarnings.length} offline/unreachable)`
      : `Failed to verify scheme portals: network or host unreachable`;

    return {
      success,
      providerId: this.providerId,
      providerName: this.name,
      recordsFetched: totalSchemes,
      recordsUpdated,
      recordsInserted: 0,
      recordsFailed,
      message,
      details: {
        totalActiveSchemes: totalSchemes,
        verifiedCount: recordsUpdated,
        warningCount: recordsFailed,
        verifiedDetails,
        warnings: unreachableWarnings
      }
    };
  }
}

module.exports = PortalHealthProvider;
