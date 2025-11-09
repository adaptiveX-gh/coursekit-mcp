# CourseKit MCP Server

## Project Context

MCP server implementing spec-driven development for course and workshop creation. Based on GitHub's Spec Kit philosophy, adapted for instructional design. This server exposes tools for a five-phase workflow: constitution → specify → plan → tasks → implement.

**Tech Stack:** Node.js 18+, Model Context Protocol (MCP), filesystem-based storage

**Purpose:** Enable AI assistants to systematically develop high-quality educational content through structured, iterative workflows. Claude Code skills enhance the MCP tools by guiding users through effective input gathering.

## Project Structure

```
.coursekit/              # Generated course artifacts (not in repo)
├── constitution.md      # Pedagogical principles
├── specification.md     # Learning outcomes
├── plan.md             # Course structure
├── tasks.md            # Development tasks
└── implementations/    # Generated content

.claude/skills/          # Claude Code skills that enhance MCP tools
├── constitution-builder/  # Guides constitution creation
└── specification-refiner/ # Refines specifications

index.js                 # MCP server implementation
example-workflow.js      # Usage examples
test.js                  # Basic tests
```

## MCP Tools Available

1. `coursekit.constitution` - Establish course principles (takes vision)
2. `coursekit.specify` - Define learning outcomes (takes description)
3. `coursekit.plan` - Structure course modules (takes format, duration, approach)
4. `coursekit.tasks` - Generate development tasks (takes granularity)
5. `coursekit.implement` - Create content (takes task description)

Each tool reads context from previous phases in `.coursekit/` directory.

## Skills vs MCP Tools

**MCP Tools** provide the actual course generation functionality. They're thin-slice implementations that would integrate with LLM APIs in production.

**Claude Code Skills** enhance the user experience by:
- Asking clarifying questions before calling MCP tools
- Gathering better input through conversation
- Ensuring context-aware tool usage

When a user says "create a workshop," the constitution-builder skill guides them through problem definition, audience analysis, and goal setting before calling `coursekit.constitution`.

## Common Commands

```bash
npm start               # Start MCP server
npm test                # Run basic tests
node example-workflow.js   # See example usage
node interactive-test.js   # Interactive tool testing
```

## Working with Generated Content

All artifacts are markdown files stored in `.coursekit/`. Content includes Slidev presentations, exercises with solutions, and facilitator guides. Version control these files to track course evolution.

## Key Constraints

- Constitution guides all subsequent phases
- Each phase depends on previous phase output
- Specifications must have measurable learning outcomes
- Tasks should map to specific learning objectives
- Implementations use Slidev format for slides
