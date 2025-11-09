# Gamma AI Provider for CourseKit

Professional presentation generation using Gamma AI's API, integrated with CourseKit's course development workflow.

## Overview

The Gamma AI provider enables automatic conversion of CourseKit course content (constitution, specification, plan, implementations) into polished Gamma AI presentations.

**Features:**
- ✅ Automatic content conversion (CourseKit → Gamma format)
- ✅ Comprehensive error handling with retry logic
- ✅ Rate limit management and tracking
- ✅ Exponential backoff for failed requests
- ✅ Content validation before submission
- ✅ Support for multiple export formats (PDF, PPTX, HTML)
- ✅ Speaker notes from facilitator guides
- ✅ Learning outcome mapping to slides

## Installation

### Prerequisites

- Node.js 18+
- Gamma AI API key ([Get yours here](https://gamma.app/settings/api))

### Setup

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Configure API key**:
   ```bash
   cp .env.template .env
   # Edit .env and add your Gamma API key
   GAMMA_API_KEY=your_gamma_api_key_here
   ```

3. **Enable Gamma provider** in `config/user-preferences.json`:
   ```json
   {
     "providers": {
       "presentations": {
         "preferredProvider": "gamma",
         "gamma": {
           "enabled": true,
           "config": {
             "style": "professional",
             "maxSlides": 50
           }
         }
       }
     }
   }
   ```

## Quick Start

### Basic Usage

```javascript
import { GammaAPIClient } from './providers/gamma/GammaAPIClient.js';
import { GammaContentConverter } from './providers/gamma/GammaContentConverter.js';

// 1. Initialize client
const client = new GammaAPIClient(process.env.GAMMA_API_KEY, {
  timeout: 60000,
  maxRetries: 3,
  logging: true
});

// 2. Convert CourseKit content
const converter = new GammaContentConverter();
const presentation = await converter.convertCourse('./.coursekit', {
  maxSlides: 50,
  style: 'professional'
});

// 3. Generate presentation with Gamma AI
const gammaRequest = converter.toGammaAPIFormat(presentation);
const result = await client.createPresentation({
  title: presentation.title,
  prompt: `Create a presentation based on this course structure`,
  context: gammaRequest
});

// 4. Wait for completion
const completed = await client.waitForCompletion(result.id);

// 5. Export to desired format
const pdfBlob = await client.exportPresentation(completed.id, 'pdf');
```

### Complete Example

```javascript
import { GammaAPIClient } from './providers/gamma/GammaAPIClient.js';
import { GammaContentConverter } from './providers/gamma/GammaContentConverter.js';
import fs from 'fs/promises';

async function generateCoursePresentation() {
  try {
    // Initialize
    const client = new GammaAPIClient(process.env.GAMMA_API_KEY);
    const converter = new GammaContentConverter({
      includeNotes: true,
      includeExercises: true
    });

    // Convert CourseKit course
    console.log('Converting course content...');
    const presentation = await converter.convertCourse('./.coursekit');

    // Validate before sending
    const validation = converter.validate(presentation);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.issues.errors.join(', ')}`);
    }

    // Generate with Gamma AI
    console.log('Creating Gamma presentation...');
    const gammaFormat = converter.toGammaAPIFormat(presentation);
    const result = await client.createPresentation({
      title: presentation.title,
      prompt: `Generate a ${presentation.slides.length}-slide presentation`,
      context: gammaFormat,
      options: {
        style: 'professional',
        maxSlides: 50
      }
    });

    console.log(`Presentation created: ${result.id}`);

    // Wait for generation
    console.log('Waiting for completion...');
    const completed = await client.waitForCompletion(result.id, 300000, 2000);

    console.log('Presentation ready!');
    console.log(`View at: ${completed.url}`);

    // Export to PDF
    console.log('Exporting to PDF...');
    const pdf = await client.exportPresentation(completed.id, 'pdf');
    await fs.writeFile('./course-presentation.pdf', Buffer.from(await pdf.arrayBuffer()));

    console.log('✅ Course presentation generated successfully!');

    return completed;

  } catch (error) {
    console.error('Error generating presentation:', error.message);
    throw error;
  }
}

// Run
generateCoursePresentation();
```

## API Reference

### GammaAPIClient

Client for interacting with Gamma AI API.

#### Constructor

```javascript
new GammaAPIClient(apiKey, options)
```

**Parameters:**
- `apiKey` (string, required) - Gamma API key
- `options` (object, optional):
  - `baseUrl` (string) - API base URL (default: `https://api.gamma.app/v1`)
  - `timeout` (number) - Request timeout in ms (default: `60000`)
  - `maxRetries` (number) - Max retry attempts (default: `3`)
  - `logging` (boolean) - Enable request logging (default: `false`)

**Example:**
```javascript
const client = new GammaAPIClient('gamma_abc123', {
  timeout: 30000,
  maxRetries: 5,
  logging: true
});
```

#### Methods

##### createPresentation(params)

Create a new Gamma presentation.

```javascript
const result = await client.createPresentation({
  title: 'My Presentation',
  prompt: 'Create slides about business agility',
  context: { /* additional context */ },
  options: { style: 'professional', maxSlides: 50 }
});
```

**Returns:** `Promise<Object>` - Presentation object with `id`, `status`, etc.

##### getPresentation(presentationId)

Get presentation details by ID.

```javascript
const presentation = await client.getPresentation('pres_abc123');
```

**Returns:** `Promise<Object>` - Presentation details

##### waitForCompletion(presentationId, maxWaitTime, pollInterval)

Wait for presentation generation to complete.

```javascript
const completed = await client.waitForCompletion('pres_abc123', 300000, 2000);
```

**Parameters:**
- `presentationId` (string) - Presentation ID
- `maxWaitTime` (number) - Max wait time in ms (default: `300000` = 5 min)
- `pollInterval` (number) - Poll interval in ms (default: `2000`)

**Returns:** `Promise<Object>` - Completed presentation

##### exportPresentation(presentationId, format)

Export presentation to specified format.

```javascript
const pdf = await client.exportPresentation('pres_abc123', 'pdf');
```

**Parameters:**
- `presentationId` (string) - Presentation ID
- `format` (string) - Export format: `'pdf'`, `'pptx'`, or `'html'`

**Returns:** `Promise<Blob>` - Exported content

##### listTemplates(filters)

List available Gamma templates.

```javascript
const templates = await client.listTemplates({ category: 'business' });
```

**Returns:** `Promise<Array>` - List of templates

##### deletePresentation(presentationId)

Delete a presentation.

```javascript
await client.deletePresentation('pres_abc123');
```

**Returns:** `Promise<Object>` - Deletion confirmation

##### getRateLimitStatus()

Get current rate limit status.

```javascript
const status = client.getRateLimitStatus();
console.log(`Remaining: ${status.remaining}, Resets in: ${status.resetIn}s`);
```

**Returns:** `Object` - Rate limit info with `remaining`, `resetAt`, `resetIn`

---

### GammaContentConverter

Converts CourseKit content to Gamma presentation format.

#### Constructor

```javascript
new GammaContentConverter(options)
```

**Parameters:**
- `options` (object, optional):
  - `includeNotes` (boolean) - Include facilitator notes as speaker notes (default: `true`)
  - `includeExercises` (boolean) - Include exercises as slides (default: `true`)
  - `slideTransition` (string) - Default slide transition (default: `'slide-left'`)

#### Methods

##### convertCourse(coursekitPath, options)

Convert entire CourseKit course to Gamma format.

```javascript
const presentation = await converter.convertCourse('./.coursekit', {
  maxSlides: 50,
  style: 'professional'
});
```

**Parameters:**
- `coursekitPath` (string) - Path to `.coursekit` directory
- `options` (object, optional):
  - `maxSlides` (number) - Maximum number of slides
  - `style` (string) - Gamma presentation style

**Returns:** `Promise<Object>` - Presentation structure

##### toGammaAPIFormat(presentation)

Convert presentation to Gamma API request format.

```javascript
const apiFormat = converter.toGammaAPIFormat(presentation);
```

**Returns:** `Object` - API-ready presentation structure

##### validate(presentation)

Validate presentation structure.

```javascript
const validation = converter.validate(presentation);
if (!validation.valid) {
  console.error('Errors:', validation.issues.errors);
  console.warn('Warnings:', validation.issues.warnings);
}
```

**Returns:** `Object` - Validation result with `valid`, `issues`

---

### Error Types

All errors extend `GammaAPIError` and include:
- `name` - Error type name
- `message` - Error description
- `code` - Error code
- `statusCode` - HTTP status code (if applicable)
- `details` - Additional error details
- `timestamp` - Error timestamp

**Available Error Types:**
- `GammaAPIError` - Base error class
- `GammaAuthenticationError` - Authentication failures (401, 403)
- `GammaRateLimitError` - Rate limit exceeded (429)
- `GammaNotFoundError` - Resource not found (404)
- `GammaValidationError` - Invalid parameters (400)
- `GammaServerError` - Server errors (500, 502, 503, 504)
- `GammaNetworkError` - Network failures
- `GammaTimeoutError` - Request timeouts
- `GammaConversionError` - Content conversion errors
- `GammaExportError` - Export failures
- `GammaQuotaError` - Quota exceeded

**Example Error Handling:**
```javascript
import {
  GammaAPIError,
  GammaRateLimitError,
  GammaAuthenticationError
} from './GammaErrors.js';

try {
  await client.createPresentation({ title: 'Test', prompt: 'Test' });
} catch (error) {
  if (error instanceof GammaRateLimitError) {
    console.log(`Rate limited. Retry after ${error.retryAfter} seconds`);
  } else if (error instanceof GammaAuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof GammaAPIError) {
    console.error(`API error: ${error.code} - ${error.message}`);
  } else {
    throw error;
  }
}
```

## Configuration

### Provider Configuration

Edit `config/providers.json` to customize Gamma provider settings:

```json
{
  "presentations": {
    "gamma": {
      "enabled": false,
      "priority": 10,
      "api": {
        "baseUrl": "https://api.gamma.app/v1",
        "rateLimit": {
          "requestsPerMinute": 20,
          "requestsPerHour": 500,
          "requestsPerDay": 5000
        },
        "timeout": 60000
      },
      "capabilities": {
        "contentTypes": ["slides", "presentations"],
        "formats": ["gamma"],
        "features": ["ai-generation", "templates", "themes", "export"],
        "outputFormats": ["pdf", "pptx", "html", "gamma"]
      },
      "config": {
        "model": "gamma-v1",
        "style": "professional",
        "autoDesign": true,
        "maxSlides": 50
      },
      "fallback": {
        "onError": "slidev",
        "onRateLimit": "powerpoint",
        "onTimeout": "slidev"
      }
    }
  }
}
```

### User Preferences

Customize in `config/user-preferences.json`:

```json
{
  "providers": {
    "presentations": {
      "preferredProvider": "gamma",
      "gamma": {
        "enabled": true,
        "config": {
          "style": "creative",
          "maxSlides": 100,
          "autoDesign": true
        }
      }
    }
  }
}
```

## Rate Limits

**Free Tier Limits:**
- 20 requests per minute
- 500 requests per hour
- 5,000 requests per day

The client automatically:
- Tracks rate limit status
- Retries with exponential backoff when rate limited
- Falls back to alternative providers if configured

**Monitoring Rate Limits:**
```javascript
const status = client.getRateLimitStatus();
console.log(`Remaining: ${status.remaining}`);
console.log(`Resets at: ${status.resetAt}`);
console.log(`Resets in: ${status.resetIn} seconds`);
```

## Testing

Run tests:
```bash
npm test providers/gamma/GammaClient.test.js
```

**Test Coverage:**
- ✅ 43 tests covering all functionality
- ✅ Error handling and edge cases
- ✅ Content conversion and validation
- ✅ API client methods
- ✅ Rate limiting and retries

## Troubleshooting

### Common Issues

**1. Authentication Error**
```
GammaAuthenticationError: Invalid API key
```
**Solution:** Verify `GAMMA_API_KEY` in `.env` is correct

**2. Rate Limit Exceeded**
```
GammaRateLimitError: Rate limit exceeded
```
**Solution:** Wait for rate limit to reset, or reduce request frequency

**3. Timeout Error**
```
GammaTimeoutError: Operation 'createPresentation' timed out
```
**Solution:** Increase timeout in client options:
```javascript
const client = new GammaAPIClient(apiKey, { timeout: 120000 });
```

**4. Validation Error**
```
GammaValidationError: Title is required
```
**Solution:** Ensure all required parameters are provided

### Debug Mode

Enable logging to see detailed request/response information:

```javascript
const client = new GammaAPIClient(apiKey, { logging: true });
```

**Note:** Logging may expose sensitive data in development. Never enable in production.

## Security Best Practices

1. **Never commit `.env` files** - Always in `.gitignore`
2. **Rotate API keys regularly** - Every 90 days recommended
3. **Use different keys per environment** - Dev, staging, production
4. **Monitor API usage** - Track request counts and costs
5. **Implement rate limiting** - Respect API limits
6. **Validate all inputs** - Before sending to API
7. **Sanitize logs** - Remove sensitive data from logs

## Integration with CourseKit

The Gamma provider integrates seamlessly with CourseKit's workflow:

```
CourseKit Workflow:
1. constitution → Define course principles
2. specify → Set learning outcomes
3. plan → Structure modules
4. tasks → Generate development tasks
5. implement → Create content

↓ Gamma Provider

6. Convert to Gamma format
7. Generate AI presentation
8. Export to PDF/PPTX
```

**Full Integration Example:**
```javascript
// After completing CourseKit workflow...
import { GammaAPIClient } from './providers/gamma/GammaAPIClient.js';
import { GammaContentConverter } from './providers/gamma/GammaContentConverter.js';

const client = new GammaAPIClient(process.env.GAMMA_API_KEY);
const converter = new GammaContentConverter();

// Convert course to presentation
const presentation = await converter.convertCourse('./.coursekit');

// Generate with Gamma AI
const result = await client.createPresentation({
  title: presentation.title,
  prompt: 'Create professional presentation',
  context: converter.toGammaAPIFormat(presentation)
});

// Wait and export
const completed = await client.waitForCompletion(result.id);
const pdf = await client.exportPresentation(completed.id, 'pdf');
```

## Contributing

See the main CourseKit contributing guidelines.

## License

Part of the CourseKit MCP Server project.

## Support

- **Issues:** [GitHub Issues](https://github.com/anthropics/coursekit-mcp/issues)
- **Gamma AI Docs:** [Gamma API Documentation](https://gamma.app/docs/api)
- **CourseKit Docs:** See main `README.md`
