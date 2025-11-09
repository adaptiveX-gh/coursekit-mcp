import { describe, it, before, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { BaseContentSkill, SkillError } from './BaseContentSkill.js';
import { GammaAISkill } from './GammaAISkill.js';

// ============================================================================
// TEST: BaseContentSkill
// ============================================================================

describe('BaseContentSkill', () => {
  describe('Constructor', () => {
    it('should throw error when instantiated directly', () => {
      assert.throws(
        () => new BaseContentSkill('test'),
        { message: /abstract/ }
      );
    });
  });

  describe('Abstract Methods', () => {
    // Create a minimal concrete implementation for testing
    class TestSkill extends BaseContentSkill {
      async initialize() { return; }
    }

    it('should require initialize() implementation', async () => {
      class BadSkill extends BaseContentSkill {}
      const skill = new BadSkill('test');

      await assert.rejects(
        async () => await skill.initialize(),
        { message: /must be implemented/ }
      );
    });

    it('should require gatherRequirements() implementation', async () => {
      const skill = new TestSkill('test');

      await assert.rejects(
        async () => await skill.gatherRequirements({}, {}),
        { message: /must be implemented/ }
      );
    });

    it('should require generateContent() implementation', async () => {
      const skill = new TestSkill('test');

      await assert.rejects(
        async () => await skill.generateContent({}, {}),
        { message: /must be implemented/ }
      );
    });

    it('should require validate() implementation', async () => {
      const skill = new TestSkill('test');

      await assert.rejects(
        async () => await skill.validate({}),
        { message: /must be implemented/ }
      );
    });
  });

  describe('Common Functionality', () => {
    class TestSkill extends BaseContentSkill {
      async initialize() { this.initialized = true; }
      async gatherRequirements() { return {}; }
      async generateContent() { return {}; }
      async validate() { return { valid: true, issues: [] }; }
    }

    it('should set progress callback', () => {
      const skill = new TestSkill('test');
      const callback = () => {};

      skill.setProgressCallback(callback);
      assert.strictEqual(skill.progressCallback, callback);
    });

    it('should report progress', () => {
      const skill = new TestSkill('test');
      const progressEvents = [];

      skill.setProgressCallback((event) => progressEvents.push(event));
      skill.reportProgress('test-stage', 50, 'Test message');

      assert.strictEqual(progressEvents.length, 1);
      assert.strictEqual(progressEvents[0].stage, 'test-stage');
      assert.strictEqual(progressEvents[0].progress, 50);
      assert.strictEqual(progressEvents[0].message, 'Test message');
    });

    it('should get capabilities', () => {
      const skill = new TestSkill('test', {
        contentTypes: ['test-type'],
        formats: ['test-format']
      });

      const capabilities = skill.getCapabilities();

      assert.ok(capabilities.contentTypes.includes('test-type'));
      assert.ok(capabilities.formats.includes('test-format'));
    });

    it('should check support for content type', () => {
      const skill = new TestSkill('test', {
        contentTypes: ['presentations', 'slides']
      });

      assert.strictEqual(skill.supports('presentations'), true);
      assert.strictEqual(skill.supports('documents'), false);
    });

    it('should get metadata', () => {
      const skill = new TestSkill('test', {
        version: '1.0.0',
        description: 'Test skill'
      });

      const metadata = skill.getMetadata();

      assert.strictEqual(metadata.name, 'test');
      assert.strictEqual(metadata.version, '1.0.0');
      assert.strictEqual(metadata.description, 'Test skill');
    });

    it('should handle errors', async () => {
      const skill = new TestSkill('test');
      const error = new Error('Test error');

      const result = await skill.handleError(error, 'test-operation');

      assert.strictEqual(result.success, false);
      assert.strictEqual(result.error.message, 'Test error');
      assert.strictEqual(result.error.operation, 'test-operation');
    });

    it('should cleanup resources', async () => {
      const skill = new TestSkill('test');
      skill.initialized = true;
      skill.setProgressCallback(() => {});

      await skill.cleanup();

      assert.strictEqual(skill.initialized, false);
      assert.strictEqual(skill.progressCallback, null);
    });
  });
});

describe('SkillError', () => {
  it('should create error with all properties', () => {
    const error = new SkillError('Test error', 'TEST_CODE', 'test-skill', { detail: 'test' });

    assert.strictEqual(error.name, 'SkillError');
    assert.strictEqual(error.message, 'Test error');
    assert.strictEqual(error.code, 'TEST_CODE');
    assert.strictEqual(error.skill, 'test-skill');
    assert.deepStrictEqual(error.details, { detail: 'test' });
    assert.ok(error.timestamp);
  });

  it('should serialize to JSON', () => {
    const error = new SkillError('Test', 'CODE', 'skill');
    const json = error.toJSON();

    assert.strictEqual(json.name, 'SkillError');
    assert.strictEqual(json.message, 'Test');
    assert.strictEqual(json.code, 'CODE');
    assert.strictEqual(json.skill, 'skill');
  });
});

// ============================================================================
// TEST: GammaAISkill
// ============================================================================

describe('GammaAISkill', () => {
  describe('Constructor', () => {
    it('should create skill with default config', () => {
      const skill = new GammaAISkill();

      assert.strictEqual(skill.name, 'gamma-ai');
      assert.ok(skill.supports('presentations'));
      assert.ok(skill.supports('slides'));
      assert.strictEqual(skill.initialized, false);
    });

    it('should accept custom config', () => {
      const skill = new GammaAISkill({
        contentTypes: ['custom-type'],
        version: '2.0.0'
      });

      const metadata = skill.getMetadata();
      assert.strictEqual(metadata.version, '2.0.0');
    });
  });

  describe('Initialization', () => {
    it('should throw error without API key', async () => {
      const skill = new GammaAISkill();

      await assert.rejects(
        async () => await skill.initialize({}),
        { message: /API key is required/ }
      );
    });

    it('should initialize with API key', async () => {
      const skill = new GammaAISkill();

      await skill.initialize({
        apiKey: 'test-api-key',
        clientOptions: { logging: false }
      });

      assert.strictEqual(skill.initialized, true);
      assert.ok(skill.client);
      assert.ok(skill.converter);
    });

    it('should accept fallback skill configuration', async () => {
      const skill = new GammaAISkill();

      await skill.initialize({
        apiKey: 'test-key',
        fallbackSkill: 'slidev'
      });

      assert.strictEqual(skill.fallbackSkill, 'slidev');
    });
  });

  describe('Gather Requirements', () => {
    let skill;

    beforeEach(async () => {
      skill = new GammaAISkill();
      await skill.initialize({ apiKey: 'test-key' });
    });

    it('should throw if not initialized', async () => {
      const uninitializedSkill = new GammaAISkill();

      await assert.rejects(
        async () => await uninitializedSkill.gatherRequirements({}, {}),
        { message: /not initialized/ }
      );
    });

    it('should gather requirements with progress', async () => {
      const task = {
        description: 'Create presentation',
        duration: 60,
        contentType: 'business'
      };

      const context = {
        constitution: {
          title: 'Business Agility',
          audience: 'business professionals',
          focus: 'frameworks'
        },
        specification: {
          outcomes: ['Understand agility', 'Apply frameworks']
        },
        plan: {
          modules: [{ title: 'Intro' }, { title: 'Practice' }]
        }
      };

      const progressEvents = [];
      skill.setProgressCallback((event) => progressEvents.push(event));

      const requirements = await skill.gatherRequirements(task, context);

      // Check requirements structure
      assert.ok(requirements.style);
      assert.ok(requirements.length);
      assert.ok(requirements.images);
      assert.ok(requirements.exportFormat);
      assert.ok(requirements.theme);

      // Check progress was reported
      assert.ok(progressEvents.length > 0);
      assert.ok(progressEvents.some(e => e.stage === 'gathering'));
    });

    it('should select appropriate style based on audience', async () => {
      const task = { description: 'Test', contentType: 'business' };
      const context = {
        constitution: { audience: 'executives' }
      };

      const requirements = await skill.gatherRequirements(task, context);

      // Should select minimal for executives
      assert.ok(['professional', 'minimal'].includes(requirements.style.style));
    });

    it('should estimate slide count from duration', async () => {
      const task = { duration: 60 };
      const context = { constitution: {} };

      const requirements = await skill.gatherRequirements(task, context);

      // 60 min / 2.5 min per slide + 3 (title, outline, summary) ≈ 27 slides
      assert.ok(requirements.length.estimated >= 20);
      assert.ok(requirements.length.estimated <= 50);
    });

    it('should select image preference based on content type', async () => {
      const technicalTask = { contentType: 'technical code' };
      const businessTask = { contentType: 'business' };
      const context = { constitution: {} };

      const techReq = await skill.gatherRequirements(technicalTask, context);
      const bizReq = await skill.gatherRequirements(businessTask, context);

      // Technical should prefer no images
      assert.strictEqual(techReq.images.preference, 'none');

      // Business should prefer stock or AI
      assert.ok(['stock', 'ai-generated'].includes(bizReq.images.preference));
    });

    it('should select export format based on delivery method', async () => {
      const liveTask = { deliveryMethod: 'live' };
      const distTask = { deliveryMethod: 'distributed' };
      const context = { constitution: {} };

      const liveReq = await skill.gatherRequirements(liveTask, context);
      const distReq = await skill.gatherRequirements(distTask, context);

      assert.strictEqual(liveReq.exportFormat.format, 'view-only');
      assert.strictEqual(distReq.exportFormat.format, 'pptx');
    });

    it('should select theme based on style and audience', async () => {
      const task = { contentType: 'business' };
      const context = {
        constitution: { audience: 'business', focus: 'business' }
      };

      const requirements = await skill.gatherRequirements(task, context);

      assert.ok(requirements.theme.theme);
      assert.ok(requirements.theme.accessibility);
    });
  });

  describe('Generate Content', () => {
    let skill;

    beforeEach(async () => {
      skill = new GammaAISkill();
      await skill.initialize({ apiKey: 'test-key' });
    });

    it('should throw if not initialized', async () => {
      const uninitializedSkill = new GammaAISkill();

      await assert.rejects(
        async () => await uninitializedSkill.generateContent({}, {}),
        { message: /not initialized/ }
      );
    });

    it('should build presentation from context when CourseKit files missing', () => {
      const context = {
        constitution: {
          title: 'Test Course',
          tagline: 'A test course'
        },
        specification: {
          outcomes: ['Learn A', 'Learn B']
        },
        plan: {
          modules: [
            { title: 'Module 1', content: 'Content 1' },
            { title: 'Module 2', content: 'Content 2' }
          ]
        }
      };

      const requirements = {
        style: { style: 'professional' }
      };

      const presentation = skill.buildPresentationFromContext(context, requirements);

      assert.strictEqual(presentation.title, 'Test Course');
      assert.ok(presentation.slides.length > 0);
      assert.ok(presentation.slides.some(s => s.type === 'title'));
      assert.ok(presentation.slides.some(s => s.type === 'bullets'));
      assert.ok(presentation.slides.some(s => s.type === 'section'));
    });

    it('should build effective prompt', () => {
      const requirements = {
        task: {
          description: 'Business Agility Workshop',
          duration: 120,
          focus: 'frameworks'
        },
        style: { style: 'professional' },
        length: { estimated: 30, duration: 120 },
        images: { preference: 'ai-generated' },
        theme: { theme: 'modern' }
      };

      const context = {
        constitution: {
          title: 'Business Agility',
          audience: 'professionals',
          focus: 'agility frameworks'
        },
        specification: {
          outcomes: ['Understand agility', 'Apply frameworks', 'Create hypotheses']
        }
      };

      const presentation = {
        title: 'Business Agility',
        slides: [
          { type: 'title', title: 'Title' },
          { type: 'content', title: 'Content 1' }
        ]
      };

      const prompt = skill.buildPrompt(requirements, context, presentation);

      assert.ok(prompt.includes('Business Agility'));
      assert.ok(prompt.includes('professional'));
      assert.ok(prompt.includes('120 minutes'));
      assert.ok(prompt.includes('Understand agility'));
    });
  });

  describe('Validation', () => {
    let skill;

    beforeEach(async () => {
      skill = new GammaAISkill();
      await skill.initialize({ apiKey: 'test-key' });
    });

    it('should validate successful content', async () => {
      const content = {
        success: true,
        metadata: {
          presentationId: 'pres_123',
          url: 'https://gamma.app/pres_123',
          slideCount: 25
        },
        requirements: {
          exportFormat: { format: 'view-only' }
        }
      };

      const validation = await skill.validate(content);

      assert.strictEqual(validation.valid, true);
      assert.strictEqual(validation.issues.errors.length, 0);
    });

    it('should detect missing presentation ID', async () => {
      const content = {
        success: true,
        metadata: {
          url: 'https://gamma.app/pres_123',
          slideCount: 25
        },
        requirements: {
          exportFormat: { format: 'view-only' }
        }
      };

      const validation = await skill.validate(content);

      assert.strictEqual(validation.valid, true);
      assert.ok(validation.issues.warnings.some(w => w.includes('presentation ID')));
    });

    it('should warn about very small presentations', async () => {
      const content = {
        success: true,
        metadata: {
          presentationId: 'pres_123',
          url: 'https://gamma.app/pres_123',
          slideCount: 2
        }
      };

      const validation = await skill.validate(content);

      assert.ok(validation.issues.warnings.some(w => w.includes('few slides')));
    });

    it('should warn about very large presentations', async () => {
      const content = {
        success: true,
        metadata: {
          presentationId: 'pres_123',
          url: 'https://gamma.app/pres_123',
          slideCount: 150
        }
      };

      const validation = await skill.validate(content);

      assert.ok(validation.issues.warnings.some(w => w.includes('Large presentation')));
    });

    it('should detect missing export when requested', async () => {
      const content = {
        success: true,
        content: null,
        metadata: {
          presentationId: 'pres_123',
          slideCount: 25
        },
        requirements: {
          exportFormat: { format: 'pptx' }
        }
      };

      const validation = await skill.validate(content);

      assert.strictEqual(validation.valid, false);
      assert.ok(validation.issues.errors.some(e => e.includes('Export was requested')));
    });

    it('should detect unsuccessful generation', async () => {
      const content = {
        success: false,
        error: { message: 'Generation failed' }
      };

      const validation = await skill.validate(content);

      assert.strictEqual(validation.valid, false);
      assert.ok(validation.issues.errors.some(e => e.includes('not successful')));
    });
  });

  describe('Status and Cleanup', () => {
    it('should get skill status', async () => {
      const skill = new GammaAISkill();
      await skill.initialize({
        apiKey: 'test-key',
        fallbackSkill: 'slidev'
      });

      const status = skill.getStatus();

      assert.strictEqual(status.name, 'gamma-ai');
      assert.strictEqual(status.initialized, true);
      assert.strictEqual(status.fallbackConfigured, true);
      assert.ok(status.rateLimit);
    });

    it('should cleanup resources', async () => {
      const skill = new GammaAISkill();
      await skill.initialize({ apiKey: 'test-key' });

      assert.ok(skill.client);
      assert.ok(skill.converter);

      await skill.cleanup();

      assert.strictEqual(skill.initialized, false);
      assert.strictEqual(skill.client, null);
      assert.strictEqual(skill.converter, null);
    });
  });
});

console.log('\n✅ All GammaAISkill tests defined. Run with: npm test');
