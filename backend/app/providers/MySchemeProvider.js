const BaseProvider = require('./BaseProvider');
const SchemeValidator = require('../services/schemeValidator');

/**
 * MySchemeProvider
 * 
 * Connector for MyScheme National Platform (MeitY & NeGD, Government of India).
 * Official Portal: https://www.myscheme.gov.in
 * 
 * Access Policy & Compliance:
 * - MyScheme is the central government national platform for welfare scheme discovery.
 * - Access to the backend scheme API catalog is restricted to authorized government
 *   and institutional partners via API Key issued by NeGD / MeitY.
 * - This connector respects access policies and safely checks portal availability.
 */
class MySchemeProvider extends BaseProvider {
  constructor() {
    super({
      id: 'myscheme-national-api',
      providerId: 6, // 'MyScheme National Platform'
      name: 'MyScheme National Welfare Discovery Platform (MeitY)',
      baseUrl: 'https://www.myscheme.gov.in',
      sourceType: 'National Platform',
      requiresAuth: true,
      apiKeyEnvVar: 'MYSCHEME_API_KEY',
      docUrl: 'https://www.myscheme.gov.in/about'
    });
  }

  /**
   * Execute MyScheme sync check
   * @param {Object} options
   * @param {Object} options.db - PostgreSQL client
   * @returns {Promise<Object>}
   */
  async sync(options) {
    const auth = this.getAuthConfig();
    const reachability = await this.checkReachability(this.baseUrl, 5000);

    if (!auth.isConfigured) {
      return {
        success: reachability.reachable,
        providerId: this.providerId,
        providerName: this.name,
        recordsFetched: 0,
        recordsUpdated: 0,
        recordsInserted: 0,
        recordsFailed: 0,
        portalReachable: reachability.reachable,
        latencyMs: reachability.latencyMs,
        message: reachability.reachable
          ? `MyScheme national portal is online (${reachability.latencyMs}ms). Live catalog dataset ingestion requires authorized MeitY/NeGD API credentials (MYSCHEME_API_KEY).`
          : `MyScheme national portal unreachable: ${reachability.error}`,
        authRequired: true,
        docUrl: this.docUrl
      };
    }

    const apiKey = process.env.MYSCHEME_API_KEY;
    const apiEndpoint = process.env.MYSCHEME_API_ENDPOINT || `${this.baseUrl}/api/v1/schemes`;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(apiEndpoint, {
        headers: {
          'x-api-key': apiKey,
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
          message: `MyScheme API returned HTTP ${res.status}: ${res.statusText}`,
          error: `API error ${res.status}`
        };
      }

      const json = await res.json();
      const records = json.data || json.schemes || [];
      return {
        success: true,
        providerId: this.providerId,
        providerName: this.name,
        recordsFetched: records.length,
        recordsUpdated: 0,
        recordsInserted: 0,
        recordsFailed: 0,
        message: `MyScheme sync retrieved ${records.length} schemes.`
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
        message: `MyScheme sync failed: ${err.message}`,
        error: err.message
      };
    }
  }
}

module.exports = MySchemeProvider;
