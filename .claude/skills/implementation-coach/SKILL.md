# Implementation Coach Skill (Extensible Router)

## Purpose
Routes content creation tasks to specialized skills (Slidev, PowerPoint, DOCX, etc.) while maintaining quality and consistency across all materials.

## MCP Tool Enhanced
`coursekit.implement` - Transforms basic implementation into skill-routed, high-quality content creation with format-specific expertise

## Architecture: Skill Router Pattern

```javascript
class ImplementationCoach {
  constructor() {
    this.contentSkills = new Map([
      ['slides-slidev', SlidevSkill],
      ['slides-pptx', PowerPointSkill],
      ['slides-google', GoogleSlidesSkill],
      ['exercise-markdown', ExerciseSkill],
      ['exercise-jupyter', JupyterSkill],
      ['docs-markdown', MarkdownDocsSkill],
      ['docs-docx', WordDocsSkill],
      ['assessment-forms', FormsSkill],
      ['video-script', VideoScriptSkill]
    ]);
  }
  
  async implementTask(task, context) {
    // 1. Identify content type and format
    const contentType = this.identifyContentType(task);
    const format = await this.determineFormat(contentType, context);
    
    // 2. Route to appropriate skill
    const skill = this.selectSkill(contentType, format);
    
    // 3. Gather skill-specific requirements
    const requirements = await skill.gatherRequirements(task, context);
    
    // 4. Generate content using specialized skill
    const content = await skill.generateContent(requirements);
    
    // 5. Apply quality checks and consistency
    return await this.qualityAssurance(content, context);
  }
}
```

## Information Gathering Flow

### Stage 1: Task Analysis
**Questions to Ask:**
1. "What specific task are we implementing?"
2. "Who's the audience for this content?"
3. "What's the delivery medium?"
4. "Any format requirements or constraints?"

**What We're Building:**
- Content type identification
- Format selection
- Constraint mapping
- Audience alignment

### Stage 2: Format & Tool Selection
**Questions to Ask:**
1. "What's your preferred tool for [content type]?"
2. "Any existing templates to follow?"
3. "Brand guidelines to apply?"
4. "Technical constraints?"

**Routing Decision Tree:**
```
Task: "Create slides for Module 1"
├── Format preference? 
│   ├── Markdown → Route to SlidevSkill
│   ├── PowerPoint → Route to PowerPointSkill
│   ├── Google Slides → Route to GoogleSlidesSkill
│   └── No preference → Recommend based on context
```

### Stage 3: Content Specification
**Delegated to Specialized Skill**
Each specialized skill asks its own specific questions

## Specialized Content Skills

### SlidevSkill
**Specializes in**: Markdown-based presentations with code
**Questions**:
- Theme preference?
- Code syntax highlighting needs?
- Animation preferences?
- Export requirements?

**Capabilities**:
```javascript
class SlidevSkill {
  async gatherRequirements(task, context) {
    return {
      theme: await this.askTheme(),
      layouts: await this.determineLayouts(context),
      codeBlocks: await this.identifyCodeNeeds(),
      animations: await this.askAnimationLevel()
    };
  }
  
  async generateContent(requirements) {
    return `---
theme: ${requirements.theme}
layout: cover
---

# ${requirements.title}

${requirements.subtitle}

---
layout: two-cols
---

# ${requirements.section}

::left::
${requirements.leftContent}

::right::
${requirements.rightContent}
`;
  }
}
```

### PowerPointSkill  
**Specializes in**: Professional PPTX presentations
**Questions**:
- Template file to use?
- Slide master preferences?
- Animation complexity?
- Handout format?

**Integration with PPTX Skill**:
```javascript
class PowerPointSkill {
  async generateContent(requirements) {
    // Read the PPTX skill documentation
    const pptxSkillDoc = await readSkill('/mnt/skills/public/pptx/SKILL.md');
    
    // Apply PPTX best practices
    const config = this.extractConfig(pptxSkillDoc);
    
    // Generate using pptxgenjs
    const pres = new PptxGenJS();
    pres.author = requirements.author;
    pres.company = requirements.company;
    
    // Apply skill-specific patterns
    this.applyTemplates(pres, requirements);
    this.addSlides(pres, requirements.content);
    
    return pres;
  }
}
```

### ExerciseSkill
**Specializes in**: Hands-on coding exercises
**Questions**:
- Difficulty level?
- Solution visibility?
- Test cases needed?
- Starter code complexity?

**Output Structure**:
```markdown
# Exercise: [Title]

## Learning Objectives
- [Generated from task context]

## Instructions
[Step-by-step guide]

## Starter Code
\`\`\`language
[Boilerplate code]
\`\`\`

## Tests
[Test cases]

## Solution
<details>
<summary>Click to reveal</summary>
[Complete solution with explanation]
</details>
```

### DocxSkill
**Specializes in**: Professional Word documents
**Questions**:
- Document template?
- Style guide to follow?
- Table of contents needed?
- Review tracking enabled?

**Integration with DOCX Skill**:
```javascript
class DocxSkill {
  async initialize() {
    // Read DOCX skill for best practices
    this.docxGuide = await readSkill('/mnt/skills/public/docx/SKILL.md');
  }
  
  async generateContent(requirements) {
    // Apply DOCX skill patterns
    const doc = new Document({
      creator: requirements.author,
      styles: this.loadStyles(requirements.template),
      numbering: this.configureNumbering()
    });
    
    // Generate sections
    for (const section of requirements.sections) {
      doc.addSection(this.createSection(section));
    }
    
    return doc;
  }
}
```

## Quality Assurance Framework

### Consistency Checks
```javascript
async qualityAssurance(content, context) {
  const checks = [
    this.checkBrandCompliance(content, context.brand),
    this.checkAccessibility(content),
    this.checkCompleteness(content, context.requirements),
    this.checkReadability(content, context.audience),
    this.checkTechnicalAccuracy(content)
  ];
  
  const results = await Promise.all(checks);
  
  if (results.every(r => r.passed)) {
    return { content, status: 'approved' };
  } else {
    const issues = results.filter(r => !r.passed);
    return { content, status: 'needs-revision', issues };
  }
}
```

## Extensibility: Adding New Skills

### Skill Registration Pattern
```javascript
// Register a new content skill
implementationCoach.registerSkill('video-loom', {
  matcher: /video|recording|screencast/i,
  skill: LoomVideoSkill,
  priority: 1
});

// Custom skill implementation
class LoomVideoSkill {
  async gatherRequirements(task, context) {
    return {
      duration: await this.askDuration(),
      style: await this.askPresentationStyle(),
      overlays: await this.askForOverlays()
    };
  }
  
  async generateContent(requirements) {
    return {
      script: this.generateScript(requirements),
      storyboard: this.createStoryboard(requirements),
      recordingGuide: this.createGuide(requirements)
    };
  }
}
```

### Dynamic Skill Loading
```javascript
async function loadSkillForTask(task) {
  // Check for user-provided skills first
  const userSkill = await checkUserSkills(task.type);
  if (userSkill) return userSkill;
  
  // Check public skills
  const publicSkill = await checkPublicSkills(task.type);
  if (publicSkill) return publicSkill;
  
  // Fall back to generic implementation
  return GenericImplementationSkill;
}
```

## Example Interaction

```
Human: Implement the Module 1 slides task

Assistant with Implementation Coach:

I'll help you create the Module 1 slides. Let me route you to the best tool 
for your needs.

**First, let's determine the format:**

What tool would you prefer for creating slides?
1. Slidev (Markdown-based, great for code)
2. PowerPoint (Professional, animations)
3. Google Slides (Collaborative, web-based)
4. Let me recommend based on your content

What's your preference?