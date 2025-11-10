# Stage 3: Process Video & Create Content Brief

## Objective

Extract insights from video content and synthesize with course outline to create a comprehensive content brief that guides subsequent research and presentation development.

## Input Requirements

**Required Inputs:**
- `course_outline.json` from Stage 2 (validated)
- YouTube video URL containing relevant instructional content
- (Optional) Additional video URLs or content sources

**Expected Video Content:**
- Instructional or educational content related to course themes
- Lectures, tutorials, demonstrations, or expert discussions
- Preferably 15-90 minutes in length (longer videos may need segmentation)

## Process Steps

### Step 1: Extract Video Transcript

Run the transcript extraction script:

```bash
python scripts/fetch_youtube_transcript.py <youtube_url> --output raw_transcript.txt
```

**What the script does:**
1. Fetches auto-generated or manual captions from YouTube
2. Formats transcript with timestamps
3. Cleans formatting artifacts
4. Saves to `raw_transcript.txt`

**If script fails:**
- Check video has captions enabled
- Verify URL is accessible and correct
- Consider manual transcription for critical content
- Try alternative extraction tools if needed

### Step 2: Analyze Transcript for Key Content

Read through `raw_transcript.txt` and identify:

**Key Concepts:**
- Main topics covered in the video
- Definitions and explanations provided
- Frameworks or models presented
- Terminology and vocabulary used

**Teaching Approaches:**
- How concepts are explained or demonstrated
- Metaphors, analogies, or examples used
- Common student questions addressed
- Pedagogical techniques employed

**Examples and Case Studies:**
- Real-world applications mentioned
- Specific examples or scenarios
- Case studies or demonstrations
- Problem-solving approaches shown

**Visual Elements:**
- Diagrams, charts, or visualizations described
- Code or formulas shown
- Demonstrations or experiments performed
- Slides or materials referenced

### Step 3: Create Structured Video Notes

Transform your analysis into structured notes following this format:

```json
{
  "video_metadata": {
    "url": "https://youtube.com/watch?v=...",
    "title": "Video Title",
    "duration": "45:23",
    "presenter": "Instructor Name",
    "analysis_date": "2025-10-19"
  },
  "key_concepts": [
    {
      "concept": "Concept Name",
      "timestamp": "12:34",
      "explanation": "How it was explained in video",
      "examples": ["Example 1", "Example 2"],
      "relates_to_outline": ["Module 2, Section 1"]
    }
  ],
  "teaching_techniques": [
    {
      "technique": "Technique name (e.g., 'Progressive disclosure')",
      "context": "Where and how it was used",
      "effectiveness": "Your assessment of its impact"
    }
  ],
  "notable_examples": [
    {
      "example": "Description of example",
      "timestamp": "23:45",
      "topics": ["Topic A", "Topic B"],
      "why_notable": "Why this example is particularly useful"
    }
  ],
  "questions_addressed": [
    {
      "question": "Common student question",
      "answer_approach": "How the video addressed it",
      "timestamp": "34:56"
    }
  ],
  "visual_elements": [
    {
      "type": "diagram|chart|code|demo",
      "description": "What was shown",
      "timestamp": "15:30",
      "purpose": "Why it was effective"
    }
  ]
}
```

Save this as `video_notes.json`.

### Step 4: Map Video Content to Course Outline

Open `course_outline.json` and `video_notes.json` side by side and create mapping:

**For each section in the outline, identify:**
- Which video concepts apply to this section
- What examples from the video support this section
- What teaching approaches from the video could work here
- What gaps exist between video content and outline needs

**Create mapping structure:**
```json
{
  "outline_video_mapping": [
    {
      "module": 1,
      "section": 1,
      "section_title": "Introduction to Topic X",
      "video_concepts_applicable": [
        "Concept A from video (timestamp 12:34)",
        "Concept B from video (timestamp 23:45)"
      ],
      "video_examples_to_use": [
        "Example 1 (timestamp 15:20)"
      ],
      "teaching_approaches_from_video": [
        "Progressive disclosure technique",
        "Real-world analogy about Y"
      ],
      "gaps_to_research": [
        "Need more examples for advanced use case",
        "Missing explanation of edge case Z"
      ]
    }
  ]
}
```

### Step 5: Create Comprehensive Content Brief

Synthesize all previous work into `content_brief.json`:

**Structure:**
```json
{
  "brief_metadata": {
    "created_date": "2025-10-19",
    "course_title": "From outline",
    "video_source": "URL",
    "outline_version": "Reference to course_outline.json"
  },
  "modules": [
    {
      "module_number": 1,
      "module_title": "From outline",
      "sections": [
        {
          "section_number": 1,
          "section_title": "From outline",
          "learning_objectives": ["From outline"],

          "core_content": {
            "key_points": [
              "Point 1 (from outline theme)",
              "Point 2 (from video concept)",
              "Point 3 (synthesis)"
            ],
            "definitions": {
              "Term 1": "Definition (source: outline/video/both)"
            },
            "concepts_to_explain": [
              "Concept A with approach from video",
              "Concept B needing additional research"
            ]
          },

          "examples_and_applications": {
            "from_video": [
              {
                "example": "Description",
                "timestamp": "12:34",
                "application": "How to use in presentation"
              }
            ],
            "needed": [
              "Additional example for scenario X",
              "Case study for context Y"
            ]
          },

          "teaching_guidance": {
            "approach": "How to present (from video insights)",
            "analogies": ["Analogy 1 from video"],
            "common_misconceptions": ["From video or anticipated"],
            "visual_suggestions": ["Diagram type needed"]
          },

          "research_needs": [
            "Topic to research for depth",
            "Current statistics or data needed",
            "Alternative perspectives to include"
          ]
        }
      ]
    }
  ],

  "overall_research_priorities": [
    "High priority research need 1",
    "High priority research need 2"
  ],

  "content_gaps": [
    "Gap between outline and video",
    "Missing prerequisite explanation",
    "Advanced topic not covered"
  ]
}
```

**Key Elements:**
- Integrates structure from `course_outline.json`
- Incorporates insights from `video_notes.json`
- Maps video content to outline sections
- Identifies research needs for Stage 4
- Provides teaching guidance based on video analysis
- Notes gaps requiring attention

## Output Format

**Files Created:**
1. `raw_transcript.txt` - Original video transcript
2. `video_notes.json` - Structured analysis of video content
3. `content_brief.json` - Comprehensive brief for presentation development

**The content brief should:**
- Cover every section in the course outline
- Reference specific video content with timestamps
- Identify clear research needs for Stage 4
- Provide actionable teaching guidance
- Highlight examples and applications
- Note any content gaps or concerns

## Validation

### Automated Validation

Run the validation script:

```bash
python scripts/validate_brief.py content_brief.json course_outline.json
```

**The script checks:**
- ✓ Brief covers all modules and sections from outline
- ✓ Learning objectives are preserved from outline
- ✓ Video content is meaningfully integrated (not just copied)
- ✓ Research needs are specified for each section
- ✓ Required metadata fields are complete
- ✓ JSON structure is valid and complete

### Manual Review Checklist

**Completeness:**
- [ ] Every section from outline appears in brief
- [ ] All learning objectives are addressed
- [ ] Video insights are incorporated throughout
- [ ] Research needs are identified for all gaps

**Quality of Integration:**
- [ ] Video content adds value (not redundant with outline)
- [ ] Examples from video are appropriately placed
- [ ] Teaching approaches from video are actionable
- [ ] Synthesis creates coherent narrative

**Actionability:**
- [ ] Clear guidance for what to present in each section
- [ ] Specific examples identified (not vague)
- [ ] Research needs are specific enough to act on
- [ ] Teaching approaches are concrete

**Alignment:**
- [ ] Brief maintains outline's learning progression
- [ ] Video content supports (doesn't distort) outline goals
- [ ] Identified gaps are real (not artificial)
- [ ] Research needs align with course level and audience

## Common Issues and Solutions

### Issue: Video content doesn't align with outline

**Symptom:** Video covers different topics or approaches material differently

**Solutions:**
1. Use video content as supplementary examples only
2. Note pedagogical approaches from video even if content differs
3. Mark outline sections as needing primary research (Stage 4)
4. Consider if outline needs adjustment based on video insights
5. Don't force alignment—be honest about mismatches

### Issue: Video is too high-level or too detailed

**Symptom:** Video doesn't match target audience level in outline

**Solutions:**
1. Extract general concepts and adapt to appropriate level
2. Use video examples as starting points to simplify/complexify
3. Note in research needs: "Find [simpler/more advanced] treatment"
4. Use video's teaching approach but adjust content depth
5. Consider if outline's level assessment needs revision

### Issue: Transcript quality is poor

**Symptom:** Auto-generated captions are inaccurate or incomplete

**Solutions:**
1. Focus on concepts you can extract despite errors
2. Use timestamps to manually verify unclear sections
3. Skip problematic sections if not critical
4. Consider manual transcription for key sections
5. Supplement with video creator's materials if available

### Issue: Too much or too little video content

**Symptom:** Video is 3 hours or only 10 minutes

**Solutions:**
For long videos:
- Focus on most relevant sections
- Create separate notes for each major segment
- Prioritize content that fills outline gaps
- Consider extracting multiple specific sections

For short videos:
- Extract what's useful without over-relying on it
- Treat as one input among many
- Increase research needs in brief
- Consider additional video sources

### Issue: Video content reveals outline problems

**Symptom:** Video suggests outline structure should be different

**Solutions:**
1. Note concerns in content brief
2. Consider if outline adjustment is warranted
3. Discuss with stakeholders if significant restructuring needed
4. For minor issues, note in teaching guidance
5. Don't make major changes without validation—Stage 2 was already validated

## Best Practices

**Efficient Video Analysis:**
- Watch at 1.5-2x speed for first pass
- Use timestamps to jump back for important sections
- Take notes in real-time rather than re-watching
- Focus on extractability (what can be reused) not perfection

**Quality Integration:**
- Synthesize, don't just concatenate outline + video
- Look for complementarity (how video enhances outline)
- Be explicit about sources (outline vs. video vs. synthesis)
- Maintain pedagogical intent from outline

**Setting Up Stage 4:**
- Make research needs specific and bounded
- Prioritize research needs by importance
- Group related research needs together
- Consider research feasibility when framing needs

## Reference Materials

**For content analysis:**
- `templates/brief_template.json` - Full structure template
- `examples/example_brief.json` - Concrete example

**For research planning:**
- `reference/research_guidelines.md` - Preview of research standards
- `workflow/stage4-research.md` - Next stage overview

## Next Steps

Once validation passes:
1. Review `content_brief.json` for completeness
2. Ensure research needs are well-specified
3. Proceed to **Stage 4: Conduct Targeted Research**
4. Read `workflow/stage4-research.md`

---

**Stage 3 Complete** ✓ You now have a comprehensive brief that integrates structure, video insights, and research direction.
