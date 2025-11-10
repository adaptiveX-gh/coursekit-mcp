# Stage 1: Extract Themes from Learning Outcomes

## Objective

Extract and cluster learning outcomes from a PDF document into coherent thematic groups that will form the foundation of the course structure.

## Input Requirements

**Required Input:**
- PDF document containing learning outcomes, learning objectives, competencies, or course goals
- PDF must be text-extractable (not scanned images)

**Expected PDF Structure:**
- May be formatted as bulleted lists, numbered items, or paragraph form
- May include section headings or categorical organization
- Should contain actionable learning statements (e.g., "Students will be able to...")

## Process Steps

### Step 1: Run PDF Extraction Script

Execute the extraction script:

```bash
python scripts/extract_pdf_themes.py <path_to_pdf> --output themes.json
```

**What the script does:**
1. Extracts text from PDF
2. Identifies learning outcome statements
3. Analyzes outcomes for thematic similarity
4. Clusters related outcomes into themes
5. Names each theme based on common concepts
6. Outputs structured JSON

### Step 2: Review Extracted Themes

Open `themes.json` and review the extracted themes. Check for:

**Completeness:**
- ✓ All major topics from the PDF are represented
- ✓ No significant outcomes were missed or misclassified
- ✓ Theme names accurately reflect their content

**Quality of Clustering:**
- ✓ Related outcomes are grouped together
- ✓ Themes are distinct and don't overlap significantly
- ✓ Theme size is balanced (not too many small themes or too few large ones)

**Clarity:**
- ✓ Theme names are clear and descriptive
- ✓ Outcomes are properly attributed to themes
- ✓ Any ambiguous outcomes are resolved

### Step 3: Manual Refinement (If Needed)

If the automatic extraction needs adjustment:

1. **Merge themes** that are too granular or closely related
2. **Split themes** that are too broad or combine unrelated topics
3. **Rename themes** for clarity or alignment with course terminology
4. **Reclassify outcomes** that belong to different themes
5. **Add missing context** if the PDF structure was unclear

### Step 4: Validate Against Source PDF

Do a final check against the original PDF:

1. Open PDF alongside `themes.json`
2. Verify each major section/topic is represented
3. Check that outcome statements match original wording
4. Ensure no critical learning objectives were omitted

## Output Format

**File:** `themes.json`

**Structure:**
```json
{
  "themes": [
    {
      "theme_name": "Clear, descriptive theme name",
      "description": "Brief description of what this theme covers",
      "learning_outcomes": [
        "Specific learning outcome 1",
        "Specific learning outcome 2",
        "Specific learning outcome 3"
      ],
      "bloom_levels": ["remember", "understand", "apply"],
      "estimated_hours": 3.5
    }
  ],
  "metadata": {
    "source_pdf": "path/to/original.pdf",
    "extraction_date": "2025-10-19",
    "total_outcomes": 45,
    "total_themes": 6
  }
}
```

**Key Fields:**
- `theme_name`: Concise, descriptive name (2-5 words)
- `description`: 1-2 sentence overview of theme scope
- `learning_outcomes`: Array of specific, actionable outcome statements
- `bloom_levels`: Cognitive levels addressed (optional, for educational design)
- `estimated_hours`: Rough time estimate for teaching this theme (optional)

## Validation Checklist

Before proceeding to Stage 2, verify:

- [ ] `themes.json` file exists and is valid JSON
- [ ] All major topics from the PDF are represented in themes
- [ ] Each theme has at least 2-3 learning outcomes
- [ ] No theme has more than 10 outcomes (if so, consider splitting)
- [ ] Theme names are clear and distinct from each other
- [ ] Learning outcomes are specific and actionable (not vague)
- [ ] Metadata section is complete
- [ ] You can explain each theme's scope in 1-2 sentences

## Common Issues and Solutions

### Issue: PDF extraction returns garbled text

**Cause:** PDF uses images or non-standard encoding

**Solutions:**
1. Try using OCR tools to convert to text-extractable PDF
2. Manually extract text and save as `.txt` file
3. See `reference/theme_extraction_guide.md` for manual extraction process

### Issue: Too many small themes (15+ themes)

**Cause:** Over-fragmentation of related topics

**Solutions:**
1. Look for themes that share concepts or skills
2. Merge related themes into broader categories
3. Aim for 5-8 major themes for typical course

### Issue: Outcomes don't clearly map to themes

**Cause:** Learning outcomes are too vague or overlap multiple topics

**Solutions:**
1. Break compound outcomes into separate specific outcomes
2. Classify each component to appropriate theme
3. Add clarifying context to outcome statements if needed

### Issue: Unclear what level of granularity to use

**Guidance:**
- **Too coarse:** "Programming Fundamentals" covering everything from variables to algorithms
- **Too fine:** Separate themes for "While Loops" and "For Loops"
- **Just right:** "Control Flow and Iteration" covering conditionals and all loop types

## Reference Materials

For deeper guidance on theme extraction:
- `reference/theme_extraction_guide.md` - Detailed patterns and examples
- `templates/outline_template.json` - See how themes feed into outlines
- `examples/example_themes.json` - Concrete example of good theme clustering

## Next Steps

Once validation passes:
1. Save `themes.json` in your working directory
2. Proceed to **Stage 2: Build Course Outline**
3. Read `workflow/stage2-build-outline.md`

---

**Stage 1 Complete** ✓ Ready to proceed when validation checklist is fully satisfied.
