# Coverage Depth Levels

## Purpose
Define consistent criteria for assessing how deeply a learning outcome is covered in course content.

## Three-Level Assessment Model

### Level 1: Awareness (33% Coverage)
**Definition**: Learning outcome is mentioned or introduced but not explained in detail.

**Characteristics**:
- Topic is named or referenced
- May include brief definition
- No examples or practice activities
- No assessment or verification

**Evidence Examples**:
- "We'll cover High-Performance Questions in Module 4"
- Slide title mentions concept but no content
- Facilitator note: "Introduce Design Thinking (save details for later)"
- Passing reference in context of another topic

**When to Use**: Content introduces the concept but doesn't enable participants to understand or apply it.

---

### Level 2: Working Knowledge (66% Coverage)
**Definition**: Learning outcome is explained with examples, and participants have opportunity to practice.

**Characteristics**:
- Concept is explained clearly
- Examples or case studies provided
- Hands-on activity or practice session included
- No formal assessment or quality rubric

**Evidence Examples**:
- **Explained**: Slide shows 4 HPQ categories with definitions
- **Example**: Each category has sample questions (e.g., "What evidence would change your mind?")
- **Practice**: Participants type HPQ in chat (90 seconds)
- **Missing**: No rubric defining what makes an HPQ "good" vs. "poor"

**When to Use**: Participants can understand and practice the concept, but there's no verification of quality.

---

### Level 3: Mastery (100% Coverage)
**Definition**: Learning outcome is explained, practiced, and assessed with clear quality criteria.

**Characteristics**:
- Concept is explained with examples
- Hands-on practice activity included
- Quality rubric or assessment criteria defined
- Facilitator or peer evaluation happens

**Evidence Examples**:
- **Explained**: O-I-S pattern taught (Slide 5-6, 8 minutes)
- **Example**: Sample O-I-S cards shown (Acceptable vs. Stretch)
- **Practice**: Participants build O-I-S card in Miro (10 minutes)
- **Assessment**:
  - Triad peer review using 1-1-1 protocol (3 minutes)
  - RYG self-check (Green = meets Acceptable rubric)
  - Quality gate @ minute 30 (facilitator confirms ≥80% Green/Yellow)

**When to Use**: Full instructional cycle complete—participants can perform the skill to a defined standard.

---

## Assessment Decision Tree

```
Does content mention the learning outcome?
├─ NO → 0% (Not Covered)
└─ YES → Continue...

Does content EXPLAIN the concept with examples?
├─ NO → 33% (Awareness only)
└─ YES → Continue...

Does content include PRACTICE activity?
├─ NO → 33% (Explained but no practice)
└─ YES → Continue...

Does content include ASSESSMENT (rubric/quality check)?
├─ NO → 66% (Working Knowledge)
└─ YES → 100% (Mastery)
```

---

## Coverage Percentage Mapping

| Coverage % | Level | Criteria Met |
|------------|-------|--------------|
| 0% | Not Covered | No mention of learning outcome |
| 33% | Awareness | Mentioned OR Explained (but no practice) |
| 66% | Working Knowledge | Explained + Example + Practice (but no assessment) |
| 100% | Mastery | Explained + Example + Practice + Assessment |

---

## Edge Cases

### Case 1: Explained but Not Practiced
**Scenario**: Slide explains concept with examples, but no hands-on activity.
**Coverage**: 33% (Awareness)
**Rationale**: Understanding without practice is awareness-level. Participants haven't "done" it.

### Case 2: Practiced but Not Explained
**Scenario**: Activity sheet says "Create an O-I-S card" but no prior explanation of what O-I-S is.
**Coverage**: 0-33% (Depends on context)
**Rationale**: Practice without foundation is likely ineffective. If participants already know O-I-S from another source, might be 66%. Otherwise, 0%.

### Case 3: Assessed but Not Practiced
**Scenario**: Knowledge check quiz asks about concept, but no hands-on practice.
**Coverage**: 33% (Awareness)
**Rationale**: Assessment tests understanding (awareness), not application (working knowledge).

### Case 4: Practice During Assessment
**Scenario**: Final project requires participants to demonstrate skill (practice + assessment combined).
**Coverage**: 100% (Mastery)
**Rationale**: Summative assessment that requires application = practice + assessment.

### Case 5: Self-Assessment Only
**Scenario**: Participants practice, then self-assess using RYG signals (no peer/facilitator review).
**Coverage**: 66-100% (Depends on rigor)
**Rationale**:
- **66%** if RYG is subjective ("Do you feel confident?")
- **100%** if RYG is criteria-based ("Green = meets Acceptable rubric: Outcome is behavioral, Indicator is leading, Slice ≤2 weeks")

### Case 6: Informal Practice (No Structured Activity)
**Scenario**: Facilitator says "Think about your own examples" but no structured activity.
**Coverage**: 33-66% (Depends on depth)
**Rationale**:
- **33%** if just "think about it" (mental reflection = awareness)
- **66%** if "write it down and share with neighbor" (structured practice)

---

## Multi-Artifact Coverage

### Scenario: Coverage Across Multiple Artifacts

**Example**:
- **Slide Deck**: Explains HPQs with 4 categories (Awareness: 33%)
- **Facilitator Script**: Includes chat practice exercise (adds Practice: +33% = 66%)
- **Quality Gate Section**: Defines HPQ rubric (adds Assessment: +34% = 100%)

**Assessment**: Aggregate across all artifacts. If ANY artifact has assessment, criterion is at Mastery (100%).

**Evidence Format**:
```yaml
where_the_course_covers: |
  **Mastery (100%)** ✅
  - **Explained**: Slide 14 (workshop-slides.md:200-250)
  - **Practice**: Module 4 script (module4-facilitator-script.md:132-150)
  - **Assessment**: Quality gate rubric (module4-facilitator-script.md:180-195)
```

---

## Coverage Calculations

### Individual Criterion Coverage

```
Coverage % = (Explained? 33%) + (Practice? 33%) + (Assessment? 34%)
```

### Overall Course Coverage

```
Average Coverage = (Sum of all criterion coverage %) / (Total criteria count)
```

**Example**:
- 31 criteria total
- 8 criteria at 100% (Mastery)
- 18 criteria at 66% (Working Knowledge)
- 5 criteria at 0% (Not Covered)

```
Average = (8×100 + 18×66 + 5×0) / 31 = (800 + 1188 + 0) / 31 = 1988 / 31 = 64%
```

### Category Coverage

Group criteria by learning outcome prefix (e.g., "1.1.", "2.2."), calculate average for each category:

**Example**:
- **1.1. Awareness: The Need for Business Agility** (4 criteria)
  - 1.1.1: 100%
  - 1.1.2: 66%
  - 1.1.3: 66%
  - 1.1.4: 100%
  - **Category Average: 83%**

- **2.2. New and Differentiating Behaviors** (4 criteria)
  - 2.2.1: 66%
  - 2.2.2: 100%
  - 2.2.3: 100%
  - 2.2.4: 0%
  - **Category Average: 67%**

---

## Quality Verification Checklist

When assessing each criterion, verify:

**Explained**:
- [ ] Concept is defined clearly (not just mentioned)
- [ ] Examples or analogies provided
- [ ] Relevant context given (why it matters)

**Practice**:
- [ ] Hands-on activity described (not just "think about it")
- [ ] Time allocated for practice (even if brief)
- [ ] Participants produce an artifact (O-I-S card, flow strip, etc.)

**Assessment**:
- [ ] Quality rubric exists (Acceptable vs. Stretch, or similar)
- [ ] Evaluation method defined (peer review, facilitator spot-check, self-assessment with criteria)
- [ ] Quality gate or checkpoint mentioned (can't proceed until criterion met)

If all 3 checklists pass → 100% (Mastery)
If 2 of 3 pass → 66% (Working Knowledge)
If 1 of 3 passes → 33% (Awareness)
If 0 of 3 pass → 0% (Not Covered)

---

Generated: 2025-11-09
Purpose: Consistent depth assessment for content audits
Use: Reference this file when determining coverage % for each learning outcome
