# CourseKit MCP Server

## Project Context

MCP server implementing spec-driven development for course and workshop creation. Based on GitHub's Spec Kit philosophy, adapted for instructional design. This server exposes tools for a five-phase workflow: constitution → specify → plan → tasks → implement.

**Tech Stack:** Node.js 18+, Model Context Protocol (MCP), filesystem-based storage

**Purpose:** Enable AI assistants to systematically develop high-quality educational content through structured, iterative workflows. Claude Code skills enhance the MCP tools by guiding users through effective input gathering and content generation.

## Project Structure

```
.coursekit/                    # Generated course artifacts (not in repo)
├── constitution.md            # Pedagogical principles
├── specification.md           # Learning outcomes
├── plan.md                   # Course structure
├── tasks.md                  # Development tasks
└── implementations/          # Generated content

.claude/skills/               # Claude Code skills that enhance MCP tools
├── constitution-builder/     # Guides constitution creation
│   └── scripts/             # Skill-specific utility scripts
├── specification-refiner/    # Refines specifications
│   └── scripts/
├── plan-optimizer/           # Optimizes course timing & energy flow
│   └── scripts/
├── task-generator/           # Creates prioritized task lists
│   └── scripts/
├── implementation-coach/     # Routes to specialized content skills
│   └── scripts/
├── brand-guidelines/         # Maintains brand consistency
│   └── scripts/
├── skill-creator/            # Helps create new skills
│   └── scripts/
├── content-skills/          # Specialized presentation content
│   ├── slidev-skill/       # Markdown presentations
│   │   └── scripts/
│   └── powerpoint-skill/   # PowerPoint presentations
│       └── scripts/
├── document-skills/         # Specialized document generation
│   ├── docx/               # Word documents
│   │   ├── scripts/
│   │   └── ooxml/         # OOXML helpers
│   ├── pptx/               # PowerPoint files
│   │   ├── scripts/
│   │   └── ooxml/
│   ├── pdf/                # PDF generation
│   │   └── scripts/
│   └── xlsx/               # Excel spreadsheets
│       └── scripts/
├── .docs/                   # 📚 Documentation & implementation summaries
│   ├── INDEX.md            # Master documentation index
│   ├── README.md           # Documentation guide
│   ├── CLAUDE-IMPLEMENTATION-PROMPTS.md  # All implementation prompts
│   ├── implementation-summaries/  # Phase-by-phase implementation docs
│   │   ├── PROMPT-1.1-ConfigurationManager.md
│   │   ├── PROMPT-1.2-ConfigurationFiles.md
│   │   ├── PROMPT-2.1-GammaAPIClient.md
│   │   ├── PROMPT-2.2-GammaAISkill.md
│   │   ├── PROMPT-3.1-ImplementationCoach.md
│   │   ├── PROMPT-3.2-ProviderRegistry.md
│   │   ├── PROMPT-4.1-IntegrationTests.md
│   │   └── PROMPT-4.1-Deliverables.md
│   ├── tests/              # Test scripts
│   ├── workflows/          # Example workflows
│   ├── mcp-settings/       # Configuration examples
│   └── roadmap/            # Development roadmap
└── SKILL-TEMPLATE.md        # Template for new skills

registry/                    # Provider registry and base classes (not Claude Code skills)
├── BaseContentSkill.js      # Abstract base for content providers
├── GammaAISkill.js         # Gamma AI presentation provider
├── GammaAISkill.test.js
├── ImplementationCoachSkill.js  # Provider routing and selection
├── ImplementationCoachSkill.test.js
├── ProviderRegistry.js     # Provider management system
├── ProviderRegistry.test.js
└── README.md

index.js                     # MCP server implementation
setup.sh                     # Environment setup script
README.md                    # Project overview
```

## MCP Tools Available

1. `coursekit.constitution` - Establish course principles (takes vision)
2. `coursekit.specify` - Define learning outcomes (takes description)
3. `coursekit.plan` - Structure course modules (takes format, duration, approach)
4. `coursekit.tasks` - Generate development tasks (takes granularity)
5. `coursekit.implement` - Create content (takes task description)

Each tool reads context from previous phases in `.coursekit/` directory.

## Architecture Overview

### MCP Tools
Provide the actual course generation functionality. Thin-slice implementations that integrate with LLM APIs.

### Claude Code Skills (`.claude/skills/`)
Enhance user experience by asking clarifying questions and gathering better context before calling MCP tools.

### Provider Registry (`registry/`)
**Important distinction**: The `registry/` directory contains provider implementations and management code (BaseContentSkill, GammaAISkill, ImplementationCoachSkill, ProviderRegistry), NOT Claude Code skills.

- **BaseContentSkill.js** - Abstract base class for all content providers
- **GammaAISkill.js** - Gamma AI API integration for presentations
- **ImplementationCoachSkill.js** - Provider selection and routing
- **ProviderRegistry.js** - Provider lifecycle management

These are JavaScript classes that implement content generation, while Claude Code skills (in `.claude/skills/`) are markdown-based conversation guides.

### Workflow Skills (1:1 with MCP Tools)

1. **constitution-builder** - Guides users through a structured interview process to develop comprehensive course constitutions
   - Explores vision, audience, learning outcomes, pedagogical approach, and constraints
   - Synthesizes responses into enriched vision statements
   - Calls `coursekit.constitution`

2. **specification-refiner** - Ensures learning outcomes are specific, measurable, and aligned with Bloom's taxonomy
   - Validates prerequisites and success criteria
   - Creates detailed audience profiles
   - Calls `coursekit.specify`

3. **plan-optimizer** - Creates realistic course plans with proper pacing and energy management
   - Manages energy curves and activity balance
   - Optimizes module sequencing and timing
   - Calls `coursekit.plan`

4. **task-generator** - Produces prioritized, dependency-mapped task lists with accurate time estimates
   - Assesses development resources and velocity
   - Creates sprint-based work breakdown
   - Calls `coursekit.tasks`

5. **implementation-coach** - Routes content creation to specialized format-specific skills
   - Identifies content type and format requirements
   - Delegates to specialized content skills
   - Ensures quality and consistency
   - Calls `coursekit.implement`

### Content Skills (Called by Implementation Coach)

**Presentation Skills:**
- **slidev-skill** - Generates Slidev markdown presentations with layouts, themes, and code highlighting
- **powerpoint-skill** - Creates professional PowerPoint presentations with templates and animations

**Document Skills:**
- **docx** - Generates Word documents with styles, templates, and OOXML manipulation
- **pptx** - Creates PowerPoint files with advanced OOXML features
- **pdf** - Produces PDF documents from various sources
- **xlsx** - Generates Excel spreadsheets with formulas and formatting

### Utility Skills

- **brand-guidelines** - Ensures brand consistency across all generated content
- **skill-creator** - Helps developers create new CourseKit skills following best practices

### Example Flow

When a user says "create a workshop," the constitution-builder skill guides them through problem definition, audience analysis, goal setting, pedagogical approach, and constraints before calling `coursekit.constitution` with an enriched vision statement.

## Documentation

**📖 Start here**: [.claude/skills/.docs/INDEX.md](.claude/skills/.docs/INDEX.md)

The documentation index provides:
- Links to all implementation summaries
- Architecture overview
- Test coverage statistics
- Component documentation
- Quick reference commands

Implementation summaries are organized in `.claude/skills/.docs/implementation-summaries/` and include:
- Phase 1: Configuration System (Prompts 1.1, 1.2)
- Phase 2: Gamma AI Integration (Prompts 2.1, 2.2)
- Phase 3: Provider Management (Prompts 3.1, 3.2)
- Phase 4: Testing & Validation (Prompt 4.1)

## Common Commands

```bash
# MCP Server
npm start                                    # Start MCP server
node index.js                                # Start server directly

# Testing
npm test                                     # Run all tests
npm run test:integration                     # Run integration tests
node .claude/skills/.docs/tests/test.js             # Basic MCP tests
node .claude/skills/.docs/tests/interactive-test.js # Interactive tool testing

# Examples
node .claude/skills/.docs/workflows/example-workflow.js  # See full workflow

# Setup
bash setup.sh                                # Initial environment setup
```

## Working with Generated Content

All artifacts are markdown files stored in `.coursekit/`. Content includes Slidev presentations, exercises with solutions, and facilitator guides. Version control these files to track course evolution.

## Skill Development Guidelines

### Scripts Directory Convention

Each skill should maintain its utility scripts in a `scripts/` subdirectory:

```
.claude/skills/
├── my-skill/
│   ├── SKILL.md              # Skill documentation
│   └── scripts/              # Skill-specific scripts
│       ├── helper.js         # Helper utilities
│       ├── generator.js      # Content generators
│       └── validator.js      # Validation scripts
```

**Why this structure?**
- Keeps skill directories organized
- Prevents root directory clutter
- Makes skill dependencies explicit
- Enables easy skill packaging and sharing

### Creating New Skills

1. Copy `.claude/skills/SKILL-TEMPLATE.md` to your new skill directory
2. Create a `scripts/` subdirectory for any utilities
3. Document the skill's purpose, information gathering flow, and MCP tool integration
4. Register the skill in this CLAUDE.md file

## Key Constraints

- Constitution guides all subsequent phases
- Each phase depends on previous phase output
- Specifications must have measurable learning outcomes
- Tasks should map to specific learning objectives
- Implementations use Slidev format for slides by default
- Skills can generate format-specific content (PPTX, DOCX, etc.) via content skills
