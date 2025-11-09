# Constitution Builder Scripts

This directory contains utility scripts for the constitution-builder skill.

## Purpose

Scripts here support the constitution-builder skill by:
- Automating repetitive tasks
- Providing helper functions
- Generating artifacts
- Validating input

## Adding Scripts

When creating new scripts:
1. Use descriptive names (e.g., `validate-vision.js`, `generate-constitution.js`)
2. Include JSDoc comments
3. Export functions for reuse
4. Add tests if complex logic is involved

## Example Structure

```
scripts/
├── README.md              # This file
├── helpers/
│   └── prompt-templates.js
├── validators/
│   └── vision-validator.js
└── generators/
    └── constitution-generator.js
```
