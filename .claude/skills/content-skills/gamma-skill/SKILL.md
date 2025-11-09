# Gamma AI Content Skill

## Purpose
Generates professional AI-powered presentations using Gamma AI's API, converting CourseKit course content into polished slide decks with automatic design and layout.

## Parent Skill
Called by Implementation Coach when task involves presentations and user selects Gamma AI as the provider.

## Specialized Capabilities

### Gamma AI Features
- AI-powered slide generation
- Automatic design and layouts
- Multiple presentation styles (professional, creative, minimal)
- Theme selection based on audience
- AI-generated or stock images
- Speaker notes from course content
- Export to PDF, PPTX, HTML
- Real-time generation tracking

## Information Gathering

### Stage 1: Presentation Style
**Questions**:
1. "What's the tone of your presentation?" (professional/creative/minimal)
2. "Who's your target audience?" (beginners/intermediate/experts)
3. "Is this technical or business content?"

**What We're Building**:
- Style preference (professional, creative, minimal)
- Audience-appropriate theme selection
- Content tone and approach

**Red Flags to Watch For**:
- Mismatch between audience and style
- Overly complex for beginners
- Too basic for experts

### Stage 2: Presentation Length
**Questions**:
1. "How long is your presentation?" (duration in minutes)
2. "Do you want me to estimate slide count, or specify it?"
3. "Will there be exercises or activities?"

**What We're Building**:
- Target slide count (auto-estimated or manual)
- Time allocation per slide
- Exercise slide inclusion

**Red Flags to Watch For**:
- Too many slides for time available
- Not enough content for duration
- Unrealistic slide count

### Stage 3: Visual Preferences
**Questions**:
1. "Should I include images?" (AI-generated/stock/none)
2. "Any specific visual requirements?" (accessibility, branding)
3. "Color preferences or constraints?"

**What We're Building**:
- Image strategy
- Accessibility requirements
- Brand guidelines compliance

### Stage 4: Export Format
**Questions**:
1. "How will you deliver this?" (live/distributed/handout/online)
2. "Need an editable version?" (PPTX)
3. "Need a PDF for printing?"

**What We're Building**:
- Export format selection
- Delivery method optimization
- Distribution strategy

## Synthesis Pattern

```javascript
function synthesizeRequirements(context) {
  return {
    style: determineStyle(context.audience, context.contentType),
    length: estimateSlideCount(context.duration, context.modules),
    images: selectImageStrategy(context.contentType, context.technical),
    exportFormat: selectFormat(context.deliveryMethod),
    theme: selectTheme(context.style, context.audience, context.focus)
  };
}

function determineStyle(audience, contentType) {
  if (audience.includes('executive') || contentType.includes('business')) {
    return 'minimal';  // Clean, focused for decision-makers
  } else if (audience.includes('creative') || contentType.includes('design')) {
    return 'creative';  // Bold, engaging for creative professionals
  } else {
    return 'professional';  // Balanced for general audiences
  }
}

function estimateSlideCount(duration, modules) {
  // Rule: 2-3 minutes per slide for presentations
  const baseSlides = Math.ceil(duration / 2.5);

  // Add title, outline, summary
  const structuralSlides = 3;

  // Add section dividers for modules
  const moduleDividers = modules.length;

  return baseSlides + structuralSlides + moduleDividers;
}

function selectImageStrategy(contentType, isTechnical) {
  if (isTechnical || contentType.includes('code')) {
    return 'none';  // Code presentations need space, not images
  } else if (contentType.includes('business') || contentType.includes('concept')) {
    return 'ai-generated';  // AI images work well for concepts
  } else {
    return 'stock';  // Stock photos for general content
  }
}
```

## Generation Workflow

```
1. Gather Requirements
   ↓
2. Analyze CourseKit Content
   - Parse constitution (vision, audience)
   - Extract specification (learning outcomes)
   - Process plan (modules, structure)
   ↓
3. Build Presentation Structure
   - Title slide
   - Outline slide
   - Content slides (from modules)
   - Exercise slides (if included)
   - Summary slide
   ↓
4. Map Learning Outcomes to Slides
   - Keyword matching
   - Outcome distribution
   - Metadata attachment
   ↓
5. Build AI Prompt
   - Course context
   - Audience information
   - Style and theme
   - Structure specification
   ↓
6. Call Gamma AI API
   - Create presentation
   - Monitor progress
   - Handle rate limits
   ↓
7. Wait for Completion
   - Poll status (every 3s)
   - Report progress
   - Handle timeouts
   ↓
8. Export (if needed)
   - PDF for handouts
   - PPTX for editing
   - HTML for web
   ↓
9. Validate Output
   - Check slide count
   - Verify metadata
   - Confirm export
   ↓
10. Return Result
```

## Prompt Engineering

### Building Effective Prompts

```javascript
function buildPrompt(requirements, context, presentation) {
  const prompt = `
Create a ${requirements.style.style} presentation titled "${context.constitution.title}".

**Context:**
- Course: ${context.constitution.title}
- Target Audience: ${context.constitution.audience}
- Focus Areas: ${context.constitution.focus}
- Duration: ${requirements.length.duration} minutes
- Learning Objectives: ${context.specification.outcomes.join('; ')}

**Requirements:**
- Style: ${requirements.style.style}
- Theme: ${requirements.theme.theme}
- Images: ${requirements.images.preference}
- Slide Count: ${requirements.length.estimated}

**Content Structure:**
${presentation.slides.map((s, i) => `${i + 1}. [${s.type}] ${s.title}`).join('\n')}

**Tone and Approach:**
- Professional yet engaging
- Clear and actionable
- Focused on practical application
- Include speaker notes for each slide
- Ensure accessibility

**Key Points to Emphasize:**
${context.specification.outcomes.map((o, i) => `${i + 1}. ${o}`).join('\n')}

Please create a visually appealing, well-structured presentation that achieves these learning objectives.
  `.trim();

  return prompt;
}
```

### Prompt Best Practices

1. **Context First**: Provide course context before requirements
2. **Clear Structure**: Show slide structure explicitly
3. **Specific Requirements**: Be precise about style, theme, images
4. **Learning Focus**: Emphasize learning objectives
5. **Accessibility**: Always mention accessibility needs

## Theme Selection

### Theme Mapping

```javascript
const THEME_MAP = {
  professional: {
    business: 'corporate',      // Business content
    technical: 'tech',          // Technical/engineering
    education: 'academic',      // Educational institutions
    default: 'modern'           // General professional
  },
  creative: {
    design: 'bold',             // Design/creative
    marketing: 'vibrant',       // Marketing/advertising
    startup: 'dynamic',         // Startups/innovation
    default: 'creative'         // General creative
  },
  minimal: {
    executive: 'clean',         // C-level presentations
    financial: 'minimal',       // Financial/legal
    legal: 'formal',            // Legal/compliance
    default: 'simple'           // General minimal
  }
};
```

### Accessibility Considerations

```javascript
const ACCESSIBILITY_DEFAULTS = {
  highContrast: false,          // High contrast mode
  largeText: false,             // Large text for readability
  colorBlindSafe: true,         // Color-blind safe palettes
  screenReaderFriendly: true,   // Alt text for images
  keyboardNavigable: true       // Keyboard navigation support
};
```

## Error Handling

### Rate Limiting

```javascript
if (error instanceof GammaRateLimitError) {
  const retryAfter = error.retryAfter;

  // Option 1: Wait and retry
  await sleep(retryAfter * 1000);
  return await retry();

  // Option 2: Fall back to alternative provider
  return {
    success: false,
    fallback: {
      attempted: true,
      skill: 'slidev',
      reason: 'rate_limited'
    }
  };
}
```

### Timeout Handling

```javascript
if (error instanceof GammaTimeoutError) {
  // Provide options to user
  return {
    success: false,
    error: {
      message: 'Generation timed out',
      guidance: 'Try reducing slide count or use fallback provider',
      options: [
        { action: 'reduce_slides', newCount: Math.floor(originalCount * 0.7) },
        { action: 'use_fallback', provider: 'slidev' },
        { action: 'retry', waitTime: 60000 }
      ]
    }
  };
}
```

### Authentication Errors

```javascript
if (error instanceof GammaAuthenticationError) {
  return {
    success: false,
    error: {
      message: 'Authentication failed',
      guidance: 'Check your Gamma API key in .env file',
      steps: [
        '1. Verify GAMMA_API_KEY is set in .env',
        '2. Check key hasn't expired',
        '3. Verify key has correct permissions',
        '4. Get new key from https://gamma.app/settings/api'
      ]
    }
  };
}
```

## Example Interaction

```
Human: Create a presentation for my business agility workshop

Assistant with Gamma AI Skill:
I'll help you create an AI-powered presentation for your business agility workshop.

Let me gather some information to ensure the presentation matches your needs.

**Presentation Style**
Based on your course being about "business agility" for "business professionals",
I recommend a **professional** style. This gives you:
- Clean, business-appropriate design
- Clear information hierarchy
- Professional color schemes
- Appropriate imagery

Does this work for you, or would you prefer:
- Creative (bold, dynamic, more visual)
- Minimal (clean, focused, executive-style)

[User: Professional works]

**Presentation Length**
Your workshop is 2 hours (120 minutes). Based on this, I estimate:
- ~45 content slides (2.5 min per slide)
- Plus 5 structural slides (title, outline, section dividers, summary)
- Total: **50 slides**

Should I use this estimate, or do you have a specific count in mind?

[User: 50 slides is perfect]

**Visual Elements**
For business content, I recommend **AI-generated** images for:
- Concept illustrations
- Diagrams and frameworks
- Visual metaphors

This keeps the presentation engaging without generic stock photos.

**Export Format**
How will you deliver this presentation?
- Live presentation → View-only (online)
- Distributed to attendees → PPTX (editable)
- Handout material → PDF (printable)
- Online course → HTML (embeddable)

[User: Need PPTX for live presenting and editing]

**Theme Selection**
For professional business content, I'm selecting the **'corporate'** theme with:
- Professional blue/gray color scheme
- Clean sans-serif fonts
- High contrast for readability
- Color-blind safe palette

Perfect! I'm now generating your presentation with Gamma AI...

[Progress updates]
✓ Converting course content (10%)
✓ Building AI prompt (20%)
✓ Calling Gamma AI API (30%)
✓ Presentation created: pres_abc123 (50%)
✓ Waiting for generation... (60%)
✓ Generation complete (80%)
✓ Exporting to PPTX (90%)
✓ Done! (100%)

Your presentation is ready:
- 50 slides covering all modules
- Professional corporate theme
- AI-generated concept images
- Speaker notes included
- Exported to PPTX

View online: https://gamma.app/pres_abc123
Download: course-presentation.pptx
```

## Integration Points

### With Implementation Coach

Implementation Coach calls Gamma AI Skill when:
- User selects Gamma AI as provider
- Task involves presentations/slides
- API key is configured
- No rate limit issues

### With Other Skills

Fallback chain:
```
Gamma AI (primary)
  ↓ (on rate limit/timeout)
Slidev (fallback)
  ↓ (on failure)
PowerPoint (fallback)
```

### With Configuration System

Reads from:
- `config/providers.json` - Gamma provider config
- `config/user-preferences.json` - User style preferences
- `.env` - GAMMA_API_KEY

## Success Metrics

Good presentation generation:
- ✓ Slide count within 10% of estimate
- ✓ All learning outcomes mapped to slides
- ✓ Speaker notes included
- ✓ Theme matches audience/content
- ✓ Generation time < 5 minutes
- ✓ Export successful (if requested)

Red flags:
- ✗ <3 slides generated
- ✗ >100 slides generated
- ✗ No speaker notes
- ✗ Missing learning outcomes
- ✗ Export failed when requested
- ✗ Generation timeout

## Limitations

- **Rate Limits**: Free tier = 20 req/min, 500/hour, 5000/day
- **Slide Count**: Max 100 slides per presentation
- **Generation Time**: Can take 2-5 minutes for large decks
- **Internet Required**: API-based, needs internet connection
- **API Key Required**: Must have Gamma AI account and API key

## Future Enhancements

1. **Template Support**: Use custom Gamma templates
2. **Batch Generation**: Generate multiple presentations
3. **Incremental Updates**: Update existing presentations
4. **Collaboration**: Multi-user presentation editing
5. **Analytics**: Track presentation views and engagement
6. **Custom Branding**: Upload brand assets and guidelines
7. **Voice Notes**: Convert speaker notes to voice recordings
