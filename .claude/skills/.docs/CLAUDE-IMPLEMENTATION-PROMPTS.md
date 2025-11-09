# Claude Implementation Prompts for Gamma AI Integration

## Phase 1: Configuration System

### Prompt 1.1: Create Configuration Manager
```
Create a ConfigurationManager class for the CourseKit system that handles multi-source configuration with proper precedence and security.

Context: We have a CourseKit MCP server with skills for course development. We need to add support for multiple content providers (Gamma AI, Slidev, PowerPoint) with user-configurable preferences.

Requirements:
1. Load configuration from multiple sources in this precedence order:
   - User preferences (highest priority)
   - Environment variables
   - Provider defaults
   - System defaults (lowest priority)

2. File structure to support:
   coursekit/
   ├── .env (git-ignored)
   ├── config/
   │   ├── default.json
   │   ├── providers.json
   │   └── user-preferences.json

3. Core methods needed:
   - constructor(): Load all config sources
   - get(path): Get config value using dot notation (e.g., "providers.presentations.gamma.enabled")
   - set(path, value): Update user preferences
   - getProvider(contentType, taskCharacteristics): Select best provider
   - getProviderConfig(providerName): Get provider-specific config
   - getAPIKey(provider): Securely retrieve API key from environment
   - save(): Persist user preferences to file

4. Security requirements:
   - Never log or expose API keys
   - Validate configuration schema
   - Sanitize file paths
   - Handle missing config files gracefully

5. Provider selection logic:
   - Check if provider is enabled
   - Match task requirements with provider capabilities
   - Consider user preferences
   - Return ranked list of suitable providers

Include comprehensive error handling and JSDoc comments.
```

### Prompt 1.2: Create Configuration Files
```
Create the configuration file templates for the CourseKit Gamma AI integration.

Create these JSON configuration files:

1. config/default.json - System defaults
2. config/providers.json - Provider capabilities and settings
3. config/user-preferences.json.template - User preference template
4. .env.template - Environment variable template

Requirements:

default.json should include:
- Default content providers for each type
- Fallback options
- Timeout settings
- Retry policies

providers.json should define:
- Each provider's capabilities (gamma, slidev, powerpoint)
- API endpoints
- Rate limits
- Supported export formats
- Selection rules based on task characteristics

user-preferences.json.template should show:
- How users can override defaults
- Provider-specific settings
- Preference persistence

.env.template should include:
- All required API keys with descriptions
- Security notes
- Example format

Make the configuration extensible for future providers.
```

## Phase 2: Gamma AI Skill Implementation

### Prompt 2.1: Create Gamma AI Client
```
Create a GammaAPIClient class that interfaces with the Gamma AI API for presentation generation.

API Documentation: https://developers.gamma.app/docs/

Requirements:

1. Authentication:
   - Bearer token authentication using API key from environment
   - Refresh token handling if required
   - Secure header management

2. Core API methods:
   async createPresentation({ title, prompt, context, options })
   async getPresentation(presentationId)
   async waitForCompletion(presentationId, maxWaitTime)
   async exportPresentation(presentationId, format)
   async listTemplates()
   async deletePresentation(presentationId)

3. Request handling:
   - Proper error handling for all API calls
   - Exponential backoff for rate limits (429 responses)
   - Retry logic with jitter for network failures
   - Request/response logging (without sensitive data)
   - Timeout handling

4. Content conversion:
   - Convert CourseKit module structure to Gamma format
   - Map learning objectives to slide recommendations
   - Include speaker notes from facilitator guides
   - Handle code blocks appropriately
   - Process images and diagrams

5. Response processing:
   - Parse Gamma presentation format
   - Extract slide content and metadata
   - Handle pagination if needed
   - Stream large exports

Include comprehensive error types and promise-based interface.
```

### Prompt 2.2: Create Gamma AI Skill
```
Create a GammaAISkill class that extends BaseContentSkill to generate presentations using Gamma AI.

Context: This skill is called by the Implementation Coach when the user selects Gamma AI for presentation generation.

Requirements:

1. Class structure:
   - Extends BaseContentSkill
   - Uses GammaAPIClient for API communication
   - Implements required methods: gatherRequirements(), generateContent(), validate()

2. gatherRequirements(task, context) should ask:
   - Presentation style (professional, creative, minimal)
   - Target length (auto, specific slide count)
   - Include images? (AI-generated, stock, none)
   - Export format needed (view-only, PPTX, PDF)
   - Theme preferences

3. generateContent(requirements) should:
   - Build an effective prompt from course context
   - Call Gamma AI with appropriate parameters
   - Monitor generation progress
   - Handle partial failures gracefully
   - Return generated content with metadata

4. Prompt engineering:
   - Extract key information from constitution, specification, and plan
   - Structure prompt for best Gamma results
   - Include relevant context without overwhelming
   - Specify desired output structure

5. Theme and style selection:
   - Map audience type to appropriate themes
   - Consider technical vs business content
   - Account for branding requirements
   - Respect accessibility needs

6. Error handling:
   - API failures (fallback to local generation?)
   - Timeout scenarios
   - Invalid content responses
   - Export failures

Include progress callbacks for long-running operations.
```

## Phase 3: Implementation Coach Enhancement

### Prompt 3.1: Enhance Implementation Coach
```
Modify the existing ImplementationCoachSkill class to support multiple content providers with dynamic selection.

Current state: Implementation Coach routes to different skills based on content type.
Goal: Add provider selection based on configuration and task characteristics.

Modifications needed:

1. Constructor changes:
   - Initialize ConfigurationManager
   - Load available provider skills dynamically
   - Set up provider registry

2. New method: selectProvider(contentType, task, context)
   - Check user preferences
   - Evaluate task characteristics
   - Match with provider capabilities
   - Handle "ask me" preference
   - Return selected provider or provider list

3. Enhanced route(task, context) method:
   OLD: Directly route to skill based on content type
   NEW: 
   - Identify content type
   - Select appropriate provider
   - Initialize provider with config
   - Execute with fallback support
   - Track usage metrics

4. New method: executeWithFallback(provider, task, context)
   - Try primary provider
   - On failure, select fallback
   - Log failure reason
   - Retry with fallback provider
   - Report which provider was used

5. Provider initialization:
   - Pass API keys securely
   - Configure provider-specific settings
   - Set up progress handlers
   - Initialize connection pools

6. User interaction for provider selection:
   - When to ask vs auto-select
   - How to present options
   - Remember user choices
   - Quick comparison display

Maintain backward compatibility with existing skills.
```

### Prompt 3.2: Create Provider Registry
```
Create a ProviderRegistry class that manages all available content providers for CourseKit.

Requirements:

1. Provider registration:
   - registerProvider(name, skill, config)
   - Support lazy loading of providers
   - Validate provider implements required interface
   - Check for capability conflicts

2. Provider discovery:
   - Auto-discover providers in content-skills directory
   - Load provider metadata
   - Check system requirements
   - Verify API keys if needed

3. Capability matching:
   - getProvidersForType(contentType)
   - matchProviderCapabilities(requirements)
   - rankProviders(task, context)
   - filterByAvailability()

4. Provider lifecycle:
   - Initialize providers on demand
   - Cache initialized instances
   - Clean up resources
   - Handle provider updates

5. Monitoring and metrics:
   - Track provider usage
   - Success/failure rates
   - Performance metrics
   - User preferences

6. Provider interface validation:
   Every provider must implement:
   - initialize(config)
   - gatherRequirements(task, context)
   - generateContent(requirements)
   - validate(content)
   - export(content, format)
   - getCapabilities()
   - estimateTime(task)
   - estimateCost(task)

Include provider health checks and status reporting.
```

## Phase 4: Testing and Validation

### Prompt 4.1: Create Integration Tests
```
Create comprehensive integration tests for the Gamma AI integration with CourseKit.

Test file: test/gamma-integration.test.js

Test suites needed:

1. Configuration Manager Tests:
   - Test configuration loading from all sources
   - Test precedence order
   - Test get/set operations
   - Test provider selection logic
   - Test API key security
   - Test missing file handling

2. Gamma API Client Tests:
   - Mock Gamma AI API responses
   - Test successful presentation creation
   - Test error handling (401, 429, 500)
   - Test retry logic
   - Test timeout handling
   - Test export functionality

3. Gamma AI Skill Tests:
   - Test requirement gathering
   - Test prompt generation
   - Test content generation with mock API
   - Test fallback behavior
   - Test progress reporting

4. Implementation Coach Tests:
   - Test provider selection
   - Test routing to Gamma skill
   - Test fallback to alternative providers
   - Test configuration integration
   - Test user preference persistence

5. End-to-End Tests:
   - Complete flow: Task → Implementation Coach → Gamma → Content
   - Test with real-like course context
   - Test provider switching mid-flow
   - Test error recovery

Include:
- Test fixtures for all data types
- Mock implementations for external services
- Performance benchmarks
- Memory leak detection
```

### Prompt 4.2: Create Provider Comparison Tool
```
Create a ProviderComparisonTool that helps users choose the best content provider for their task.

Requirements:

1. Task analysis:
   - analyzeTask(task, context): Extract task characteristics
   - Identify: content type, complexity, code presence, visual needs
   - Estimate: slide count, generation time, quality requirements

2. Provider comparison:
   - compareProviders(task, availableProviders)
   - Create comparison matrix with:
     * Capabilities match score
     * Estimated time
     * Cost (if applicable)
     * Quality indicators
     * User preference alignment

3. Recommendation engine:
   - recommendProvider(comparisonMatrix, userPreferences)
   - Weight factors based on user priorities
   - Provide confidence score
   - Explain recommendation reasoning

4. Interactive selection:
   - presentComparison(matrix): Format for display
   - askUserChoice(options): Interactive provider selection
   - rememberChoice(choice, task): Update preferences

5. Output format:
   ```
   Task: Create Module 1 Python Basics Slides
   
   Recommended: Gamma AI (85% match)
   - ✅ AI-powered generation (2 min)
   - ✅ Professional themes
   - ✅ Code syntax support
   - ⚠️ Requires API key
   
   Alternatives:
   2. Slidev (70% match) - Better for code-heavy content
   3. PowerPoint (60% match) - More control, slower
   ```

Include methods for A/B testing different providers and tracking outcomes.
```

## Phase 5: Documentation and Deployment

### Prompt 5.1: Create Setup Guide
```
Create a comprehensive setup guide for adding Gamma AI to an existing CourseKit installation.

File: SETUP-GAMMA-AI.md

Sections needed:

1. Prerequisites:
   - CourseKit MCP server installed
   - Node.js version requirements
   - Gamma AI account and API key

2. Installation Steps:
   - Installing dependencies
   - Setting up configuration files
   - Adding environment variables
   - Testing the connection

3. Configuration Guide:
   - Choosing between providers
   - Setting defaults
   - Customizing Gamma settings
   - Fallback configuration

4. Usage Examples:
   - Creating first Gamma presentation
   - Comparing with Slidev output
   - Switching providers mid-task
   - Handling API limits

5. Troubleshooting:
   - Common errors and solutions
   - API key issues
   - Network problems
   - Fallback scenarios

6. Best Practices:
   - When to use Gamma vs alternatives
   - Prompt optimization tips
   - Cost management
   - Performance optimization

Include code examples and screenshots where helpful.
```

### Prompt 5.2: Create Migration Script
```
Create a migration script that adds Gamma AI support to existing CourseKit installations.

File: scripts/add-gamma-provider.js

Requirements:

1. Check current installation:
   - Verify CourseKit version compatibility
   - Check existing configuration
   - Backup current settings

2. Add Gamma AI files:
   - Create config files if missing
   - Add Gamma provider to providers.json
   - Update user-preferences template
   - Add .env template entries

3. Install dependencies:
   - Add required npm packages
   - Update package.json
   - Run installation

4. Configuration wizard:
   - Ask if user has Gamma API key
   - Help configure provider preferences
   - Set up fallback options
   - Test API connection

5. Validation:
   - Test configuration loading
   - Verify provider registration
   - Run simple generation test
   - Report success/issues

6. Rollback capability:
   - Save rollback point
   - Provide rollback command
   - Restore on failure

Make it idempotent - safe to run multiple times.
```

## Usage Instructions for These Prompts

1. **Start with Configuration** (Prompts 1.1-1.2)
   - This is the foundation everything else builds on
   - Test configuration loading before proceeding

2. **Implement Gamma AI Client** (Prompts 2.1-2.2)
   - Build the API client first
   - Test with actual Gamma API
   - Then build the skill wrapper

3. **Enhance Implementation Coach** (Prompts 3.1-3.2)
   - Modify existing code carefully
   - Maintain backward compatibility
   - Test with both old and new providers

4. **Add Tests** (Prompts 4.1-4.2)
   - Write tests as you implement
   - Use TDD where possible
   - Ensure comprehensive coverage

5. **Document and Deploy** (Prompts 5.1-5.2)
   - Create documentation alongside code
   - Test migration script thoroughly
   - Provide clear examples

## Tips for Claude Coding Sessions

- Provide one prompt at a time for focused implementation
- Share existing code context when asking for modifications
- Test each component before moving to the next
- Ask for explanations of architectural decisions
- Request error handling and edge cases explicitly