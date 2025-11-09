/**
 * Mock Configuration Manager
 *
 * In-memory configuration manager for testing without file I/O.
 * Provides same interface as real ConfigurationManager.
 */
export class MockConfigurationManager {
  constructor(initialConfig = {}) {
    this.systemDefaults = initialConfig.systemDefaults || {};
    this.providerDefaults = initialConfig.providerDefaults || {};
    this.userPreferences = initialConfig.userPreferences || {};
    this.envConfig = initialConfig.envConfig || {};
    this.mergedConfig = {};

    this.sensitiveFields = ['apiKey', 'token', 'secret', 'password', 'key'];
    this.saveCallback = null;
  }

  /**
   * Initialize configuration (synchronous for testing)
   */
  async initialize() {
    this.mergeConfigurations();
    return Promise.resolve();
  }

  /**
   * Merge all configuration sources
   */
  mergeConfigurations() {
    // Start with system defaults
    this.mergedConfig = this.deepMerge({}, this.systemDefaults);

    // Merge provider defaults
    if (this.providerDefaults) {
      this.mergedConfig.providers = this.deepMerge(
        this.mergedConfig.providers || {},
        this.providerDefaults
      );
    }

    // Merge user preferences (highest priority)
    this.mergedConfig = this.deepMerge(this.mergedConfig, this.userPreferences);
  }

  /**
   * Deep merge two objects
   */
  deepMerge(target, source) {
    const result = { ...target };

    for (const key in source) {
      if (source[key] instanceof Object && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  /**
   * Get configuration value using dot notation
   */
  get(dotPath, defaultValue = undefined) {
    const keys = dotPath.split('.');
    let value = this.mergedConfig;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }

    return value !== undefined ? value : defaultValue;
  }

  /**
   * Set configuration value using dot notation
   */
  set(dotPath, value) {
    const keys = dotPath.split('.');
    const lastKey = keys.pop();

    // Navigate/create path in user preferences
    let current = this.userPreferences;
    for (const key of keys) {
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    current[lastKey] = value;

    // Re-merge to update merged config
    this.mergeConfigurations();
  }

  /**
   * Get provider for content type
   */
  getProvider(contentType, taskCharacteristics = {}) {
    const providers = this.getAllProviders();
    const candidates = [];

    for (const [category, categoryProviders] of Object.entries(providers)) {
      for (const [providerName, provider] of Object.entries(categoryProviders)) {
        // Skip disabled providers
        if (provider.enabled === false) {
          continue;
        }

        // Check if provider supports this content type
        if (!provider.capabilities?.contentTypes?.includes(contentType)) {
          continue;
        }

        // Calculate match score
        let score = provider.priority || 0;

        // Check features match
        if (taskCharacteristics.features) {
          const matchingFeatures = taskCharacteristics.features.filter(
            f => provider.capabilities.features?.includes(f)
          );
          score += matchingFeatures.length * 5;
        }

        // Check format match
        if (taskCharacteristics.format) {
          if (provider.capabilities.formats?.includes(taskCharacteristics.format)) {
            score += 10;
          }
        }

        // Check tech level match
        if (taskCharacteristics.techLevel) {
          if (provider.capabilities.techLevel?.includes(taskCharacteristics.techLevel)) {
            score += 3;
          }
        }

        candidates.push({
          name: providerName,
          category: category,
          provider: provider,
          score: score
        });
      }
    }

    // Sort by score (highest first)
    candidates.sort((a, b) => b.score - a.score);

    // Return best match or null
    if (candidates.length > 0) {
      return {
        name: candidates[0].name,
        category: candidates[0].category,
        config: candidates[0].provider.config,
        priority: candidates[0].score,
        capabilities: candidates[0].provider.capabilities
      };
    }

    return null;
  }

  /**
   * Get all providers
   */
  getAllProviders() {
    return this.get('providers', {});
  }

  /**
   * Get provider configuration
   */
  getProviderConfig(providerName) {
    const providers = this.getAllProviders();

    for (const category of Object.values(providers)) {
      if (category[providerName]) {
        return category[providerName];
      }
    }

    return null;
  }

  /**
   * Get API key for provider
   */
  getAPIKey(providerName) {
    const provider = this.getProviderConfig(providerName);

    if (!provider || !provider.requirements?.apiKey) {
      return null;
    }

    const envVarName = provider.requirements.apiKeyEnvVar;
    if (!envVarName) {
      return null;
    }

    // Check env config (mock environment)
    const key = this.envConfig[envVarName.toLowerCase().replace(/_/g, '_')];
    if (key) return key;

    // Check actual environment
    return process.env[envVarName] || null;
  }

  /**
   * Validate configuration
   */
  validateConfig(config) {
    const errors = [];

    if (!config.system) {
      errors.push('Missing required field: system');
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Save user preferences (mock)
   */
  async save() {
    if (this.saveCallback) {
      this.saveCallback(this.userPreferences);
    }
    return Promise.resolve();
  }

  /**
   * Get safe configuration (redacted)
   */
  getSafeConfig() {
    return this.redactSensitiveFields(this.mergedConfig);
  }

  /**
   * Redact sensitive fields
   */
  redactSensitiveFields(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.redactSensitiveFields(item));
    }

    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      const isSensitive = this.sensitiveFields.some(
        field => key.toLowerCase().includes(field.toLowerCase())
      );

      if (isSensitive) {
        result[key] = '***REDACTED***';
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.redactSensitiveFields(value);
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Export configuration
   */
  exportConfig() {
    return {
      systemDefaults: this.redactSensitiveFields(this.systemDefaults),
      providerDefaults: this.redactSensitiveFields(this.providerDefaults),
      userPreferences: this.redactSensitiveFields(this.userPreferences),
      envConfig: this.redactSensitiveFields(this.envConfig),
      merged: this.redactSensitiveFields(this.mergedConfig)
    };
  }

  /**
   * Set save callback for testing
   */
  onSave(callback) {
    this.saveCallback = callback;
  }
}
