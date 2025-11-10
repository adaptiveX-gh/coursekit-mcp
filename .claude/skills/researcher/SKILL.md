# Researcher Skill

Guide users through researching identified knowledge gaps in course plans using the CRAAP test and 4-tier source hierarchy.

## When to Use

After running `coursekit.plan`, if research needs are identified, this skill guides the user through:
1. Understanding the research needs
2. Finding credible sources
3. Evaluating source quality
4. Documenting findings
5. Updating the course plan with research

## Prerequisites

- Course plan has been created with `coursekit.plan`
- Research needs have been identified (stored in `.coursekit/research_needs.json`)
- User is ready to conduct research

## Stage 1: Review Research Needs

First, call the `coursekit.research` MCP tool to understand what research is needed:

```
Use coursekit.research to review all identified research needs
```

Then present the research needs to the user, grouped by:
- **Priority**: Critical > High > Medium > Low
- **Type**: Data, Example, Evidence, Concept

Ask the user:
> I've found [N] research needs for your course plan. The highest priority items are:
>
> [List top 3-5 critical/high priority needs]
>
> Would you like to:
> 1. Research these systematically (recommended)
> 2. Focus on critical/high priority only
> 3. Skip research and proceed with current information

## Stage 2: Research Each Need

For each research need, guide the user through this process:

### 2.1 Understand the Need

Present the specific research need:
```
Need: [need.need]
Type: [need.type]
Priority: [need.priority]
Context: [need.context]
Suggested search: [need.suggested_search]
```

### 2.2 Source Quality Framework

Explain the 4-tier source hierarchy for this type of need:

**For Data/Evidence needs:**
- **Tier 1 (Best)**: Peer-reviewed academic papers, meta-analyses, systematic reviews
- **Tier 2 (Good)**: Industry reports from reputable firms, government statistics, academic books
- **Tier 3 (Fair)**: Practitioner blogs from recognized experts, conference talks, reputable tech blogs
- **Tier 4 (Verify)**: General blogs, social media, marketing materials (use with caution)

**For Example/Concept needs:**
- **Tier 1 (Best)**: Official documentation, academic textbooks, established tutorials
- **Tier 2 (Good)**: GitHub repos with high stars, case studies from known companies
- **Tier 3 (Fair)**: Blog posts from practitioners, Stack Overflow high-voted answers
- **Tier 4 (Verify)**: Random tutorials, unverified examples (validate thoroughly)

### 2.3 CRAAP Test

For each source the user finds, apply the CRAAP test:

**Currency**: When was it published? Is it current for this topic?
- Data/stats: Prefer last 2 years
- Examples: Prefer last 3 years unless classic
- Concepts: Foundational knowledge can be older

**Relevance**: Does it directly address the need?
- Exact match or requires interpretation?
- Appropriate depth for target audience?

**Authority**: Who created it? What are their credentials?
- Author's expertise in the field
- Institutional affiliation
- Publication venue quality

**Accuracy**: Is the information reliable and verified?
- Claims supported by evidence
- References to other credible sources
- Transparent about limitations

**Purpose**: Why was it created? Any bias?
- Educational vs. marketing intent
- Potential conflicts of interest
- Balanced perspective

### 2.4 Document Findings

For each validated source, collect:
```json
{
  "research_id": "research_X",
  "source_url": "https://...",
  "source_title": "Title of source",
  "source_type": "academic paper|industry report|blog|documentation|etc",
  "tier": 1-4,
  "craap_score": {
    "currency": "high|medium|low",
    "relevance": "high|medium|low",
    "authority": "high|medium|low",
    "accuracy": "high|medium|low",
    "purpose": "high|medium|low"
  },
  "key_findings": [
    "Specific finding 1",
    "Specific finding 2"
  ],
  "quotes": [
    "Direct quote if useful"
  ],
  "how_to_use": "How this addresses the research need"
}
```

## Stage 3: Save Research Notes

After researching each need, update the research notes file:

Create or update `.coursekit/research_notes.json`:

```json
{
  "findings": [
    {
      "research_id": "research_1",
      "need_id": "research_1",
      "sources": [
        {
          "url": "https://example.com/paper",
          "title": "Study on X",
          "type": "academic paper",
          "tier": 1,
          "craap_score": {
            "currency": "high",
            "relevance": "high",
            "authority": "high",
            "accuracy": "high",
            "purpose": "high"
          },
          "key_findings": ["Finding 1", "Finding 2"],
          "quotes": ["Quote if relevant"],
          "accessed_date": "2025-11-09"
        }
      ],
      "synthesis": "Summary of what was learned and how it addresses the need",
      "recommendation": "How to incorporate this into the course plan",
      "status": "completed"
    }
  ],
  "metadata": {
    "totalFindings": 1,
    "researchedBy": "User name",
    "lastUpdated": "2025-11-09T00:00:00.000Z"
  }
}
```

After documenting findings, also update `.coursekit/research_needs.json` to mark the need as completed:

```json
{
  "id": "research_1",
  "type": "data",
  "priority": "high",
  "need": "...",
  "context": "...",
  "suggested_search": "...",
  "location": "...",
  "status": "completed"  // Changed from "pending"
}
```

## Stage 4: Integrate Findings into Plan

After research is complete, guide the user to:

1. Review all findings
2. Identify how to integrate them into the plan:
   - Add statistics to strengthen claims
   - Include examples in materials list
   - Reference evidence in rationale
   - Expand on concepts with sources

3. Suggest specific plan updates:
```
Based on your research, I recommend updating the plan:

Module 2:
- Add citation: [Author, Year] found that [statistic]
- Include example: [Company] case study (source: [URL])
- Materials: Add reference to [documentation]

Module 3:
- Strengthen claim about [X] with evidence from [source]
```

4. Ask if user wants to regenerate the plan with research incorporated, or manually update it

## Stage 5: Summary

Provide a research summary:

```
Research Summary:
- Total needs identified: [N]
- Needs researched: [N]
- Sources found: [N]
- Tier breakdown:
  - Tier 1 (peer-reviewed/official): [N]
  - Tier 2 (reputable industry): [N]
  - Tier 3 (practitioner): [N]
  - Tier 4 (verify carefully): [N]

All findings saved to .coursekit/research_notes.json

Next steps:
1. Review research_notes.json for complete findings
2. Update course plan to incorporate research
3. Run coursekit.plan again to regenerate with improvements (optional)
4. Proceed to coursekit.tasks to begin content development
```

## Best Practices

1. **Prioritize**: Start with critical and high priority needs
2. **Quality over Quantity**: One Tier 1 source beats five Tier 4 sources
3. **Document thoroughly**: Future you will thank you for good notes
4. **Be skeptical**: Always apply CRAAP test, even to sources you like
5. **Synthesize**: Don't just collect links, extract actionable insights
6. **Cite properly**: Note URLs, authors, dates for proper attribution
7. **Know when to stop**: Diminishing returns after 3-5 good sources per need

## Error Handling

If `coursekit.research` returns "No research needs found":
- Verify that `coursekit.plan` has been run
- Check if `.coursekit/research_needs.json` exists
- The plan might not have identified any gaps (rare but possible)

If user can't find good sources:
- Suggest broadening search terms
- Consider adjacent topics or foundational concepts
- Check if the need is actually critical or can be addressed with general knowledge
- Recommend consulting with subject matter experts

## Output Files

This skill helps create/update:
- `.coursekit/research_notes.json` - All research findings with sources
- `.coursekit/research_needs.json` - Updated to mark completed research

These files are then used by subsequent phases (tasks, implement) to ensure course content is well-researched and credible.
