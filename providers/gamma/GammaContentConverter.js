import fs from 'fs/promises';
import path from 'path';
import { GammaConversionError } from './GammaErrors.js';

/**
 * Content Converter for CourseKit → Gamma AI
 *
 * Converts CourseKit course structure (constitution, specification, plan, implementations)
 * into Gamma AI's presentation format.
 *
 * @example
 * const converter = new GammaContentConverter();
 * const gammaContent = await converter.convertCourse('/path/to/.coursekit', {
 *   maxSlides: 50,
 *   includeExercises: true
 * });
 */
export class GammaContentConverter {
  /**
   * Create a new content converter
   * @param {Object} options - Converter options
   * @param {boolean} options.includeNotes - Include facilitator notes as speaker notes
   * @param {boolean} options.includeExercises - Include exercises as slides
   * @param {string} options.slideTransition - Default slide transition
   */
  constructor(options = {}) {
    this.includeNotes = options.includeNotes !== false; // Default: true
    this.includeExercises = options.includeExercises !== false; // Default: true
    this.slideTransition = options.slideTransition || 'slide-left';
  }

  /**
   * Convert entire CourseKit course to Gamma presentation format
   * @param {string} coursekitPath - Path to .coursekit directory
   * @param {Object} options - Conversion options
   * @param {number} options.maxSlides - Maximum number of slides
   * @param {string} options.style - Gamma presentation style
   * @returns {Promise<Object>} Gamma presentation specification
   */
  async convertCourse(coursekitPath, options = {}) {
    try {
      // Read CourseKit artifacts
      const constitution = await this.readArtifact(coursekitPath, 'constitution.md');
      const specification = await this.readArtifact(coursekitPath, 'specification.md');
      const plan = await this.readArtifact(coursekitPath, 'plan.md');

      // Parse content structure
      const parsedConstitution = this.parseConstitution(constitution);
      const parsedSpec = this.parseSpecification(specification);
      const parsedPlan = this.parsePlan(plan);

      // Build Gamma presentation structure
      const presentation = {
        title: parsedSpec.title || parsedConstitution.title || 'Untitled Course',
        subtitle: parsedConstitution.tagline || '',
        style: options.style || 'professional',
        slides: [],
        metadata: {
          source: 'CourseKit',
          generatedAt: new Date().toISOString(),
          constitution: parsedConstitution.vision,
          learningOutcomes: parsedSpec.outcomes
        }
      };

      // Generate slides from course structure
      this.addTitleSlide(presentation, parsedConstitution, parsedSpec);
      this.addOutlineSlide(presentation, parsedPlan);
      this.addContentSlides(presentation, parsedPlan, parsedSpec);

      // Add exercises if enabled
      if (this.includeExercises && parsedPlan.exercises) {
        this.addExerciseSlides(presentation, parsedPlan.exercises);
      }

      // Add summary/conclusion
      this.addSummarySlide(presentation, parsedSpec);

      // Apply maxSlides limit if specified
      if (options.maxSlides && presentation.slides.length > options.maxSlides) {
        presentation.slides = presentation.slides.slice(0, options.maxSlides);
        presentation.metadata.truncated = true;
      }

      return presentation;
    } catch (error) {
      throw new GammaConversionError(
        `Failed to convert CourseKit course: ${error.message}`,
        'coursekit',
        'gamma',
        { coursekitPath, originalError: error.message }
      );
    }
  }

  /**
   * Read a CourseKit artifact file
   * @private
   */
  async readArtifact(coursekitPath, filename) {
    try {
      const filePath = path.join(coursekitPath, filename);
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      if (error.code === 'ENOENT') {
        return ''; // File doesn't exist - return empty string
      }
      throw error;
    }
  }

  /**
   * Parse constitution.md into structured data
   * @private
   */
  parseConstitution(content) {
    const lines = content.split('\n');
    const parsed = {
      title: '',
      tagline: '',
      vision: '',
      problem: '',
      transformation: [],
      pedagogy: {},
      constraints: {}
    };

    let currentSection = null;
    let currentContent = [];

    for (const line of lines) {
      // Extract title (first # heading)
      if (line.startsWith('# ') && !parsed.title) {
        parsed.title = line.substring(2).trim();
        continue;
      }

      // Detect sections
      if (line.startsWith('## ')) {
        // Save previous section
        if (currentSection) {
          parsed[currentSection] = currentContent.join('\n').trim();
        }

        currentSection = this.normalizeSectionName(line.substring(3).trim());
        currentContent = [];
        continue;
      }

      // Accumulate content
      if (currentSection) {
        currentContent.push(line);
      }
    }

    // Save last section
    if (currentSection) {
      parsed[currentSection] = currentContent.join('\n').trim();
    }

    return parsed;
  }

  /**
   * Parse specification.md into structured data
   * @private
   */
  parseSpecification(content) {
    const lines = content.split('\n');
    const parsed = {
      title: '',
      description: '',
      outcomes: [],
      audience: '',
      prerequisites: []
    };

    let currentSection = null;
    let currentContent = [];

    for (const line of lines) {
      if (line.startsWith('# ') && !parsed.title) {
        parsed.title = line.substring(2).trim();
        continue;
      }

      if (line.startsWith('## ')) {
        if (currentSection) {
          this.saveSectionContent(parsed, currentSection, currentContent);
        }
        currentSection = this.normalizeSectionName(line.substring(3).trim());
        currentContent = [];
        continue;
      }

      // Extract learning outcomes (bullet points)
      if (currentSection === 'learningoutcomes' && line.trim().startsWith('-')) {
        parsed.outcomes.push(line.trim().substring(1).trim());
      } else if (currentSection) {
        currentContent.push(line);
      }
    }

    if (currentSection) {
      this.saveSectionContent(parsed, currentSection, currentContent);
    }

    return parsed;
  }

  /**
   * Parse plan.md into structured data
   * @private
   */
  parsePlan(content) {
    const lines = content.split('\n');
    const parsed = {
      modules: [],
      exercises: [],
      duration: 0
    };

    let currentModule = null;
    let currentContent = [];

    for (const line of lines) {
      // Module heading (## or ###)
      if (line.match(/^#{2,3}\s+/)) {
        if (currentModule) {
          currentModule.content = currentContent.join('\n').trim();
          parsed.modules.push(currentModule);
        }

        currentModule = {
          title: line.replace(/^#{2,3}\s+/, '').trim(),
          level: line.startsWith('###') ? 2 : 1,
          content: '',
          slides: [],
          duration: this.extractDuration(line)
        };
        currentContent = [];
        continue;
      }

      // Detect exercises
      if (line.toLowerCase().includes('exercise:') || line.toLowerCase().includes('activity:')) {
        parsed.exercises.push({
          title: line.trim(),
          module: currentModule?.title || 'General'
        });
      }

      if (currentModule) {
        currentContent.push(line);
      }
    }

    // Save last module
    if (currentModule) {
      currentModule.content = currentContent.join('\n').trim();
      parsed.modules.push(currentModule);
    }

    return parsed;
  }

  /**
   * Add title slide
   * @private
   */
  addTitleSlide(presentation, constitution, specification) {
    presentation.slides.push({
      type: 'title',
      title: presentation.title,
      subtitle: constitution.tagline || specification.description,
      background: 'gradient',
      transition: this.slideTransition
    });
  }

  /**
   * Add outline/agenda slide
   * @private
   */
  addOutlineSlide(presentation, plan) {
    if (!plan.modules || plan.modules.length === 0) return;

    const outline = plan.modules
      .filter(m => m.level === 1) // Only top-level modules
      .map(m => m.title);

    presentation.slides.push({
      type: 'bullets',
      title: 'Agenda',
      content: outline,
      speakerNotes: 'Course overview and structure',
      transition: this.slideTransition
    });
  }

  /**
   * Add content slides from plan modules
   * @private
   */
  addContentSlides(presentation, plan, specification) {
    for (const module of plan.modules) {
      // Section divider for top-level modules
      if (module.level === 1) {
        presentation.slides.push({
          type: 'section',
          title: module.title,
          transition: 'fade'
        });
      }

      // Parse module content into slide blocks
      const slideBlocks = this.parseContentIntoSlides(module.content);

      for (const block of slideBlocks) {
        const slide = {
          type: block.type || 'content',
          title: block.title || module.title,
          content: block.content,
          transition: this.slideTransition
        };

        // Add speaker notes if enabled
        if (this.includeNotes && block.notes) {
          slide.speakerNotes = block.notes;
        }

        // Map to learning outcomes
        const relatedOutcomes = this.findRelatedOutcomes(
          block.content,
          specification.outcomes
        );
        if (relatedOutcomes.length > 0) {
          slide.metadata = { learningOutcomes: relatedOutcomes };
        }

        presentation.slides.push(slide);
      }
    }
  }

  /**
   * Parse content text into slide blocks
   * @private
   */
  parseContentIntoSlides(content) {
    const blocks = [];
    const lines = content.split('\n');

    let currentBlock = null;
    let currentContent = [];

    for (const line of lines) {
      // Heading starts a new slide
      if (line.match(/^#{4,6}\s+/)) {
        if (currentBlock) {
          currentBlock.content = currentContent.join('\n').trim();
          blocks.push(currentBlock);
        }

        currentBlock = {
          title: line.replace(/^#{4,6}\s+/, '').trim(),
          type: 'content',
          content: ''
        };
        currentContent = [];
        continue;
      }

      // Code block
      if (line.trim().startsWith('```')) {
        const language = line.trim().substring(3).trim();
        const codeLines = [];
        let i = lines.indexOf(line) + 1;

        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }

        currentContent.push({
          type: 'code',
          language: language || 'text',
          code: codeLines.join('\n')
        });
        continue;
      }

      // Bullet list
      if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
        currentContent.push(line.trim().substring(1).trim());
      } else if (line.trim()) {
        currentContent.push(line.trim());
      }
    }

    // Save last block
    if (currentBlock) {
      currentBlock.content = currentContent.join('\n').trim();
      blocks.push(currentBlock);
    }

    // If no blocks created, create one from all content
    if (blocks.length === 0 && currentContent.length > 0) {
      blocks.push({
        type: 'content',
        content: currentContent.join('\n').trim()
      });
    }

    return blocks;
  }

  /**
   * Add exercise slides
   * @private
   */
  addExerciseSlides(presentation, exercises) {
    for (const exercise of exercises) {
      presentation.slides.push({
        type: 'exercise',
        title: exercise.title,
        content: exercise.description || 'Group activity',
        speakerNotes: `Facilitate this exercise for the ${exercise.module} module`,
        transition: this.slideTransition
      });
    }
  }

  /**
   * Add summary/conclusion slide
   * @private
   */
  addSummarySlide(presentation, specification) {
    if (specification.outcomes.length === 0) return;

    presentation.slides.push({
      type: 'summary',
      title: 'Key Takeaways',
      content: specification.outcomes,
      speakerNotes: 'Review main learning outcomes',
      transition: this.slideTransition
    });
  }

  /**
   * Find learning outcomes related to content
   * @private
   */
  findRelatedOutcomes(content, outcomes) {
    const related = [];
    const contentLower = content.toLowerCase();

    for (const outcome of outcomes) {
      // Simple keyword matching - extract key terms from outcome
      const keywords = outcome
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 4); // Only words longer than 4 chars

      // If any keyword appears in content, consider it related
      for (const keyword of keywords) {
        if (contentLower.includes(keyword)) {
          related.push(outcome);
          break;
        }
      }
    }

    return related;
  }

  /**
   * Extract duration from text (e.g., "Module 1 (30 min)")
   * @private
   */
  extractDuration(text) {
    const match = text.match(/\((\d+)\s*min/i);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Normalize section name for object key
   * @private
   */
  normalizeSectionName(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .replace(/^(the|a|an)/, '');
  }

  /**
   * Save section content to parsed object
   * @private
   */
  saveSectionContent(parsed, section, content) {
    const text = content.join('\n').trim();

    if (section === 'prerequisites' || section === 'requirements') {
      // Parse as list
      parsed.prerequisites = text
        .split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.trim().substring(1).trim());
    } else {
      parsed[section] = text;
    }
  }

  /**
   * Convert Gamma presentation to API request format
   * @param {Object} presentation - Presentation structure from convertCourse()
   * @returns {Object} API request body for Gamma
   */
  toGammaAPIFormat(presentation) {
    return {
      title: presentation.title,
      subtitle: presentation.subtitle,
      style: presentation.style || 'professional',
      slides: presentation.slides.map(slide => ({
        type: slide.type,
        title: slide.title,
        content: this.formatSlideContent(slide.content),
        speakerNotes: slide.speakerNotes || '',
        transition: slide.transition || this.slideTransition,
        metadata: slide.metadata || {}
      })),
      metadata: presentation.metadata
    };
  }

  /**
   * Format slide content for Gamma API
   * @private
   */
  formatSlideContent(content) {
    if (Array.isArray(content)) {
      return content.join('\n');
    }
    if (typeof content === 'object' && content.type === 'code') {
      return `\`\`\`${content.language}\n${content.code}\n\`\`\``;
    }
    return String(content);
  }

  /**
   * Validate converted content meets Gamma requirements
   * @param {Object} presentation - Presentation structure
   * @returns {Object} Validation result with warnings/errors
   */
  validate(presentation) {
    const issues = {
      errors: [],
      warnings: []
    };

    // Check required fields
    if (!presentation.title) {
      issues.errors.push('Presentation title is required');
    }

    if (!presentation.slides || presentation.slides.length === 0) {
      issues.errors.push('Presentation must have at least one slide');
    }

    // Check slide count
    if (presentation.slides.length > 100) {
      issues.warnings.push(`Large presentation: ${presentation.slides.length} slides (max recommended: 100)`);
    }

    // Check slide content
    for (let i = 0; i < presentation.slides.length; i++) {
      const slide = presentation.slides[i];

      if (!slide.type) {
        issues.warnings.push(`Slide ${i + 1} missing type`);
      }

      if (!slide.title && slide.type !== 'section') {
        issues.warnings.push(`Slide ${i + 1} missing title`);
      }
    }

    return {
      valid: issues.errors.length === 0,
      issues
    };
  }
}
