# Presentation Design Guide

## Core Design Principles

### Principle 1: Less is More

**The Problem**: Information overload reduces learning

**The Solution**: Strategic minimalism
- One main idea per slide
- Remove non-essential content
- Use white space deliberately
- Break complex ideas across multiple slides

**Example:**

❌ **Overloaded Slide:**
```
Database Normalization: 1NF, 2NF, 3NF, BCNF
- 1NF: Eliminate repeating groups, create separate table, primary key
- 2NF: Remove partial dependencies, create table for each set of related data
- 3NF: Remove transitive dependencies, no non-key dependencies
- BCNF: Every determinant is a candidate key
- Benefits: Reduces redundancy, improves integrity, easier updates
- Drawbacks: More tables, complex queries, possible performance impact
- When to denormalize: Read-heavy workloads, data warehousing, caching
```

✅ **Well-Designed Sequence:**

Slide 1:
```
Database Normalization

**Goal**: Organize data to reduce redundancy and improve integrity

**We'll Cover**:
- Three normal forms (1NF, 2NF, 3NF)
- When and why to normalize
- Trade-offs to consider
```

Slide 2 (and subsequent slides for each form):
```
First Normal Form (1NF)

**Rule**: Each column contains atomic values

**Before 1NF**:
Customer | Phone Numbers
---|---
Alice | 555-1234, 555-5678

**After 1NF**:
Customer | Phone Number
---|---
Alice | 555-1234
Alice | 555-5678
```

### Principle 2: Visual Hierarchy

**The Problem**: Everything looks equally important

**The Solution**: Clear hierarchy guides attention
- Size: Larger = more important
- Weight: Bold = emphasis
- Color: Contrast = focus
- Position: Top-left gets noticed first
- Grouping: Related items together

**Hierarchy Levels:**

```
# Level 1: Slide Title (largest, bold)
## Level 2: Section Header (medium, bold)
### Level 3: Subsection (medium, normal)
Body text (normal size)
- Bullet points (normal, indented)
```

### Principle 3: Consistent Design

**The Problem**: Inconsistency is distracting and unprofessional

**The Solution**: Establish and follow patterns
- Consistent fonts (2-3 maximum)
- Consistent colors (defined palette)
- Consistent layouts (templates for slide types)
- Consistent terminology
- Consistent spacing and alignment

**Define Slide Types:**
1. **Title Slide**: Course/module intro
2. **Content Slide**: Main teaching content
3. **Example Slide**: Case studies, demos
4. **Data Slide**: Statistics, charts
5. **Summary Slide**: Recap, takeaways
6. **Transition Slide**: Between modules

## Typography

### Font Selection

**Readability First:**
- **Sans-serif for screens**: Arial, Helvetica, Calibri, Open Sans
- **Serif for print**: Times, Georgia, Garamond
- **Monospace for code**: Courier, Monaco, Consolas

**Font Combinations:**

Good:
- Headings: Helvetica Bold
- Body: Helvetica Regular

- Headings: Open Sans Bold
- Body: Source Sans Pro Regular

Avoid:
- Mixing too many fonts (stick to 2-3)
- Decorative fonts for body text
- All caps for paragraphs
- Overuse of italic or bold

### Size Guidelines

**For projected presentations:**
- Title: 36-44 pt
- Headings: 28-32 pt
- Body text: 20-24 pt
- Captions: 16-18 pt

**For online/self-paced:**
- Title: 32-40 pt
- Headings: 24-28 pt
- Body text: 18-20 pt
- Captions: 14-16 pt

**Rule**: If you can't read it from the back of the room, it's too small

### Text Density: The 6x6 Rule

**Traditional Rule**: Maximum 6 bullets, 6 words per bullet

**Modern Interpretation**: Keep text minimal

❌ **Too Dense:**
```
Database Design Best Practices for Enterprise Applications

When designing databases for large-scale enterprise applications, it's important to consider several factors including scalability, performance, data integrity, security, and maintainability. You should normalize your schema to at least third normal form to reduce redundancy, but be prepared to denormalize for performance in specific cases, particularly for read-heavy workloads where query complexity and join costs become significant bottlenecks.
```

✅ **Better:**
```
Database Design Principles

**Key Considerations:**
- Scalability
- Performance
- Data integrity
- Security
- Maintainability

[Speaker notes contain the detailed explanation]
```

## Color Theory

### Color Psychology in Education

**Blue**: Trust, calm, professional
- Use for: Corporate, technical, formal content
- Good for: Primary color, backgrounds, headers

**Green**: Growth, harmony, success
- Use for: Environmental, health, progress indicators
- Good for: Success messages, positive data

**Red**: Urgency, importance, warning
- Use for: Errors, warnings, critical info
- Avoid for: Large areas (tiring), body text

**Yellow**: Energy, optimism, attention
- Use for: Highlights, cautions, creative content
- Avoid for: Text on white (poor contrast)

**Purple**: Creativity, luxury, wisdom
- Use for: Creative fields, advanced topics
- Moderate use, can be tiring

**Orange**: Enthusiasm, affordable, friendly
- Use for: Call-to-action, informal content
- Good for: Highlights, accents

**Gray**: Neutral, balanced, professional
- Use for: Body text, secondary info
- Good for: Backgrounds, supporting text

### Color Palette Design

**Rule of Three**: Use 3 main colors
1. **Primary**: Main brand/course color (60% usage)
2. **Secondary**: Complement primary (30% usage)
3. **Accent**: Highlights and emphasis (10% usage)

**Example Palette (Tech Course):**
- Primary: Dark Blue (#1a237e) - headers, key text
- Secondary: Light Gray (#f5f5f5) - backgrounds
- Accent: Teal (#00897b) - highlights, links

**Accessibility Considerations:**
- Ensure 4.5:1 contrast ratio for body text
- Ensure 3:1 contrast ratio for large text
- Don't rely solely on color to convey meaning
- Test with colorblind simulation tools
- Provide text alternatives for color-coded info

### Color Don'ts

❌ Avoid:
- Red text on green background (hard to read)
- Low contrast combinations
- Too many colors (rainbow effect)
- Color as only differentiator
- Pure white backgrounds (use off-white)
- Neon or overly bright colors

## Visual Elements

### When to Use Visuals

**Use visuals to:**
- Illustrate relationships (diagrams)
- Show processes (flowcharts)
- Present data (charts, graphs)
- Provide examples (screenshots, photos)
- Simplify complex concepts (infographics)
- Create memory anchors (icons, symbols)

**Don't use visuals to:**
- Decorate without purpose
- Replace words that work better
- Fill empty space
- Make slides "prettier"

### Types of Visuals

**Diagrams and Flowcharts:**
```
Use when:
- Showing system architecture
- Explaining processes
- Illustrating relationships
- Demonstrating workflows

Best practices:
- Keep simple (5-7 elements max)
- Use consistent shapes and colors
- Label clearly
- Show direction with arrows
- Explain in speaker notes
```

**Charts and Graphs:**
```
Bar Chart: Comparing quantities across categories
Line Graph: Showing trends over time
Pie Chart: Showing parts of a whole (use sparingly, max 5-6 slices)
Scatter Plot: Showing correlation
Table: Comparing detailed data (use sparingly, prefer charts)

Best practices:
- Clear axis labels
- Legend when needed
- Don't use 3D (harder to read)
- Limit data series (3-5 max)
- Use consistent colors
- Start y-axis at zero (usually)
```

**Images and Photos:**
```
Use for:
- Real-world examples
- Context setting
- Emotional connection
- Concrete illustrations

Requirements:
- High resolution
- Relevant to content
- Properly licensed
- Alt text for accessibility
- Credited if needed
```

**Icons and Symbols:**
```
Use for:
- Highlighting key points
- Creating visual anchors
- Navigation cues
- Process steps

Guidelines:
- Consistent style (all line, all solid, etc.)
- Appropriate metaphors
- Cultural sensitivity
- Not too decorative
```

### Visual Design Principles

**Alignment:**
- Align elements to create order
- Use grid systems
- Be consistent across slides
- Nothing should be placed arbitrarily

**Proximity:**
- Group related items together
- Use space to separate distinct groups
- Create clear visual relationships

**Repetition:**
- Repeat design elements for consistency
- Colors, fonts, layouts, spacing
- Creates professional, cohesive look

**Contrast:**
- Make important elements stand out
- Size, color, weight, shape
- Avoid subtle differences (either same or very different)

## Slide Layouts

### Standard Layout Templates

**1. Title Slide**
```markdown
# Course Title
**Subtitle or Tagline**

Instructor Name
Date

[Optional: University/Company logo]
```

**2. Section Introduction**
```markdown
# Module/Section Title

Overview sentence or key question

**We'll Cover:**
- Topic 1
- Topic 2
- Topic 3
```

**3. Content Slide (Text Heavy)**
```markdown
## Slide Title

**Main Point**

Supporting details in bullets:
- Key point 1
- Key point 2
- Key point 3

[Visual element if helpful]
```

**4. Content Slide (Visual Heavy)**
```markdown
## Slide Title

[Large visual: diagram, image, chart]

Caption or key takeaway below
```

**5. Example Slide**
```markdown
## Example: [Title]

**Scenario**: Brief setup

**Application**: How concept applies

**Result**: What we learn

[Code block, screenshot, or illustration]
```

**6. Data Slide**
```markdown
## Slide Title

[Chart or graph - largest element]

**Key Insights:**
- Insight 1
- Insight 2

Source: Citation
```

**7. Summary Slide**
```markdown
## Summary: [Section Title]

**Key Takeaways:**
1. Main point 1
2. Main point 2
3. Main point 3

**Next**: Preview of next section
```

## Accessibility

### Universal Design Principles

Design for diverse learners:
- **Vision**: High contrast, alt text, large fonts
- **Hearing**: Captions, transcripts, visual cues
- **Motor**: Easy navigation, no timing constraints
- **Cognitive**: Clear structure, plain language, chunking

### Specific Accessibility Practices

**Text:**
- Minimum 18pt font size
- High contrast (4.5:1 ratio)
- San-serif fonts
- Left-aligned (not justified)
- Adequate line spacing (1.5x)

**Images:**
- Alt text describing content
- Don't embed text in images
- Describe charts in words too
- Use patterns in addition to colors

**Color:**
- Don't use color alone to convey meaning
- Test with color blind simulation
- Provide text alternatives
- Sufficient contrast

**Navigation:**
- Clear structure and headings
- Logical reading order
- Keyboard accessible
- Skip navigation available

**Content:**
- Plain language
- Define technical terms
- Break complex ideas into chunks
- Multiple representations (text, visual, example)

## Speaker Notes

### Purpose of Speaker Notes

**Not for:**
- Reading verbatim to audience
- Duplicating slide content
- Writing your script

**Use for:**
- Teaching tips and reminders
- Additional context and details
- Examples and stories
- Common questions and answers
- Timing guidelines
- References and sources

### Effective Speaker Notes Format

```markdown
<!--
SPEAKER NOTES:

**Key Points to Emphasize:**
- Critical concept 1
- Critical concept 2

**Teaching Approach:**
- Start with question: "Who has experienced X?"
- Use analogy: "Think of it like..."
- Common misconception: Students think X, but actually Y

**Examples:**
- Primary example: [Specific case from research]
- If time permits: [Additional example]

**Interaction:**
- Pause for questions after explaining Y
- Quick poll: "How many have tried Z?"

**Timing:**
- Estimated 15 minutes
- 10 min core content, 5 min discussion

**Sources:**
- Data from: research_notes.json source_id_5
- Example from: Video timestamp 23:45
-->
```

## Presentation Flow

### Pacing

**Timing Guidelines:**
- **Content slides**: 2-3 minutes each
- **Complex concepts**: 3-5 minutes
- **Examples**: 1-2 minutes
- **Data/charts**: 2-3 minutes
- **Transition slides**: 30 seconds

**Activity Mix (for 1-hour session):**
- Presentation: 30-35 minutes (50-60%)
- Activities/practice: 15-20 minutes (25-35%)
- Discussion: 5-10 minutes (10-15%)
- Breaks/transitions: 5 minutes (5-10%)

### Transitions

**Between Slides:**
- Brief pause to let information sink in
- Connect current slide to next
- Use transition phrases

**Between Sections:**
- Summary of previous section
- Preview of next section
- Show relationship

**Between Modules:**
- Module summary slide
- "What we've learned" recap
- "Where we're going" preview
- Longer break recommended

### Engagement Strategies

**Every 10-15 Minutes:**
- Ask a question
- Quick activity or poll
- Discussion prompt
- Physical break
- Change of pace

**Engagement Techniques:**
- **Think-Pair-Share**: Individual reflection, partner discussion, group share
- **Polls**: Quick check for understanding
- **Examples**: Real-world applications
- **Stories**: Relevant anecdotes
- **Demonstrations**: Live examples
- **Questions**: To audience or rhetorical

## Quality Checklist

### Content Quality
- [ ] One main idea per slide
- [ ] Text is minimal and scannable
- [ ] Complex ideas broken across slides
- [ ] No orphaned content
- [ ] Clear progression of ideas

### Visual Quality
- [ ] Consistent design throughout
- [ ] High contrast for readability
- [ ] All images high resolution
- [ ] Visuals support content
- [ ] No decorative-only elements

### Typography
- [ ] 2-3 fonts maximum
- [ ] Minimum 18pt font
- [ ] Consistent formatting
- [ ] Adequate white space
- [ ] Easy to scan

### Color
- [ ] Consistent color palette
- [ ] High contrast ratios
- [ ] Not relying on color alone
- [ ] Accessible for color blindness
- [ ] Professional appearance

### Accessibility
- [ ] Alt text on images
- [ ] High contrast
- [ ] Clear structure
- [ ] Logical reading order
- [ ] Captions where needed

### Technical
- [ ] All links work
- [ ] Images load properly
- [ ] File size reasonable
- [ ] Compatible with delivery platform
- [ ] Backup format available

### Pedagogical
- [ ] Aligned with learning objectives
- [ ] Appropriate depth for audience
- [ ] Good pacing and flow
- [ ] Opportunities for engagement
- [ ] Clear summaries

## Common Mistakes

### Mistake 1: Death by Bullet Points

**Problem**: Slide after slide of text bullets

**Solution**:
- Convert bullets to visuals where possible
- Use diagrams, process flows, or images
- Put detail in speaker notes
- One key point per slide

### Mistake 2: Reading the Slides

**Problem**: Presenter reads slides verbatim

**Solution**:
- Slides show key points only
- Presenter adds context and detail
- Use speaker notes for full explanation
- Make slides complement, not duplicate, speech

### Mistake 3: Too Much Too Fast

**Problem**: Information overload, rapid pace

**Solution**:
- Break complex topics across multiple slides
- Build concepts progressively
- Allow time for absorption
- Include pauses and interaction

### Mistake 4: Inconsistent Design

**Problem**: Each slide looks different

**Solution**:
- Create templates for slide types
- Establish and follow style guide
- Use master slides/themes
- Review for consistency before finalizing

### Mistake 5: Chartjunk

**Problem**: Overly complex or decorative charts

**Solution**:
- Simplify charts to essential information
- Remove 3D effects, shadows, gradients
- Clear labels and legends
- One chart, one message

## Tools and Resources

**Presentation Software:**
- **PowerPoint**: Industry standard, feature-rich
- **Keynote**: Mac/iOS, beautiful templates
- **Google Slides**: Collaborative, cloud-based
- **reveal.js**: Web-based, markdown support
- **Marp**: Markdown presentations
- **Beamer (LaTeX)**: Academic presentations

**Design Resources:**
- **Colors**: Adobe Color, Coolors, ColorBrewer
- **Icons**: Font Awesome, Noun Project, Icons8
- **Images**: Unsplash, Pexels, Pixabay (free)
- **Diagrams**: diagrams.net, Lucidchart, Miro
- **Accessibility**: WAVE, Color Contrast Checker

**Learning Resources:**
- *Presentation Zen* by Garr Reynolds
- *slide:ology* by Nancy Duarte
- *The Cognitive Style of PowerPoint* by Edward Tufte
- Apple's design guidelines
- Material Design principles

## Final Thoughts

**Remember:**
- Slides support your teaching, they don't replace it
- Less is more—remove until you can't remove anymore
- Design for your audience, not for yourself
- Test your presentation with real users
- Iterate based on feedback

**Your presentation is ready when:**
- Every slide has a clear purpose
- Visual design supports learning
- Content is accessible to all learners
- You can explain the rationale for each design choice
- Someone could learn from the slides even without you (with speaker notes)
