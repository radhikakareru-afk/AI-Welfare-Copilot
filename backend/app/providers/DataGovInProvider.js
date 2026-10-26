const BaseProvider = require('./BaseProvider');
const SchemeValidator = require('../services/schemeValidator');

/**
 * DataGovInProvider
 * 
 * Connector for Open Government Data (OGD) Platform India (data.gov.in).
 * 
 * Access Policy & Compliance:
 * - OGD India requires an authenticated API key issued to registered developers.
 * - This connector respects access policies and will NOT bypass authentication.
 * - If DATA_GOV_IN_API_KEY is omitted, it cleanly reports 'requires_credentials'
 *   with documentation instructions.
 */
class DataGovInProvider extends BaseProvider {
  constructor() {
    super({
      id: 'ogd-india-api',
      providerId: 1, // 'National Portal of India & Open Government Data'
      name: 'Open Government Data Platform India (data.gov.in)',
      baseUrl: 'https://api.data.gov.in',
      sourceType: 'Central Open API Platform',
      requiresAuth: true,
      apiKeyEnvVar: 'DATA_GOV_IN_API_KEY',
      docUrl: 'https://data.gov.in/apis'
    });
  }

  /**
   * Execute OGD India catalog sync
   * @param {Object} options
   * @param {Object} options.db - PostgreSQL client
   * @returns {Promise<Object>}
   */
  async sync(options) {
    const auth = this.getAuthConfig();

    // Check if official credentials are provided
    if (!auth.isConfigured) {
      return {
        success: false,
        providerId: this.providerId,
        providerName: this.name,
        recordsFetched: 0,
        recordsUpdated: 0,
        recordsInserted: 0,
        recordsFailed: 0,
        message: 'Official API authorization required. Register at https://data.gov.in/ and set DATA_GOV_IN_API_KEY in backend/.env',
        authRequired: true,
        docUrl: this.docUrl
      };
    }

    const apiKey = process.env.DATA_GOV_IN_API_KEY;
    const { db } = options;

    try {
      // Query official resource feed with abort controller
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);

      // Example official welfare resource catalog endpoint
      const resourceId = process.env.DATA_GOV_IN_RESOURCE_ID || '9ef84268-d588-465a-a308-a864a43d0070';
      const url = `${this.baseUrl}/resource/${resourceId}?api-key=${encodeURIComponent(apiKey)}&format=json&limit=50`;

      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'AI-Welfare-Copilot-Sync/1.0'
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
          message: `OGD India API returned HTTP ${res.status}: ${res.statusText}`,
          error: `API error ${res.status}`
        };
      }

      const json = await res.json();
      const records = json.records || [];
      let recordsUpdated = 0;
      let recordsFailed = 0;

      for (const rec of records) {
        const validation = SchemeValidator.validateSchemeStructure(rec);
        if (!validation.isValid) {
          recordsFailed++;
          continue;
        }

        // Check if scheme exists in PostgreSQL
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
        message: `Processed ${records.length} records from OGD India (${recordsUpdated} updated).`
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
        message: `Failed to query OGD India API: ${err.message}`,
        error: err.message
      };
    }
  }
}

module.exports = DataGovInProvider;
