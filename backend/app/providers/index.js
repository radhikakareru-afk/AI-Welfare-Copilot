const PortalHealthProvider = require('./PortalHealthProvider');
const DataGovInProvider = require('./DataGovInProvider');
const MahaDbtProvider = require('./MahaDbtProvider');
const MySchemeProvider = require('./MySchemeProvider');

/**
 * Provider Registry
 * Manages registered government scheme synchronization providers.
 */
class ProviderRegistry {
  constructor() {
    this.providers = new Map();

    // Register active connectors
    this.register(new PortalHealthProvider());
    this.register(new DataGovInProvider());
    this.register(new MahaDbtProvider());
    this.register(new MySchemeProvider());
  }

  /**
   * Register a new provider
   * @param {import('./BaseProvider')} provider 
   */
  register(provider) {
    this.providers.set(provider.id, provider);
  }

  /**
   * Retrieve a provider by unique ID
   * @param {string} id 
   */
  get(id) {
    return this.providers.get(id);
  }

  /**
   * Get all registered providers
   * @returns {import('./BaseProvider')[]}
   */
  getAll() {
    return Array.from(this.providers.values());
  }

  /**
   * Get diagnostic status report for all providers
   */
  async getAllStatus() {
    const statuses = [];
    for (const provider of this.providers.values()) {
      try {
        const s = await provider.getStatus();
        statuses.push(s);
      } catch (err) {
        statuses.push({
          id: provider.id,
          name: provider.name,
          error: err.message,
          authStatus: 'error'
        });
      }
    }
    return statuses;
  }
}

// Export singleton instance
module.exports = new ProviderRegistry();
