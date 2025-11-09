# CourseKit MCP - LLM Development Prompts

Use these prompts with Claude, GPT-4, or other LLMs to develop and extend CourseKit.

## Initial Development

### Prompt 1: Create Base MCP Server
```
Create a Node.js MCP (Model Context Protocol) server called "coursekit-mcp" that implements spec-driven development for course creation.

The server should have 5 tools following this workflow:
1. coursekit.constitution - Create governing principles
2. coursekit.specify - Define learning outcomes  
3. coursekit.plan - Create course structure
4. coursekit.tasks - Generate task list
5. coursekit.implement - Execute tasks

Each tool should:
- Accept specific inputs (vision, description, format, etc.)
- Generate markdown output
- Save artifacts to a .coursekit directory
- Build on outputs from previous phases

Use the @modelcontextprotocol/server-node package.
Include proper error handling and logging.
```

### Prompt 2: Add LLM Integration
```
Modify the CourseKit MCP server to integrate with OpenAI and Anthropic APIs.

Requirements:
1. Add a callLLM function that supports both providers
2. Use environment variables for API keys
3. Include proper prompt engineering for each phase
4. Add retry logic for API failures
5. Cache responses to avoid duplicate API calls

The prompts should be instructional-design focused and generate high-quality educational content.
```

### Prompt 3: Add Slidev Support
```
Enhance the coursekit.implement tool to generate proper Slidev presentations.

Requirements:
1. Use correct Slidev frontmatter
2. Include multiple layout types (cover, two-cols, center, etc.)
3. Add speaker notes in HTML comments
4. Include code blocks with syntax highlighting
5. Use Slidev-specific features (v-click, animations)
6. Generate 8-12 slides per module

Example Slidev features to use:
- Grid layouts for comparisons
- Animated bullet points
- Code highlighting with line numbers
- Mermaid diagrams for processes
```

## Feature Extensions

### Add Assessment Generation
```
Extend CourseKit to generate assessments aligned with learning outcomes.

Add a new tool: coursekit.assess that creates:
1. Pre-assessments to gauge existing knowledge
2. Formative assessments for each module
3. Summative assessment for course completion
4. Self-assessment rubrics
5. Peer review templates

Assessments should:
- Map directly to specified learning outcomes
- Use varied question types (multiple choice, short answer, practical)
- Include answer keys and grading rubrics
- Follow Bloom's taxonomy levels
```

### Add Template System
```
Create a template system for CourseKit that allows:

1. Saving successful course structures as templates
2. Loading templates when starting new projects
3. Industry-specific templates (tech, healthcare, finance)
4. Format templates (workshop, course, training, webinar)
5. Customizing templates with variables

Structure:
- Store templates in .coursekit/templates/
- Use JSON for template metadata
- Allow partial template application
- Include example templates in the package
```

### Add Collaboration Features
```
Add collaboration capabilities to CourseKit:

1. Export/import course packages for sharing
2. Add commenting system on artifacts
3. Track changes between versions
4. Generate review checklists
5. Create stakeholder summary reports

Implementation:
- Use Git for version control
- Add metadata for authors and reviewers
- Create diff views for changes
- Generate executive summaries
```

## Output Format Extensions

### PowerPoint Export
```
Add PPTX export capability to CourseKit:

1. Convert Slidev markdown to PowerPoint
2. Preserve formatting and layouts
3. Include speaker notes
4. Add company branding/templates
5. Generate handout versions

Use the officegen or pptxgenjs library.
Map Slidev layouts to PowerPoint layouts.
Support custom themes.
```

### SCORM Package Generation
```
Create a SCORM export for Learning Management Systems:

1. Package course content as SCORM 1.2/2004
2. Include assessments with scoring
3. Track completion and time spent
4. Support resume functionality
5. Generate manifest files

Follow SCORM standards for compatibility.
Test with common LMS platforms.
```

### Interactive HTML Export
```
Generate interactive HTML courseware:

1. Convert course to single-page application
2. Include navigation and progress tracking
3. Embed exercises with live coding
4. Add video placeholders
5. Make mobile-responsive

Use modern web technologies (React/Vue).
Include offline capability with service workers.
Support keyboard navigation.
```

## Validation and Quality Checks

### Alignment Validator
```
Create a validation tool that checks:

1. All learning outcomes are addressed in plan
2. Each task contributes to an outcome
3. Time allocations are realistic
4. Prerequisites are covered
5. Assessment matches objectives

Generate a report with:
- Coverage matrix
- Gap analysis
- Time audit
- Recommendation for improvements
```

### Accessibility Checker
```
Add accessibility validation for generated content:

1. Check slide contrast ratios
2. Verify alt text for images
3. Ensure readable font sizes
4. Check for keyboard navigation
5. Validate screen reader compatibility

Follow WCAG 2.1 guidelines.
Generate accessibility report.
Suggest improvements.
```

## Integration Examples

### VS Code Extension
```
Create a VS Code extension for CourseKit:

1. Add CourseKit commands to command palette
2. Show course structure in sidebar
3. Preview Slidev presentations
4. Syntax highlighting for .coursekit files
5. IntelliSense for course elements

Package as .vsix extension.
Include snippets for common patterns.
Add keybindings for workflow navigation.
```

### GitHub Action
```
Create a GitHub Action for CourseKit:

1. Run on push to main branch
2. Generate course materials automatically
3. Validate changes against constitution
4. Create PR with generated content
5. Deploy to GitHub Pages

Use YAML workflow configuration.
Support custom triggers.
Include status badges.
```

### Web UI
```
Build a web interface for CourseKit:

1. Step-by-step wizard for each phase
2. Real-time preview of generated content
3. Drag-and-drop task reordering
4. Collaborative editing features
5. Export in multiple formats

Use React/Next.js for the frontend.
Connect to MCP server via WebSocket.
Include authentication and projects.
```

## Testing and Quality

### Test Suite
```
Create comprehensive tests for CourseKit:

1. Unit tests for each tool
2. Integration tests for full workflow
3. Content quality tests
4. Performance benchmarks
5. Error handling tests

Use Jest or Mocha for testing.
Include fixture data.
Test with multiple LLM providers.
Add CI/CD pipeline.
```

### Documentation Generator
```
Auto-generate documentation from CourseKit artifacts:

1. Create course catalog from specifications
2. Generate instructor guides from plans
3. Build learner handbooks from content
4. Create marketing materials from constitution
5. Generate reports for stakeholders

Use templates for each document type.
Include customization options.
Support multiple output formats.
```

## Best Practices Implementation

### Instructional Design Validator
```
Implement instructional design best practices:

1. Check for clear learning objectives (SMART)
2. Validate Bloom's taxonomy usage
3. Ensure varied instructional methods
4. Check for assessment alignment
5. Verify accessibility compliance

Reference frameworks:
- ADDIE model
- Backwards design
- Universal Design for Learning
- Kirkpatrick evaluation model
```

## Usage Notes

- These prompts are starting points - customize based on your needs
- Test generated code thoroughly before production use
- Consider rate limits when integrating LLM APIs
- Keep security in mind (API keys, user data)
- Version control all customizations

## Contributing

To contribute new prompt templates:
1. Test the prompt with at least 2 different LLMs
2. Include example outputs
3. Document any dependencies
4. Add error handling considerations
