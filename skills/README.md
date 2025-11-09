# CourseKit Skills

Content generation skills for CourseKit MCP Server.

## Overview

Skills are classes that implement specific content generation capabilities. Each skill extends `BaseContentSkill` and provides specialized functionality for creating different types of content (presentations, documents, etc.).

## Available Skills

### GammaAISkill

AI-powered presentation generation using Gamma AI.

**Capabilities:**
- Automatic slide generation from CourseKit content
- Multiple presentation styles (professional, creative, minimal)
- Theme selection based on audience and content
- Export to multiple formats (PDF, PPTX, HTML)
- Progress tracking for long-running operations
- Fallback to alternative providers on errors

**Usage:**
```javascript
import { GammaAISkill } from './GammaAISkill.js';

// Initialize skill
const skill = new GammaAISkill();
await skill.initialize({
  apiKey: process.env.GAMMA_API_KEY,
  fallbackSkill: 'slidev'
});

// Gather requirements
const requirements = await skill.gatherRequirements(task, context);

// Generate content
const result = await skill.generateContent(requirements, context);

// Validate output
const validation = await skill.validate(result);
```

See [GammaAISkill Documentation](./GAMMA-AI-SKILL.md) for detailed information.

## Base Class: BaseContentSkill

All skills extend the `BaseContentSkill` abstract base class.

### Required Methods

Skills must implement these methods:

```javascript
class MySkill extends BaseContentSkill {
  // Initialize skill with API keys, config, etc.
  async initialize(options) { }

  // Gather requirements from user
  async gatherRequirements(task, context) { }

  // Generate content based on requirements
  async generateContent(requirements, context) { }

  // Validate generated content
  async validate(content) { }
}
```

### Provided Methods

BaseContentSkill provides these methods:

- `setProgressCallback(callback)` - Set progress reporting callback
- `reportProgress(stage, progress, message)` - Report progress
- `getCapabilities()` - Get skill capabilities
- `supports(contentType)` - Check if content type is supported
- `getMetadata()` - Get skill metadata
- `handleError(error, operation, fallbackOptions)` - Handle errors
- `cleanup()` - Clean up resources

## Creating a New Skill

### 1. Create the Skill Class

```javascript
import { BaseContentSkill, SkillError } from './BaseContentSkill.js';

export class MySkill extends BaseContentSkill {
  constructor(config = {}) {
    super('my-skill', {
      contentTypes: ['my-content-type'],
      formats: ['format1', 'format2'],
      features: ['feature1', 'feature2'],
      version: '1.0.0',
      description: 'My content generation skill',
      ...config
    });

    this.client = null;
  }

  async initialize(options) {
    // Initialize API clients, converters, etc.
    this.client = new MyAPIClient(options.apiKey);
    this.initialized = true;
  }

  async gatherRequirements(task, context) {
    // Ask user questions, analyze context, etc.
    return {
      // Gathered requirements
    };
  }

  async generateContent(requirements, context) {
    // Generate content using API client
    // Report progress with this.reportProgress()
    return {
      success: true,
      content: generatedContent,
      metadata: { }
    };
  }

  async validate(content) {
    return {
      valid: true,
      issues: {
        errors: [],
        warnings: []
      }
    };
  }
}
```

### 2. Create Tests

```javascript
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { MySkill } from './MySkill.js';

describe('MySkill', () => {
  it('should initialize', async () => {
    const skill = new MySkill();
    await skill.initialize({ apiKey: 'test-key' });
    assert.strictEqual(skill.initialized, true);
  });

  // More tests...
});
```

### 3. Document the Skill

Create a `MY-SKILL.md` file documenting:
- Purpose and capabilities
- Installation and setup
- Usage examples
- API reference
- Configuration options
- Troubleshooting

### 4. Register the Skill

Add the skill to the configuration system in `config/providers.json`.

## Testing

Run all skill tests:

```bash
npm test skills/*.test.js
```

Run specific skill tests:

```bash
node skills/GammaAISkill.test.js
```

## Error Handling

Skills should use the `SkillError` class for skill-specific errors:

```javascript
throw new SkillError(
  'Description of error',
  'ERROR_CODE',
  this.name,
  { additionalDetails: 'value' }
);
```

Common error codes:
- `NOT_INITIALIZED` - Skill not initialized
- `MISSING_API_KEY` - API key not provided
- `INVALID_PARAMETERS` - Invalid parameters
- `GENERATION_FAILED` - Content generation failed
- `VALIDATION_FAILED` - Content validation failed

## Progress Reporting

Skills can report progress for long-running operations:

```javascript
this.reportProgress('stage-name', 50, 'Processing...');
```

Progress events include:
- `skill` - Skill name
- `stage` - Current stage
- `progress` - Progress percentage (0-100)
- `message` - Progress message
- `timestamp` - ISO timestamp

## Fallback Support

Skills can specify fallback skills for error scenarios:

```javascript
await skill.initialize({
  apiKey: 'key',
  fallbackSkill: 'alternative-skill'
});
```

When errors occur, skills can attempt fallback:

```javascript
if (this.fallbackSkill && isRecoverable) {
  return {
    success: false,
    fallback: {
      attempted: true,
      skill: this.fallbackSkill,
      reason: 'rate_limited'
    }
  };
}
```

## Best Practices

1. **Initialization**
   - Validate all required options
   - Set `initialized = true` only when fully ready
   - Store API clients as instance variables

2. **Requirements Gathering**
   - Analyze context to provide intelligent defaults
   - Ask minimal questions
   - Provide clear reasoning for selections

3. **Content Generation**
   - Report progress regularly
   - Handle partial failures gracefully
   - Return consistent result structure

4. **Validation**
   - Check for required fields
   - Distinguish errors from warnings
   - Provide actionable error messages

5. **Error Handling**
   - Use appropriate error types
   - Include context in error details
   - Suggest fallback options when available

6. **Cleanup**
   - Always implement cleanup method
   - Release all resources
   - Call `super.cleanup()`

## Integration with CourseKit

Skills integrate with CourseKit's workflow:

```
CourseKit Workflow        Skill Integration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. constitution       →   Read course principles
2. specify            →   Extract learning outcomes
3. plan               →   Understand structure
4. tasks              →   Identify content needs
5. implement          →   Skills generate content
```

Skills receive context objects containing:
- `constitution` - Course principles and vision
- `specification` - Learning outcomes and audience
- `plan` - Module structure and timing
- `tasks` - Current task details

## Contributing

When contributing new skills:

1. Follow the `BaseContentSkill` interface
2. Include comprehensive tests
3. Document all public methods
4. Provide usage examples
5. Add to `config/providers.json`
6. Update this README

## License

Part of the CourseKit MCP Server project.
