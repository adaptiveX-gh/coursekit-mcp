#!/usr/bin/env python3
"""
Validate course outline structure and completeness.

This script checks that a course outline JSON file:
- Has valid structure
- Covers all themes from themes.json
- Has well-formed learning objectives
- Has reasonable time estimates
- Meets quality criteria

Usage:
    python validate_outline.py course_outline.json themes.json
"""

import argparse
import json
import re
from pathlib import Path
from typing import Dict, List, Tuple


class OutlineValidator:
    """Validate course outline against structure and content requirements."""

    def __init__(self, outline_path: str, themes_path: str = None):
        self.outline_path = Path(outline_path)
        self.themes_path = Path(themes_path) if themes_path else None
        self.outline = None
        self.themes = None
        self.errors = []
        self.warnings = []

    def load_files(self):
        """Load JSON files."""
        print(f"Loading outline: {self.outline_path}")
        try:
            with open(self.outline_path, 'r', encoding='utf-8') as f:
                self.outline = json.load(f)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON in outline file: {e}")
        except Exception as e:
            raise ValueError(f"Error loading outline: {e}")

        if self.themes_path:
            print(f"Loading themes: {self.themes_path}")
            try:
                with open(self.themes_path, 'r', encoding='utf-8') as f:
                    self.themes = json.load(f)
            except json.JSONDecodeError as e:
                raise ValueError(f"Invalid JSON in themes file: {e}")
            except Exception as e:
                raise ValueError(f"Error loading themes: {e}")

    def validate(self) -> Tuple[bool, List[str], List[str]]:
        """
        Run all validation checks.

        Returns:
            (is_valid, errors, warnings)
        """
        print("\nRunning validation checks...")

        self.load_files()

        # Structure validation
        self._check_required_fields()
        self._check_module_structure()
        self._check_section_structure()

        # Content validation
        self._check_learning_objectives()
        self._check_time_estimates()

        # Theme coverage (if themes provided)
        if self.themes:
            self._check_theme_coverage()

        # Quality checks
        self._check_quality_criteria()

        is_valid = len(self.errors) == 0

        return is_valid, self.errors, self.warnings

    def _check_required_fields(self):
        """Check that all required top-level fields exist."""
        required_fields = ['course_metadata', 'modules']

        for field in required_fields:
            if field not in self.outline:
                self.errors.append(f"Missing required field: {field}")

        if 'course_metadata' in self.outline:
            metadata = self.outline['course_metadata']
            required_metadata = ['title', 'target_audience', 'duration']

            for field in required_metadata:
                if field not in metadata:
                    self.errors.append(f"Missing required metadata field: {field}")

    def _check_module_structure(self):
        """Validate module structure."""
        if 'modules' not in self.outline:
            return

        modules = self.outline['modules']

        if not isinstance(modules, list):
            self.errors.append("'modules' must be a list")
            return

        if len(modules) == 0:
            self.errors.append("Outline must have at least one module")
            return

        # Check each module
        for i, module in enumerate(modules):
            module_num = module.get('module_number', i + 1)
            prefix = f"Module {module_num}"

            # Required fields
            required = ['module_title', 'module_description', 'sections']
            for field in required:
                if field not in module:
                    self.errors.append(f"{prefix}: Missing required field '{field}'")

            # Check module number sequence
            if module.get('module_number') != i + 1:
                self.warnings.append(
                    f"{prefix}: Module number should be {i + 1}, got {module.get('module_number')}"
                )

            # Check sections exist
            if 'sections' not in module or not module['sections']:
                self.errors.append(f"{prefix}: Must have at least one section")

    def _check_section_structure(self):
        """Validate section structure within modules."""
        if 'modules' not in self.outline:
            return

        for module in self.outline['modules']:
            module_num = module.get('module_number', '?')

            if 'sections' not in module:
                continue

            sections = module['sections']

            if not isinstance(sections, list):
                self.errors.append(f"Module {module_num}: 'sections' must be a list")
                continue

            for j, section in enumerate(sections):
                section_num = section.get('section_number', j + 1)
                prefix = f"Module {module_num}, Section {section_num}"

                # Required fields
                required = ['section_title', 'learning_objectives']
                for field in required:
                    if field not in section:
                        self.errors.append(f"{prefix}: Missing required field '{field}'")

                # Check section number sequence
                if section.get('section_number') != j + 1:
                    self.warnings.append(
                        f"{prefix}: Section number should be {j + 1}, "
                        f"got {section.get('section_number')}"
                    )

    def _check_learning_objectives(self):
        """Validate learning objectives format and quality."""
        if 'modules' not in self.outline:
            return

        # Common action verbs from Bloom's taxonomy
        bloom_verbs = [
            'analyze', 'apply', 'assess', 'build', 'calculate', 'categorize',
            'classify', 'compare', 'compose', 'construct', 'contrast', 'create',
            'critique', 'define', 'demonstrate', 'describe', 'design', 'determine',
            'develop', 'differentiate', 'discuss', 'distinguish', 'evaluate',
            'examine', 'explain', 'formulate', 'identify', 'illustrate',
            'implement', 'integrate', 'interpret', 'justify', 'list', 'organize',
            'perform', 'plan', 'predict', 'prepare', 'produce', 'prove',
            'recognize', 'recommend', 'relate', 'review', 'select', 'solve',
            'summarize', 'synthesize', 'use', 'utilize', 'validate', 'verify'
        ]

        # Vague verbs to avoid
        vague_verbs = ['understand', 'know', 'learn', 'appreciate', 'become familiar with']

        for module in self.outline['modules']:
            module_num = module.get('module_number', '?')

            if 'sections' not in module:
                continue

            for section in module['sections']:
                section_num = section.get('section_number', '?')
                prefix = f"Module {module_num}, Section {section_num}"

                if 'learning_objectives' not in section:
                    continue

                objectives = section['learning_objectives']

                if not isinstance(objectives, list):
                    self.errors.append(f"{prefix}: learning_objectives must be a list")
                    continue

                if len(objectives) == 0:
                    self.warnings.append(f"{prefix}: No learning objectives specified")

                # Check each objective
                for obj_idx, objective in enumerate(objectives, 1):
                    if not isinstance(objective, str):
                        self.errors.append(
                            f"{prefix}, Objective {obj_idx}: Must be a string"
                        )
                        continue

                    if len(objective) < 10:
                        self.warnings.append(
                            f"{prefix}, Objective {obj_idx}: Very short objective (< 10 chars)"
                        )

                    # Check for action verb
                    first_word = objective.split()[0].lower().strip('.,;:!?')
                    has_bloom_verb = any(verb in objective.lower() for verb in bloom_verbs)
                    has_vague_verb = any(verb in objective.lower() for verb in vague_verbs)

                    if not has_bloom_verb:
                        self.warnings.append(
                            f"{prefix}, Objective {obj_idx}: "
                            f"Consider using Bloom's taxonomy action verb. "
                            f"Starts with: '{first_word}'"
                        )

                    if has_vague_verb:
                        self.warnings.append(
                            f"{prefix}, Objective {obj_idx}: "
                            f"Contains vague verb (understand/know/learn). "
                            f"Be more specific about what learners will do."
                        )

    def _check_time_estimates(self):
        """Check that time estimates are present and reasonable."""
        if 'modules' not in self.outline:
            return

        total_hours = 0

        for module in self.outline['modules']:
            module_num = module.get('module_number', '?')
            prefix = f"Module {module_num}"

            # Check module-level estimate
            if 'estimated_hours' in module:
                module_hours = module['estimated_hours']
                if not isinstance(module_hours, (int, float)):
                    self.errors.append(f"{prefix}: estimated_hours must be a number")
                elif module_hours <= 0:
                    self.errors.append(f"{prefix}: estimated_hours must be positive")
                elif module_hours > 100:
                    self.warnings.append(f"{prefix}: Very large time estimate ({module_hours} hours)")
                else:
                    total_hours += module_hours
            else:
                self.warnings.append(f"{prefix}: No time estimate provided")

            # Check section-level estimates
            if 'sections' in module:
                for section in module['sections']:
                    section_num = section.get('section_number', '?')
                    if 'estimated_time' in section:
                        est_time = section['estimated_time']
                        if isinstance(est_time, str):
                            # Try to extract hours from string like "2 hours" or "90 minutes"
                            hours_match = re.search(r'(\d+(?:\.\d+)?)\s*hours?', est_time)
                            mins_match = re.search(r'(\d+)\s*min', est_time)

                            if not hours_match and not mins_match:
                                self.warnings.append(
                                    f"{prefix}, Section {section_num}: "
                                    f"Time estimate format unclear: '{est_time}'"
                                )

        # Check total duration
        if total_hours > 0:
            print(f"  Total course time: {total_hours} hours")

            if total_hours < 2:
                self.warnings.append(f"Total course time seems very short: {total_hours} hours")
            elif total_hours > 200:
                self.warnings.append(f"Total course time seems very long: {total_hours} hours")

    def _check_theme_coverage(self):
        """Check that all themes from themes.json are covered in outline."""
        if not self.themes or 'themes' not in self.themes:
            return

        print("  Checking theme coverage...")

        theme_names = {theme['theme_name'] for theme in self.themes['themes']}
        covered_themes = set()

        # Collect themes mentioned in outline
        for module in self.outline.get('modules', []):
            if 'themes_covered' in module:
                for theme in module['themes_covered']:
                    covered_themes.add(theme)

        # Check coverage
        uncovered = theme_names - covered_themes
        if uncovered:
            self.warnings.append(
                f"Themes from themes.json not covered in outline: {', '.join(uncovered)}"
            )

        # Check for themes in outline not in themes.json
        extra = covered_themes - theme_names
        if extra:
            self.warnings.append(
                f"Themes in outline not found in themes.json: {', '.join(extra)}"
            )

    def _check_quality_criteria(self):
        """Check quality criteria for good course design."""
        if 'modules' not in self.outline:
            return

        modules = self.outline['modules']

        # Check module count
        if len(modules) < 2:
            self.warnings.append(
                "Very few modules (< 2). Consider if content should be organized into more modules."
            )
        elif len(modules) > 10:
            self.warnings.append(
                "Many modules (> 10). Consider consolidating related topics."
            )

        # Check sections per module
        for module in modules:
            module_num = module.get('module_number', '?')

            if 'sections' in module:
                section_count = len(module['sections'])

                if section_count < 2:
                    self.warnings.append(
                        f"Module {module_num}: Only 1 section. "
                        f"Consider breaking into multiple sections or combining with another module."
                    )
                elif section_count > 8:
                    self.warnings.append(
                        f"Module {module_num}: Many sections ({section_count}). "
                        f"Consider splitting into multiple modules."
                    )

                # Check objectives per section
                for section in module['sections']:
                    section_num = section.get('section_number', '?')
                    objectives = section.get('learning_objectives', [])

                    if len(objectives) > 7:
                        self.warnings.append(
                            f"Module {module_num}, Section {section_num}: "
                            f"Many learning objectives ({len(objectives)}). "
                            f"Consider if section is trying to cover too much."
                        )


def main():
    """CLI entry point."""
    parser = argparse.ArgumentParser(
        description='Validate course outline structure and content'
    )
    parser.add_argument(
        'outline',
        help='Path to course_outline.json'
    )
    parser.add_argument(
        'themes',
        nargs='?',
        help='Path to themes.json (optional, for theme coverage check)'
    )
    parser.add_argument(
        '--strict',
        action='store_true',
        help='Treat warnings as errors'
    )

    args = parser.parse_args()

    try:
        validator = OutlineValidator(args.outline, args.themes)
        is_valid, errors, warnings = validator.validate()

        # Print results
        print("\n" + "=" * 60)
        print("VALIDATION RESULTS")
        print("=" * 60)

        if errors:
            print(f"\n✗ ERRORS ({len(errors)}):")
            for error in errors:
                print(f"  - {error}")

        if warnings:
            print(f"\n⚠ WARNINGS ({len(warnings)}):")
            for warning in warnings:
                print(f"  - {warning}")

        if not errors and not warnings:
            print("\n✓ All checks passed! Outline looks good.")

        print("\n" + "=" * 60)

        # Exit code
        if errors:
            print("\n✗ Validation failed due to errors.")
            exit(1)
        elif warnings and args.strict:
            print("\n✗ Validation failed due to warnings (strict mode).")
            exit(1)
        else:
            print("\n✓ Validation passed!")
            exit(0)

    except Exception as e:
        print(f"\n✗ Validation error: {e}")
        exit(1)


if __name__ == '__main__':
    main()
