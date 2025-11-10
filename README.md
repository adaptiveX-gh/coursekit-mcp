# CourseKit MCP Server

A Model Context Protocol (MCP) server implementing spec-driven development for course and workshop creation. Based on GitHub's Spec Kit philosophy, adapted for instructional design.

## Overview

CourseKit follows a systematic workflow to develop high-quality courses. The workflow includes an optional material ingestion phase followed by five core development phases:

### Optional: Material Ingestion (Pre-Development)

0. **Ingest** - Import existing materials (PDFs, markdown, transcripts, URLs)
1. **Themes** - Extract and cluster learning themes from materials
2. **Research** - Review and address knowledge gaps

### Core Development Workflow

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

### Material Ingestion Workflow

If you have existing course materials, you can ingest them before starting the core development workflow. This helps extract learning outcomes, identify themes, and discover research needs.

#### 1. Ingest Materials
Import existing course content from various sources:

```
Use tool: coursekit.ingest

Input:
{
  "pdf_paths": ["/path/to/syllabus.pdf", "/path/to/ICP-BAF-learning-outcomes.pdf"],
  "markdown_paths": ["/path/to/course-notes.md"],
  "text_paths": ["/path/to/lecture-transcript.txt"],
  "urls": ["https://example.com/course-outline"]
}
```

Returns:
- Extracted learning outcomes
- Key concepts and topics
- Content structure analysis
- Warnings about unclear or missing information

#### 2. Extract Themes
Cluster related learning concepts into coherent themes:

```
Use tool: coursekit.themes

Input:
{
  "source": "materials",
  "granularity": "medium"
}
```

Options:
- `source`: "materials" (from ingested content) or "both" (materials + constitution)
- `granularity`: "coarse" (broad themes), "medium" (balanced), "fine" (detailed)

Returns:
- Clustered themes with learning outcomes
- Alignment scores
- Recommended sequence

#### 3. Review Research Needs
After running `coursekit.plan`, review identified knowledge gaps:

```
Use tool: coursekit.research

Input:
{
  "filter": "high"
}
```

Options:
- `filter`: "all", "critical", "high", "medium", "low"

Returns:
- Research needs by priority
- Guidance for addressing gaps
- Suggested sources and approaches

### Complete Workflow Example

Here's how to develop a complete workshop using CourseKit. You can start with existing materials or from scratch.

#### Option A: Starting with Existing Materials

If you have existing course content, PDFs, or transcripts:

**Step 0: Ingest existing materials**
```
coursekit.ingest with paths to your PDFs, markdown files, transcripts, or URLs
```

**Step 1: Extract themes**
```
coursekit.themes to cluster learning outcomes into coherent themes
```

**Step 2-6: Continue with core workflow** (see Option B below)

After running `coursekit.plan`, use `coursekit.research` to review and address knowledge gaps.

#### Option B: Starting from Scratch

Here's how to develop a workshop from a vision:

**Step 1: Create Constitution**

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

**Step 2: Specify Requirements**

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

**Step 3: Plan Structure**

Create the implementation plan with validation and research gap identification:

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
- Validation scores (completeness, feasibility, alignment)
- Identified research needs with priorities

Note: After planning, use `coursekit.research` to review knowledge gaps and get guidance on addressing them.

**Step 4: Generate Tasks**

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

**Step 5: Implement Tasks**

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

## Available Tools

### Material Ingestion Tools

#### coursekit.ingest
Ingests existing course materials to extract learning outcomes and concepts.

**Parameters:**
- `pdf_paths` (array, optional): Paths to PDF files with learning outcomes or course descriptions
- `markdown_paths` (array, optional): Paths to markdown files with course content or notes
- `text_paths` (array, optional): Paths to text files (transcripts, notes)
- `urls` (array, optional): URLs to course websites or documentation

**Returns:**
```json
{
  "success": true,
  "analysis": {
    "synthesized": {
      "learningOutcomes": [...],
      "concepts": [...],
      "topics": [...]
    },
    "metadata": {
      "totalSources": 5,
      "errors": [],
      "warnings": [...]
    }
  },
  "summary": {
    "totalSources": 5,
    "learningOutcomes": 12,
    "concepts": 8,
    "topics": 4
  },
  "file": ".coursekit/materials.json"
}
```

**Use cases:**
- Analyzing existing course syllabi
- Extracting learning outcomes from certification PDFs
- Processing lecture transcripts
- Consolidating scattered course materials

#### coursekit.themes
Extracts and clusters learning themes from ingested materials.

**Parameters:**
- `source` (string, default: "materials"): Source for theme extraction
  - `"materials"`: Use only ingested materials
  - `"both"`: Combine materials with constitution
- `granularity` (string, default: "medium"): Level of theme detail
  - `"coarse"`: Broad, high-level themes (3-5 themes)
  - `"medium"`: Balanced clustering (5-8 themes)
  - `"fine"`: Detailed, specific themes (8-12 themes)

**Returns:**
```json
{
  "success": true,
  "themes": [
    {
      "name": "Theme Name",
      "description": "...",
      "learningOutcomes": [...],
      "concepts": [...],
      "alignmentScore": 0.85
    }
  ],
  "summary": {
    "themesGenerated": 6,
    "totalOutcomes": 12,
    "alignmentScore": 0.82
  },
  "file": ".coursekit/themes.json"
}
```

**Use cases:**
- Organizing scattered learning outcomes
- Finding natural content groupings
- Planning module structure
- Identifying curriculum coherence

#### coursekit.research
Reviews identified research needs and provides guidance for addressing knowledge gaps.

**Parameters:**
- `filter` (string, default: "all"): Filter research needs by priority
  - `"all"`: Show all research needs
  - `"critical"`: Only critical priority items
  - `"high"`: High priority and above
  - `"medium"`: Medium priority and above
  - `"low"`: All priorities including low

**Returns:**
```json
{
  "success": true,
  "researchNeeds": [
    {
      "id": "rn-001",
      "priority": "high",
      "type": "data",
      "description": "...",
      "guidance": "...",
      "module": "Module 1",
      "relatedOutcomes": [...]
    }
  ],
  "summary": {
    "total": 8,
    "critical": 2,
    "high": 3,
    "medium": 2,
    "low": 1
  }
}
```

**Use cases:**
- Reviewing knowledge gaps after planning
- Prioritizing research activities
- Getting guidance on addressing specific gaps
- Ensuring comprehensive course coverage

### Core Development Tools

#### coursekit.constitution
Establishes pedagogical principles and course development guidelines.

**Parameters:**
- `vision` (string, required): Vision statement for the course

**Returns:** Constitution document with principles, audience profile, and constraints

#### coursekit.specify
Defines learning outcomes and requirements based on course description.

**Parameters:**
- `description` (string, required): Detailed course description

**Returns:** Specification with measurable learning outcomes and success criteria

#### coursekit.plan
Creates course structure with validation and research gap identification.

**Parameters:**
- `format` (string, required): Course format (e.g., "workshop", "seminar", "online course")
- `duration` (string, required): Total duration (e.g., "4 hours", "3 days", "8 weeks")
- `approach` (string, required): Instructional approach (e.g., "hands-on", "lecture", "blended")

**Returns:** Detailed plan with modules, validation scores, and research needs

#### coursekit.tasks
Generates actionable, prioritized development tasks.

**Parameters:**
- `granularity` (string, required): Task detail level
  - `"coarse"`: High-level tasks
  - `"medium"`: Balanced breakdown
  - `"fine"`: Detailed task list

**Returns:** Prioritized task list mapped to learning objectives

#### coursekit.implement
Executes specific tasks to create course content.

**Parameters:**
- `task` (string, required): Description of the task to implement

**Returns:** Generated content (slides, exercises, facilitator guides, etc.)

## Output Structure

CourseKit creates a `.coursekit` directory in your project with:

```
.coursekit/
├── materials.json       # Ingested materials analysis (optional)
├── themes.json         # Extracted learning themes (optional)
├── research_needs.json # Identified knowledge gaps (optional)
├── constitution.md     # Governing principles
├── specification.md    # Learning outcomes and requirements
├── plan.md            # Course structure
├── tasks.md           # Development task list
└── implementations/   # Generated content
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

1. **Start with materials if available** - Use `coursekit.ingest` to leverage existing content before creating from scratch
2. **Extract themes early** - Run `coursekit.themes` after ingestion to understand natural content groupings
3. **Address research gaps** - Use `coursekit.research` after planning to identify and prioritize knowledge gaps
4. **Iterate at each phase** - Review and refine before moving forward
5. **Keep constitution updated** - It guides everything else
6. **Be specific in specifications** - Vague goals lead to vague content
7. **Validate task completeness** - Ensure all learning outcomes are covered
8. **Test implementations** - Try exercises yourself before deployment

### Material Ingestion Best Practices

- **Multiple sources are better** - Combine PDFs, transcripts, and web content for richer analysis
- **Use medium granularity first** - Start with medium granularity for themes, then adjust if needed
- **Review research needs early** - Check research gaps before diving into implementation
- **Iterate on themes** - Try different granularity levels to find the optimal clustering

## Roadmap

### Completed
- [x] Material ingestion (PDF, markdown, text, URLs)
- [x] Theme extraction and clustering
- [x] Validation and alignment checking
- [x] Research gap identification

### In Progress
- [ ] LLM API integration (OpenAI, Anthropic)
- [ ] Multiple output formats (PPTX, PDF, HTML)
- [ ] Template library system

### Planned
- [ ] Enhanced material ingestion (video transcripts, SCORM packages)
- [ ] Collaborative review features
- [ ] Assessment generation from learning outcomes
- [ ] Learning analytics integration
- [ ] Export to LMS formats (Canvas, Moodle, Blackboard)
- [ ] Automated content validation against standards
- [ ] Multi-language course development support

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
