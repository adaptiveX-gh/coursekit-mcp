import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * ConfigurationManager - Manages multi-source configuration with proper precedence and security
 *
 * Configuration precedence (highest to lowest):
 * 1. User preferences
 * 2. Environment variables
 * 3. Provider defaults
 * 4. System defaults
 *
 * @class ConfigurationManager
 */
export class ConfigurationManager {
  /**
   * Creates a new ConfigurationManager instance
   * @constructor
   */
  constructor() {
    this.configDir = path.join(__dirname);
    this.systemDefaults = {};
    this.providerDefaults = {};
    this.userPreferences = {};
    this.envConfig = {};
    this.mergedConfig = {};

    // Sensitive fields that should never be logged
    this.sensitiveFields = ['apiKey', 'token', 'secret', 'password', 'key'];
  }

  /**
   * Initialize and load all configuration sources
   * @async
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      // Load in order: defaults -> providers -> user prefs -> env
      await this.loadSystemDefaults();
      await this.loadProviderDefaults();
      await this.loadUserPreferences();
      this.loadEnvironmentVariables();

      // Merge all configurations with proper precedence
      this.mergeConfigurations();

      console.error('✓ Configuration loaded successfully');
    } catch (error) {
      console.error('Configuration initialization error:', error.message);
      throw new Error(`Failed to initialize configuration: ${error.message}`);
    }
  }

  /**
   * Load system default configuration
   * @private
   * @async
   */
  async loadSystemDefaults() {
    try {
      const defaultPath = path.join(this.configDir, 'default.json');
      const content = await fs.readFile(defaultPath, 'utf-8');
      this.systemDefaults = JSON.parse(content);
    } catch (error) {
      console.error('Warning: Could not load system defaults:', error.message);
      this.systemDefaults = {};
    }
  }

  /**
   * Load provider default configuration
   * @private
   * @async
   */
  async loadProviderDefaults() {
    try {
      const providersPath = path.join(this.configDir, 'providers.json');
      const content = await fs.readFile(providersPath, 'utf-8');
      this.providerDefaults = JSON.parse(content);
    } catch (error) {
      console.error('Warning: Could not load provider defaults:', error.message);
      this.providerDefaults = {};
    }
  }

  /**
   * Load user preferences from file
   * @private
   * @async
   */
  async loadUserPreferences() {
    try {
      const userPrefPath = path.join(this.configDir, 'user-preferences.json');
      const content = await fs.readFile(userPrefPath, 'utf-8');
      this.userPreferences = JSON.parse(content);
    } catch (error) {
      // User preferences file might not exist yet - this is OK
      console.error('Info: No user preferences file found (will be created on first save)');
      this.userPreferences = {};
    }
  }

  /**
   * Load configuration from environment variables
   * Supports: COURSEKIT_GAMMA_API_KEY, COURSEKIT_*, etc.
   * @private
   */
  loadEnvironmentVariables() {
    this.envConfig = {};

    // Scan environment for COURSEKIT_ prefixed variables
    for (const [key, value] of Object.entries(process.env)) {
      if (key.startsWith('COURSEKIT_')) {
        const configKey = key.replace('COURSEKIT_', '').toLowerCase();
        this.envConfig[configKey] = value;
      }
    }

    // Also support provider-specific API keys
    if (process.env.GAMMA_API_KEY) {
      this.envConfig.gamma_api_key = process.env.GAMMA_API_KEY;
    }
  }

  /**
   * Merge all configuration sources with proper precedence
   * @private
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
   * @private
   * @param {Object} target - Target object
   * @param {Object} source - Source object
   * @returns {Object} Merged object
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
   * @param {string} dotPath - Path in dot notation (e.g., "providers.presentations.gamma.enabled")
   * @param {*} defaultValue - Default value if path not found
   * @returns {*} Configuration value
   *
   * @example
   * config.get('providers.presentations.gamma.enabled') // returns true/false
   * config.get('providers.slidev.config.theme', 'default') // returns theme or 'default'
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
   * Updates user preferences only (doesn't modify defaults)
   * @param {string} dotPath - Path in dot notation
   * @param {*} value - Value to set
   *
   * @example
   * config.set('providers.presentations.preferredProvider', 'slidev')
   * config.set('providers.presentations.gamma.enabled', true)
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
   * Get best provider for given content type and task characteristics
   * @param {string} contentType - Type of content (e.g., 'slides', 'presentation', 'documentation')
   * @param {Object} taskCharacteristics - Task requirements
   * @param {string[]} taskCharacteristics.features - Required features
   * @param {string} taskCharacteristics.format - Preferred format
   * @param {string} taskCharacteristics.techLevel - Technical level
   * @returns {Object|null} Best matching provider or null
   *
   * @example
   * config.getProvider('slides', { features: ['code-highlighting'], techLevel: 'advanced' })
   * // Returns: { name: 'slidev', config: {...}, priority: 10 }
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

        // Check for API key requirement
        if (provider.requirements?.apiKey) {
          const hasApiKey = this.getAPIKey(providerName);
          if (!hasApiKey) {
            // Skip if API key required but not available
            continue;
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
   * Get all providers (from merged configuration)
   * @returns {Object} All providers by category
   */
  getAllProviders() {
    return this.get('providers', {});
  }

  /**
   * Get configuration for a specific provider
   * @param {string} providerName - Name of provider (e.g., 'gamma', 'slidev')
   * @returns {Object|null} Provider configuration or null if not found
   *
   * @example
   * config.getProviderConfig('slidev')
   * // Returns: { enabled: true, priority: 10, capabilities: {...}, config: {...} }
   */
  getProviderConfig(providerName) {
    const providers = this.getAllProviders();

    // Search across all categories
    for (const category of Object.values(providers)) {
      if (category[providerName]) {
        return category[providerName];
      }
    }

    return null;
  }

  /**
   * Securely retrieve API key for a provider from environment
   * Never logs or exposes the actual key value
   * @param {string} providerName - Name of provider
   * @returns {string|null} API key or null if not found
   *
   * @example
   * const apiKey = config.getAPIKey('gamma')
   * // Returns the key from process.env.GAMMA_API_KEY if available
   */
  getAPIKey(providerName) {
    const provider = this.getProviderConfig(providerName);

    if (!provider || !provider.requirements?.apiKey) {
      return null;
    }

    // Get API key environment variable name
    const envVarName = provider.requirements.apiKeyEnvVar;
    if (!envVarName) {
      console.error(`Warning: Provider ${providerName} requires API key but no envVar specified`);
      return null;
    }

    // Try to get from environment
    const apiKey = process.env[envVarName];

    if (!apiKey) {
      console.error(`Warning: ${envVarName} not found in environment for ${providerName}`);
      return null;
    }

    // Return key (never log it!)
    return apiKey;
  }

  /**
   * Validate configuration schema
   * @param {Object} config - Configuration object to validate
   * @returns {Object} Validation result { valid: boolean, errors: string[] }
   */
  validateConfig(config) {
    const errors = [];

    // Check required fields
    if (!config.system) {
      errors.push('Missing required field: system');
    }

    // Validate providers structure
    if (config.providers) {
      for (const [category, providers] of Object.entries(config.providers)) {
        if (typeof providers !== 'object') {
          errors.push(`Invalid providers.${category}: must be an object`);
          continue;
        }

        for (const [name, provider] of Object.entries(providers)) {
          if (typeof provider !== 'object') {
            errors.push(`Invalid provider ${category}.${name}: must be an object`);
            continue;
          }

          // Validate required provider fields
          if (!provider.capabilities) {
            errors.push(`Provider ${category}.${name} missing required field: capabilities`);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Sanitize file path to prevent directory traversal
   * @param {string} filePath - Path to sanitize
   * @returns {string} Sanitized path
   * @throws {Error} If path is invalid or attempts directory traversal
   */
  sanitizePath(filePath) {
    // Remove null bytes
    if (filePath.includes('\0')) {
      throw new Error('Invalid file path: contains null byte');
    }

    // Check for directory traversal in the original path
    const normalized = path.normalize(filePath);
    if (normalized.includes('..') || filePath.includes('..')) {
      throw new Error('Invalid file path: directory traversal not allowed');
    }

    // Resolve to absolute path
    const resolved = path.resolve(filePath);

    // Additional check: ensure resolved path doesn't escape base directory
    const basedir = process.cwd();
    if (!resolved.startsWith(basedir)) {
      throw new Error('Invalid file path: path escapes base directory');
    }

    return resolved;
  }

  /**
   * Save user preferences to file
   * @async
   * @returns {Promise<void>}
   *
   * @example
   * config.set('providers.presentations.preferredProvider', 'gamma')
   * await config.save()
   */
  async save() {
    try {
      const userPrefPath = path.join(this.configDir, 'user-preferences.json');

      // Pretty print JSON with 2-space indentation
      const content = JSON.stringify(this.userPreferences, null, 2);

      await fs.writeFile(userPrefPath, content, 'utf-8');

      console.error('✓ User preferences saved successfully');
    } catch (error) {
      console.error('Error saving user preferences:', error.message);
      throw new Error(`Failed to save user preferences: ${error.message}`);
    }
  }

  /**
   * Get safe configuration for logging (removes sensitive fields)
   * @returns {Object} Safe configuration object
   */
  getSafeConfig() {
    return this.redactSensitiveFields(this.mergedConfig);
  }

  /**
   * Recursively redact sensitive fields from an object
   * @private
   * @param {*} obj - Object to redact
   * @returns {*} Redacted copy
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
      // Check if key contains sensitive field name
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
   * Export current configuration (for debugging)
   * @returns {Object} Current merged configuration (with sensitive fields redacted)
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
}

// Export singleton instance
export const config = new ConfigurationManager();
