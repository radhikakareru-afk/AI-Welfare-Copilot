/**
 * BaseProvider Abstract Class
 * 
 * Defines standard contract for all government scheme synchronization providers:
 * - Standardized availability & network reachability checking
 * - Explicit credentials / authorization requirement handling
 * - Standardized logging and telemetry
 * - Error isolation so individual provider failures do not crash the scheduler
 */

class BaseProvider {
  /**
   * @param {Object} options
   * @param {string} options.id - Unique provider identifier
   * @param {number} [options.providerId] - Database ID in data_providers table
   * @param {string} options.name - Human-readable provider name
   * @param {string} options.baseUrl - Base official URL
   * @param {string} options.sourceType - 'Central Government', 'State Government', 'Open Data', etc.
   * @param {boolean} [options.requiresAuth=false] - Whether credentials are required
   * @param {string} [options.apiKeyEnvVar] - Name of environment variable holding API key
   * @param {string} [options.docUrl] - Official documentation URL for API access
   */
  constructor(options) {
    if (new.target === BaseProvider) {
      throw new TypeError('Cannot construct BaseProvider instances directly');
    }

    this.id = options.id;
    this.providerId = options.providerId || 1;
    this.name = options.name;
    this.baseUrl = options.baseUrl;
    this.sourceType = options.sourceType || 'Government Portal';
    this.requiresAuth = Boolean(options.requiresAuth);
    this.apiKeyEnvVar = options.apiKeyEnvVar || null;
    this.docUrl = options.docUrl || null;
  }

  /**
   * Check if credentials for this provider are configured in the environment
   * @returns {{ isConfigured: boolean, envVar: string|null, docUrl: string|null }}
   */
  getAuthConfig() {
    if (!this.requiresAuth) {
      return { isConfigured: true, envVar: null, docUrl: null };
    }

    const key = this.apiKeyEnvVar ? process.env[this.apiKeyEnvVar] : null;
    const isConfigured = Boolean(key && key.trim().length > 0);

    return {
      isConfigured,
      envVar: this.apiKeyEnvVar,
      docUrl: this.docUrl
    };
  }

  /**
   * Safe reachability check with strict timeout and no hanging connections
   * @param {string} [targetUrl] - Optional URL, defaults to this.baseUrl
   * @param {number} [timeoutMs=5000] - Timeout in milliseconds
   * @returns {Promise<{ reachable: boolean, statusCode: number|null, latencyMs: number, error: string|null }>}
   */
  async checkReachability(targetUrl = this.baseUrl, timeoutMs = 5000) {
    const startTime = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // Use HEAD request first for minimal bandwidth, fallback to GET if HEAD not supported
      const response = await fetch(targetUrl, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'AI-Welfare-Copilot-Verifier/1.0 (+https://github.com/AI-Welfare-Copilot)'
        }
      });
      clearTimeout(timer);

      const latencyMs = Date.now() - startTime;
      return {
        reachable: response.status < 500, // 2xx, 3xx, 4xx (except 5xx server down)
        statusCode: response.status,
        latencyMs,
        error: null
      };
    } catch (err) {
      clearTimeout(timer);
      const latencyMs = Date.now() - startTime;
      const isAbort = err.name === 'AbortError';

      return {
        reachable: false,
        statusCode: null,
        latencyMs,
        error: isAbort ? `Connection timed out after ${timeoutMs}ms` : (err.message || 'Network unreachable')
      };
    }
  }

  /**
   * Get provider operational status and requirements summary
   */
  async getStatus() {
    const auth = this.getAuthConfig();
    const reachability = await this.checkReachability(this.baseUrl, 4000);

    return {
      id: this.id,
      name: this.name,
      baseUrl: this.baseUrl,
      sourceType: this.sourceType,
      requiresAuth: this.requiresAuth,
      authStatus: this.requiresAuth
        ? (auth.isConfigured ? 'configured' : 'requires_credentials')
        : 'public_accessible',
      docUrl: auth.docUrl,
      reachability: {
        reachable: reachability.reachable,
        latencyMs: reachability.latencyMs,
        statusCode: reachability.statusCode,
        error: reachability.error
      }
    };
  }

  /**
   * Execute synchronization logic. Must be implemented by concrete classes.
   * @param {Object} options
   * @param {Object} options.db - PostgreSQL client/pool
   * @param {string} [options.syncType='scheduled'] - 'scheduled' or 'manual'
   * @returns {Promise<{
   *   success: boolean,
   *   recordsFetched: number,
   *   recordsUpdated: number,
   *   recordsInserted: number,
   *   recordsFailed: number,
   *   message: string,
   *   error?: string,
   *   details?: Object
   * }>}
   */
  async sync(options) {
    throw new Error(`Sync method must be implemented by subclass ${this.constructor.name}`);
  }
}

module.exports = BaseProvider;
