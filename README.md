# CourseKit MCP Server

A Model Context Protocol (MCP) server implementing spec-driven development for course and workshop creation. Based on GitHub's Spec Kit philosophy, adapted for instructional design.

## Overview

CourseKit follows a five-phase workflow to systematically develop high-quality courses:

1. **Constitution** - Establish pedagogical principles and guidelines
2. **Specify** - Define learning outcomes and requirements  
3. **Plan** - Create course structure and instructional strategy
4. **Tasks** - Generate actionable content development tasks
5. **Implement** - Execute tasks to create course materials

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/coursekit-mcp.git
cd coursekit-mcp

# Install dependencies
npm install

# Start the server
npm start
```

## Configuration

Add to your Claude Desktop configuration (`claude_desktop_config.json`):

```json
{
  "mcp_servers": {
    "coursekit": {
      "command": "node",
      "args": ["/path/to/coursekit-mcp/index.js"],
      "env": {}
    }
  }
}
```

## Usage

### Complete Workflow Example

Here's how to develop a complete workshop using CourseKit:

#### 1. Create Constitution
Start by establishing your course development principles:

```
Use tool: coursekit.constitution

Input:
{
  "vision": "Create a 4-hour hands-on workshop teaching developers how to use AI coding assistants effectively. Focus on practical skills, real-world examples, and immediate applicability."
}
```

This generates a constitution document with:
- Vision statement
- Core pedagogical principles
- Target audience profile
- Instructional guidelines
- Content standards
- Constraints

#### 2. Specify Requirements
Define what the course needs to achieve:

```
Use tool: coursekit.specify

Input:
{
  "description": "AI Coding Assistants Workshop: A 4-hour hands-on workshop for senior developers who haven't used AI coding tools. Cover prompt engineering, code review with AI, debugging assistance, and best practices. Learners should leave able to immediately integrate AI assistants into their daily workflow."
}
```

Generates a specification with:
- Measurable learning outcomes
- Prerequisites
- Success criteria
- Scope definition
- Assessment strategy

#### 3. Plan Structure
Create the implementation plan:

```
Use tool: coursekit.plan

Input:
{
  "format": "workshop",
  "duration": "4 hours",
  "approach": "hands-on"
}
```

Produces a detailed plan with:
- Module breakdown with timings
- Learning objectives per module
- Activities and exercises
- Materials needed
- Facilitator notes

#### 4. Generate Tasks
Break down the work into manageable tasks:

```
Use tool: coursekit.tasks

Input:
{
  "granularity": "medium"
}
```

Creates a prioritized task list:
- Slide deck creation (Slidev format)
- Exercise design
- Facilitator guides
- Assessment materials
- Resource documentation

#### 5. Implement Tasks
Execute specific tasks to create content:

```
Use tool: coursekit.implement

Input:
{
  "task": "Create welcome slides for Module 1"
}
```

Generates ready-to-use content:
- Slidev markdown presentations
- Hands-on exercises with solutions
- Facilitator guides with timing
- Assessment materials

## Output Structure

CourseKit creates a `.coursekit` directory in your project with:

```
.coursekit/
├── constitution.md      # Governing principles
├── specification.md     # Learning outcomes and requirements
├── plan.md             # Course structure
├── tasks.md            # Development task list
└── implementations/    # Generated content
    ├── slides-module1.md
    ├── exercise-1.md
    ├── facilitator-notes.md
    └── ...
```

## Content Types

### Slidev Presentations
Generated slides include:
- Proper frontmatter configuration
- Multiple layout types (cover, two-cols, center)
- Speaker notes in comments
- Interactive elements
- Code examples with syntax highlighting

Example output:
```markdown
---
theme: default
layout: cover
---

# Workshop Title

Subtitle here

---
layout: two-cols
---

# Key Concept

::left::
## Theory
- Point 1
- Point 2

::right::
## Practice
\`\`\`javascript
// Code example
\`\`\`

<!--
Speaker notes: Emphasize the connection
-->
```

### Exercises
Structured learning activities with:
- Clear objectives
- Time requirements
- Step-by-step instructions
- Starter code
- Hidden solutions
- Debrief questions

### Facilitator Guides
Comprehensive teaching notes including:
- Detailed timeline
- Key talking points
- Common challenges and solutions
- Expected questions with answers
- Energy management techniques
- Materials checklist

## Integration with LLMs

While this thin slice returns example content, the prompts are designed for integration with any LLM API:

### OpenAI Integration
```javascript
import OpenAI from 'openai';

const openai = new OpenAI();

async function callLLM(prompt) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }]
  });
  return completion.choices[0].message.content;
}
```

### Anthropic Integration
```javascript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

async function callLLM(prompt) {
  const message = await anthropic.messages.create({
    model: "claude-3-opus-20240229",
    messages: [{ role: "user", content: prompt }]
  });
  return message.content[0].text;
}
```

## Extending CourseKit

### Adding New Content Types
1. Add the type to the task generation
2. Create a template in the implement phase
3. Add specific generation logic

### Custom Themes
Modify the Slidev theme configuration in generated presentations:
```javascript
theme: 'your-custom-theme'
```

### Version Control
All artifacts are markdown files, perfect for Git:
```bash
git init
git add .coursekit/
git commit -m "Initial course specification"
```

## Best Practices

1. **Iterate at each phase** - Review and refine before moving forward
2. **Keep constitution updated** - It guides everything else
3. **Be specific in specifications** - Vague goals lead to vague content
4. **Validate task completeness** - Ensure all learning outcomes are covered
5. **Test implementations** - Try exercises yourself before deployment

## Roadmap

- [ ] LLM API integration (OpenAI, Anthropic)
- [ ] Multiple output formats (PPTX, PDF, HTML)
- [ ] Template library system
- [ ] Validation and alignment checking
- [ ] Collaborative review features
- [ ] Assessment generation
- [ ] Learning analytics integration
- [ ] Export to LMS formats

## Contributing

Contributions welcome! Please follow the spec-driven approach:
1. Update the specification for new features
2. Plan the implementation
3. Break into tasks
4. Implement incrementally

## License

MIT

## Acknowledgments

Inspired by GitHub's Spec Kit and the principles of spec-driven development, adapted for the instructional design domain.
