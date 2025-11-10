# Stage 2: Build Course Outline

## Objective

Transform extracted themes into a structured, pedagogically sound course outline with clear learning progression and hierarchical organization.

## Input Requirements

**Required Input:**
- `themes.json` from Stage 1 (validated and refined)
- Target audience information (level, background, context)
- Course duration or time constraints (if applicable)

**Context Needed:**
- Learning environment (online, in-person, hybrid)
- Prerequisites or assumed knowledge
- Desired teaching approach (theoretical, practical, balanced)

## Process Steps

### Step 1: Analyze Themes for Dependencies

Review themes from `themes.json` and identify:

**Learning Dependencies:**
- Which themes build on others?
- What foundational knowledge is required first?
- Are there natural prerequisite relationships?

**Logical Groupings:**
- Can themes be grouped into modules or units?
- Are there natural phase divisions (intro, core, advanced)?
- Do some themes form a coherent storyline?

**Cognitive Progression:**
- Which themes involve basic concepts (Bloom's: remember, understand)?
- Which require application and analysis?
- Which involve synthesis and evaluation?

### Step 2: Design Module Structure

Organize themes into modules following educational design principles:

**Module Design Criteria:**
1. **Coherence:** Each module should have a unified focus
2. **Balance:** Modules should be roughly similar in scope (2-4 themes each)
3. **Progression:** Move from foundational to advanced concepts
4. **Independence:** Modules should be loosely coupled where possible
5. **Completeness:** Each module should achieve meaningful learning milestones

**Typical Module Pattern:**
```
Module 1: Foundations (prerequisite concepts)
Module 2-3: Core Content (main topics)
Module 4: Integration & Application (synthesis)
Module 5: Advanced Topics (optional/extension)
```

### Step 3: Structure Learning Objectives

For each module and section, create clear learning objectives:

**Good Learning Objective Format:**
- Starts with action verb (analyze, create, evaluate, etc.)
- Specifies what learners will be able to do
- Includes conditions or context when relevant
- Is measurable and observable

**Example Transformation:**

❌ **Vague:** "Understand database concepts"

✓ **Specific:** "Design normalized database schemas up to 3NF, identifying entities, relationships, and constraints for a given business scenario"

### Step 4: Add Instructional Details

Enhance the outline with teaching guidance:

**For Each Section:**
- Estimated time allocation
- Suggested teaching methods (lecture, lab, discussion)
- Key concepts to emphasize
- Common misconceptions to address
- Assessment opportunities

**For Each Module:**
- Module learning goals (big picture)
- Prerequisite knowledge required
- Module deliverables or assessments
- Resources needed

### Step 5: Create Outline JSON

Using the structure from `templates/outline_template.json`, create `course_outline.json`:

```json
{
  "course_metadata": {
    "title": "Course Title",
    "target_audience": "Description of learners",
    "duration": "Total hours or weeks",
    "prerequisites": ["List", "of", "prerequisites"]
  },
  "modules": [
    {
      "module_number": 1,
      "module_title": "Descriptive Module Name",
      "module_description": "What this module accomplishes",
      "estimated_hours": 8,
      "themes_covered": ["Theme 1", "Theme 2"],
      "sections": [
        {
          "section_number": 1,
          "section_title": "Section Name",
          "learning_objectives": [
            "Specific objective 1",
            "Specific objective 2"
          ],
          "key_concepts": ["Concept A", "Concept B"],
          "estimated_time": "2 hours",
          "teaching_methods": ["lecture", "hands-on exercise"],
          "assessment_opportunities": ["quiz", "lab exercise"]
        }
      ],
      "module_assessment": "Description of module-level assessment"
    }
  ]
}
```

## Output Format

**File:** `course_outline.json`

**Required Elements:**
- Course metadata (title, audience, duration, prerequisites)
- Modules array (3-6 modules typical for standard course)
- Sections within each module (2-5 sections typical)
- Learning objectives for each section
- Time estimates at module and section level
- Theme attribution (which themes each section addresses)

**Quality Criteria:**
- Clear hierarchical structure (Course → Module → Section)
- Each section has 2-5 specific learning objectives
- Time estimates sum to realistic course duration
- All themes from Stage 1 are incorporated
- Logical learning progression is evident

## Validation

### Automated Validation

Run the validation script:

```bash
python scripts/validate_outline.py course_outline.json themes.json
```

**The script checks:**
- ✓ Valid JSON structure
- ✓ All themes from `themes.json` are used in outline
- ✓ No theme is overused or underrepresented
- ✓ Learning objectives follow proper format
- ✓ Time estimates are present and reasonable
- ✓ Required metadata fields are complete

### Manual Review Checklist

- [ ] Course flows logically from simple to complex
- [ ] Prerequisites are clearly identified
- [ ] Each module has clear purpose and outcomes
- [ ] Learning objectives are specific and measurable
- [ ] Time allocation is realistic for content depth
- [ ] No critical gaps in coverage
- [ ] No unnecessary redundancy between sections
- [ ] Assessment opportunities are well-distributed
- [ ] Module boundaries make sense for teaching

### Pedagogical Quality Check

Review against these educational design principles:

**Constructive Alignment:**
- Do learning objectives align with course goals?
- Are assessment opportunities aligned with objectives?
- Do teaching methods support the learning objectives?

**Cognitive Load:**
- Is information chunked appropriately?
- Are complex topics broken into learnable pieces?
- Is there progression from concrete to abstract?

**Engagement:**
- Are there varied teaching methods?
- Are there opportunities for active learning?
- Is there a mix of theory and practice?

## Common Issues and Solutions

### Issue: Outline feels too linear

**Symptom:** Every module depends heavily on previous ones

**Solutions:**
1. Identify which concepts are truly prerequisites vs. nice-to-know
2. Design modules with clear interfaces (what they require vs. provide)
3. Consider parallel tracks for different learner goals
4. Add "review" sections to reinforce key concepts when needed

### Issue: Uneven module sizes

**Symptom:** One module has 10 hours, another has 2 hours

**Solutions:**
1. Split large modules into 2 modules
2. Combine small modules or redistribute content
3. Check if some themes are over-detailed vs. others under-detailed
4. Consider moving advanced/optional content to appendix

### Issue: Learning objectives are too vague

**Symptom:** Objectives like "understand X" or "learn about Y"

**Solutions:**
1. Use Bloom's Taxonomy action verbs (analyze, design, evaluate, create)
2. Add specific conditions or criteria ("given X, create Y that meets Z criteria")
3. Make outcomes measurable (how would you assess this?)
4. See `reference/outline_best_practices.md` for objective writing guide

### Issue: Coverage gaps or unclear progression

**Symptom:** Topics seem disconnected or concepts appear without foundation

**Solutions:**
1. Create a concept dependency map
2. Add bridging sections to connect topics
3. Reorder sections to establish prerequisites first
4. Add "foundations" module if prerequisites are missing

## Design Patterns

### Pattern: Spiral Curriculum

**When to use:** Complex topics requiring multiple passes at increasing depth

**Structure:**
```
Module 1: Introduce concept A at basic level
Module 2: Apply concept A in simple contexts
Module 3: Analyze concept A in complex scenarios
Module 4: Synthesize concept A with other concepts
```

### Pattern: Project-Based Learning

**When to use:** Practical, skills-focused courses

**Structure:**
```
Module 1: Project introduction + core skills
Module 2-3: Incremental project milestones + supporting theory
Module 4: Project completion + reflection
```

### Pattern: Case Study Approach

**When to use:** Professional or business-oriented courses

**Structure:**
```
Module 1: Foundational concepts
Module 2-4: Each module = case study exemplifying concepts
Module 5: Comparative analysis across cases
```

## Reference Materials

**For educational design principles:**
- `reference/outline_best_practices.md` - Deep dive on course design
- `templates/outline_template.json` - Full structure template
- `examples/example_outline.json` - Concrete example

**For learning objective writing:**
- Bloom's Taxonomy reference in `outline_best_practices.md`
- Action verb lists and examples
- Assessment alignment guidance

## Next Steps

Once validation passes:
1. Save `course_outline.json` in your working directory
2. Proceed to **Stage 3: Process Video & Create Content Brief**
3. Read `workflow/stage3-video-brief.md`

---

**Stage 2 Complete** ✓ You now have a pedagogically sound course structure ready for content development.
