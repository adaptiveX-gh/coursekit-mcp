# CourseKit Configuration System

Multi-source configuration management with security, provider selection, and user preferences.

## Quick Start

```javascript
import { config } from './config/ConfigurationManager.js';

// Initialize (loads all config sources)
await config.initialize();

// Get configuration values
const theme = config.get('providers.presentations.slidev.config.defaultTheme');

// Set user preferences
config.set('providers.presentations.preferredProvider', 'slidev');
await config.save();

// Get best provider for a task
const provider = config.getProvider('slides', {
  features: ['code-highlighting'],
  techLevel: 'advanced'
});
console.log(`Using: ${provider.name}`);
```

## Configuration Files

### System Files (Don't Modify)

- **`default.json`** - System defaults and core settings
- **`providers.json`** - Provider capabilities and configurations

### User Files (Safe to Modify)

- **`user-preferences.json`** - Your preferences (auto-created, safe to commit)
- **`.env`** - API keys and secrets (NEVER commit!)

## Configuration Precedence

Configuration is loaded from multiple sources with this precedence (highest to lowest):

1. **User Preferences** (highest) - `user-preferences.json`
2. **Environment Variables** - `.env` and `COURSEKIT_*` vars
3. **Provider Defaults** - `providers.json`
4. **System Defaults** (lowest) - `default.json`

## API Reference

### Core Methods

#### `initialize()`
Load all configuration sources. Call this first!

```javascript
await config.initialize();
```

#### `get(path, defaultValue)`
Get configuration value using dot notation.

```javascript
const value = config.get('providers.presentations.slidev.enabled', true);
const nested = config.get('system.name');
```

#### `set(path, value)`
Set user preference (updates merged config immediately).

```javascript
config.set('providers.presentations.preferredProvider', 'gamma');
config.set('defaults.quality', 'production');
```

#### `save()`
Persist user preferences to file.

```javascript
await config.save();
```

### Provider Selection

#### `getProvider(contentType, taskCharacteristics)`
Select best provider based on requirements.

```javascript
const provider = config.getProvider('slides', {
  features: ['code-highlighting', 'mermaid'],
  format: 'markdown',
  techLevel: 'advanced'
});

// Returns:
// {
//   name: 'slidev',
//   category: 'presentations',
//   config: { ... },
//   priority: 23,
//   capabilities: { ... }
// }
```

**Content Types:**
- `slides`, `presentation`
- `documentation`, `guides`, `exercises`
- `data`, `assessment`, `tracking`

**Task Characteristics:**
- `features` - Required features (array)
- `format` - Preferred format (string)
- `techLevel` - Technical level: `beginner`, `intermediate`, `advanced`

#### `getProviderConfig(providerName)`
Get configuration for a specific provider.

```javascript
const slidevConfig = config.getProviderConfig('slidev');
console.log(slidevConfig.capabilities.features);
```

#### `getAllProviders()`
Get all providers grouped by category.

```javascript
const providers = config.getAllProviders();
console.log(providers.presentations.slidev);
console.log(providers.documents.markdown);
```

### Security

#### `getAPIKey(providerName)`
Securely retrieve API key from environment. **Never logs the key!**

```javascript
const apiKey = config.getAPIKey('gamma');
// Reads from process.env.GAMMA_API_KEY
```

#### `sanitizePath(filePath)`
Prevent directory traversal attacks.

```javascript
try {
  const safe = config.sanitizePath('./config/file.json');
} catch (error) {
  console.error('Invalid path!');
}
```

#### `getSafeConfig()`
Get configuration with sensitive fields redacted.

```javascript
const safe = config.getSafeConfig();
console.log(safe); // API keys shown as ***REDACTED***
```

### Debugging

#### `exportConfig()`
Export all configuration layers for debugging.

```javascript
const debug = config.exportConfig();
console.log('System defaults:', debug.systemDefaults);
console.log('User prefs:', debug.userPreferences);
console.log('Merged:', debug.merged);
```

#### `validateConfig(config)`
Validate configuration structure.

```javascript
const result = config.validateConfig(myConfig);
if (!result.valid) {
  console.error('Errors:', result.errors);
}
```

## Environment Variables

Create a `.env` file in the project root:

```bash
# API Keys (required for specific providers)
GAMMA_API_KEY=your_gamma_api_key_here

# Optional CourseKit settings
COURSEKIT_LOG_LEVEL=info
COURSEKIT_PREFERRED_PRESENTATION_PROVIDER=slidev
```

**Supported Variables:**
- `GAMMA_API_KEY` - Gamma AI API key
- `COURSEKIT_*` - Any setting (automatically loaded)

## User Preferences

The `user-preferences.json` file stores your personal settings. It's safe to commit (contains no secrets).

Example:

```json
{
  "providers": {
    "presentations": {
      "preferredProvider": "slidev",
      "slidev": {
        "config": {
          "defaultTheme": "seriph"
        }
      }
    }
  },
  "defaults": {
    "quality": "production"
  }
}
```

## Providers

### Presentations

| Provider | Enabled | Features | API Key Required |
|----------|---------|----------|------------------|
| **slidev** | ✓ | Code highlighting, themes, Mermaid, Vue | No |
| **powerpoint** | ✓ | Templates, animations, charts | No |
| **gamma** | ✗ | AI design, auto-layout, responsive | Yes |

### Documents

| Provider | Enabled | Features | API Key Required |
|----------|---------|----------|------------------|
| **markdown** | ✓ | Simple, portable, Git-friendly | No |
| **docx** | ✓ | Styles, templates, TOC | No |
| **pdf** | ✓ | Professional, portable, print-ready | No |

### Spreadsheets

| Provider | Enabled | Features | API Key Required |
|----------|---------|----------|------------------|
| **xlsx** | ✓ | Formulas, charts, pivot tables | No |

## Provider Selection Logic

The system automatically selects the best provider based on:

1. **Enabled status** - Disabled providers are skipped
2. **Content type match** - Must support the requested type
3. **Feature match** - More matching features = higher score
4. **Format match** - Preferred format gets bonus points
5. **Tech level match** - Appropriate for audience level
6. **API key availability** - Providers requiring keys are skipped if key missing
7. **Priority score** - Ties broken by configured priority

## Security Features

### API Key Protection

- API keys stored only in environment variables
- Never logged or exposed in safe configs
- Validated before provider selection
- Redacted in error messages and exports

### Path Sanitization

- Prevents directory traversal (`../../../etc/passwd`)
- Blocks null bytes in paths
- Validates paths stay within project directory
- Safe for user-provided file paths

### Configuration Validation

- Schema validation for all configs
- Type checking on provider settings
- Required field validation
- Error messages for invalid configs

## Testing

Run the comprehensive test suite:

```bash
node config/ConfigurationManager.test.js
```

**Test Coverage:**
- Multi-source loading
- Configuration precedence
- Provider selection
- API key handling
- Path sanitization
- Security redaction
- Configuration persistence

All 20 tests pass! ✓

## Examples

### Example 1: Basic Usage

```javascript
import { config } from './config/ConfigurationManager.js';

await config.initialize();

// Get system info
console.log(config.get('system.name'));

// Set preference
config.set('providers.presentations.preferredProvider', 'slidev');
await config.save();
```

### Example 2: Provider Selection

```javascript
// Find best provider for technical slides with code
const provider = config.getProvider('slides', {
  features: ['code-highlighting', 'mermaid'],
  techLevel: 'advanced'
});

if (provider) {
  console.log(`Using ${provider.name}`);
  console.log(`Priority: ${provider.priority}`);
  console.log(`Config:`, provider.config);
}
```

### Example 3: Conditional Features

```javascript
// Enable Gamma if API key is available
const gammaKey = config.getAPIKey('gamma');

if (gammaKey) {
  config.set('providers.presentations.gamma.enabled', true);
  await config.save();
  console.log('Gamma AI enabled');
} else {
  console.log('Set GAMMA_API_KEY to enable AI features');
}
```

### Example 4: Custom Provider Config

```javascript
// Customize Slidev theme
config.set('providers.presentations.slidev.config.defaultTheme', 'seriph');
config.set('providers.presentations.slidev.config.lineNumbers', true);
await config.save();

// Apply to new presentations
const slidevConfig = config.getProviderConfig('slidev');
console.log('Theme:', slidevConfig.config.defaultTheme);
```

## Troubleshooting

### Configuration won't load

```javascript
// Check initialization
try {
  await config.initialize();
} catch (error) {
  console.error('Config error:', error.message);
  // Check file permissions on config/*.json
}
```

### API key not found

```bash
# Verify .env file exists
cat .env | grep GAMMA_API_KEY

# Or set in environment
export GAMMA_API_KEY=your_key_here
node your-script.js
```

### Provider not selected

```javascript
// Debug provider selection
const all = config.getAllProviders();
console.log('Available:', Object.keys(all.presentations));

const provider = config.getProvider('slides', {});
console.log('Selected:', provider?.name || 'NONE');

// Check if provider is enabled
const gamma = config.getProviderConfig('gamma');
console.log('Gamma enabled:', gamma?.enabled);
```

### Path errors

```javascript
// Use sanitizePath for user input
try {
  const safe = config.sanitizePath(userInput);
  // Use safe path
} catch (error) {
  console.error('Invalid path:', error.message);
}
```

## Best Practices

1. **Always initialize first**
   ```javascript
   await config.initialize();
   ```

2. **Save after changes**
   ```javascript
   config.set('key', 'value');
   await config.save(); // Persist to file
   ```

3. **Use dot notation**
   ```javascript
   config.get('providers.presentations.slidev.enabled')
   // Not: config.mergedConfig.providers.presentations.slidev.enabled
   ```

4. **Provide defaults**
   ```javascript
   const theme = config.get('missing.key', 'default-value');
   ```

5. **Never commit `.env`**
   - Use `.env.example` for documentation
   - Add `.env` to `.gitignore` (already done)

6. **Validate external configs**
   ```javascript
   const result = config.validateConfig(userConfig);
   if (!result.valid) {
     throw new Error(result.errors.join(', '));
   }
   ```

## License

Part of the CourseKit MCP Server project.
