import { SkillError } from './BaseContentSkill.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Provider Registry
 *
 * Centralized management system for all content providers in CourseKit.
 * Handles registration, discovery, lifecycle, capability matching, and monitoring.
 *
 * @example
 * const registry = new ProviderRegistry();
 * await registry.initialize();
 *
 * registry.registerProvider('gamma', GammaAISkill, config);
 * const providers = registry.getProvidersForType('presentations');
 * const ranked = registry.rankProviders(task, context);
 */
export class ProviderRegistry {
  /**
   * Create a new Provider Registry
   * @param {Object} options - Registry options
   */
  constructor(options = {}) {
    this.options = options;

    // Provider definitions: Map<name, ProviderDefinition>
    this.providers = new Map();

    // Initialized instances: Map<name, ProviderInstance>
    this.instances = new Map();

    // Provider metadata cache
    this.metadata = new Map();

    // Metrics tracking
    this.metrics = {
      usage: {},      // Usage counts per provider
      success: {},    // Success counts
      failure: {},    // Failure counts
      timing: {},     // Average execution time
      preferences: {} // User preference tracking
    };

    // Health status: Map<name, HealthStatus>
    this.healthStatus = new Map();

    // Required provider interface methods
    this.requiredMethods = [
      'initialize',
      'gatherRequirements',
      'generateContent',
      'validate'
    ];

    // Optional provider methods
    this.optionalMethods = [
      'export',
      'getCapabilities',
      'estimateTime',
      'estimateCost',
      'cleanup',
      'getStatus'
    ];
  }

  /**
   * Initialize the provider registry
   * @param {Object} options - Initialization options
   * @returns {Promise<void>}
   */
  async initialize(options = {}) {
    this.options = { ...this.options, ...options };

    // Auto-discover providers if enabled
    if (this.options.autoDiscover !== false) {
      await this.discoverProviders();
    }

    console.log(`[ProviderRegistry] Initialized with ${this.providers.size} registered providers`);
  }

  /**
   * Register a provider
   * @param {string} name - Provider name
   * @param {Class} ProviderClass - Provider class
   * @param {Object} config - Provider configuration
   * @returns {Object} Registration result
   */
  registerProvider(name, ProviderClass, config = {}) {
    try {
      // Validate provider name
      if (!name || typeof name !== 'string') {
        throw new SkillError('Provider name must be a non-empty string', 'INVALID_NAME', 'ProviderRegistry');
      }

      // Check if already registered
      if (this.providers.has(name)) {
        throw new SkillError(`Provider '${name}' is already registered`, 'ALREADY_REGISTERED', 'ProviderRegistry');
      }

      // Validate provider class
      this.validateProviderInterface(ProviderClass);

      // Check for capability conflicts
      this.checkCapabilityConflicts(name, config.capabilities);

      // Create provider definition
      const definition = {
        name,
        class: ProviderClass,
        config,
        capabilities: config.capabilities || {},
        requiresApiKey: config.requiresApiKey || false,
        apiKeyEnvVar: config.apiKeyEnvVar || `${name.toUpperCase()}_API_KEY`,
        lazy: config.lazy !== false, // Default: lazy loading
        registeredAt: new Date().toISOString()
      };

      // Store definition
      this.providers.set(name, definition);

      // Initialize health status
      this.healthStatus.set(name, {
        status: 'registered',
        lastCheck: null,
        available: false,
        message: 'Not yet initialized'
      });

      // Initialize metrics
      this.metrics.usage[name] = 0;
      this.metrics.success[name] = 0;
      this.metrics.failure[name] = 0;
      this.metrics.timing[name] = [];

      console.log(`[ProviderRegistry] Registered provider: ${name}`);

      return {
        success: true,
        name,
        lazy: definition.lazy
      };
    } catch (error) {
      console.error(`[ProviderRegistry] Failed to register ${name}:`, error.message);
      throw error;
    }
  }

  /**
   * Unregister a provider
   * @param {string} name - Provider name
   * @returns {Promise<boolean>} Success status
   */
  async unregisterProvider(name) {
    if (!this.providers.has(name)) {
      return false;
    }

    // Cleanup instance if initialized
    if (this.instances.has(name)) {
      const instance = this.instances.get(name);
      if (instance.cleanup) {
        await instance.cleanup();
      }
      this.instances.delete(name);
    }

    // Remove from registry
    this.providers.delete(name);
    this.metadata.delete(name);
    this.healthStatus.delete(name);

    console.log(`[ProviderRegistry] Unregistered provider: ${name}`);
    return true;
  }

  /**
   * Validate provider implements required interface
   * @private
   */
  validateProviderInterface(ProviderClass) {
    // Check if it's a class
    if (typeof ProviderClass !== 'function') {
      throw new SkillError('Provider must be a class', 'INVALID_PROVIDER', 'ProviderRegistry');
    }

    // Create temporary instance to check methods
    const prototype = ProviderClass.prototype;

    // Check required methods
    const missingMethods = this.requiredMethods.filter(
      method => typeof prototype[method] !== 'function'
    );

    if (missingMethods.length > 0) {
      throw new SkillError(
        `Provider missing required methods: ${missingMethods.join(', ')}`,
        'INCOMPLETE_INTERFACE',
        'ProviderRegistry',
        { missingMethods }
      );
    }

    return true;
  }

  /**
   * Check for capability conflicts with existing providers
   * @private
   */
  checkCapabilityConflicts(name, capabilities) {
    if (!capabilities) return;

    // For now, just log potential conflicts
    // Could be enhanced to prevent conflicts if needed
    const conflicts = [];

    for (const [existingName, existingDef] of this.providers.entries()) {
      const existingCaps = existingDef.capabilities;

      // Check if content types overlap
      if (capabilities.contentTypes && existingCaps.contentTypes) {
        const overlap = capabilities.contentTypes.filter(
          type => existingCaps.contentTypes.includes(type)
        );

        if (overlap.length > 0) {
          conflicts.push({
            provider: existingName,
            contentTypes: overlap
          });
        }
      }
    }

    if (conflicts.length > 0) {
      console.log(`[ProviderRegistry] ${name} has capability overlaps:`, conflicts);
    }
  }

  /**
   * Discover providers from content-skills directory
   * @private
   */
  async discoverProviders() {
    try {
      const skillsDir = path.join(__dirname, '../.claude/skills/content-skills');

      try {
        const entries = await fs.readdir(skillsDir, { withFileTypes: true });

        for (const entry of entries) {
          if (entry.isDirectory()) {
            await this.loadProviderMetadata(entry.name, path.join(skillsDir, entry.name));
          }
        }
      } catch (error) {
        // Directory doesn't exist or not accessible
        console.log(`[ProviderRegistry] Skills directory not found: ${skillsDir}`);
      }
    } catch (error) {
      console.error(`[ProviderRegistry] Provider discovery failed:`, error.message);
    }
  }

  /**
   * Load provider metadata from directory
   * @private
   */
  async loadProviderMetadata(name, dirPath) {
    try {
      const skillFile = path.join(dirPath, 'SKILL.md');

      try {
        const content = await fs.readFile(skillFile, 'utf-8');

        // Parse metadata from SKILL.md
        const metadata = this.parseSkillMetadata(content);

        this.metadata.set(name, {
          name,
          path: dirPath,
          ...metadata,
          discoveredAt: new Date().toISOString()
        });

        console.log(`[ProviderRegistry] Discovered provider metadata: ${name}`);
      } catch (error) {
        // SKILL.md not found
      }
    } catch (error) {
      console.error(`[ProviderRegistry] Failed to load metadata for ${name}:`, error.message);
    }
  }

  /**
   * Parse metadata from SKILL.md content
   * @private
   */
  parseSkillMetadata(content) {
    const metadata = {
      purpose: null,
      capabilities: [],
      requirements: []
    };

    // Extract purpose
    const purposeMatch = content.match(/## Purpose\s+([^\n]+)/);
    if (purposeMatch) {
      metadata.purpose = purposeMatch[1].trim();
    }

    // Extract capabilities (simple parsing)
    const capsMatch = content.match(/## Specialized Capabilities\s+([\s\S]+?)(?=\n##|$)/);
    if (capsMatch) {
      metadata.capabilities = capsMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.trim().substring(1).trim());
    }

    return metadata;
  }

  /**
   * Get provider instance (initialize if needed)
   * @param {string} name - Provider name
   * @param {Object} initOptions - Initialization options
   * @returns {Promise<Object>} Provider instance
   */
  async getProvider(name, initOptions = {}) {
    // Check if provider is registered
    if (!this.providers.has(name)) {
      throw new SkillError(`Provider '${name}' is not registered`, 'PROVIDER_NOT_FOUND', 'ProviderRegistry');
    }

    // Return cached instance if available
    if (this.instances.has(name)) {
      return this.instances.get(name);
    }

    // Initialize provider
    const definition = this.providers.get(name);

    try {
      const ProviderClass = definition.class;
      const instance = new ProviderClass(definition.config);

      // Initialize with options
      await instance.initialize({
        ...definition.config,
        ...initOptions
      });

      // Cache instance
      this.instances.set(name, instance);

      // Update health status
      this.healthStatus.set(name, {
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        available: true,
        message: 'Provider initialized successfully'
      });

      console.log(`[ProviderRegistry] Initialized provider: ${name}`);

      return instance;
    } catch (error) {
      // Update health status
      this.healthStatus.set(name, {
        status: 'error',
        lastCheck: new Date().toISOString(),
        available: false,
        message: error.message
      });

      throw new SkillError(
        `Failed to initialize provider '${name}': ${error.message}`,
        'INITIALIZATION_FAILED',
        'ProviderRegistry',
        { provider: name, originalError: error.message }
      );
    }
  }

  /**
   * Get all providers for a content type
   * @param {string} contentType - Content type
   * @returns {Array<string>} Provider names
   */
  getProvidersForType(contentType) {
    const providers = [];

    for (const [name, definition] of this.providers.entries()) {
      const capabilities = definition.capabilities;

      if (capabilities.contentTypes && capabilities.contentTypes.includes(contentType)) {
        providers.push(name);
      }
    }

    return providers;
  }

  /**
   * Match provider capabilities to requirements
   * @param {Object} requirements - Task requirements
   * @returns {Array<Object>} Matched providers with scores
   */
  matchProviderCapabilities(requirements) {
    const matches = [];

    for (const [name, definition] of this.providers.entries()) {
      const score = this.calculateCapabilityScore(definition.capabilities, requirements);

      if (score > 0) {
        matches.push({
          name,
          definition,
          score,
          capabilities: definition.capabilities
        });
      }
    }

    // Sort by score (descending)
    matches.sort((a, b) => b.score - a.score);

    return matches;
  }

  /**
   * Calculate capability match score
   * @private
   */
  calculateCapabilityScore(capabilities, requirements) {
    let score = 0;

    // Content type match (required)
    if (requirements.contentType) {
      if (capabilities.contentTypes?.includes(requirements.contentType)) {
        score += 10;
      } else {
        return 0; // Must match content type
      }
    }

    // Feature matches
    if (requirements.features && capabilities.features) {
      const matchedFeatures = requirements.features.filter(
        f => capabilities.features.includes(f)
      );
      score += matchedFeatures.length * 5;
    }

    // Format match
    if (requirements.format && capabilities.formats?.includes(requirements.format)) {
      score += 10;
    }

    // Tech level match
    if (requirements.techLevel && capabilities.techLevel?.includes(requirements.techLevel)) {
      score += 3;
    }

    return score;
  }

  /**
   * Rank providers for a task
   * @param {Object} task - Task details
   * @param {Object} context - Course context
   * @returns {Array<Object>} Ranked providers
   */
  rankProviders(task, context) {
    // Build requirements from task and context
    const requirements = {
      contentType: task.contentType || task.type,
      features: task.requiredFeatures || [],
      format: task.format,
      techLevel: context.constitution?.audience?.techLevel || 'intermediate'
    };

    // Get capability matches
    const matches = this.matchProviderCapabilities(requirements);

    // Filter by availability
    const available = matches.filter(match => {
      const health = this.healthStatus.get(match.name);
      return !health || health.available !== false;
    });

    // Enhance with additional ranking factors
    const ranked = available.map(match => {
      const metrics = this.getProviderMetrics(match.name);
      const health = this.healthStatus.get(match.name);

      // Adjust score based on success rate
      let adjustedScore = match.score;

      if (metrics.successRate !== undefined) {
        adjustedScore *= (metrics.successRate / 100);
      }

      // Penalize if unhealthy
      if (health && health.status === 'degraded') {
        adjustedScore *= 0.5;
      }

      return {
        ...match,
        adjustedScore,
        metrics,
        health
      };
    });

    // Resort by adjusted score
    ranked.sort((a, b) => b.adjustedScore - a.adjustedScore);

    return ranked;
  }

  /**
   * Filter providers by availability
   * @param {Array<string>} providerNames - Provider names to check
   * @returns {Array<string>} Available providers
   */
  filterByAvailability(providerNames) {
    return providerNames.filter(name => {
      const health = this.healthStatus.get(name);

      if (!health) return false;
      if (health.available === false) return false;
      if (health.status === 'error') return false;

      // Check if requires API key
      const definition = this.providers.get(name);
      if (definition.requiresApiKey) {
        // Check if API key is available
        const apiKey = process.env[definition.apiKeyEnvVar];
        if (!apiKey) return false;
      }

      return true;
    });
  }

  /**
   * Track provider usage
   * @param {string} name - Provider name
   * @param {boolean} success - Whether operation succeeded
   * @param {number} duration - Operation duration in ms
   */
  trackUsage(name, success, duration) {
    if (!this.providers.has(name)) return;

    // Increment usage
    this.metrics.usage[name] = (this.metrics.usage[name] || 0) + 1;

    // Track success/failure
    if (success) {
      this.metrics.success[name] = (this.metrics.success[name] || 0) + 1;
    } else {
      this.metrics.failure[name] = (this.metrics.failure[name] || 0) + 1;
    }

    // Track timing
    if (!this.metrics.timing[name]) {
      this.metrics.timing[name] = [];
    }

    this.metrics.timing[name].push(duration);

    // Keep only last 100 timings
    if (this.metrics.timing[name].length > 100) {
      this.metrics.timing[name].shift();
    }
  }

  /**
   * Track user preference
   * @param {string} name - Provider name
   * @param {string} contentType - Content type
   */
  trackPreference(name, contentType) {
    if (!this.metrics.preferences[contentType]) {
      this.metrics.preferences[contentType] = {};
    }

    this.metrics.preferences[contentType][name] =
      (this.metrics.preferences[contentType][name] || 0) + 1;
  }

  /**
   * Get provider metrics
   * @param {string} name - Provider name
   * @returns {Object} Metrics data
   */
  getProviderMetrics(name) {
    if (!this.providers.has(name)) return null;

    const usage = this.metrics.usage[name] || 0;
    const success = this.metrics.success[name] || 0;
    const failure = this.metrics.failure[name] || 0;
    const timings = this.metrics.timing[name] || [];

    const successRate = usage > 0 ? (success / usage * 100) : 0;
    const averageTime = timings.length > 0
      ? timings.reduce((a, b) => a + b, 0) / timings.length
      : 0;

    return {
      usage,
      success,
      failure,
      successRate: Math.round(successRate * 10) / 10,
      averageTime: Math.round(averageTime)
    };
  }

  /**
   * Get all metrics
   * @returns {Object} Complete metrics data
   */
  getAllMetrics() {
    const metrics = {};

    for (const name of this.providers.keys()) {
      metrics[name] = this.getProviderMetrics(name);
    }

    return {
      providers: metrics,
      preferences: this.metrics.preferences
    };
  }

  /**
   * Perform health check on provider
   * @param {string} name - Provider name
   * @returns {Promise<Object>} Health status
   */
  async healthCheck(name) {
    if (!this.providers.has(name)) {
      return {
        status: 'not_found',
        available: false,
        message: 'Provider not registered'
      };
    }

    const definition = this.providers.get(name);

    try {
      // Check if API key is required and available
      if (definition.requiresApiKey) {
        const apiKey = process.env[definition.apiKeyEnvVar];
        if (!apiKey) {
          return {
            status: 'unavailable',
            available: false,
            message: `API key not found: ${definition.apiKeyEnvVar}`,
            lastCheck: new Date().toISOString()
          };
        }
      }

      // Check if instance is initialized
      if (this.instances.has(name)) {
        const instance = this.instances.get(name);

        // Call getStatus if available
        if (instance.getStatus) {
          const status = instance.getStatus();

          return {
            status: 'healthy',
            available: true,
            message: 'Provider operational',
            lastCheck: new Date().toISOString(),
            providerStatus: status
          };
        }

        return {
          status: 'healthy',
          available: true,
          message: 'Provider initialized',
          lastCheck: new Date().toISOString()
        };
      }

      // Not initialized but available
      return {
        status: 'ready',
        available: true,
        message: 'Provider ready for initialization',
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        available: false,
        message: error.message,
        lastCheck: new Date().toISOString()
      };
    }
  }

  /**
   * Perform health check on all providers
   * @returns {Promise<Object>} Health status for all providers
   */
  async healthCheckAll() {
    const results = {};

    for (const name of this.providers.keys()) {
      results[name] = await this.healthCheck(name);
      this.healthStatus.set(name, results[name]);
    }

    return results;
  }

  /**
   * Get provider status
   * @param {string} name - Provider name
   * @returns {Object} Status information
   */
  getProviderStatus(name) {
    if (!this.providers.has(name)) {
      return {
        registered: false,
        message: 'Provider not found'
      };
    }

    const definition = this.providers.get(name);
    const health = this.healthStatus.get(name);
    const metrics = this.getProviderMetrics(name);
    const instance = this.instances.get(name);

    return {
      registered: true,
      name,
      initialized: this.instances.has(name),
      capabilities: definition.capabilities,
      requiresApiKey: definition.requiresApiKey,
      health,
      metrics,
      metadata: this.metadata.get(name)
    };
  }

  /**
   * Get status for all providers
   * @returns {Object} Status for all providers
   */
  getAllProviderStatus() {
    const status = {};

    for (const name of this.providers.keys()) {
      status[name] = this.getProviderStatus(name);
    }

    return status;
  }

  /**
   * Get registry statistics
   * @returns {Object} Registry statistics
   */
  getStatistics() {
    const total = this.providers.size;
    const initialized = this.instances.size;
    const available = this.filterByAvailability(Array.from(this.providers.keys())).length;

    const byContentType = {};
    for (const [name, definition] of this.providers.entries()) {
      const contentTypes = definition.capabilities.contentTypes || [];
      for (const type of contentTypes) {
        byContentType[type] = (byContentType[type] || 0) + 1;
      }
    }

    return {
      total,
      initialized,
      available,
      byContentType,
      metrics: this.getAllMetrics()
    };
  }

  /**
   * Clean up all provider instances
   * @returns {Promise<void>}
   */
  async cleanup() {
    for (const [name, instance] of this.instances.entries()) {
      if (instance.cleanup) {
        try {
          await instance.cleanup();
        } catch (error) {
          console.error(`[ProviderRegistry] Failed to cleanup ${name}:`, error.message);
        }
      }
    }

    this.instances.clear();
    console.log('[ProviderRegistry] Cleaned up all provider instances');
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      usage: {},
      success: {},
      failure: {},
      timing: {},
      preferences: {}
    };

    // Reinitialize for registered providers
    for (const name of this.providers.keys()) {
      this.metrics.usage[name] = 0;
      this.metrics.success[name] = 0;
      this.metrics.failure[name] = 0;
      this.metrics.timing[name] = [];
    }
  }
}
