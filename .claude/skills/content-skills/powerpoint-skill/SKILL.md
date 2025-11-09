# PowerPoint Content Skill

## Purpose
Generates professional PowerPoint presentations using brand templates, animations, and corporate design standards.

## Parent Skill
Called by Implementation Coach when task involves slides and format is PowerPoint/PPTX

## Integration with PPTX Skill
This skill leverages the `/mnt/skills/public/pptx/SKILL.md` for core PPTX generation while adding course-specific intelligence.

## Information Gathering

### Stage 1: Template & Branding
**Questions**:
1. "Do you have a PowerPoint template file? (.potx or .pptx)"
2. "Company brand colors? (hex codes preferred)"
3. "Required logos or watermarks?"
4. "Any compliance requirements? (copyright, disclaimers)"

### Stage 2: Presentation Style
**Questions**:
1. "Animation level? (none/subtle/moderate/dynamic)"
2. "Slide transitions? (none/fade/push/morph)"
3. "Include slide numbers and footers?"
4. "Need printable handouts version?"

### Stage 3: Media & Interactivity
**Questions**:
1. "Will you embed videos?"
2. "Need interactive elements? (hyperlinks/buttons)"
3. "Include Excel charts or data?"
4. "Want action buttons for navigation?"

## PowerPoint Generation Architecture

```javascript
class PowerPointSkill {
  constructor() {
    this.PptxGenJS = require('pptxgenjs');
    this.pptxSkillPath = '/mnt/skills/public/pptx/SKILL.md';
  }
  
  async initialize() {
    // Load PPTX skill best practices
    this.pptxGuidance = await this.loadSkill(this.pptxSkillPath);
    this.templates = await this.loadTemplates();
  }
  
  async generatePresentation(task, context) {
    // 1. Create presentation with brand
    const pres = await this.setupPresentation(context);
    
    // 2. Apply master slides
    await this.applyMasterSlides(pres, context.template);
    
    // 3. Generate slides
    for (const section of context.sections) {
      await this.addSlide(pres, section);
    }
    
    // 4. Apply animations and transitions
    await this.applyAnimations(pres, context.animationLevel);
    
    // 5. Generate file
    return await pres.writeFile({ fileName: task.filename });
  }
}
```

## Slide Layouts

### Title Slide Layout
```javascript
function createTitleSlide(pres, content) {
  const slide = pres.addSlide({ masterName: 'TITLE_SLIDE' });
  
  // Title
  slide.addText(content.title, {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 2,
    fontSize: 44,
    bold: true,
    color: content.brandColors.primary,
    align: 'center',
    fontFace: content.fonts.heading
  });
  
  // Subtitle
  slide.addText(content.subtitle, {
    x: 1,
    y: 3.5,
    w: 8,
    h: 1,
    fontSize: 24,
    color: content.brandColors.secondary,
    align: 'center',
    fontFace: content.fonts.body
  });
  
  // Author/Date
  slide.addText(`${content.author} | ${content.date}`, {
    x: 0.5,
    y: 5.5,
    w: 9,
    h: 0.5,
    fontSize: 14,
    color: '666666',
    align: 'center'
  });
  
  // Company logo
  if (content.logo) {
    slide.addImage({
      path: content.logo,
      x: 8.5,
      y: 0.3,
      w: 1.5,
      h: 0.75
    });
  }
  
  return slide;
}
```

### Content with Bullets Layout
```javascript
function createBulletSlide(pres, content) {
  const slide = pres.addSlide({ masterName: 'CONTENT' });
  
  // Slide title
  slide.addText(content.title, {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.75,
    fontSize: 32,
    bold: true,
    color: content.brandColors.primary
  });
  
  // Bullet points with animation
  const bullets = content.bullets.map(bullet => ({
    text: bullet.text,
    options: {
      bullet: { code: '2022' },  // Unicode bullet
      indentLevel: bullet.level || 0,
      fontSize: bullet.level > 0 ? 16 : 18,
      color: content.brandColors.text,
      paraSpaceAfter: 6
    }
  }));
  
  slide.addText(bullets, {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 4,
    fontFace: content.fonts.body,
    lineSpacing: 36
  });
  
  // Add entrance animation
  if (content.animate) {
    bullets.forEach((bullet, index) => {
      bullet.options.animate = {
        effect: 'fadeIn',
        delay: index * 500  // Stagger animations
      };
    });
  }
  
  return slide;
}
```

### Two-Column Layout
```javascript
function createTwoColumnSlide(pres, content) {
  const slide = pres.addSlide({ masterName: 'TWO_CONTENT' });
  
  // Title
  slide.addText(content.title, {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.75,
    fontSize: 32,
    bold: true,
    color: content.brandColors.primary
  });
  
  // Left column
  slide.addText(content.leftTitle, {
    x: 0.5,
    y: 1.5,
    w: 4.25,
    h: 0.5,
    fontSize: 20,
    bold: true,
    color: content.brandColors.secondary
  });
  
  slide.addText(content.leftContent, {
    x: 0.5,
    y: 2,
    w: 4.25,
    h: 3.5,
    fontSize: 16,
    fontFace: content.fonts.body
  });
  
  // Right column
  slide.addText(content.rightTitle, {
    x: 5.25,
    y: 1.5,
    w: 4.25,
    h: 0.5,
    fontSize: 20,
    bold: true,
    color: content.brandColors.secondary
  });
  
  slide.addText(content.rightContent, {
    x: 5.25,
    y: 2,
    w: 4.25,
    h: 3.5,
    fontSize: 16,
    fontFace: content.fonts.body
  });
  
  return slide;
}
```

### Code Display Layout
```javascript
function createCodeSlide(pres, content) {
  const slide = pres.addSlide({ masterName: 'CONTENT' });
  
  // Title
  slide.addText(content.title, {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.75,
    fontSize: 28,
    bold: true,
    color: content.brandColors.primary
  });
  
  // Code block with syntax highlighting simulation
  const codeLines = content.code.split('\n').map((line, index) => ({
    text: line,
    options: {
      fontSize: 14,
      fontFace: 'Courier New',
      color: getCodeColor(line, content.language),
      breakLine: true,
      indentLevel: getIndentLevel(line)
    }
  }));
  
  // Add code in a shaped box
  slide.addShape('rect', {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 4,
    fill: { color: 'F5F5F5' },
    line: { color: 'CCCCCC', width: 1 }
  });
  
  slide.addText(codeLines, {
    x: 0.75,
    y: 1.75,
    w: 8.5,
    h: 3.5,
    valign: 'top'
  });
  
  // Add explanation if provided
  if (content.explanation) {
    slide.addText(content.explanation, {
      x: 0.5,
      y: 5.75,
      w: 9,
      h: 1,
      fontSize: 14,
      color: '666666',
      fontFace: content.fonts.body
    });
  }
  
  return slide;
}
```

## Animation Patterns

### Progressive Disclosure
```javascript
function applyProgressiveDisclosure(slide, elements) {
  elements.forEach((element, index) => {
    element.options = {
      ...element.options,
      animate: {
        effect: 'fadeIn',
        trigger: 'onClick',
        delay: index * 300,
        duration: 500
      }
    };
  });
}
```

### Emphasis Animations
```javascript
function applyEmphasisAnimation(element, type = 'pulse') {
  const animations = {
    pulse: { effect: 'pulse', duration: 1000, repeat: 2 },
    highlight: { effect: 'changeFillColor', to: 'FFFF00', duration: 500 },
    grow: { effect: 'grow', by: 1.2, duration: 300 }
  };
  
  element.options.animate = animations[type];
}
```

## Chart Integration

### Data Visualization
```javascript
function createChartSlide(pres, content) {
  const slide = pres.addSlide({ masterName: 'CONTENT' });
  
  slide.addChart(pres.ChartType.bar, content.data, {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 4,
    
    showTitle: true,
    title: content.chartTitle,
    
    showLegend: true,
    legendPos: 'b',
    
    showValue: true,
    dataLabelPosition: 'outEnd',
    
    barGrouping: 'clustered',
    
    catAxisTitle: content.xAxisLabel,
    valAxisTitle: content.yAxisLabel,
    
    chartColors: content.brandColors.chartPalette
  });
}
```

## Brand Compliance

### Template System
```javascript
async function applyBrandTemplate(pres, brandConfig) {
  // Define master slides
  pres.defineSlideMaster({
    title: 'CORPORATE_MASTER',
    background: { color: brandConfig.colors.background },
    objects: [
      // Header bar
      {
        rect: {
          x: 0, y: 0, w: '100%', h: 0.75,
          fill: { color: brandConfig.colors.primary }
        }
      },
      // Footer
      {
        text: {
          text: brandConfig.footer,
          options: {
            x: 0, y: '95%', w: '100%', h: '5%',
            fontSize: 10,
            color: brandConfig.colors.muted,
            align: 'center'
          }
        }
      },
      // Logo
      {
        image: {
          x: '90%', y: 0.1, w: 1.5, h: 0.5,
          path: brandConfig.logoPath
        }
      }
    ]
  });
  
  // Apply to all slides
  pres.slides.forEach(slide => {
    slide.masterName = 'CORPORATE_MASTER';
  });
}
```

## Speaker Notes

### Adding Presenter Notes
```javascript
function addSpeakerNotes(slide, notes) {
  slide.addNotes(notes.join('\n'));
  
  // Also create a separate notes view
  const notesContent = `
SLIDE: ${slide.number} - ${slide.title}
TIME: ${notes.timing || '2 minutes'}

TALKING POINTS:
${notes.points.map((p, i) => `${i + 1}. ${p}`).join('\n')}

KEY MESSAGE:
${notes.keyMessage}

TRANSITION:
${notes.transition}
  `;
  
  slide.speakerNotes = notesContent;
}
```

## Export Options

### Multiple Formats
```javascript
async function exportPresentation(pres, options) {
  const exports = [];
  
  // Standard presentation
  if (options.standard) {
    exports.push(pres.writeFile({ 
      fileName: `${options.name}.pptx` 
    }));
  }
  
  // Handout version (multiple slides per page)
  if (options.handout) {
    const handoutPres = clonePresentation(pres);
    handoutPres.slides.forEach(slide => {
      slide.removeAnimations();
      slide.layout = 'handout';
    });
    exports.push(handoutPres.writeFile({ 
      fileName: `${options.name}-handout.pptx` 
    }));
  }
  
  // PDF version
  if (options.pdf) {
    exports.push(pres.writeFile({ 
      fileName: `${options.name}.pdf`,
      fileType: 'pdf'
    }));
  }
  
  return Promise.all(exports);
}
```

## Quality Checks

### Accessibility Compliance
```javascript
function checkAccessibility(presentation) {
  const issues = [];
  
  presentation.slides.forEach(slide => {
    // Check alt text for images
    slide.images.forEach(img => {
      if (!img.altText) {
        issues.push(`Slide ${slide.number}: Missing alt text for image`);
      }
    });
    
    // Check color contrast
    slide.textElements.forEach(text => {
      const contrast = calculateContrast(text.color, slide.background);
      if (contrast < 4.5) {
        issues.push(`Slide ${slide.number}: Low contrast text`);
      }
    });
    
    // Check reading order
    if (!slide.readingOrder) {
      issues.push(`Slide ${slide.number}: No reading order defined`);
    }
  });
  
  return issues;
}
```

## Integration with Implementation Coach

```javascript
// Implementation Coach routes to this skill
if (task.type === 'slides' && format === 'powerpoint') {
  const pptSkill = new PowerPointSkill();
  await pptSkill.initialize();
  
  const requirements = await pptSkill.gatherRequirements(task);
  const presentation = await pptSkill.generatePresentation(task, {
    ...context,
    ...requirements,
    brandConfig: await pptSkill.loadBrandConfig()
  });
  
  // Export in multiple formats
  const files = await pptSkill.exportPresentation(presentation, {
    standard: true,
    handout: true,
    pdf: context.needsPDF
  });
  
  return {
    files: files,
    primaryFile: `${task.module}-slides.pptx`,
    instructions: 'Open in PowerPoint to present or edit',
    accessibility: await pptSkill.checkAccessibility(presentation)
  };
}
```

This skill ensures PowerPoint presentations follow corporate standards while maintaining engagement and accessibility.