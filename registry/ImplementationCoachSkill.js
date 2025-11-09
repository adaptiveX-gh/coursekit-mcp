import { ConfigurationManager } from '../config/ConfigurationManager.js';
import { GammaAISkill } from './GammaAISkill.js';
import { BaseContentSkill, SkillError } from './BaseContentSkill.js';

/**
 * Implementation Coach Skill
 *
 * Extensible router that directs content creation tasks to specialized skills
 * based on content type, format preferences, and provider capabilities.
 *
 * Enhanced with:
 * - Multi-provider support with dynamic selection
 * - Configuration-driven provider selection
 * - Fallback handling
 * - Usage metrics tracking
 * - Provider comparison and recommendations
 *
 * @example
 * const coach = new ImplementationCoachSkill();
 * await coach.initialize();
 *
 * const result = await coach.route(task, context);
 */
export class ImplementationCoachSkill {
  /**
   * Create a new Implementation Coach
   * @param {Object} options - Coach options
   */
  constructor(options = {}) {
    this.name = 'implementation-coach';
    this.config = options;

    // Configuration manager for provider settings
    this.configManager = null;

    // Provider registry: Map<string, Class>
    this.providerRegistry = new Map();

    // Initialized provider instances: Map<string, Instance>
    this.providers = new Map();

    // Usage metrics for tracking provider usage
    this.metrics = {
      totalTasks: 0,
      byProvider: {},
      failures: {},
      fallbacks: {}
    };

    // Content type to provider category mapping
    this.contentTypeMap = {
      'slides': 'presentations',
      'presentation': 'presentations',
      'deck': 'presentations',
      'document': 'documents',
      'doc': 'documents',
      'report': 'documents',
      'spreadsheet': 'spreadsheets',
      'sheet': 'spreadsheets',
      'data': 'spreadsheets'
    };
  }

  /**
   * Initialize the Implementation Coach
   * @param {Object} options - Initialization options
   * @returns {Promise<void>}
   */
  async initialize(options = {}) {
    try {
      // Initialize Configuration Manager
      this.configManager = new ConfigurationManager();
      await this.configManager.initialize();

      // Register available provider skills
      await this.registerProviderSkills();

      // Load providers based on configuration
      await this.loadConfiguredProviders();

      console.log(`[${this.name}] Initialized with ${this.providerRegistry.size} provider types`);
      console.log(`[${this.name}] ${this.providers.size} providers ready`);
    } catch (error) {
      throw new SkillError(
        `Failed to initialize Implementation Coach: ${error.message}`,
        'INITIALIZATION_FAILED',
        this.name,
        { originalError: error.message }
      );
    }
  }

  /**
   * Register available provider skills
   * @private
   */
  async registerProviderSkills() {
    // Register Gamma AI provider
    this.providerRegistry.set('gamma', {
      class: GammaAISkill,
      contentTypes: ['presentations', 'slides', 'decks'],
      requiresApiKey: true
    });

    // Placeholders for future providers
    // TODO: Register Slidev, PowerPoint, Markdown, DOCX, etc.
    // this.providerRegistry.set('slidev', { class: SlidevSkill, ... });
    // this.providerRegistry.set('powerpoint', { class: PowerPointSkill, ... });
    // this.providerRegistry.set('markdown', { class: MarkdownSkill, ... });
  }

  /**
   * Load and initialize configured providers
   * @private
   */
  async loadConfiguredProviders() {
    const providersConfig = this.configManager.get('providers') || {};

    for (const [category, providers] of Object.entries(providersConfig)) {
      if (typeof providers !== 'object') continue;

      for (const [providerName, providerConfig] of Object.entries(providers)) {
        if (providerConfig.enabled === false) continue;

        const registryEntry = this.providerRegistry.get(providerName);
        if (!registryEntry) continue;

        try {
          // Initialize provider instance
          const ProviderClass = registryEntry.class;
          const provider = new ProviderClass(providerConfig.config || {});

          // Initialize with API key if required
          if (registryEntry.requiresApiKey) {
            const apiKey = this.configManager.getAPIKey(providerName);
            if (apiKey) {
              await provider.initialize({
                apiKey,
                clientOptions: providerConfig.api || {},
                fallbackSkill: providerConfig.fallback?.onError
              });

              this.providers.set(providerName, provider);
              console.log(`[${this.name}] Initialized provider: ${providerName}`);
            } else {
              console.log(`[${this.name}] Skipping ${providerName}: No API key`);
            }
          } else {
            await provider.initialize(providerConfig);
            this.providers.set(providerName, provider);
            console.log(`[${this.name}] Initialized provider: ${providerName}`);
          }
        } catch (error) {
          console.error(`[${this.name}] Failed to initialize ${providerName}:`, error.message);
        }
      }
    }
  }

  /**
   * Select appropriate provider for content type and task
   * @param {string} contentType - Content type (slides, document, etc.)
   * @param {Object} task - Task details
   * @param {Object} context - Course context
   * @returns {Promise<Object>} Selected provider(s) and selection metadata
   */
  async selectProvider(contentType, task, context) {
    // Normalize content type to category
    const category = this.contentTypeMap[contentType.toLowerCase()] || contentType;

    // Check user preferences
    const preferenceMode = this.configManager.get(`preferences.providerSelection.${category}`);
    const preferredProvider = this.configManager.get(`providers.${category}.preferredProvider`);

    // Handle "ask me" preference
    if (preferenceMode === 'ask' || preferredProvider === 'ask') {
      return await this.askUserForProvider(category, task, context);
    }

    // Get suitable providers using ConfigurationManager
    const suitableProvider = this.configManager.getProvider(category, {
      contentType,
      features: task.requiredFeatures || [],
      format: task.format,
      techLevel: context.constitution?.audience?.techLevel || 'intermediate'
    });

    if (!suitableProvider) {
      throw new SkillError(
        `No suitable providers found for ${category}`,
        'NO_PROVIDERS_AVAILABLE',
        this.name,
        { category, contentType }
      );
    }

    // Get provider instance - suitableProvider is an object with {name, category, config, ...}
    const providerInstance = this.providers.get(suitableProvider.name);
    if (!providerInstance) {
      throw new SkillError(
        `Suitable provider found but not initialized: ${suitableProvider.name}`,
        'PROVIDER_NOT_INITIALIZED',
        this.name,
        { category, providerName: suitableProvider.name }
      );
    }

    // Create providers array with single provider
    const providers = [{
      name: suitableProvider.name,
      instance: providerInstance,
      config: suitableProvider.config
    }];

    // Return primary provider and alternatives
    return {
      primary: providers[0],
      alternatives: providers.slice(1),
      selectionReason: preferredProvider ? `User preference: ${preferredProvider}` : 'Best match based on capabilities',
      category
    };
  }

  /**
   * Ask user to select a provider
   * @private
   */
  async askUserForProvider(category, task, context) {
    // Get all available providers for this category
    const availableProviders = Array.from(this.providers.entries())
      .filter(([name, instance]) => instance.supports(category))
      .map(([name, instance]) => ({
        name,
        instance,
        capabilities: instance.getCapabilities(),
        config: this.configManager.get(`providers.${category}.${name}`)
      }));

    if (availableProviders.length === 0) {
      throw new SkillError(
        `No providers available for ${category}`,
        'NO_PROVIDERS_AVAILABLE',
        this.name,
        { category }
      );
    }

    // If only one provider, use it
    if (availableProviders.length === 1) {
      return {
        primary: availableProviders[0],
        alternatives: [],
        selectionReason: 'Only available provider',
        category,
        userSelected: false
      };
    }

    // Build comparison for user
    const comparison = this.buildProviderComparison(availableProviders, task);

    // In a real implementation, this would use Claude's conversation capabilities
    // For now, return the first provider with metadata for user to choose
    return {
      primary: availableProviders[0],
      alternatives: availableProviders.slice(1),
      selectionReason: 'User selection requested',
      category,
      userSelected: true,
      comparison
    };
  }

  /**
   * Build provider comparison for user decision
   * @private
   */
  buildProviderComparison(providers, task) {
    return providers.map(p => ({
      name: p.name,
      capabilities: p.capabilities,
      pros: this.getProviderPros(p, task),
      cons: this.getProviderCons(p, task),
      bestFor: this.getProviderBestUseCase(p),
      estimatedTime: this.estimateGenerationTime(p, task)
    }));
  }

  /**
   * Get provider pros
   * @private
   */
  getProviderPros(provider, task) {
    const pros = [];

    if (provider.name === 'gamma') {
      pros.push('AI-powered automatic design');
      pros.push('Professional themes');
      pros.push('Export to multiple formats');
    }

    // Add task-specific pros
    if (provider.capabilities.features.includes('ai-generation')) {
      pros.push('Fast generation');
    }

    return pros;
  }

  /**
   * Get provider cons
   * @private
   */
  getProviderCons(provider, task) {
    const cons = [];

    if (provider.name === 'gamma') {
      cons.push('Requires API key and internet');
      cons.push('Rate limits on free tier');
    }

    return cons;
  }

  /**
   * Get provider best use case
   * @private
   */
  getProviderBestUseCase(provider) {
    const bestFor = {
      'gamma': 'Business presentations with professional design',
      'slidev': 'Technical presentations with code examples',
      'powerpoint': 'Corporate presentations with custom templates',
      'markdown': 'Simple documents with minimal formatting'
    };

    return bestFor[provider.name] || 'General content';
  }

  /**
   * Estimate generation time
   * @private
   */
  estimateGenerationTime(provider, task) {
    // Simple estimation logic
    const baseTime = {
      'gamma': 180,      // 3 minutes (API-based)
      'slidev': 10,      // 10 seconds (local)
      'powerpoint': 30,  // 30 seconds (local)
      'markdown': 5      // 5 seconds (local)
    };

    return baseTime[provider.name] || 60;
  }

  /**
   * Route task to appropriate provider
   * @param {Object} task - Task details
   * @param {Object} context - Course context
   * @returns {Promise<Object>} Generation result
   */
  async route(task, context) {
    this.metrics.totalTasks++;

    try {
      // 1. Identify content type
      const contentType = this.identifyContentType(task);

      // 2. Select appropriate provider
      const selection = await this.selectProvider(contentType, task, context);

      // 3. Initialize provider with config
      const provider = selection.primary.instance;
      const providerConfig = selection.primary.config;

      // Set up progress handler
      provider.setProgressCallback((event) => {
        this.reportProgress(event, selection.primary.name);
      });

      // 4. Execute with fallback support
      const result = await this.executeWithFallback(
        selection.primary,
        selection.alternatives,
        task,
        context
      );

      // 5. Track usage metrics
      this.trackMetrics(selection.primary.name, result.success);

      return result;
    } catch (error) {
      console.error(`[${this.name}] Routing error:`, error.message);
      throw error;
    }
  }

  /**
   * Identify content type from task
   * @private
   */
  identifyContentType(task) {
    const description = task.description?.toLowerCase() || '';
    const type = task.type?.toLowerCase() || '';
    const format = task.format?.toLowerCase() || '';

    // Check explicit type
    if (type) return type;

    // Check format
    if (format && this.contentTypeMap[format]) {
      return format;
    }

    // Check description keywords
    if (description.match(/slide|presentation|deck/i)) return 'slides';
    if (description.match(/document|doc|report/i)) return 'document';
    if (description.match(/spreadsheet|sheet|data/i)) return 'spreadsheet';

    // Default
    return task.contentType || 'document';
  }

  /**
   * Execute task with fallback support
   * @param {Object} primary - Primary provider
   * @param {Array} alternatives - Alternative providers
   * @param {Object} task - Task details
   * @param {Object} context - Course context
   * @returns {Promise<Object>} Generation result
   */
  async executeWithFallback(primary, alternatives, task, context) {
    const attemptProvider = async (provider, isPrimary = true) => {
      try {
        console.log(`[${this.name}] Attempting ${provider.name}${isPrimary ? ' (primary)' : ' (fallback)'}...`);

        // Gather requirements
        const requirements = await provider.instance.gatherRequirements(task, context);

        // Generate content
        const result = await provider.instance.generateContent(requirements, context);

        // Validate
        const validation = await provider.instance.validate(result);

        if (!validation.valid) {
          throw new SkillError(
            `Validation failed: ${validation.issues.errors.join(', ')}`,
            'VALIDATION_FAILED',
            provider.name,
            { validation }
          );
        }

        return {
          ...result,
          provider: provider.name,
          isPrimary,
          validation
        };
      } catch (error) {
        console.error(`[${this.name}] ${provider.name} failed:`, error.message);

        // Track failure
        this.metrics.failures[provider.name] = (this.metrics.failures[provider.name] || 0) + 1;

        throw error;
      }
    };

    // Try primary provider
    try {
      const result = await attemptProvider(primary, true);
      return result;
    } catch (primaryError) {
      console.log(`[${this.name}] Primary provider ${primary.name} failed, trying fallbacks...`);

      // Track fallback attempt
      this.metrics.fallbacks[primary.name] = (this.metrics.fallbacks[primary.name] || 0) + 1;

      // Try alternatives in order
      for (const alternative of alternatives) {
        try {
          const result = await attemptProvider(alternative, false);

          return {
            ...result,
            fallbackUsed: true,
            fallbackReason: primaryError.message,
            originalProvider: primary.name
          };
        } catch (alternativeError) {
          console.log(`[${this.name}] Alternative ${alternative.name} also failed`);
          continue;
        }
      }

      // All providers failed
      throw new SkillError(
        `All providers failed. Primary: ${primaryError.message}`,
        'ALL_PROVIDERS_FAILED',
        this.name,
        {
          primaryProvider: primary.name,
          primaryError: primaryError.message,
          alternatives: alternatives.map(a => a.name),
          totalAttempts: 1 + alternatives.length
        }
      );
    }
  }

  /**
   * Report progress
   * @private
   */
  reportProgress(event, providerName) {
    console.log(`[${this.name}] [${providerName}] ${event.stage}: ${event.progress}% - ${event.message}`);
  }

  /**
   * Track usage metrics
   * @private
   */
  trackMetrics(providerName, success) {
    if (!this.metrics.byProvider[providerName]) {
      this.metrics.byProvider[providerName] = {
        total: 0,
        successful: 0,
        failed: 0
      };
    }

    this.metrics.byProvider[providerName].total++;

    if (success) {
      this.metrics.byProvider[providerName].successful++;
    } else {
      this.metrics.byProvider[providerName].failed++;
    }
  }

  /**
   * Get usage metrics
   * @returns {Object} Metrics data
   */
  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.calculateSuccessRate()
    };
  }

  /**
   * Calculate success rate per provider
   * @private
   */
  calculateSuccessRate() {
    const rates = {};

    for (const [provider, stats] of Object.entries(this.metrics.byProvider)) {
      if (stats.total > 0) {
        rates[provider] = (stats.successful / stats.total * 100).toFixed(1) + '%';
      }
    }

    return rates;
  }

  /**
   * Get provider status
   * @param {string} providerName - Provider name (optional)
   * @returns {Object} Status information
   */
  getProviderStatus(providerName) {
    if (providerName) {
      const provider = this.providers.get(providerName);
      if (!provider) {
        return { available: false, reason: 'Not initialized' };
      }

      return {
        available: true,
        initialized: provider.initialized,
        metadata: provider.getMetadata(),
        status: provider.getStatus ? provider.getStatus() : {}
      };
    }

    // Return status for all providers
    const status = {};
    for (const [name, provider] of this.providers.entries()) {
      status[name] = this.getProviderStatus(name);
    }

    return status;
  }

  /**
   * Register a new provider skill dynamically
   * @param {string} name - Provider name
   * @param {Object} registration - Registration details
   */
  registerProvider(name, registration) {
    this.providerRegistry.set(name, registration);
    console.log(`[${this.name}] Registered new provider: ${name}`);
  }

  /**
   * Unregister a provider
   * @param {string} name - Provider name
   */
  unregisterProvider(name) {
    this.providerRegistry.delete(name);
    this.providers.delete(name);
    console.log(`[${this.name}] Unregistered provider: ${name}`);
  }

  /**
   * Reload configuration and providers
   * @returns {Promise<void>}
   */
  async reload() {
    console.log(`[${this.name}] Reloading configuration and providers...`);

    // Cleanup existing providers
    for (const provider of this.providers.values()) {
      if (provider.cleanup) {
        await provider.cleanup();
      }
    }

    this.providers.clear();

    // Reinitialize
    await this.configManager.initialize();
    await this.loadConfiguredProviders();

    console.log(`[${this.name}] Reload complete`);
  }

  /**
   * Clean up resources
   * @returns {Promise<void>}
   */
  async cleanup() {
    for (const provider of this.providers.values()) {
      if (provider.cleanup) {
        await provider.cleanup();
      }
    }

    this.providers.clear();
    this.providerRegistry.clear();
    this.configManager = null;
  }
}
