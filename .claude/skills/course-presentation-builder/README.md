# Course Presentation Builder

A comprehensive Claude skill for building high-quality course presentations from learning outcomes, research, and video content.

## Overview

This skill implements a systematic, 5-stage workflow for creating educational presentations that synthesize multiple sources into cohesive teaching materials. It follows best practices for agent skills including progressive disclosure, feedback loops, and clear validation gates.

## Quick Start

1. **Read the main skill file**: Start with `SKILL.md` to understand the workflow
2. **Prepare your inputs**: Gather a PDF with learning outcomes and optionally a YouTube video URL
3. **Follow the stages**: Work through stages 1-5, validating at each gate
4. **Generate presentation**: End with a complete, research-backed presentation

## File Structure

```
course-presentation-builder/
├── SKILL.md                      # Main entry point - start here!
├── README.md                     # This file
│
├── inputs/                       # User-provided source materials
│   ├── learning-outcomes.pdf     # Learning outcomes document
│   ├── transcript-tac.txt        # Team Alignment Canvas transcript
│   └── transcript-fsprint.txt    # Foundations Sprint transcript
│
├── outputs/                      # Agent-generated artifacts
│   ├── themes/                   # Stage 1: Extracted themes
│   │   └── themes.json
│   ├── outline/                  # Stage 2: Course structure
│   │   └── course_outline.json
│   ├── notes/                    # Stage 3: Video analysis
│   │   ├── module2_team_alignment_video_notes.json
│   │   └── module3_foundations_sprint_video_notes.json
│   ├── briefs/                   # Stage 3: Content briefs
│   │   ├── module2_content_brief.json
│   │   └── module3_content_brief.json
│   └── content/                  # Stage 5: Final presentations
│       ├── module2_culture_team_alignment_presentation.md
│       └── module3_vision_strategy_presentation.md
│
├── workflow/                     # Detailed stage instructions
│   ├── stage1-extract-themes.md
│   ├── stage2-build-outline.md
│   ├── stage3-video-brief.md
│   ├── stage4-research.md
│   └── stage5-generate-presentation.md
│
├── scripts/                      # Python utility scripts
│   ├── extract_pdf_themes.py
│   ├── fetch_youtube_transcript.py
│   ├── validate_outline.py
│   ├── validate_brief.py
│   └── generate_presentation.py
│
├── templates/                    # Output format templates
│   ├── outline_template.json
│   ├── brief_template.json
│   └── presentation_template.md
│
├── reference/                    # Deep-dive documentation
│   ├── theme_extraction_guide.md
│   ├── outline_best_practices.md
│   ├── research_guidelines.md
│   └── presentation_design.md
│
└── examples/                     # Sample outputs
    ├── example_themes.json
    ├── example_outline.json
    ├── example_brief.json
    ├── example_research.json
    └── example_presentation.md
```

## The 5-Stage Workflow

### Stage 1: Extract Themes
Extract and cluster learning outcomes from a PDF into thematic groups.

**Input:** `inputs/learning-outcomes.pdf`
**Output:** `outputs/themes/themes.json`
**Script:** `scripts/extract_pdf_themes.py`

### Stage 2: Build Outline
Transform themes into a pedagogically sound course outline with clear structure.

**Input:** `outputs/themes/themes.json`, target audience info
**Output:** `outputs/outline/course_outline.json`
**Validation:** `scripts/validate_outline.py`

### Stage 3: Create Content Brief
Extract video insights and synthesize with outline to create comprehensive brief.

**Input:** `outputs/outline/course_outline.json`, `inputs/transcript-*.txt`
**Output:** `outputs/briefs/module*_content_brief.json`, `outputs/notes/module*_video_notes.json`
**Scripts:** `scripts/fetch_youtube_transcript.py`, `scripts/validate_brief.py`

### Stage 4: Conduct Research
Research specific gaps and needs identified in the brief.

**Input:** `outputs/briefs/module*_content_brief.json`
**Output:** `outputs/research/research_notes.json`
**Reference:** `reference/research_guidelines.md`

### Stage 5: Generate Presentation
Synthesize all materials into formatted presentation.

**Input:** All previous outputs from `outputs/` folder
**Output:** `outputs/content/module*_presentation.md`
**Script:** `scripts/generate_presentation.py`

## Key Features

### Progressive Disclosure
- Main SKILL.md stays concise (~100 lines)
- Detailed instructions in separate workflow files
- Reference materials for deep dives only when needed
- Claude loads only what's relevant for current stage

### Validation Gates
Each stage includes validation to catch errors early:
- Stage 1: Manual review of extracted themes
- Stage 2: `validate_outline.py` checks structure
- Stage 3: `validate_brief.py` ensures alignment
- Stage 4: Quality checks for sources
- Stage 5: Final presentation review

### Utility Scripts
Scripts handle deterministic tasks that shouldn't vary:
- PDF extraction and theme clustering
- YouTube transcript retrieval
- Automated validation checks
- Template-based generation

### Structured Outputs
All intermediate outputs use structured JSON:
- Enables validation scripts
- Provides clear examples
- Makes data flow explicit between stages

## Installation

### Python Dependencies

Install required packages for utility scripts:

```bash
pip install PyPDF2 nltk scikit-learn youtube-transcript-api
```

### Optional Tools

For presentation rendering:
```bash
npm install -g reveal-md  # For reveal.js presentations
npm install -g @marp-team/marp-cli  # For Marp presentations
```

## Usage with Claude

When asking Claude to build a presentation using this skill:

1. **Reference the skill**: "Using the course-presentation-builder skill..."
2. **Claude reads SKILL.md**: Understands high-level workflow
3. **Stage-by-stage execution**: Claude loads only relevant workflow file for current stage
4. **Progressive refinement**: Each stage produces validated output feeding the next
5. **Final presentation**: Complete, research-backed presentation ready for delivery

## Best Practices

### For Creators
- Start with clear learning outcomes in your PDF
- Provide high-quality video content when possible
- Allow time for validation at each stage
- Don't skip validation gates
- Review and refine outputs before proceeding

### For Claude
- Load only the workflow file for the current stage
- Run validation scripts after each stage
- Reference templates and examples for structure
- Use reference docs for deep dives when needed
- Document any deviations or decisions made

## Examples

See the `examples/` directory for complete sample outputs from each stage:

- **example_themes.json**: Theme extraction from web development course
- **example_outline.json**: Complete course outline structure
- **example_brief.json**: Content brief with video integration
- **example_research.json**: Research findings with sources
- **example_presentation.md**: Excerpt from final presentation

## Reference Documentation

Deep-dive guides in `reference/` directory:

- **theme_extraction_guide.md**: Patterns for identifying and clustering learning outcomes
- **outline_best_practices.md**: Educational design principles and course structure
- **research_guidelines.md**: Source evaluation and research quality standards
- **presentation_design.md**: Slide design, typography, accessibility, and engagement

## Contributing

This skill is designed to be extended and customized:

- Add new workflow stages for your specific needs
- Create additional validation scripts
- Develop custom templates for different presentation formats
- Add domain-specific reference materials

## Design Rationale

This skill structure follows Claude agent best practices:

1. **Progressive Disclosure**: Information provided just-in-time when needed
2. **Validation Gates**: Catch errors early before investing in later stages
3. **Utility Scripts**: Deterministic tasks automated, creative tasks left to Claude
4. **Domain Organization**: Files organized by stage for focused context
5. **Clear Naming**: Descriptive names that communicate purpose
6. **Template Pattern**: Structured outputs enable validation and consistency
7. **Verifiable Outputs**: Checkpoints at each stage allow error detection

## License

This skill is provided as educational material. Adapt and extend for your needs.

## Support

For issues or questions:
1. Check the relevant workflow or reference documentation
2. Review examples for similar scenarios
3. Consult SKILL.md for high-level guidance

## Version

Current Version: 1.0
Last Updated: October 19, 2025

---

**Ready to start?** Read `SKILL.md` and begin with Stage 1!
