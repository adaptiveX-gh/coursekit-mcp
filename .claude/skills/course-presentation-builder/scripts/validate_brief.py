#!/usr/bin/env python3
"""
Validate content brief structure and alignment with course outline.

This script checks that a content brief:
- Has valid structure
- Covers all modules/sections from outline
- Has meaningful content integration
- Specifies research needs
- Maintains alignment with learning objectives

Usage:
    python validate_brief.py content_brief.json course_outline.json
"""

import argparse
import json
from pathlib import Path
from typing import Dict, List, Tuple, Set


class BriefValidator:
    """Validate content brief against structure and outline alignment."""

    def __init__(self, brief_path: str, outline_path: str):
        self.brief_path = Path(brief_path)
        self.outline_path = Path(outline_path)
        self.brief = None
        self.outline = None
        self.errors = []
        self.warnings = []

    def load_files(self):
        """Load JSON files."""
        print(f"Loading brief: {self.brief_path}")
        try:
            with open(self.brief_path, 'r', encoding='utf-8') as f:
                self.brief = json.load(f)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON in brief file: {e}")
        except Exception as e:
            raise ValueError(f"Error loading brief: {e}")

        print(f"Loading outline: {self.outline_path}")
        try:
            with open(self.outline_path, 'r', encoding='utf-8') as f:
                self.outline = json.load(f)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON in outline file: {e}")
        except Exception as e:
            raise ValueError(f"Error loading outline: {e}")

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
        self._check_module_section_alignment()

        # Content validation
        self._check_learning_objectives_preserved()
        self._check_content_integration()
        self._check_research_needs()

        # Quality checks
        self._check_quality_criteria()

        is_valid = len(self.errors) == 0

        return is_valid, self.errors, self.warnings

    def _check_required_fields(self):
        """Check that all required fields exist."""
        required_fields = ['brief_metadata', 'modules']

        for field in required_fields:
            if field not in self.brief:
                self.errors.append(f"Missing required field: {field}")

        if 'brief_metadata' in self.brief:
            metadata = self.brief['brief_metadata']
            required_metadata = ['created_date', 'course_title']

            for field in required_metadata:
                if field not in metadata:
                    self.warnings.append(f"Missing recommended metadata field: {field}")

    def _check_module_section_alignment(self):
        """Check that brief covers all modules and sections from outline."""
        print("  Checking module/section alignment with outline...")

        if 'modules' not in self.outline or 'modules' not in self.brief:
            self.errors.append("Both files must have 'modules' field")
            return

        outline_modules = self.outline['modules']
        brief_modules = self.brief['modules']

        # Create module mapping
        outline_mod_map = {m.get('module_number'): m for m in outline_modules}
        brief_mod_map = {m.get('module_number'): m for m in brief_modules}

        # Check all outline modules are in brief
        for mod_num, outline_mod in outline_mod_map.items():
            if mod_num not in brief_mod_map:
                self.errors.append(f"Module {mod_num} from outline not found in brief")
                continue

            brief_mod = brief_mod_map[mod_num]

            # Check module title matches
            outline_title = outline_mod.get('module_title')
            brief_title = brief_mod.get('module_title')

            if outline_title and brief_title and outline_title != brief_title:
                self.warnings.append(
                    f"Module {mod_num}: Title mismatch. "
                    f"Outline: '{outline_title}', Brief: '{brief_title}'"
                )

            # Check sections
            self._check_sections_alignment(mod_num, outline_mod, brief_mod)

        # Check for extra modules in brief
        extra_modules = set(brief_mod_map.keys()) - set(outline_mod_map.keys())
        if extra_modules:
            self.warnings.append(
                f"Modules in brief not in outline: {sorted(extra_modules)}"
            )

    def _check_sections_alignment(self, module_num: int, outline_mod: Dict, brief_mod: Dict):
        """Check section alignment within a module."""
        outline_sections = outline_mod.get('sections', [])
        brief_sections = brief_mod.get('sections', [])

        outline_sec_map = {s.get('section_number'): s for s in outline_sections}
        brief_sec_map = {s.get('section_number'): s for s in brief_sections}

        # Check all outline sections are in brief
        for sec_num, outline_sec in outline_sec_map.items():
            if sec_num not in brief_sec_map:
                self.errors.append(
                    f"Module {module_num}, Section {sec_num} from outline not found in brief"
                )
                continue

            brief_sec = brief_sec_map[sec_num]

            # Check section title matches
            outline_title = outline_sec.get('section_title')
            brief_title = brief_sec.get('section_title')

            if outline_title and brief_title and outline_title != brief_title:
                self.warnings.append(
                    f"Module {module_num}, Section {sec_num}: Title mismatch"
                )

        # Check for extra sections in brief
        extra_sections = set(brief_sec_map.keys()) - set(outline_sec_map.keys())
        if extra_sections:
            self.warnings.append(
                f"Module {module_num}: Sections in brief not in outline: {sorted(extra_sections)}"
            )

    def _check_learning_objectives_preserved(self):
        """Check that learning objectives from outline are preserved in brief."""
        print("  Checking learning objectives preservation...")

        if 'modules' not in self.outline or 'modules' not in self.brief:
            return

        for outline_mod in self.outline['modules']:
            mod_num = outline_mod.get('module_number')

            # Find corresponding brief module
            brief_mod = None
            for bm in self.brief['modules']:
                if bm.get('module_number') == mod_num:
                    brief_mod = bm
                    break

            if not brief_mod:
                continue

            # Check each section
            for outline_sec in outline_mod.get('sections', []):
                sec_num = outline_sec.get('section_number')
                outline_objs = set(outline_sec.get('learning_objectives', []))

                # Find corresponding brief section
                brief_sec = None
                for bs in brief_mod.get('sections', []):
                    if bs.get('section_number') == sec_num:
                        brief_sec = bs
                        break

                if not brief_sec:
                    continue

                brief_objs = set(brief_sec.get('learning_objectives', []))

                # Check objectives are preserved
                missing_objs = outline_objs - brief_objs
                if missing_objs:
                    self.errors.append(
                        f"Module {mod_num}, Section {sec_num}: "
                        f"Learning objectives from outline missing in brief: {len(missing_objs)} objective(s)"
                    )

                # Extra objectives are okay (warnings only)
                extra_objs = brief_objs - outline_objs
                if extra_objs:
                    self.warnings.append(
                        f"Module {mod_num}, Section {sec_num}: "
                        f"Brief has additional learning objectives not in outline: {len(extra_objs)}"
                    )

    def _check_content_integration(self):
        """Check that brief has meaningful content beyond just structure."""
        print("  Checking content integration...")

        if 'modules' not in self.brief:
            return

        for module in self.brief['modules']:
            mod_num = module.get('module_number', '?')

            for section in module.get('sections', []):
                sec_num = section.get('section_number', '?')
                prefix = f"Module {mod_num}, Section {sec_num}"

                # Check for core content
                if 'core_content' not in section:
                    self.warnings.append(f"{prefix}: No 'core_content' specified")
                else:
                    core = section['core_content']

                    # Check key points
                    if 'key_points' not in core or not core['key_points']:
                        self.warnings.append(f"{prefix}: No key points specified")
                    elif len(core['key_points']) < 2:
                        self.warnings.append(f"{prefix}: Very few key points (< 2)")

                    # Check concepts to explain
                    if 'concepts_to_explain' in core and core['concepts_to_explain']:
                        # Good - has concepts
                        pass
                    else:
                        self.warnings.append(f"{prefix}: No concepts to explain specified")

                # Check examples
                if 'examples_and_applications' in section:
                    examples = section['examples_and_applications']

                    has_video_examples = 'from_video' in examples and examples['from_video']
                    has_outline_examples = 'from_outline' in examples and examples['from_outline']
                    has_needed_examples = 'needed' in examples and examples['needed']

                    if not (has_video_examples or has_outline_examples or has_needed_examples):
                        self.warnings.append(
                            f"{prefix}: No examples specified (from video, outline, or needed)"
                        )

                # Check teaching guidance
                if 'teaching_guidance' not in section:
                    self.warnings.append(f"{prefix}: No teaching guidance provided")
                else:
                    guidance = section['teaching_guidance']

                    if 'approach' not in guidance or not guidance['approach']:
                        self.warnings.append(f"{prefix}: No teaching approach specified")

    def _check_research_needs(self):
        """Check that research needs are specified."""
        print("  Checking research needs...")

        if 'modules' not in self.brief:
            return

        total_research_needs = 0
        sections_with_research = 0
        total_sections = 0

        for module in self.brief['modules']:
            for section in module.get('sections', []):
                total_sections += 1

                research_needs = section.get('research_needs', [])
                if research_needs:
                    sections_with_research += 1
                    total_research_needs += len(research_needs)

                    # Check research need format
                    for i, need in enumerate(research_needs):
                        if isinstance(need, dict):
                            # Good - structured research need
                            if 'need' not in need:
                                mod_num = module.get('module_number', '?')
                                sec_num = section.get('section_number', '?')
                                self.warnings.append(
                                    f"Module {mod_num}, Section {sec_num}: "
                                    f"Research need {i+1} missing 'need' field"
                                )
                        elif isinstance(need, str):
                            # String is okay but structured is better
                            if len(need) < 10:
                                mod_num = module.get('module_number', '?')
                                sec_num = section.get('section_number', '?')
                                self.warnings.append(
                                    f"Module {mod_num}, Section {sec_num}: "
                                    f"Research need {i+1} is very vague (< 10 chars)"
                                )

        # Summary
        if total_sections > 0:
            coverage = (sections_with_research / total_sections) * 100
            print(f"    Research needs: {total_research_needs} needs across "
                  f"{sections_with_research}/{total_sections} sections ({coverage:.0f}% coverage)")

            if total_research_needs == 0:
                self.warnings.append(
                    "No research needs specified. Brief should identify gaps needing research."
                )
            elif coverage < 30:
                self.warnings.append(
                    f"Few sections have research needs ({coverage:.0f}%). "
                    f"Consider if more research is needed."
                )

        # Check overall priorities
        if 'overall_research_priorities' not in self.brief:
            self.warnings.append("No 'overall_research_priorities' specified")
        elif not self.brief['overall_research_priorities']:
            self.warnings.append("'overall_research_priorities' is empty")

    def _check_quality_criteria(self):
        """Check quality criteria for good brief."""
        print("  Checking quality criteria...")

        # Check video integration
        if 'video_metadata' in self.brief:
            video_meta = self.brief['video_metadata']

            if 'url' not in video_meta:
                self.warnings.append("Video URL not specified in metadata")

            if 'quality_assessment' in video_meta:
                assessment = video_meta['quality_assessment']
                if 'low' in assessment.lower():
                    self.warnings.append(
                        f"Video quality rated as low: {assessment}"
                    )

        # Check content gaps
        if 'content_gaps' in self.brief:
            gaps = self.brief['content_gaps']

            if gaps:
                critical_gaps = sum(1 for g in gaps if isinstance(g, dict) and g.get('severity') == 'critical')

                if critical_gaps > 0:
                    self.errors.append(
                        f"Brief identifies {critical_gaps} critical content gap(s) "
                        f"that must be addressed before proceeding"
                    )

                print(f"    Content gaps identified: {len(gaps)} ({critical_gaps} critical)")

        # Check next steps
        if 'next_steps' in self.brief:
            next_steps = self.brief['next_steps']

            if 'stage_4_research' not in next_steps:
                self.warnings.append("No Stage 4 research guidance in next_steps")

            if 'stage_5_generation' not in next_steps:
                self.warnings.append("No Stage 5 generation guidance in next_steps")


def main():
    """CLI entry point."""
    parser = argparse.ArgumentParser(
        description='Validate content brief structure and alignment with outline'
    )
    parser.add_argument(
        'brief',
        help='Path to content_brief.json'
    )
    parser.add_argument(
        'outline',
        help='Path to course_outline.json'
    )
    parser.add_argument(
        '--strict',
        action='store_true',
        help='Treat warnings as errors'
    )

    args = parser.parse_args()

    try:
        validator = BriefValidator(args.brief, args.outline)
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
            print("\n✓ All checks passed! Brief looks good.")

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
