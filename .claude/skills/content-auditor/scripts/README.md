# Content Auditor Scripts

This directory is reserved for future automation scripts that could enhance the content auditing process.

## Potential Future Scripts

### `audit_runner.py`
Automate the audit process:
- Read evaluation criteria YAML
- Discover all content artifacts
- Run grep searches for each criterion
- Generate annotated YAML output
- Calculate coverage statistics

### `gap_reporter.py`
Generate gap analysis reports:
- Parse audit results
- Sort gaps by priority
- Estimate effort to close gaps
- Generate actionable recommendations

### `yaml_validator.py`
Validate evaluation criteria files:
- Check YAML syntax
- Ensure required fields present
- Verify structure consistency

---

**Current Status**: No scripts implemented yet. The content-auditor skill is currently search/analysis-based using Claude's native tools (Glob, Grep, Read).

**Future Enhancement**: If audit process becomes repetitive, consider implementing Python scripts to automate keyword extraction, search orchestration, and report generation.
