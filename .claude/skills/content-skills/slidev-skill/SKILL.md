# Slidev Content Skill

## Purpose
Generates high-quality Slidev markdown presentations with proper layouts, themes, code highlighting, interactive elements, and NaiveUI component integration for enhanced visual appeal and interactivity.

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

### NaiveUI Component Integration
- **Typography Components**: NText, NH1-NH6 for theme-aware semantic text
- **Interactive Elements**: NButton for CTAs, navigation, and demos
- **Content Grouping**: NCard for case studies, examples, and structured content
- **Responsive Layouts**: NGrid/NGi for multi-column responsive designs
- **Media Display**: NImage with preview/lightbox, NCarousel for rotating content
- **Code Presentation**: NCode with syntax highlighting and copy functionality
- **Tabbed Content**: NTabs for alternate views and code comparisons
- **Visual Separators**: NDivider for section breaks
- **Spacing Utilities**: NSpace for consistent gaps and alignment

Detailed NaiveUI component documentation available in `scripts/llms.md`

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

### Stage 4: NaiveUI Component Usage
**Questions**:
1. "Want interactive elements? (buttons, tabs, carousels)"
2. "Need card-based layouts for content grouping?"
3. "Require responsive grid layouts?"
4. "Want image galleries with lightbox?"
5. "Include code examples with copy button?"
6. "Use carousel for rotating quotes/images/testimonials?"

## NaiveUI Component Library

### What is NaiveUI?
NaiveUI is a Vue 3 component library offering a wide range of UI components with theme customization and TypeScript support. When integrated with Slidev, it provides:
- **Theme-aware components** that automatically adapt to light/dark modes
- **Interactive elements** for more engaging presentations
- **Consistent styling** across all components
- **Responsive layouts** that work on different screen sizes
- **Built-in accessibility** features

### When to Use NaiveUI
**Use NaiveUI when you need:**
- Interactive buttons and navigation elements
- Card-based layouts for grouping content
- Responsive multi-column layouts
- Image galleries with preview/lightbox
- Tabbed content for code comparisons or alternate views
- Theme-consistent typography and colors
- Advanced code presentation with copy functionality

**Keep it simple (plain Slidev) when:**
- Creating basic text-only slides
- Building minimal presentations
- Prioritizing load time over interactivity
- Content doesn't require complex layouts

### Setup Instructions

#### Installation
```bash
npm install naive-ui
```

#### Global Setup (setup/main.ts)
```typescript
import { defineAppSetup } from '@slidev/types'
import naive from 'naive-ui'

export default defineAppSetup(({ app, router }) => {
  app.use(naive)
})
```

#### Per-Slide Import
```markdown
<script setup>
import { NButton, NCard, NSpace, NGrid, NGi } from 'naive-ui'
</script>
```

### Component Selection Guide

| Component | Use Case | Key Props | Example |
|-----------|----------|-----------|---------|
| **NButton** | CTAs, navigation | type, size, loading | `<NButton type="primary">Next</NButton>` |
| **NCard** | Content grouping | title, hoverable, cover | `<NCard title="Topic">...</NCard>` |
| **NGrid/NGi** | Responsive layouts | cols, x-gap, span | `<NGi :xs="24" :lg="12">...</NGi>` |
| **NSpace** | Simple spacing | size, vertical, align | `<NSpace size="large">...</NSpace>` |
| **NImage** | Images with preview | src, lazy, preview-disabled | `<NImage src="..." />` |
| **NCarousel** | Rotating content | autoplay, interval, effect | `<NCarousel autoplay>...</NCarousel>` |
| **NCode** | Code snippets | language, line-numbers, copyable | `<NCode language="js">...</NCode>` |
| **NTabs** | Alternate views | type, justify-content | `<NTabs type="card">...</NTabs>` |
| **NDivider** | Section separators | dashed, title-placement | `<NDivider>Section</NDivider>` |
| **NText** | Styled text | type, depth, strong | `<NText type="primary">...</NText>` |
| **NH1-NH6** | Semantic headings | (standard) | `<NH1>Title</NH1>` |

### NaiveUI-Enhanced Slide Templates

#### Hero Slide with Interactive Button
```markdown
---
layout: center
---

<script setup>
import { NButton, NH1, NText } from 'naive-ui'
</script>

<NH1>Welcome to Business Agility Fundamentals</NH1>

<NText depth="3" class="text-xl mt-4">
Transform your organization's ability to adapt and thrive in uncertainty
</NText>

<div class="mt-8">
  <NButton type="primary" size="large" @click="$slidev.nav.next">
    Start Learning →
  </NButton>
</div>

<!--
Opening slide: Use the button to advance to build anticipation
Timing: ~30 seconds
-->
```

#### Card-Based Content Layout
```markdown
---
layout: default
---

<script setup>
import { NCard, NSpace, NButton, NImage } from 'naive-ui'
</script>

# The Three Pillars of Lean

<NSpace vertical size="large">
  <NCard title="Respect for People" hoverable>
    <template #cover>
      <NImage src="/images/people.jpg" alt="Respect for People" />
    </template>
    Workers closest to the work know best how to improve it.
    Trust teams to solve problems and create lasting change.
    <template #footer>
      <NButton text type="primary" @click="showDetails('respect')">
        Learn More →
      </NButton>
    </template>
  </NCard>

  <NCard title="Continuous Improvement" hoverable>
    <template #cover>
      <NImage src="/images/kaizen.jpg" alt="Continuous Improvement" />
    </template>
    Small, incremental changes compound into remarkable results.
    Make improvement everyone's responsibility.
    <template #footer>
      <NButton text type="primary" @click="showDetails('improvement')">
        Learn More →
      </NButton>
    </template>
  </NCard>

  <NCard title="Challenge" hoverable>
    <template #cover>
      <NImage src="/images/challenge.jpg" alt="Challenge" />
    </template>
    Question assumptions and push beyond comfort zones.
    Growth happens at the edge of capability.
    <template #footer>
      <NButton text type="primary" @click="showDetails('challenge')">
        Learn More →
      </NButton>
    </template>
  </NCard>
</NSpace>

<!--
Key points:
- Each pillar is equally important
- They reinforce each other
- Explain how they work together in practice
Demo: Click through to show detailed examples
-->
```

#### Responsive Grid Layout
```markdown
---
layout: default
---

<script setup>
import { NGrid, NGi, NCard, NText } from 'naive-ui'
</script>

# Agile Framework Comparison

<NGrid :cols="24" x-gap="16" y-gap="16">
  <NGi :xs="24" :sm="12" :lg="8">
    <NCard title="Scrum" hoverable>
      <NText depth="2">Iterative framework with fixed-length sprints</NText>
      <ul class="mt-4">
        <li>Sprint Planning</li>
        <li>Daily Standups</li>
        <li>Sprint Review</li>
        <li>Retrospectives</li>
      </ul>
      <template #footer>
        <NText type="success" strong>Best for: Product development</NText>
      </template>
    </NCard>
  </NGi>

  <NGi :xs="24" :sm="12" :lg="8">
    <NCard title="Kanban" hoverable>
      <NText depth="2">Flow-based approach with WIP limits</NText>
      <ul class="mt-4">
        <li>Visualize workflow</li>
        <li>Limit WIP</li>
        <li>Manage flow</li>
        <li>Continuous delivery</li>
      </ul>
      <template #footer>
        <NText type="info" strong>Best for: Operations & support</NText>
      </template>
    </NCard>
  </NGi>

  <NGi :xs="24" :sm="24" :lg="8">
    <NCard title="Scrumban" hoverable>
      <NText depth="2">Hybrid approach combining both methods</NText>
      <ul class="mt-4">
        <li>Scrum ceremonies</li>
        <li>Kanban board</li>
        <li>Flexible planning</li>
        <li>Flow metrics</li>
      </ul>
      <template #footer>
        <NText type="warning" strong>Best for: Transitioning teams</NText>
      </template>
    </NCard>
  </NGi>
</NGrid>

<!--
Responsive behavior:
- Large screens: 3 columns side-by-side
- Medium screens: 2 columns (Scrumban wraps)
- Small screens: Stack vertically
Timing: 3-4 minutes to cover all three
-->
```

#### Tabbed Code Examples
```markdown
---
layout: default
---

<script setup>
import { NTabs, NTabPane, NCode } from 'naive-ui'
import { ref } from 'vue'

const activeTab = ref('javascript')
</script>

# User Story Implementation Examples

<NTabs v-model:value="activeTab" type="card" justify-content="center">
  <NTabPane name="javascript" tab="JavaScript">
    <NCode language="javascript" line-numbers copyable>
// User story: As a user, I want to filter products by category
class ProductFilter {
  constructor(products) {
    this.products = products;
  }

  filterByCategory(category) {
    return this.products.filter(p => p.category === category);
  }

  getCategories() {
    return [...new Set(this.products.map(p => p.category))];
  }
}

// Usage
const filter = new ProductFilter(products);
const electronics = filter.filterByCategory('electronics');
    </NCode>
  </NTabPane>

  <NTabPane name="python" tab="Python">
    <NCode language="python" line-numbers copyable>
# User story: As a user, I want to filter products by category
class ProductFilter:
    def __init__(self, products):
        self.products = products

    def filter_by_category(self, category):
        return [p for p in self.products if p.category == category]

    def get_categories(self):
        return list(set(p.category for p in self.products))

# Usage
filter = ProductFilter(products)
electronics = filter.filter_by_category('electronics')
    </NCode>
  </NTabPane>

  <NTabPane name="typescript" tab="TypeScript">
    <NCode language="typescript" line-numbers copyable>
// User story: As a user, I want to filter products by category
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
}

class ProductFilter {
  constructor(private products: Product[]) {}

  filterByCategory(category: string): Product[] {
    return this.products.filter(p => p.category === category);
  }

  getCategories(): string[] {
    return [...new Set(this.products.map(p => p.category))];
  }
}

// Usage
const filter = new ProductFilter(products);
const electronics = filter.filterByCategory('electronics');
    </NCode>
  </NTabPane>
</NTabs>

<!--
Show how the same user story is implemented in different languages
Note the copyable prop - attendees can grab the code
Timing: 2-3 minutes per language
-->
```

#### Image Carousel for Testimonials
```markdown
---
layout: center
---

<script setup>
import { NCarousel, NCard, NText, NSpace } from 'naive-ui'
</script>

# Customer Success Stories

<NCarousel autoplay :interval="4000" show-arrow effect="fade">
  <NCarouselItem>
    <NCard>
      <NSpace vertical align="center">
        <NImage
          src="/testimonials/company1-logo.png"
          alt="Company 1"
          width="200"
          preview-disabled
        />
        <NText class="text-xl italic">
          "Implementing business agility transformed our delivery speed by 300%.
          We now respond to market changes in days, not months."
        </NText>
        <NText depth="2">— Sarah Johnson, CTO at TechCorp</NText>
      </NSpace>
    </NCard>
  </NCarouselItem>

  <NCarouselItem>
    <NCard>
      <NSpace vertical align="center">
        <NImage
          src="/testimonials/company2-logo.png"
          alt="Company 2"
          width="200"
          preview-disabled
        />
        <NText class="text-xl italic">
          "The workshop gave our teams practical tools they could use immediately.
          Employee satisfaction scores jumped 40% in the first quarter."
        </NText>
        <NText depth="2">— Michael Chen, VP Operations at RetailMax</NText>
      </NSpace>
    </NCard>
  </NCarouselItem>

  <NCarouselItem>
    <NCard>
      <NSpace vertical align="center">
        <NImage
          src="/testimonials/company3-logo.png"
          alt="Company 3"
          width="200"
          preview-disabled
        />
        <NText class="text-xl italic">
          "We went from waterfall chaos to smooth continuous delivery.
          The ROI was clear within 6 months."
        </NText>
        <NText depth="2">— Lisa Martinez, Director of Engineering at FinanceHub</NText>
      </NSpace>
    </NCard>
  </NCarouselItem>
</NCarousel>

<!--
Let carousel auto-rotate or use arrows to control
Each testimonial gets 4 seconds (can pause with arrows)
Timing: ~30-45 seconds total
-->
```

#### Enhanced Code Presentation with NCode
```markdown
---
layout: default
---

<script setup>
import { NCode, NSpace, NText, NDivider } from 'naive-ui'
</script>

# TDD Cycle: Red-Green-Refactor

<NSpace vertical size="large">
  <div>
    <NText type="error" strong class="text-lg">1. RED - Write Failing Test</NText>
    <NCode language="javascript" line-numbers copyable :highlight-lines="[5, 6, 7]">
describe('UserValidator', () => {
  it('should reject invalid email addresses', () => {
    const validator = new UserValidator();

    // This test will fail initially
    const result = validator.validateEmail('invalid-email');
    expect(result.valid).toBe(false);
  });
});
    </NCode>
  </div>

  <NDivider />

  <div>
    <NText type="success" strong class="text-lg">2. GREEN - Make Test Pass</NText>
    <NCode language="javascript" line-numbers copyable :highlight-lines="[2, 3, 4]">
class UserValidator {
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return { valid: emailRegex.test(email) };
  }
}
    </NCode>
  </div>

  <NDivider />

  <div>
    <NText type="info" strong class="text-lg">3. REFACTOR - Improve Code</NText>
    <NCode language="javascript" line-numbers copyable :highlight-lines="[2, 3, 4, 5, 6, 7, 8]">
class UserValidator {
  private static EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  validateEmail(email: string): ValidationResult {
    const valid = UserValidator.EMAIL_REGEX.test(email);
    const message = valid ? 'Valid email' : 'Invalid email format';
    return { valid, message };
  }
}
    </NCode>
  </div>
</NSpace>

<!--
Walk through the three phases
Highlight lines show the key changes in each step
Note the copyable prop for hands-on practice
Timing: 5-7 minutes with explanation
-->
```

#### Divider Usage for Section Breaks
```markdown
---
layout: default
---

<script setup>
import { NDivider, NText, NSpace } from 'naive-ui'
</script>

# Agile Manifesto

<NSpace vertical size="large">
  <div>
    <NText strong class="text-lg">Individuals and interactions</NText>
    <NText depth="3">over processes and tools</NText>
  </div>

  <NDivider dashed />

  <div>
    <NText strong class="text-lg">Working software</NText>
    <NText depth="3">over comprehensive documentation</NText>
  </div>

  <NDivider dashed />

  <div>
    <NText strong class="text-lg">Customer collaboration</NText>
    <NText depth="3">over contract negotiation</NText>
  </div>

  <NDivider dashed />

  <div>
    <NText strong class="text-lg">Responding to change</NText>
    <NText depth="3">over following a plan</NText>
  </div>
</NSpace>

<NDivider title-placement="center">
  <NText depth="2" italic>While there is value in the items on the right, we value the items on the left more.</NText>
</NDivider>

<!--
Use dividers to separate each value pair
Final divider with centered text for the footnote
Timing: 2-3 minutes
-->
```

### NaiveUI Best Practices

#### When to Use NaiveUI Components

**Use NaiveUI when:**
- Creating interactive demonstrations or workshops
- Building complex multi-column layouts
- Showing tabbed code examples or comparisons
- Displaying image galleries or carousels
- Need theme-consistent buttons and CTAs
- Want copyable code snippets
- Building responsive presentations

**Keep it simple (plain Slidev) when:**
- Creating basic bullet-point slides
- Building minimalist presentations
- Content is purely text-based
- Prioritizing fastest load times
- Slides don't require interactivity

#### Performance Considerations

- **Lazy load images**: Use `lazy` prop on NImage for images in later slides
- **Limit carousel items**: Keep carousels to 3-5 items for smooth performance
- **Tab content strategy**: Use `display-directive="if"` on NTabPane to unmount inactive tabs
- **Responsive breakpoints**: Use NGrid breakpoints (xs, sm, md, lg, xl) for mobile optimization
- **CSS transforms**: Leverage NaiveUI's built-in animations rather than custom JavaScript

#### Accessibility Guidelines

- **Alt text**: Always provide meaningful `alt` text for NImage components
- **Button labels**: Use clear, descriptive text in NButton (avoid icon-only without aria-label)
- **Keyboard navigation**: NTabs and NCarousel support keyboard navigation by default
- **Color contrast**: Rely on NaiveUI's theme system for WCAG-compliant contrast
- **Semantic headings**: Use NH1-NH6 instead of styled divs for proper document structure
- **Focus management**: Test tab order with keyboard navigation

#### Theme Integration

```markdown
<script setup>
import { NConfigProvider, darkTheme } from 'naive-ui'
import { computed } from 'vue'

// Detect Slidev's dark mode
const isDark = computed(() => $slidev.themeConfigs.dark)
</script>

<NConfigProvider :theme="isDark ? darkTheme : null">
  <!-- Your NaiveUI components here will respect Slidev's theme -->
</NConfigProvider>
```

#### Responsive Design Patterns

```markdown
<!-- Mobile-first responsive grid -->
<NGrid :cols="24" x-gap="16" y-gap="16">
  <!-- Full width on mobile, half on tablet, third on desktop -->
  <NGi :xs="24" :sm="12" :lg="8">
    <NCard title="Feature 1">...</NCard>
  </NGi>
  <NGi :xs="24" :sm="12" :lg="8">
    <NCard title="Feature 2">...</NCard>
  </NGi>
  <NGi :xs="24" :sm="24" :lg="8">
    <NCard title="Feature 3">...</NCard>
  </NGi>
</NGrid>
```

**Breakpoint Reference**:
- `xs`: < 480px (mobile portrait)
- `sm`: 480px - 768px (mobile landscape, small tablets)
- `md`: 768px - 992px (tablets)
- `lg`: 992px - 1200px (small desktops)
- `xl`: 1200px+ (large desktops)

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

    // Opening (potentially with NaiveUI button for interactive start)
    slides.push(this.generateTitleSlide(context, config.useNaiveUI));

    // Content slides
    for (const section of context.sections) {
      if (section.hasCode && config.useNaiveUI) {
        // Use NCode for enhanced code presentation
        slides.push(this.generateNaiveUICodeSlide(section, config));
      } else if (section.hasCode) {
        slides.push(this.generateCodeSlide(section, config));
      } else if (section.hasDiagram) {
        slides.push(this.generateDiagramSlide(section));
      } else if (section.needsCards && config.useNaiveUI) {
        // Use NCard for grouped content
        slides.push(this.generateCardSlide(section, config));
      } else if (section.needsGrid && config.useNaiveUI) {
        // Use NGrid for responsive layout
        slides.push(this.generateGridSlide(section, config));
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

  generateNaiveUICodeSlide(section, config) {
    const { code, language, highlights } = section;
    const imports = ['NCode', 'NText', 'NSpace'];

    return `
---
layout: default
---

<script setup>
import { ${imports.join(', ')} } from 'naive-ui'
</script>

# ${section.title}

<NSpace vertical size="large">
  ${section.description ? `<NText depth="2">${section.description}</NText>` : ''}

  <NCode language="${language}" line-numbers copyable${highlights.length > 0 ? ` :highlight-lines="[${highlights.join(', ')}]"` : ''}>
${code}
  </NCode>

  ${section.explanation ? `<NText type="info">${section.explanation}</NText>` : ''}
</NSpace>

<!--
${section.speakerNotes || 'Explain the code step by step'}
Note: Code is copyable for attendees
-->`;
  }

  generateCardSlide(section, config) {
    const cards = section.items || [];

    return `
---
layout: default
---

<script setup>
import { NCard, NSpace, NButton, NImage } from 'naive-ui'
</script>

# ${section.title}

<NSpace vertical size="large">
${cards.map(card => `
  <NCard title="${card.title}" hoverable>
    ${card.image ? `<template #cover>
      <NImage src="${card.image}" alt="${card.title}" />
    </template>` : ''}
    ${card.content}
    ${card.action ? `<template #footer>
      <NButton text type="primary">${card.action}</NButton>
    </template>` : ''}
  </NCard>
`).join('\n')}
</NSpace>

<!--
${section.speakerNotes || 'Walk through each card'}
-->`;
  }

  generateGridSlide(section, config) {
    const items = section.items || [];
    const colsPerRow = section.columns || 3;
    const lgSpan = Math.floor(24 / colsPerRow);

    return `
---
layout: default
---

<script setup>
import { NGrid, NGi, NCard, NText } from 'naive-ui'
</script>

# ${section.title}

<NGrid :cols="24" x-gap="16" y-gap="16">
${items.map((item, idx) => `
  <NGi :xs="24" :sm="12" :lg="${lgSpan}">
    <NCard title="${item.title}" hoverable>
      <NText depth="2">${item.description}</NText>
      ${item.content ? `<div class="mt-4">${item.content}</div>` : ''}
    </NCard>
  </NGi>
`).join('')}
</NGrid>

<!--
Responsive layout:
- Large screens: ${colsPerRow} columns
- Medium screens: 2 columns
- Small screens: 1 column (stacked)
${section.speakerNotes || ''}
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

  // Generate setup instructions if NaiveUI is used
  const setupInstructions = requirements.useNaiveUI
    ? `
Setup NaiveUI:
1. npm install naive-ui
2. Create setup/main.ts with NaiveUI configuration
3. See skill documentation for details
`
    : '';

  // Provide usage instructions
  return {
    content: presentation,
    file: `${task.module}-slides.md`,
    instructions: `Run: npx slidev [filename] to present${setupInstructions}`,
    exportPDF: 'Run: npx slidev export [filename]',
    features: {
      naiveUI: requirements.useNaiveUI,
      components: requirements.naiveUIComponents || []
    }
  };
}
```

This skill ensures all Slidev presentations follow best practices while leveraging the full power of Slidev's features and NaiveUI components for enhanced interactivity and visual appeal.

## Summary

The Slidev skill now supports both traditional Slidev markdown and NaiveUI-enhanced presentations. Key capabilities include:

**Core Slidev Features:**
- 30+ built-in layouts
- Theme customization and dark mode
- Code highlighting with Shiki
- Mermaid diagrams
- Vue component integration
- Presenter notes and recording

**NaiveUI Enhancements:**
- Interactive buttons and navigation (NButton)
- Card-based content layouts (NCard)
- Responsive grid systems (NGrid/NGi)
- Image galleries with lightbox (NImage)
- Code blocks with copy functionality (NCode)
- Tabbed content for comparisons (NTabs)
- Carousels for testimonials/quotes (NCarousel)
- Theme-aware typography (NText, NH1-NH6)
- Visual separators (NDivider)
- Spacing utilities (NSpace)

For detailed component documentation and advanced usage, refer to `scripts/llms.md`.