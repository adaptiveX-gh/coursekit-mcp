# Stage 4: Conduct Targeted Research

## Objective

Conduct focused research to address content gaps, add depth, provide current information, and enrich the presentation with credible sources and examples.

## Input Requirements

**Required Input:**
- `content_brief.json` from Stage 3 (validated)
- Research needs identified in the brief
- Course context (audience level, purpose, domain)

**Research Scope:**
- Focus on specific needs from the brief (don't do general research)
- Prioritize high-impact topics that enhance learning
- Balance breadth (coverage) with depth (quality)

## Research Principles

Before starting, understand these research guidelines:

**Targeted Research:**
- Research should address specific needs from `content_brief.json`
- Avoid general topic research—stay focused on identified gaps
- Each research item should enhance a specific section

**Source Quality:**
- Prioritize credible, authoritative sources
- Use recent sources for rapidly changing fields
- Balance academic rigor with practical applicability
- See `reference/research_guidelines.md` for detailed criteria

**Efficiency:**
- Don't research what's already covered in outline or video
- Use research to fill gaps, not duplicate existing content
- Stop researching when you have sufficient material for the presentation
- Presentations need examples and clarity, not exhaustive literature reviews

## Process Steps

### Step 1: Extract Research Needs

Review `content_brief.json` and compile all research needs:

**From section-level research needs:**
```json
"sections": [
  {
    "research_needs": [
      "Current statistics on topic X",
      "Alternative perspectives on concept Y",
      "Additional examples for scenario Z"
    ]
  }
]
```

**From overall priorities:**
```json
"overall_research_priorities": [
  "High priority need 1",
  "High priority need 2"
]
```

**From content gaps:**
```json
"content_gaps": [
  "Missing prerequisite explanation",
  "Advanced topic not covered in video"
]
```

Create a prioritized research list:

```json
{
  "research_items": [
    {
      "item_id": 1,
      "research_need": "Current statistics on cloud adoption",
      "applies_to_sections": ["Module 1, Section 1"],
      "priority": "high",
      "type": "data",
      "status": "pending"
    },
    {
      "item_id": 2,
      "research_need": "Real-world example of microservices migration",
      "applies_to_sections": ["Module 3, Section 2"],
      "priority": "medium",
      "type": "example",
      "status": "pending"
    }
  ]
}
```

### Step 2: Conduct Focused Research

For each research item, follow this process:

**A. Define Research Question**
- What specific question are you answering?
- What would "sufficient" information look like?
- What will you do with this information in the presentation?

**B. Identify Appropriate Sources**

**For factual information/data:**
- Official reports, white papers, industry surveys
- Government statistics, research institutions
- Reputable news organizations
- Academic publications

**For explanations/concepts:**
- Authoritative textbooks or reference materials
- Well-regarded technical documentation
- Expert blog posts or articles (with credentials)
- Academic papers or tutorials

**For examples/case studies:**
- Company blogs and case studies
- Conference talks and presentations
- Technical blogs with detailed walkthroughs
- Open source projects with documentation

**C. Evaluate Source Quality**

Before using a source, check:
- ✓ Author credentials or organizational authority
- ✓ Publication date (is it current enough?)
- ✓ Evidence and citations (does it reference other credible sources?)
- ✓ Objectivity (any obvious bias or commercial motivation?)
- ✓ Peer review or editorial oversight (for academic/formal sources)

See `reference/research_guidelines.md` for detailed evaluation criteria.

**D. Extract and Document Findings**

For each source used, document:

```json
{
  "source_id": "unique_identifier",
  "title": "Article or Resource Title",
  "author": "Author Name or Organization",
  "url": "https://...",
  "publication_date": "2024-03-15",
  "accessed_date": "2025-10-19",
  "source_type": "academic|industry|documentation|blog|news",
  "credibility_rating": "high|medium",

  "key_findings": [
    "Specific finding 1 relevant to presentation",
    "Specific finding 2 relevant to presentation"
  ],

  "quotes": [
    {
      "quote": "Exact quote if used verbatim",
      "context": "Why this quote is significant"
    }
  ],

  "data_points": [
    {
      "statistic": "75% of enterprises",
      "context": "Adopted cloud services in 2024",
      "source_page": "Page 12"
    }
  ],

  "examples": [
    {
      "example": "Description of example",
      "relevance": "How it applies to section X"
    }
  ],

  "applies_to_research_items": [1, 3],
  "applies_to_sections": ["Module 1, Section 1", "Module 2, Section 3"]
}
```

### Step 3: Organize Research Findings

Create `research_notes.json` with this structure:

```json
{
  "research_metadata": {
    "research_date": "2025-10-19",
    "researcher": "Your name",
    "brief_version": "Reference to content_brief.json",
    "total_sources": 15,
    "research_hours": 4.5
  },

  "sources": [
    {
      // Source documentation from Step 2D
    }
  ],

  "findings_by_section": [
    {
      "module": 1,
      "section": 1,
      "section_title": "Introduction to Topic X",

      "research_items_addressed": [
        {
          "original_need": "From content_brief.json",
          "findings_summary": "What you found",
          "sources_used": ["source_id_1", "source_id_2"]
        }
      ],

      "data_for_section": [
        {
          "data_point": "75% of enterprises adopted cloud in 2024",
          "source": "source_id_1",
          "usage_suggestion": "Use in opening slide to establish relevance"
        }
      ],

      "examples_for_section": [
        {
          "example": "Netflix's microservices migration",
          "description": "Full description",
          "source": "source_id_3",
          "usage_suggestion": "Use as case study in section 3.2"
        }
      ],

      "concepts_clarified": [
        {
          "concept": "Concept name",
          "clarification": "Enhanced explanation from research",
          "sources": ["source_id_4"]
        }
      ]
    }
  ],

  "additional_resources": [
    {
      "title": "Useful resource not directly cited",
      "url": "https://...",
      "description": "Why this might be useful",
      "suggested_use": "Optional reading or instructor reference"
    }
  ],

  "research_notes": [
    "General observation 1 from research process",
    "Emerging trend noticed across sources",
    "Potential alternative approach discovered"
  ]
}
```

### Step 4: Validate Research Quality

Check your research against quality criteria:

**Coverage:**
- [ ] All high-priority research needs from brief are addressed
- [ ] Each section needing research has received attention
- [ ] Content gaps identified in brief are filled

**Source Quality:**
- [ ] All sources meet credibility criteria (see reference/research_guidelines.md)
- [ ] Mix of source types appropriate for content (academic, industry, practical)
- [ ] Sources are recent enough for the subject matter
- [ ] Proper attribution and citation information captured

**Usability:**
- [ ] Findings are specific enough to use in presentation
- [ ] Examples are relevant and well-explained
- [ ] Data points have proper context
- [ ] Clear connection between research and sections

**Balance:**
- [ ] Not overly reliant on single source or perspective
- [ ] Balance between theoretical and practical content
- [ ] Appropriate depth for target audience level
- [ ] Research enhances rather than overwhelms core content

## Output Format

**File:** `research_notes.json`

**Required Elements:**
- Complete source documentation for all sources used
- Findings organized by section (matching `content_brief.json` structure)
- Clear mapping between research items and findings
- Proper citations and attribution
- Usage suggestions for how to incorporate findings

**Quality Indicators:**
- 10-20 sources typical for standard course presentation
- Each source has multiple extracted elements (findings, examples, data)
- Sources span multiple types (not all blog posts or all academic)
- Clear relevance to specific sections
- Recent sources (last 2-5 years) for current topics

## Validation

### Manual Validation Checklist

**Research Completeness:**
- [ ] All research needs from `content_brief.json` are addressed
- [ ] High-priority items received thorough research
- [ ] Medium and low-priority items received appropriate attention
- [ ] Unanswered research needs are documented with reasons

**Source Quality:**
- [ ] Sources meet credibility standards (reference/research_guidelines.md)
- [ ] Author credentials or organizational authority verified
- [ ] Publication dates appropriate for topics
- [ ] No low-quality or questionable sources included

**Documentation Quality:**
- [ ] All sources have complete citation information
- [ ] Findings are clearly extracted and summarized
- [ ] Proper attribution maintained throughout
- [ ] Usage suggestions are actionable

**Integration Readiness:**
- [ ] Research findings map clearly to sections
- [ ] Examples are presentation-ready (not raw)
- [ ] Data has context and interpretation
- [ ] Concepts are explained, not just referenced

## Common Issues and Solutions

### Issue: Too much research, overwhelming amount of information

**Symptom:** 50+ sources, 100+ pages of notes, unclear what to use

**Solutions:**
1. Return to research needs—what specifically did the brief ask for?
2. Prioritize high-priority items, let go of nice-to-have research
3. Extract key points from sources rather than documenting everything
4. Remember: Presentation needs clarity, not comprehensiveness
5. Move excess research to "additional resources" rather than main findings

### Issue: Can't find credible sources for some topics

**Symptom:** Research needs remain unaddressed, only found blog posts or questionable sources

**Solutions:**
1. Broaden search terms or approach the topic differently
2. Look for authoritative documentation or official sources
3. Check if the topic is too niche or emerging (adjust expectations)
4. Consider whether video or outline content is sufficient for this point
5. Document in research notes that limited sources exist
6. Use best available source with appropriate caveats

### Issue: Sources contradict each other

**Symptom:** Different sources give different information or perspectives

**Solutions:**
1. This is often valuable—present multiple perspectives
2. Check source quality—is one more authoritative?
3. Look at publication dates—has understanding evolved?
4. Present the controversy or debate as part of the content
5. Provide your synthesis or interpretation based on evidence

### Issue: Research reveals content brief problems

**Symptom:** Research shows outline or brief has errors or gaps

**Solutions:**
1. Document findings in research notes
2. For minor issues: Note corrections in research findings
3. For major issues: Flag for discussion with stakeholders
4. Don't make major structural changes without validation
5. Provide corrected information with clear citations

### Issue: Research is taking too long

**Symptom:** Hours spent researching, still not done

**Solutions:**
1. Use the "good enough" principle—presentations need adequate not exhaustive research
2. Focus on high-priority items only
3. Set time limits per research item (e.g., 20 minutes max)
4. Use research notes to document quick findings, not perfect summaries
5. Remember Stage 5 can still incorporate additional research if needed

## Research Strategies

### Strategy: Snowball Research

Start with one good source, follow its references:
1. Find one authoritative source on the topic
2. Check its bibliography or references
3. Follow citations to original sources
4. Build network of credible, related sources

### Strategy: Lateral Reading

Verify information across sources:
1. Don't deep-dive into first source found
2. Quickly check 3-4 sources on same topic
3. Look for consensus or variation
4. Choose best source(s) to document deeply

### Strategy: Tiered Research

Adjust depth based on importance:
1. High-priority: 30+ minutes, multiple sources, thorough
2. Medium-priority: 15 minutes, 1-2 sources, key points
3. Low-priority: 10 minutes, quick fact-check, single source

## Research Tools and Resources

**Recommended Tools:**
- Google Scholar for academic sources
- Industry-specific databases (IEEE, ACM, PubMed, etc.)
- Company blogs and official documentation
- Conference proceedings and presentations
- Authoritative news sources (NYT, WSJ, Reuters for business topics)

**Search Tips:**
- Use specific search terms from research needs
- Add "2024" or "2025" to find recent sources
- Use site:edu or site:org to filter by domain
- Use quotation marks for exact phrases
- Add "case study" or "example" to find practical applications

## Reference Materials

**For detailed research standards:**
- `reference/research_guidelines.md` - Complete source evaluation criteria
- `reference/research_guidelines.md` - Citation format requirements
- `reference/research_guidelines.md` - Academic vs. practical source balance

**For presentation integration:**
- `workflow/stage5-generate-presentation.md` - Preview of how research will be used
- `reference/presentation_design.md` - How to present data and examples

## Next Steps

Once validation passes:
1. Save `research_notes.json` in your working directory
2. Verify all research needs from brief are addressed
3. Proceed to **Stage 5: Generate Final Presentation**
4. Read `workflow/stage5-generate-presentation.md`

---

**Stage 4 Complete** ✓ You now have research-backed content ready to assemble into a presentation.
