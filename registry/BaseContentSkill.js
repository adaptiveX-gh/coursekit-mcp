/**
 * Base Content Skill
 *
 * Abstract base class for all content generation skills in CourseKit.
 * Provides common functionality and defines the interface that all content
 * skills must implement.
 *
 * @abstract
 */
export class BaseContentSkill {
  /**
   * Create a new content skill
   * @param {string} name - Skill name (e.g., 'gamma-ai', 'slidev', 'powerpoint')
   * @param {Object} config - Skill configuration
   */
  constructor(name, config = {}) {
    if (new.target === BaseContentSkill) {
      throw new Error('BaseContentSkill is abstract and cannot be instantiated directly');
    }

    this.name = name;
    this.config = config;
    this.initialized = false;
    this.progressCallback = null;
  }

  /**
   * Initialize the skill with API keys and configuration
   * Must be implemented by subclasses
   * @abstract
   * @param {Object} options - Initialization options
   * @returns {Promise<void>}
   */
  async initialize(options) {
    throw new Error('initialize() must be implemented by subclass');
  }

  /**
   * Gather requirements from the user through conversation
   * Must be implemented by subclasses
   * @abstract
   * @param {Object} task - Task object with description, context, etc.
   * @param {Object} context - Course context (constitution, specification, plan)
   * @returns {Promise<Object>} Requirements object
   */
  async gatherRequirements(task, context) {
    throw new Error('gatherRequirements() must be implemented by subclass');
  }

  /**
   * Generate content based on gathered requirements
   * Must be implemented by subclasses
   * @abstract
   * @param {Object} requirements - Requirements from gatherRequirements()
   * @param {Object} context - Course context
   * @returns {Promise<Object>} Generated content with metadata
   */
  async generateContent(requirements, context) {
    throw new Error('generateContent() must be implemented by subclass');
  }

  /**
   * Validate generated content
   * Must be implemented by subclasses
   * @abstract
   * @param {Object} content - Generated content to validate
   * @returns {Promise<Object>} Validation result with {valid, issues}
   */
  async validate(content) {
    throw new Error('validate() must be implemented by subclass');
  }

  /**
   * Set a progress callback for long-running operations
   * @param {Function} callback - Progress callback function
   */
  setProgressCallback(callback) {
    this.progressCallback = callback;
  }

  /**
   * Report progress to the callback
   * @protected
   * @param {string} stage - Current stage name
   * @param {number} progress - Progress percentage (0-100)
   * @param {string} message - Progress message
   */
  reportProgress(stage, progress, message) {
    if (this.progressCallback) {
      this.progressCallback({
        skill: this.name,
        stage,
        progress,
        message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get skill capabilities
   * @returns {Object} Capabilities object
   */
  getCapabilities() {
    return {
      name: this.name,
      contentTypes: this.config.contentTypes || [],
      formats: this.config.formats || [],
      features: this.config.features || []
    };
  }

  /**
   * Check if skill supports a content type
   * @param {string} contentType - Content type to check
   * @returns {boolean} True if supported
   */
  supports(contentType) {
    const capabilities = this.getCapabilities();
    return capabilities.contentTypes.includes(contentType);
  }

  /**
   * Get skill metadata
   * @returns {Object} Metadata object
   */
  getMetadata() {
    return {
      name: this.name,
      version: this.config.version || '1.0.0',
      description: this.config.description || '',
      capabilities: this.getCapabilities(),
      initialized: this.initialized
    };
  }

  /**
   * Handle errors gracefully
   * @protected
   * @param {Error} error - Error to handle
   * @param {string} operation - Operation that failed
   * @param {Object} fallbackOptions - Fallback options
   * @returns {Promise<Object>} Error result or fallback
   */
  async handleError(error, operation, fallbackOptions = {}) {
    console.error(`[${this.name}] Error in ${operation}:`, error.message);

    const errorResult = {
      success: false,
      error: {
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
        operation,
        skill: this.name,
        timestamp: new Date().toISOString()
      }
    };

    // If fallback is enabled, try alternative approach
    if (fallbackOptions.enabled && fallbackOptions.alternative) {
      console.log(`[${this.name}] Attempting fallback: ${fallbackOptions.alternative}`);
      errorResult.fallback = {
        attempted: true,
        alternative: fallbackOptions.alternative
      };
    }

    return errorResult;
  }

  /**
   * Clean up resources
   * @returns {Promise<void>}
   */
  async cleanup() {
    this.initialized = false;
    this.progressCallback = null;
  }
}

/**
 * Skill Error class for skill-specific errors
 */
export class SkillError extends Error {
  constructor(message, code, skill, details = {}) {
    super(message);
    this.name = 'SkillError';
    this.code = code;
    this.skill = skill;
    this.details = details;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      skill: this.skill,
      details: this.details,
      timestamp: this.timestamp
    };
  }
}
