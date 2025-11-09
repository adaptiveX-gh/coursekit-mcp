import { BaseContentSkill, SkillError } from './BaseContentSkill.js';
import { GammaAPIClient } from '../providers/gamma/GammaAPIClient.js';
import { GammaContentConverter } from '../providers/gamma/GammaContentConverter.js';
import {
  GammaAPIError,
  GammaRateLimitError,
  GammaAuthenticationError,
  GammaTimeoutError
} from '../providers/gamma/GammaErrors.js';

/**
 * Gamma AI Skill
 *
 * Content generation skill that uses Gamma AI to create professional presentations
 * from CourseKit course content.
 *
 * @extends BaseContentSkill
 *
 * @example
 * const skill = new GammaAISkill({
 *   contentTypes: ['presentations', 'slides'],
 *   formats: ['gamma', 'pdf', 'pptx', 'html']
 * });
 *
 * await skill.initialize({ apiKey: process.env.GAMMA_API_KEY });
 *
 * const requirements = await skill.gatherRequirements(task, context);
 * const content = await skill.generateContent(requirements, context);
 */
export class GammaAISkill extends BaseContentSkill {
  /**
   * Create a new Gamma AI skill
   * @param {Object} config - Skill configuration
   */
  constructor(config = {}) {
    super('gamma-ai', {
      contentTypes: ['presentations', 'slides', 'decks'],
      formats: ['gamma', 'pdf', 'pptx', 'html'],
      features: ['ai-generation', 'themes', 'export', 'templates'],
      version: '1.0.0',
      description: 'AI-powered presentation generation using Gamma AI',
      ...config
    });

    this.client = null;
    this.converter = null;
    this.fallbackSkill = null; // Fallback to Slidev or PowerPoint
  }

  /**
   * Initialize the Gamma AI skill
   * @param {Object} options - Initialization options
   * @param {string} options.apiKey - Gamma API key
   * @param {Object} options.clientOptions - GammaAPIClient options
   * @param {Object} options.converterOptions - GammaContentConverter options
   * @param {string} options.fallbackSkill - Fallback skill name
   * @returns {Promise<void>}
   */
  async initialize(options = {}) {
    const { apiKey, clientOptions = {}, converterOptions = {}, fallbackSkill } = options;

    if (!apiKey) {
      throw new SkillError(
        'Gamma API key is required for initialization',
        'MISSING_API_KEY',
        this.name
      );
    }

    try {
      // Initialize Gamma API client
      this.client = new GammaAPIClient(apiKey, {
        timeout: 60000,
        maxRetries: 3,
        logging: false,
        ...clientOptions
      });

      // Initialize content converter
      this.converter = new GammaContentConverter({
        includeNotes: true,
        includeExercises: true,
        slideTransition: 'slide-left',
        ...converterOptions
      });

      this.fallbackSkill = fallbackSkill;
      this.initialized = true;

      console.log(`[${this.name}] Initialized successfully`);
    } catch (error) {
      throw new SkillError(
        `Failed to initialize: ${error.message}`,
        'INITIALIZATION_FAILED',
        this.name,
        { originalError: error.message }
      );
    }
  }

  /**
   * Gather requirements from user through conversation
   * @param {Object} task - Task object
   * @param {Object} context - Course context
   * @returns {Promise<Object>} Requirements object
   */
  async gatherRequirements(task, context) {
    if (!this.initialized) {
      throw new SkillError('Skill not initialized', 'NOT_INITIALIZED', this.name);
    }

    this.reportProgress('gathering', 0, 'Starting requirements gathering...');

    const requirements = {
      task,
      context,
      style: null,
      length: null,
      images: null,
      exportFormat: null,
      theme: null,
      additionalPreferences: {}
    };

    // Stage 1: Presentation Style
    this.reportProgress('gathering', 20, 'Determining presentation style...');
    requirements.style = await this.askPresentationStyle(task, context);

    // Stage 2: Target Length
    this.reportProgress('gathering', 40, 'Determining slide count...');
    requirements.length = await this.askTargetLength(task, context);

    // Stage 3: Image Preferences
    this.reportProgress('gathering', 60, 'Gathering image preferences...');
    requirements.images = await this.askImagePreferences(task, context);

    // Stage 4: Export Format
    this.reportProgress('gathering', 80, 'Determining export format...');
    requirements.exportFormat = await this.askExportFormat(task);

    // Stage 5: Theme Preferences
    this.reportProgress('gathering', 90, 'Selecting theme...');
    requirements.theme = await this.selectTheme(context, requirements.style);

    this.reportProgress('gathering', 100, 'Requirements gathered successfully');

    return requirements;
  }

  /**
   * Ask user about presentation style
   * @private
   */
  async askPresentationStyle(task, context) {
    // Analyze context to suggest appropriate style
    const audience = context.constitution?.audience || '';
    const contentType = task.contentType || '';

    // Determine suggested style based on audience and content
    let suggestedStyle = 'professional';

    if (audience.toLowerCase().includes('creative') || audience.toLowerCase().includes('design')) {
      suggestedStyle = 'creative';
    } else if (audience.toLowerCase().includes('executive') || contentType.includes('business')) {
      suggestedStyle = 'minimal';
    }

    // In a real implementation, this would use Claude's conversation capabilities
    // For now, return suggested style
    return {
      style: suggestedStyle,
      reason: `Selected ${suggestedStyle} style based on audience and content type`,
      options: ['professional', 'creative', 'minimal']
    };
  }

  /**
   * Ask user about target slide count
   * @private
   */
  async askTargetLength(task, context) {
    // Estimate slide count from task duration and module count
    const duration = task.duration || context.plan?.duration || 60;
    const modules = context.plan?.modules?.length || 5;

    // Rule of thumb: 2-3 minutes per slide for presentations
    // Add title, outline, summary slides
    const estimatedSlides = Math.ceil(duration / 2.5) + 3;

    // Adjust based on content complexity
    const hasExercises = task.description?.toLowerCase().includes('exercise') ||
                         task.description?.toLowerCase().includes('activity');

    const finalEstimate = hasExercises ? estimatedSlides + modules : estimatedSlides;

    return {
      mode: 'auto',
      estimated: Math.min(finalEstimate, 50), // Cap at 50
      duration,
      reason: `Estimated ${finalEstimate} slides based on ${duration} min duration`
    };
  }

  /**
   * Ask user about image preferences
   * @private
   */
  async askImagePreferences(task, context) {
    // Analyze if images would be beneficial
    const contentType = task.contentType || '';
    const isHighlyTechnical = contentType.includes('code') || contentType.includes('technical');

    // AI-generated images work best for concepts, diagrams
    // Stock photos work for general business content
    // None for code-heavy presentations

    let preference = 'ai-generated';

    if (isHighlyTechnical) {
      preference = 'none';
    } else if (context.constitution?.focus?.includes('business')) {
      preference = 'stock';
    }

    return {
      preference,
      reason: `Selected '${preference}' images based on content type`,
      options: ['ai-generated', 'stock', 'none']
    };
  }

  /**
   * Ask user about export format
   * @private
   */
  async askExportFormat(task) {
    // Determine appropriate export format based on delivery method
    const deliveryMethod = task.deliveryMethod || 'live';

    const formats = {
      'live': 'view-only',      // For live presentations
      'distributed': 'pptx',    // For sharing/editing
      'handout': 'pdf',         // For print/distribution
      'online': 'html'          // For web hosting
    };

    const format = formats[deliveryMethod] || 'view-only';

    return {
      format,
      deliveryMethod,
      reason: `Selected ${format} format for ${deliveryMethod} delivery`,
      options: ['view-only', 'pptx', 'pdf', 'html']
    };
  }

  /**
   * Select appropriate theme based on context and style
   * @private
   */
  async selectTheme(context, stylePreference) {
    const audience = context.constitution?.audience || '';
    const focus = context.constitution?.focus || '';
    const style = stylePreference?.style || 'professional';

    // Theme mapping based on audience and style
    const themeMap = {
      professional: {
        business: 'corporate',
        technical: 'tech',
        education: 'academic',
        default: 'modern'
      },
      creative: {
        design: 'bold',
        marketing: 'vibrant',
        startup: 'dynamic',
        default: 'creative'
      },
      minimal: {
        executive: 'clean',
        financial: 'minimal',
        legal: 'formal',
        default: 'simple'
      }
    };

    // Determine content category
    let category = 'default';
    if (audience.includes('business') || focus.includes('business')) {
      category = 'business';
    } else if (audience.includes('technical') || focus.includes('technical')) {
      category = 'technical';
    } else if (audience.includes('executive')) {
      category = 'executive';
    }

    const selectedTheme = themeMap[style]?.[category] || themeMap[style]?.default || 'modern';

    return {
      theme: selectedTheme,
      style,
      category,
      reason: `Selected '${selectedTheme}' theme for ${style} ${category} content`,
      accessibility: {
        highContrast: false,
        largeText: false,
        colorBlindSafe: true
      }
    };
  }

  /**
   * Generate content using Gamma AI
   * @param {Object} requirements - Requirements from gatherRequirements()
   * @param {Object} context - Course context
   * @returns {Promise<Object>} Generated content with metadata
   */
  async generateContent(requirements, context) {
    if (!this.initialized) {
      throw new SkillError('Skill not initialized', 'NOT_INITIALIZED', this.name);
    }

    try {
      this.reportProgress('generation', 0, 'Starting content generation...');

      // Step 1: Convert CourseKit content to Gamma format
      this.reportProgress('generation', 10, 'Converting course content...');
      const presentation = await this.convertCourseContent(context, requirements);

      // Step 2: Build effective prompt
      this.reportProgress('generation', 20, 'Building AI prompt...');
      const prompt = this.buildPrompt(requirements, context, presentation);

      // Step 3: Call Gamma AI API
      this.reportProgress('generation', 30, 'Calling Gamma AI API...');
      const gammaFormat = this.converter.toGammaAPIFormat(presentation);

      const result = await this.client.createPresentation({
        title: presentation.title,
        prompt,
        context: gammaFormat,
        options: {
          style: requirements.style.style,
          maxSlides: requirements.length.estimated,
          theme: requirements.theme.theme,
          includeImages: requirements.images.preference !== 'none'
        }
      });

      this.reportProgress('generation', 50, `Presentation created: ${result.id}`);

      // Step 4: Wait for completion
      this.reportProgress('generation', 60, 'Waiting for AI generation to complete...');
      const completed = await this.waitForCompletionWithProgress(result.id);

      this.reportProgress('generation', 80, 'Generation complete, preparing export...');

      // Step 5: Export if needed
      let exported = null;
      if (requirements.exportFormat.format !== 'view-only') {
        const exportFormat = requirements.exportFormat.format === 'pptx' ? 'pptx' :
                            requirements.exportFormat.format === 'pdf' ? 'pdf' : 'html';

        this.reportProgress('generation', 90, `Exporting to ${exportFormat}...`);
        exported = await this.client.exportPresentation(completed.id, exportFormat);
      }

      this.reportProgress('generation', 100, 'Content generation complete!');

      return {
        success: true,
        content: exported,
        metadata: {
          presentationId: completed.id,
          url: completed.url,
          status: completed.status,
          slideCount: completed.slideCount || presentation.slides.length,
          theme: requirements.theme.theme,
          style: requirements.style.style,
          exportFormat: requirements.exportFormat.format,
          generatedAt: new Date().toISOString(),
          provider: 'gamma-ai'
        },
        requirements
      };

    } catch (error) {
      return await this.handleGenerationError(error, requirements, context);
    }
  }

  /**
   * Convert CourseKit content to presentation format
   * @private
   */
  async convertCourseContent(context, requirements) {
    // Check if .coursekit directory exists
    const coursekitPath = context.coursekitPath || './.coursekit';

    try {
      const presentation = await this.converter.convertCourse(coursekitPath, {
        maxSlides: requirements.length.estimated,
        style: requirements.style.style
      });

      // Validate presentation
      const validation = this.converter.validate(presentation);
      if (!validation.valid) {
        throw new SkillError(
          `Content validation failed: ${validation.issues.errors.join(', ')}`,
          'VALIDATION_FAILED',
          this.name,
          { validation }
        );
      }

      return presentation;
    } catch (error) {
      // If CourseKit content not available, build from context objects
      return this.buildPresentationFromContext(context, requirements);
    }
  }

  /**
   * Build presentation from context objects (fallback)
   * @private
   */
  buildPresentationFromContext(context, requirements) {
    const presentation = {
      title: context.constitution?.title || 'Untitled Presentation',
      subtitle: context.constitution?.tagline || '',
      style: requirements.style.style,
      slides: [],
      metadata: {
        source: 'context-objects',
        generatedAt: new Date().toISOString()
      }
    };

    // Add title slide
    presentation.slides.push({
      type: 'title',
      title: presentation.title,
      subtitle: presentation.subtitle
    });

    // Add learning outcomes slide
    if (context.specification?.outcomes?.length > 0) {
      presentation.slides.push({
        type: 'bullets',
        title: 'Learning Outcomes',
        content: context.specification.outcomes
      });
    }

    // Add content slides from plan modules
    if (context.plan?.modules) {
      for (const module of context.plan.modules) {
        presentation.slides.push({
          type: 'section',
          title: module.title
        });

        presentation.slides.push({
          type: 'content',
          title: module.title,
          content: module.content || 'Module content'
        });
      }
    }

    // Add summary slide
    presentation.slides.push({
      type: 'summary',
      title: 'Summary',
      content: context.specification?.outcomes || []
    });

    return presentation;
  }

  /**
   * Build effective prompt for Gamma AI
   * @private
   */
  buildPrompt(requirements, context, presentation) {
    const { task } = requirements;
    const constitution = context.constitution || {};
    const specification = context.specification || {};

    // Extract key information
    const title = constitution.title || task.description || 'Presentation';
    const audience = constitution.audience || 'general audience';
    const focus = constitution.focus || task.focus || 'key concepts';
    const duration = task.duration || requirements.length.duration || 60;
    const outcomes = specification.outcomes || [];

    // Build comprehensive prompt
    const prompt = `
Create a ${requirements.style.style} presentation titled "${title}".

**Context:**
- Course: ${constitution.title || 'Course'}
- Target Audience: ${audience}
- Focus Areas: ${focus}
- Duration: ${duration} minutes (${requirements.length.estimated} slides)
- Learning Objectives: ${outcomes.join('; ')}

**Requirements:**
- Style: ${requirements.style.style}
- Theme: ${requirements.theme.theme}
- Images: ${requirements.images.preference}
- Slide Count: ${requirements.length.estimated}

**Content Structure:**
${presentation.slides.map((slide, i) => `${i + 1}. [${slide.type}] ${slide.title || '(untitled)'}`).join('\n')}

**Tone and Approach:**
- Professional yet engaging
- Clear and actionable
- Focused on practical application
- Include speaker notes for each slide
- Ensure accessibility (high contrast, readable fonts)

**Key Points to Emphasize:**
${outcomes.slice(0, 5).map((o, i) => `${i + 1}. ${o}`).join('\n')}

Please create a visually appealing, well-structured presentation that achieves these learning objectives and maintains audience engagement throughout.
`.trim();

    return prompt;
  }

  /**
   * Wait for completion with progress updates
   * @private
   */
  async waitForCompletionWithProgress(presentationId) {
    const maxWaitTime = 300000; // 5 minutes
    const pollInterval = 3000; // 3 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const presentation = await this.client.getPresentation(presentationId);

      // Calculate progress (rough estimate based on status)
      const statusProgress = {
        'pending': 65,
        'processing': 70,
        'generating': 75,
        'completed': 80,
        'ready': 80
      };

      const progress = statusProgress[presentation.status] || 65;
      this.reportProgress('generation', progress, `Status: ${presentation.status}`);

      // Check if completed
      if (presentation.status === 'completed' || presentation.status === 'ready') {
        return presentation;
      }

      // Check if failed
      if (presentation.status === 'failed' || presentation.status === 'error') {
        throw new SkillError(
          `Generation failed: ${presentation.error || 'Unknown error'}`,
          'GENERATION_FAILED',
          this.name,
          { presentationId, status: presentation.status }
        );
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new GammaTimeoutError('waitForCompletion', maxWaitTime, { presentationId });
  }

  /**
   * Handle generation errors with fallback options
   * @private
   */
  async handleGenerationError(error, requirements, context) {
    console.error(`[${this.name}] Generation error:`, error.message);

    // Determine if error is recoverable
    const isRecoverable = error instanceof GammaRateLimitError ||
                         error instanceof GammaTimeoutError;

    // Build error result
    const errorResult = {
      success: false,
      error: {
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
        skill: this.name,
        timestamp: new Date().toISOString(),
        recoverable: isRecoverable
      }
    };

    // Attempt fallback if configured
    if (this.fallbackSkill && isRecoverable) {
      errorResult.fallback = {
        attempted: true,
        skill: this.fallbackSkill,
        reason: error instanceof GammaRateLimitError ? 'rate_limited' : 'timeout',
        message: `Falling back to ${this.fallbackSkill} due to ${errorResult.fallback.reason}`
      };

      this.reportProgress('fallback', 0, `Attempting fallback to ${this.fallbackSkill}...`);
    }

    // Provide guidance based on error type
    if (error instanceof GammaAuthenticationError) {
      errorResult.guidance = 'Check your Gamma API key configuration in .env file';
    } else if (error instanceof GammaRateLimitError) {
      errorResult.guidance = `Rate limit exceeded. Retry after ${error.retryAfter} seconds or use fallback provider`;
    } else if (error instanceof GammaTimeoutError) {
      errorResult.guidance = 'Generation timed out. Try reducing slide count or use fallback provider';
    }

    return errorResult;
  }

  /**
   * Validate generated content
   * @param {Object} content - Generated content
   * @returns {Promise<Object>} Validation result
   */
  async validate(content) {
    const issues = {
      errors: [],
      warnings: []
    };

    // Check content structure
    if (!content.success) {
      issues.errors.push('Content generation was not successful');
    }

    if (content.success) {
      // Check metadata
      if (!content.metadata?.presentationId) {
        issues.warnings.push('Missing presentation ID');
      }

      if (!content.metadata?.url) {
        issues.warnings.push('Missing presentation URL');
      }

      // Check slide count
      if (content.metadata?.slideCount < 3) {
        issues.warnings.push('Very few slides generated (< 3)');
      } else if (content.metadata?.slideCount > 100) {
        issues.warnings.push('Large presentation generated (> 100 slides)');
      }

      // Check export format
      if (content.requirements?.exportFormat?.format !== 'view-only' && !content.content) {
        issues.errors.push('Export was requested but no exported content available');
      }
    }

    return {
      valid: issues.errors.length === 0,
      issues
    };
  }

  /**
   * Get skill status and statistics
   * @returns {Object} Status object
   */
  getStatus() {
    const metadata = this.getMetadata();
    const rateLimitStatus = this.client ? this.client.getRateLimitStatus() : null;

    return {
      ...metadata,
      rateLimit: rateLimitStatus,
      fallbackConfigured: !!this.fallbackSkill
    };
  }

  /**
   * Clean up resources
   * @returns {Promise<void>}
   */
  async cleanup() {
    await super.cleanup();
    this.client = null;
    this.converter = null;
    this.fallbackSkill = null;
  }
}
