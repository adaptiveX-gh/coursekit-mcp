---
name: Building Course Presentations
description: Creates course presentations from learning outcomes, research, and video content. Use when developing educational materials that synthesize multiple sources into cohesive teaching materials.
---

## Overview

This skill guides you through building high-quality course presentations by systematically processing learning outcomes, video content, and research into structured educational materials. The workflow ensures quality at each stage through validation and progressive refinement.

**Use this skill when:**
- Creating course presentations from multiple sources
- Synthesizing learning outcomes into structured curriculum
- Integrating video content with formal learning objectives
- Building research-backed educational materials
- Converting raw educational content into presentation format

## Prerequisites

Before starting, ensure you have:
- **PDF with learning outcomes** - Document containing course objectives, competencies, or learning goals
- **YouTube video URL** (optional but recommended) - Related instructional content
- **Markdown presentation template** - Target output format
- **Target audience information** - Level, background, and learning context

## Workflow Stages

This skill follows a 5-stage workflow with validation gates between each stage. Each stage produces verifiable outputs that feed into the next stage.

### Stage 1: Extract Themes from Learning Outcomes

**Goal:** Identify and cluster core themes from learning outcomes document.

**Process:**
1. Run `scripts/extract_pdf_themes.py` on the learning outcomes PDF
2. Review extracted themes for completeness and clarity
3. Manually refine if needed

**Detailed Instructions:** See [workflow/stage1-extract-themes.md](workflow/stage1-extract-themes.md)

**Output:** `themes.json` - Structured list of thematic clusters with associated learning outcomes

**Validation:** Manual review - Are all major topics covered? Are themes appropriately clustered?

---

### Stage 2: Build Course Outline

**Goal:** Create a structured course outline organized around extracted themes.

**Process:**
1. Load `themes.json` from Stage 1
2. Organize themes into logical learning progression
3. Define modules, sections, and learning objectives
4. Create hierarchical course structure

**Detailed Instructions:** See [workflow/stage2-build-outline.md](workflow/stage2-build-outline.md)

**Output:** `course_outline.json` - Hierarchical course structure with modules, sections, and objectives

**Validation:**
- Run `scripts/validate_outline.py` to check structure and theme coverage
- Verify logical flow and appropriate module sizing

---

### Stage 3: Process Video & Create Content Brief

**Goal:** Extract insights from video content and create comprehensive content brief.

**Process:**
1. Run `scripts/fetch_youtube_transcript.py` to extract video transcript
2. Analyze transcript for key concepts, examples, and teaching approaches
3. Create detailed notes from video content
4. Build content brief combining video insights with course outline

**Detailed Instructions:** See [workflow/stage3-video-brief.md](workflow/stage3-video-brief.md)

**Output:**
- `raw_transcript.txt` - Video transcript
- `content_brief.json` - Comprehensive brief combining outline + video insights

**Validation:**
- Run `scripts/validate_brief.py` to ensure alignment with outline
- Check that video content is meaningfully integrated

---

### Stage 4: Conduct Targeted Research

**Goal:** Research topics from the brief to add depth, examples, and current information.

**Process:**
1. Identify research needs from content brief
2. Conduct targeted research on key topics
3. Evaluate source quality and credibility
4. Create structured research notes with citations

**Detailed Instructions:** See [workflow/stage4-research.md](workflow/stage4-research.md)

**Reference:** See [reference/research_guidelines.md](reference/research_guidelines.md) for quality standards

**Output:** `research_notes.json` - Structured research findings with citations and source metadata

**Validation:**
- Verify source quality meets guidelines
- Check citation completeness
- Ensure research addresses content brief needs

---

### Stage 5: Generate Final Presentation

**Goal:** Assemble all materials into formatted presentation using template.

**Process:**
1. Run `scripts/generate_presentation.py` with all previous outputs
2. Apply presentation template and formatting rules
3. Review generated presentation against quality checklist
4. Make final refinements

**Detailed Instructions:** See [workflow/stage5-generate-presentation.md](workflow/stage5-generate-presentation.md)

**Reference:** See [reference/presentation_design.md](reference/presentation_design.md) for quality standards

**Output:** `final_presentation.md` - Complete formatted presentation ready for delivery

**Final Review:** Check against quality checklist in presentation_design.md

---

## Quality Gates

**Do not proceed to the next stage until:**
- ✓ Output file is generated and properly formatted
- ✓ Validation passes (if automated script available)
- ✓ Human review confirms quality and completeness
- ✓ Any issues identified are resolved

This staged approach with validation gates ensures errors are caught early, before significant work is invested in later stages.

## Progressive Disclosure

This skill uses progressive disclosure to keep context focused:

- **SKILL.md** (this file) provides high-level workflow overview
- **workflow/** files contain detailed stage-specific instructions
- **reference/** files provide deep dives on specific topics
- **templates/** provide structure examples
- **examples/** show concrete outputs

Load only what you need for the current stage to minimize token usage while maintaining access to comprehensive guidance.

## File Organization

```
course-presentation-builder/
├── SKILL.md                    # This file - workflow overview
├── workflow/                   # Stage-specific instructions
│   ├── stage1-extract-themes.md
│   ├── stage2-build-outline.md
│   ├── stage3-video-brief.md
│   ├── stage4-research.md
│   └── stage5-generate-presentation.md
├── templates/                  # Output format templates
│   ├── outline_template.json
│   ├── brief_template.json
│   └── presentation_template.md
├── scripts/                    # Utility scripts
│   ├── extract_pdf_themes.py
│   ├── fetch_youtube_transcript.py
│   ├── validate_outline.py
│   ├── validate_brief.py
│   └── generate_presentation.py
├── reference/                  # Deep-dive documentation
│   ├── theme_extraction_guide.md
│   ├── outline_best_practices.md
│   ├── research_guidelines.md
│   └── presentation_design.md
└── examples/                   # Sample outputs
    ├── example_themes.json
    ├── example_outline.json
    ├── example_brief.json
    ├── example_research.json
    └── example_presentation.md
```

## Templates & Reference Materials

**Templates** (for output structure):
- `templates/outline_template.json` - Course outline structure
- `templates/brief_template.json` - Content brief format
- `templates/presentation_template.md` - Presentation format

**Reference** (for deep dives):
- `reference/theme_extraction_guide.md` - Theme identification patterns
- `reference/outline_best_practices.md` - Educational design principles
- `reference/research_guidelines.md` - Research quality standards
- `reference/presentation_design.md` - Presentation quality criteria

**Examples** (for concrete guidance):
- `examples/` directory - Sample outputs from each stage

## Troubleshooting

**PDF extraction fails:**
- Check PDF format and text extractability
- See `reference/theme_extraction_guide.md` for manual extraction process
- Verify PDF contains actual learning outcomes (not just course description)

**Outline validation errors:**
- Review `reference/outline_best_practices.md` for structure requirements
- Check that all themes from Stage 1 are covered
- Verify learning objectives follow proper format

**Research quality concerns:**
- Consult `reference/research_guidelines.md` for source quality criteria
- Balance academic and practical sources
- Ensure proper citations and fact-checking

**Presentation formatting issues:**
- Review `reference/presentation_design.md` for formatting standards
- Check template compatibility
- Verify markdown syntax correctness

## Getting Started

To begin using this skill:

1. **Prepare your inputs** - Gather learning outcomes PDF, video URL, and target audience info
2. **Start with Stage 1** - Read `workflow/stage1-extract-themes.md` and extract themes
3. **Follow the workflow** - Complete each stage in order, validating before proceeding
4. **Reference as needed** - Load reference materials only when you need deep dives
5. **Use examples** - Check `examples/` directory for output format guidance

## Workflow Execution Tips

- **Stay focused:** Load only the current stage workflow file
- **Validate early:** Run validation scripts immediately after stage completion
- **Document decisions:** Note any deviations or decisions in your working files
- **Iterate if needed:** It's okay to return to previous stages if validation reveals issues
- **Ask for clarification:** Request human review at validation gates when uncertain

---

Ready to start? Begin with **Stage 1** by reading [workflow/stage1-extract-themes.md](workflow/stage1-extract-themes.md).
