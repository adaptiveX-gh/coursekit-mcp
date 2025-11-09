// Sample Implementation: Gamma AI Integration for CourseKit
// This shows how the pieces fit together

// ============================================
// 1. Configuration Manager
// ============================================
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

class ConfigurationManager {
  constructor(basePath = process.cwd()) {
    this.basePath = basePath;
    this.config = {};
    this.loadConfiguration();
  }

  loadConfiguration() {
    // Load in precedence order (lowest to highest)
    const sources = [
      { path: 'config/default.json', required: true },
      { path: 'config/providers.json', required: true },
      { path: 'config/user-preferences.json', required: false },
      { path: '.env', type: 'env', required: false }
    ];

    sources.forEach(source => {
      try {
        if (source.type === 'env') {
          dotenv.config({ path: path.join(this.basePath, source.path) });
        } else {
          const filePath = path.join(this.basePath, source.path);
          if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            this.config = this.deepMerge(this.config, data);
          } else if (source.required) {
            throw new Error(`Required config file missing: ${source.path}`);
          }
        }
      } catch (error) {
        console.error(`Error loading config from ${source.path}:`, error.message);
        if (source.required) throw error;
      }
    });
  }

  get(path, defaultValue = null) {
    const keys = path.split('.');
    let value = this.config;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }
    
    return value;
  }

  getAPIKey(provider) {
    const envKey = `${provider.toUpperCase().replace('-', '_')}_API_KEY`;
    return process.env[envKey];
  }

  selectProvider(contentType, taskCharacteristics = {}) {
    const providers = this.get(`providers.${contentType}`, {});
    const userPreference = this.get(`userPreferences.${contentType}`);
    
    // User preference takes priority if set
    if (userPreference && providers[userPreference]?.enabled) {
      return userPreference;
    }
    
    // Auto-select based on rules
    const rules = this.get('selection.rules', {});
    const typeRules = rules[contentType] || {};
    
    // Check task characteristics against rules
    for (const [characteristic, provider] of Object.entries(typeRules)) {
      if (taskCharacteristics[characteristic] && providers[provider]?.enabled) {
        return provider;
      }
    }
    
    // Return default
    return typeRules.default || Object.keys(providers)[0];
  }

  deepMerge(target, source) {
    const output = { ...target };
    
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            output[key] = source[key];
          } else {
            output[key] = this.deepMerge(target[key], source[key]);
          }
        } else {
          output[key] = source[key];
        }
      });
    }
    
    return output;
  }

  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }
}

// ============================================
// 2. Gamma AI API Client
// ============================================
import axios from 'axios';

class GammaAPIClient {
  constructor(apiKey, config = {}) {
    if (!apiKey) {
      throw new Error('Gamma API key is required');
    }
    
    this.apiKey = apiKey;
    this.baseURL = config.endpoint || 'https://api.gamma.app/v1';
    this.timeout = config.timeout || 60000;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    this.setupInterceptors();
  }

  setupInterceptors() {
    // Retry logic for rate limits and network failures
    this.client.interceptors.response.use(
      response => response,
      async error => {
        const { config, response } = error;
        
        // Retry on rate limit with exponential backoff
        if (response?.status === 429 && config.retryCount < 3) {
          config.retryCount = (config.retryCount || 0) + 1;
          const delay = Math.pow(2, config.retryCount) * 1000;
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.client(config);
        }
        
        // Retry on network errors
        if (!response && config.retryCount < 2) {
          config.retryCount = (config.retryCount || 0) + 1;
          const delay = 1000 * config.retryCount;
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.client(config);
        }
        
        throw error;
      }
    );
  }

  async createPresentation({ title, prompt, options = {} }) {
    try {
      const response = await this.client.post('/presentations', {
        title,
        prompt,
        theme: options.theme || 'professional',
        num_slides: options.slideCount || 'auto',
        include_images: options.includeImages !== false,
        tone: options.tone || 'professional',
        audience: options.audience || 'general'
      });
      
      return response.data;
    } catch (error) {
      this.handleError(error, 'creating presentation');
    }
  }

  async waitForCompletion(presentationId, maxWait = 120000) {
    const startTime = Date.now();
    const pollInterval = 2000;
    
    while (Date.now() - startTime < maxWait) {
      const presentation = await this.getPresentation(presentationId);
      
      if (presentation.status === 'completed') {
        return presentation;
      } else if (presentation.status === 'failed') {
        throw new Error(`Presentation generation failed: ${presentation.error}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
    
    throw new Error('Presentation generation timed out');
  }

  async getPresentation(presentationId) {
    try {
      const response = await this.client.get(`/presentations/${presentationId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'fetching presentation');
    }
  }

  async exportPresentation(presentationId, format = 'pptx') {
    try {
      const response = await this.client.get(
        `/presentations/${presentationId}/export`,
        {
          params: { format },
          responseType: 'arraybuffer'
        }
      );
      
      return {
        data: response.data,
        contentType: response.headers['content-type'],
        filename: this.extractFilename(response.headers)
      };
    } catch (error) {
      this.handleError(error, 'exporting presentation');
    }
  }

  handleError(error, action) {
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        throw new Error('Invalid Gamma API key');
      } else if (status === 429) {
        throw new Error('Gamma API rate limit exceeded');
      } else if (status === 400) {
        throw new Error(`Invalid request while ${action}: ${data.message || 'Unknown error'}`);
      } else {
        throw new Error(`Gamma API error while ${action}: ${data.message || status}`);
      }
    } else if (error.request) {
      throw new Error(`Network error while ${action}: Unable to reach Gamma API`);
    } else {
      throw new Error(`Error ${action}: ${error.message}`);
    }
  }

  extractFilename(headers) {
    const disposition = headers['content-disposition'];
    if (!disposition) return 'presentation.pptx';
    
    const match = /filename="?([^"]+)"?/.exec(disposition);
    return match ? match[1] : 'presentation.pptx';
  }
}

// ============================================
// 3. Gamma AI Skill
// ============================================
class GammaAISkill {
  constructor(config = {}) {
    this.name = 'gamma-ai';
    this.config = config;
    this.client = null;
  }

  async initialize(apiKey, config) {
    this.client = new GammaAPIClient(apiKey, {
      endpoint: config.api?.endpoint,
      timeout: config.api?.timeout
    });
  }

  async gatherRequirements(task, context) {
    // In a real implementation, this would interact with the user
    // For now, we'll extract from context
    return {
      style: this.determineStyle(context),
      slideCount: this.estimateSlideCount(task),
      includeImages: true,
      theme: this.selectTheme(context),
      tone: this.determineTone(context)
    };
  }

  async generateContent(task, context, requirements) {
    if (!this.client) {
      throw new Error('Gamma AI client not initialized');
    }
    
    // Build comprehensive prompt from course context
    const prompt = this.buildPrompt(task, context);
    
    // Create presentation
    const presentation = await this.client.createPresentation({
      title: this.extractTitle(task, context),
      prompt,
      options: {
        theme: requirements.theme,
        slideCount: requirements.slideCount,
        includeImages: requirements.includeImages,
        tone: requirements.tone,
        audience: context.constitution?.audience || 'general'
      }
    });
    
    // Wait for completion
    const completed = await this.client.waitForCompletion(presentation.id);
    
    // Export in requested format
    const exported = await this.client.exportPresentation(
      completed.id,
      'pptx'
    );
    
    return {
      type: 'presentation',
      provider: 'gamma-ai',
      format: 'pptx',
      content: exported.data,
      metadata: {
        presentationId: completed.id,
        slideCount: completed.num_slides,
        theme: completed.theme,
        filename: exported.filename
      }
    };
  }

  buildPrompt(task, context) {
    const sections = [];
    
    // Add context from constitution
    if (context.constitution) {
      sections.push(`Course Context:
- Title: ${context.constitution.title || 'Workshop'}
- Audience: ${context.constitution.audience || 'General learners'}
- Purpose: ${context.constitution.vision || 'Educational presentation'}`);
    }
    
    // Add learning objectives from specification
    if (context.specification?.outcomes) {
      sections.push(`Learning Objectives:
${context.specification.outcomes.map((o, i) => `${i + 1}. ${o}`).join('\n')}`);
    }
    
    // Add module information from plan
    if (context.plan && task.module) {
      const module = context.plan.modules?.find(m => m.id === task.module);
      if (module) {
        sections.push(`Module Information:
- Title: ${module.title}
- Duration: ${module.duration}
- Focus: ${module.focus || 'General content'}`);
      }
    }
    
    // Add specific task requirements
    sections.push(`Task Requirements:
- ${task.description}
- Estimated time: ${task.duration || '15-20 minutes'}
- Type: ${task.type || 'presentation'}`);
    
    // Combine into comprehensive prompt
    return `Create a professional presentation with the following requirements:

${sections.join('\n\n')}

Guidelines:
- Use clear, concise language
- Include relevant examples
- Add speaker notes for key slides
- Ensure logical flow between topics
- Make it engaging and interactive where appropriate
- Follow instructional design best practices`;
  }

  determineStyle(context) {
    const audience = context.constitution?.audience?.toLowerCase() || '';
    
    if (audience.includes('executive') || audience.includes('business')) {
      return 'professional';
    } else if (audience.includes('student') || audience.includes('beginner')) {
      return 'educational';
    } else if (audience.includes('creative') || audience.includes('design')) {
      return 'creative';
    }
    
    return 'professional';
  }

  estimateSlideCount(task) {
    const duration = parseInt(task.duration) || 20;
    // Rough estimate: 1-2 slides per minute
    return Math.floor(duration * 1.5);
  }

  selectTheme(context) {
    const style = this.determineStyle(context);
    const themes = {
      professional: 'corporate-blue',
      educational: 'academic-clean',
      creative: 'modern-gradient'
    };
    
    return themes[style] || 'corporate-blue';
  }

  determineTone(context) {
    const audience = context.constitution?.audience?.toLowerCase() || '';
    
    if (audience.includes('senior') || audience.includes('executive')) {
      return 'formal';
    } else if (audience.includes('student') || audience.includes('junior')) {
      return 'friendly';
    }
    
    return 'professional';
  }

  extractTitle(task, context) {
    if (task.title) return task.title;
    
    const moduleMatch = task.description.match(/module\s+(\d+)/i);
    const module = moduleMatch ? `Module ${moduleMatch[1]}` : 'Presentation';
    
    const topic = task.description
      .replace(/create|slides?|presentation/gi, '')
      .replace(/for|module \d+/gi, '')
      .trim();
    
    return `${module}: ${topic || 'Course Content'}`;
  }

  async validate(content) {
    // Validate the generated content
    const issues = [];
    
    if (!content.content) {
      issues.push('No content generated');
    }
    
    if (!content.metadata?.slideCount) {
      issues.push('Unknown slide count');
    }
    
    if (content.metadata?.slideCount < 5) {
      issues.push('Presentation may be too short');
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  }
}

// ============================================
// 4. Enhanced Implementation Coach
// ============================================
class EnhancedImplementationCoach {
  constructor(mcp) {
    this.mcp = mcp;
    this.configManager = new ConfigurationManager();
    this.providers = new Map();
    this.loadProviders();
  }

  async loadProviders() {
    // Load Gamma AI provider
    const gammaConfig = this.configManager.get('providers.presentations.gamma');
    if (gammaConfig?.enabled) {
      const gammaSkill = new GammaAISkill(gammaConfig);
      const apiKey = this.configManager.getAPIKey('gamma-ai');
      
      if (apiKey) {
        await gammaSkill.initialize(apiKey, gammaConfig);
        this.providers.set('gamma', gammaSkill);
      }
    }
    
    // Load other providers (Slidev, PowerPoint, etc.)
    // ... similar pattern
  }

  async route(task, context) {
    const contentType = this.identifyContentType(task);
    const taskCharacteristics = this.analyzeTask(task);
    
    // Select provider based on config and task
    const providerName = this.configManager.selectProvider(
      contentType,
      taskCharacteristics
    );
    
    const provider = this.providers.get(providerName);
    
    if (!provider) {
      throw new Error(`Provider ${providerName} not available`);
    }
    
    try {
      // Gather requirements specific to the provider
      const requirements = await provider.gatherRequirements(task, context);
      
      // Generate content
      const content = await provider.generateContent(task, context, requirements);
      
      // Validate
      const validation = await provider.validate(content);
      
      if (!validation.valid) {
        console.warn('Content validation issues:', validation.issues);
      }
      
      return {
        success: true,
        provider: providerName,
        content,
        validation
      };
      
    } catch (error) {
      console.error(`Provider ${providerName} failed:`, error.message);
      
      // Try fallback provider
      const fallback = this.getFallbackProvider(contentType, providerName);
      
      if (fallback) {
        console.log(`Falling back to ${fallback.name}`);
        const requirements = await fallback.gatherRequirements(task, context);
        const content = await fallback.generateContent(task, context, requirements);
        
        return {
          success: true,
          provider: fallback.name,
          content,
          fallback: true,
          originalError: error.message
        };
      }
      
      throw error;
    }
  }

  identifyContentType(task) {
    const taskLower = task.description.toLowerCase();
    
    if (taskLower.includes('slide') || taskLower.includes('presentation')) {
      return 'presentations';
    } else if (taskLower.includes('exercise') || taskLower.includes('hands-on')) {
      return 'exercises';
    } else if (taskLower.includes('document') || taskLower.includes('guide')) {
      return 'documents';
    }
    
    return 'generic';
  }

  analyzeTask(task) {
    const description = task.description.toLowerCase();
    
    return {
      hasCode: description.includes('code') || description.includes('programming'),
      hasBranding: description.includes('brand') || description.includes('corporate'),
      needsAI: description.includes('generate') || description.includes('create'),
      isComplex: task.duration > 30,
      isTechnical: /python|javascript|api|database/.test(description)
    };
  }

  getFallbackProvider(contentType, failedProvider) {
    const providers = this.configManager.get(`providers.${contentType}`, {});
    
    // Get all enabled providers except the failed one
    const alternatives = Object.entries(providers)
      .filter(([name, config]) => 
        name !== failedProvider && 
        config.enabled && 
        this.providers.has(name)
      )
      .sort((a, b) => (a[1].priority || 999) - (b[1].priority || 999));
    
    if (alternatives.length > 0) {
      return this.providers.get(alternatives[0][0]);
    }
    
    return null;
  }
}

// ============================================
// 5. Example Usage
// ============================================
async function createPresentationWithGamma() {
  // Initialize Implementation Coach
  const coach = new EnhancedImplementationCoach();
  
  // Sample task
  const task = {
    id: 'task-001',
    description: 'Create slides for Module 1 Introduction to Python',
    module: 'module-1',
    duration: 20,
    type: 'presentation'
  };
  
  // Sample context from previous phases
  const context = {
    constitution: {
      title: 'Python for Data Scientists',
      audience: 'Data scientists with basic programming knowledge',
      vision: 'Enable data scientists to leverage Python effectively'
    },
    specification: {
      outcomes: [
        'Set up Python development environment',
        'Understand Python syntax and data types',
        'Write basic Python functions',
        'Use Python for data manipulation'
      ]
    },
    plan: {
      modules: [
        {
          id: 'module-1',
          title: 'Python Fundamentals',
          duration: 60,
          focus: 'Basic syntax and setup'
        }
      ]
    }
  };
  
  try {
    // Route task through Implementation Coach
    const result = await coach.route(task, context);
    
    console.log('✅ Presentation created successfully');
    console.log('Provider used:', result.provider);
    console.log('Slide count:', result.content.metadata.slideCount);
    console.log('File:', result.content.metadata.filename);
    
    // Save the generated presentation
    const fs = require('fs').promises;
    await fs.writeFile(
      `output/${result.content.metadata.filename}`,
      result.content.content
    );
    
    console.log('Presentation saved to output directory');
    
  } catch (error) {
    console.error('❌ Failed to create presentation:', error.message);
  }
}

// Export for use in CourseKit
export {
  ConfigurationManager,
  GammaAPIClient,
  GammaAISkill,
  EnhancedImplementationCoach,
  createPresentationWithGamma
};