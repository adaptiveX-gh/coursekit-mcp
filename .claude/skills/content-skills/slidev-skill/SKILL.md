# Slidev Content Skill

## Purpose
Generates high-quality Slidev markdown presentations with proper layouts, themes, code highlighting, and interactive elements.

## Parent Skill
Called by Implementation Coach when task involves slides and format is Slidev/Markdown

## Specialized Capabilities

### Slidev-Specific Features
- 30+ built-in layouts
- Theme customization
- Code syntax highlighting with Shiki
- Mermaid diagrams support
- Vue components integration
- Presenter notes
- Recording support
- PDF export optimization

## Information Gathering

### Stage 1: Presentation Context
**Questions**:
1. "What's the technical level of your audience?"
2. "Will you be presenting live or sharing for self-study?"
3. "How much code will you show?"
4. "Need animations or prefer clean/simple?"

### Stage 2: Theme & Style
**Questions**:
1. "Theme preference? (default/seriph/apple-basic/custom)"
2. "Color scheme? (auto/light/dark)"
3. "Code highlighting theme?"
4. "Font preferences?"

### Stage 3: Content Structure
**Questions**:
1. "How many slides roughly?"
2. "Need section dividers?"
3. "Want navigation controls?"
4. "Include slide numbers?"

## Slidev Generation Patterns

### Opening Slide Template
```yaml
---
theme: ${theme}
background: ${backgroundImage || 'https://source.unsplash.com/1920x1080/?technology'}
class: text-center
highlighter: shiki
lineNumbers: ${showLineNumbers}
info: |
  ## ${title}
  ${description}
drawings:
  persist: false
transition: ${transition || 'slide-left'}
title: ${title}
mdc: true
---

# ${title}

${subtitle}

<div class="pt-12">
  <span @click="$slidev.nav.next" class="px-2 py-1 rounded cursor-pointer" hover="bg-white bg-opacity-10">
    ${ctaText || 'Press Space to start'} <carbon:arrow-right class="inline"/>
  </span>
</div>

<div class="abs-br m-6 flex gap-2">
  ${authorInfo}
</div>

<!--
${speakerNotes}
-->
```

### Content Layouts

#### Two-Column Layout
```markdown
---
layout: two-cols
layoutClass: gap-16
---

# ${sectionTitle}

::left::

## ${leftTitle}
${leftContent}

::right::

## ${rightTitle}
${rightContent}

<!--
${speakerNotes}
-->
```

#### Code Focus Layout
```markdown
---
layout: default
highlighter: shiki
---

# ${title}

\`\`\`${language} {${highlightLines}|${animationSteps}}
${codeContent}
\`\`\`

<arrow v-click="${clickIndex}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" color="${color}" width="${width}" arrowSize="${arrowSize}" />

<div v-after class="absolute bottom-10">
  <p>${explanation}</p>
</div>
```

#### Interactive Elements
```markdown
---
layout: center
---

# ${questionTitle}

<div v-click-hide class="text-2xl">
  ${questionText}
</div>

<div v-after>
  <div v-click>✅ ${answer1}</div>
  <div v-click>✅ ${answer2}</div>
  <div v-click>✅ ${answer3}</div>
</div>

<div v-click class="mt-10 text-gray-500">
  ${additionalInfo}
</div>
```

### Diagram Support
```markdown
---
layout: default
---

# ${diagramTitle}

\`\`\`mermaid
graph ${direction}
    ${mermaidDiagram}
\`\`\`

<div class="mt-4 text-sm text-gray-500">
  ${diagramCaption}
</div>
```

## Code Highlighting Strategies

### Progressive Reveal
```javascript
function generateProgressiveCode(code, steps) {
  const lines = code.split('\n');
  const highlights = steps.map(step => {
    return `{${step.start}-${step.end}}`;
  }).join('|');
  
  return `\`\`\`javascript {${highlights}}
${code}
\`\`\``;
}
```

### Line Focus
```javascript
function generateLineFocus(code, focusLines, dim = true) {
  const dimOthers = dim ? `{all|${focusLines}}` : `{${focusLines}}`;
  return `\`\`\`javascript ${dimOthers}
${code}
\`\`\``;
}
```

## Theme Customization

### Custom Theme Creation
```css
/* ./themes/custom.css */
:root {
  --slidev-theme-primary: ${primaryColor};
  --slidev-theme-secondary: ${secondaryColor};
  --slidev-code-background: ${codeBackground};
  --slidev-code-color: ${codeColor};
}

.slidev-layout h1 {
  font-family: ${headingFont};
  color: var(--slidev-theme-primary);
}

.slidev-layout code {
  font-family: ${codeFont};
  font-size: ${codeFontSize};
}
```

## Presenter Tools

### Speaker Notes Pattern
```markdown
<!--
Key points to cover:
1. ${point1}
2. ${point2}
3. ${point3}

Timing: ${duration} minutes

Demo: ${demoInstructions}

Transition: ${transitionToNext}
-->
```

### Presenter View Elements
```markdown
<div class="absolute bottom-0 right-0 p-2 text-sm opacity-50">
  Time: ~${estimatedMinutes} min
</div>

<SpeakerNote>
  ${detailedNotes}
</SpeakerNote>
```

## Export Optimizations

### PDF Export Config
```yaml
exportPDF:
  format: 'A4'
  timeout: 60000
  dark: false
  withClicks: false
  withToc: true
```

### Recording Config
```yaml
record:
  camera: true
  microphone: true
  resolution: '1920x1080'
  fps: 30
```

## Quality Patterns

### Accessibility
- Always include alt text for images
- Use semantic headings
- Ensure color contrast
- Provide text alternatives for diagrams

### Performance
- Optimize images (use .webp when possible)
- Lazy load heavy components
- Minimize custom animations
- Use CSS transforms over JavaScript

### Best Practices
```javascript
const SLIDEV_BEST_PRACTICES = {
  slidesPerHour: 30-40,  // Optimal pace
  codePerSlide: '< 20 lines',  // Readable limit
  animationsPerSlide: '< 3',  // Avoid overwhelming
  textPerSlide: '< 50 words',  // Scannable
  imagesQuality: '1920x1080',  // Full HD
  fontSizeMin: '1rem',  // Readable from back
};
```

## Integration Example

```javascript
class SlidevSkill {
  async generatePresentation(task, context) {
    // Gather Slidev-specific requirements
    const config = await this.gatherConfig(task);
    
    // Generate frontmatter
    const frontmatter = this.generateFrontmatter(config, context);
    
    // Generate slides based on content type
    const slides = [];
    
    // Opening
    slides.push(this.generateTitleSlide(context));
    
    // Content slides
    for (const section of context.sections) {
      if (section.hasCode) {
        slides.push(this.generateCodeSlide(section, config));
      } else if (section.hasDiagram) {
        slides.push(this.generateDiagramSlide(section));
      } else {
        slides.push(this.generateContentSlide(section, config));
      }
    }
    
    // Closing
    slides.push(this.generateEndSlide(context));
    
    // Combine with proper separators
    return [frontmatter, ...slides].join('\n\n---\n\n');
  }
  
  generateCodeSlide(section, config) {
    const { code, language, highlights } = section;
    
    return `
# ${section.title}

\`\`\`${language} {${highlights.join('|')}}
${code}
\`\`\`

${section.explanation ? `\n<div v-click class="mt-4">\n${section.explanation}\n</div>` : ''}

<!--
${section.speakerNotes || 'Explain the code step by step'}
-->`;
  }
}
```

## Common Slide Patterns Library

### Agenda Slide
```markdown
---
layout: default
---

# Agenda

<Toc maxDepth="1" />
```

### Comparison Slide
```markdown
---
layout: two-cols
---

# Approach Comparison

::left::

## Traditional Method
- ❌ Slow
- ❌ Manual
- ❌ Error-prone
- ❌ Hard to maintain

::right::

## Our Solution
- ✅ Fast
- ✅ Automated
- ✅ Reliable
- ✅ Self-updating
```

### Demo Slide
```markdown
---
layout: iframe-right
url: ${demoUrl}
---

# Live Demo

## What We'll See
- ${demoPoint1}
- ${demoPoint2}
- ${demoPoint3}

<div class="text-sm text-gray-500 mt-10">
  Demo environment: ${demoEnvironment}
</div>
```

### Q&A Slide
```markdown
---
layout: center
class: text-center
---

# Questions?

<div class="text-2xl mb-10">
  ${contactInfo}
</div>

<div class="flex justify-center gap-4">
  <a href="${github}" target="_blank">
    <carbon-logo-github class="text-3xl" />
  </a>
  <a href="${twitter}" target="_blank">
    <carbon-logo-twitter class="text-3xl" />
  </a>
  <a href="${linkedin}" target="_blank">
    <carbon-logo-linkedin class="text-3xl" />
  </a>
</div>
```

## Usage in Implementation Coach

```javascript
// Implementation Coach routes to this skill
if (task.type === 'slides' && format === 'slidev') {
  const slidevSkill = new SlidevSkill();
  const requirements = await slidevSkill.gatherRequirements(task);
  const presentation = await slidevSkill.generatePresentation(task, {
    ...context,
    ...requirements
  });
  
  // Save to file
  await saveFile(`${task.module}-slides.md`, presentation);
  
  // Provide usage instructions
  return {
    content: presentation,
    file: `${task.module}-slides.md`,
    instructions: 'Run: npx slidev [filename] to present',
    exportPDF: 'Run: npx slidev export [filename]'
  };
}
```

This skill ensures all Slidev presentations follow best practices while leveraging the full power of Slidev's features.