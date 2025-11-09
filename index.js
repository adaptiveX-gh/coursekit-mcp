#!/usr/bin/env node

/**
 * CourseKit MCP Server - Standalone Implementation
 * 
 * This implements the MCP protocol directly without requiring
 * the @modelcontextprotocol/server-node package.
 * 
 * The server communicates via JSON-RPC 2.0 over stdin/stdout
 * which is how MCP servers interface with clients like Claude Desktop.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// JSON-RPC 2.0 Protocol Implementation
class JSONRPCServer {
  constructor() {
    this.methods = new Map();
    this.setupStdioTransport();
  }

  register(method, handler) {
    this.methods.set(method, handler);
  }

  setupStdioTransport() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    rl.on('line', async (line) => {
      try {
        const request = JSON.parse(line);
        const response = await this.handleRequest(request);
        if (response) {
          console.log(JSON.stringify(response));
        }
      } catch (error) {
        console.error('Error handling request:', error);
      }
    });
  }

  async handleRequest(request) {
    const { id, method, params } = request;
    
    if (!this.methods.has(method)) {
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32601,
          message: `Method not found: ${method}`
        }
      };
    }

    try {
      const handler = this.methods.get(method);
      const result = await handler(params);
      
      return {
        jsonrpc: '2.0',
        id,
        result
      };
    } catch (error) {
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32603,
          message: error.message
        }
      };
    }
  }
}

// CourseKit Implementation
class CourseKitServer {
  constructor() {
    this.projectDir = path.join(process.cwd(), '.coursekit');
    this.currentProject = {
      constitution: null,
      specification: null,
      plan: null,
      tasks: null,
      implementations: []
    };
  }

  async ensureProjectDir() {
    await fs.mkdir(this.projectDir, { recursive: true });
  }

  async saveArtifact(type, content) {
    await this.ensureProjectDir();
    const filename = `${type}.md`;
    const filepath = path.join(this.projectDir, filename);
    await fs.writeFile(filepath, content);
    return filepath;
  }

  async loadProject() {
    try {
      const files = ['constitution', 'specification', 'plan', 'tasks'];
      for (const file of files) {
        const filepath = path.join(this.projectDir, `${file}.md`);
        try {
          this.currentProject[file] = await fs.readFile(filepath, 'utf-8');
        } catch (e) {
          // File doesn't exist yet, that's ok
        }
      }
    } catch (e) {
      // Project doesn't exist yet
    }
  }

  // Tool implementations
  async handleConstitution(args) {
    const content = this.generateConstitution(args.vision);
    this.currentProject.constitution = content;
    const filepath = await this.saveArtifact('constitution', content);
    
    return {
      success: true,
      content: content,
      file: filepath,
      message: "Constitution created successfully"
    };
  }

  async handleSpecify(args) {
    const content = this.generateSpecification(args.description);
    this.currentProject.specification = content;
    const filepath = await this.saveArtifact('specification', content);
    
    return {
      success: true,
      content: content,
      file: filepath,
      message: "Specification created successfully"
    };
  }

  async handlePlan(args) {
    const content = this.generatePlan(args);
    this.currentProject.plan = content;
    const filepath = await this.saveArtifact('plan', content);
    
    return {
      success: true,
      content: content,
      file: filepath,
      message: "Plan created successfully"
    };
  }

  async handleTasks(args) {
    const content = this.generateTasks(args);
    this.currentProject.tasks = content;
    const filepath = await this.saveArtifact('tasks', content);
    
    return {
      success: true,
      content: content,
      file: filepath,
      message: "Tasks created successfully"
    };
  }

  async handleImplement(args) {
    const content = this.generateImplementation(args.task);
    
    const implFilename = `implementation-${Date.now()}.md`;
    const implPath = path.join(this.projectDir, implFilename);
    await this.ensureProjectDir();
    await fs.writeFile(implPath, content);
    
    this.currentProject.implementations.push({
      task: args.task,
      file: implFilename,
      content: content
    });
    
    return {
      success: true,
      content: content,
      file: implPath,
      message: `Implementation created for: ${args.task}`
    };
  }

  // Content generation methods
  generateConstitution(vision) {
    return `# Course Development Constitution

## Vision Statement
${vision}

## Core Principles
- **Learner-centered design**: Every decision prioritizes learner success
- **Active learning**: Minimize passive content, maximize hands-on practice  
- **Clear progression**: Each concept builds on the previous
- **Real-world application**: Use authentic examples and scenarios
- **Inclusive design**: Accessible to all learners regardless of background

## Target Audience Profile
- Technical background: Varied, from intermediate to advanced
- Learning style: Prefer hands-on experimentation
- Time constraints: Limited time for training
- Success metric: Can immediately apply skills to work

## Instructional Guidelines
- Start with why: Always explain the value before the how
- Show don't tell: Demonstrate concepts before explaining theory
- Practice immediately: Follow every concept with hands-on activity
- Iterate and refine: Build complexity gradually
- Check understanding: Regular knowledge checks and feedback loops

## Content Standards  
- Tone: Professional but approachable, avoiding jargon
- Examples: Industry-relevant and current
- Code: Production-ready, well-commented, following best practices
- Slides: Visual-first, minimal text, one concept per slide
- Exercises: Progressive difficulty with clear success criteria

## Constraints
- Duration: Fits within allocated time with 10% buffer
- Technology: Must work on standard developer machines
- Materials: All resources freely available or provided
- Format: Adaptable for remote or in-person delivery
- Class size: Optimized for 15-25 participants

## Assessment Strategy
- Formative: Quick polls and checks after each concept
- Practical: Hands-on exercises with peer review
- Summative: Capstone project demonstrating all skills
- Self-assessment: Reflection prompts and confidence ratings

Generated: ${new Date().toISOString()}`;
  }

  generateSpecification(description) {
    return `# Course Specification

## Overview
${description}

## Learning Outcomes
By the end of this course, learners will be able to:

1. **Remember**: Identify and list the key concepts and terminology
2. **Understand**: Explain the relationships between core concepts
3. **Apply**: Use the tools and techniques in practical scenarios
4. **Analyze**: Break down complex problems into manageable components
5. **Evaluate**: Assess different approaches and select the most appropriate
6. **Create**: Build original solutions combining multiple concepts

## Requirements

### Prerequisites
- Basic programming knowledge in at least one language
- Familiarity with command line interfaces
- Understanding of version control (Git basics)
- Access to a development environment

### Resources Needed  
- Development environment (VS Code or similar)
- Node.js 18+ and npm installed
- Internet connection for package installation
- GitHub account (optional but recommended)
- 8GB RAM minimum, 16GB recommended

### Success Criteria
- Learners can complete all exercises independently
- Final project demonstrates integration of all concepts
- Peer reviews show understanding and proper application
- Self-assessment indicates confidence in real-world application
- 80% or higher on knowledge checks

## Scope

### In Scope
- Core concepts and fundamentals
- Hands-on implementation practice
- Best practices and common patterns
- Troubleshooting common issues
- Real-world application examples
- Integration with existing workflows

### Out of Scope
- Advanced optimization techniques
- Legacy system migration strategies
- Organizational change management
- Production deployment at scale
- Performance tuning for edge cases
- Custom framework development

## Assessment Strategy

### Formative Assessment
- Quick knowledge checks after each module (5 questions)
- Live polling during presentations
- Pair programming observations
- Exit tickets at session breaks

### Practical Assessment  
- Hands-on exercises (30% of time)
- Code review sessions
- Debugging challenges
- Implementation sprints

### Summative Assessment
- Capstone project incorporating all concepts
- Presentation of solution approach
- Peer evaluation rubric
- Instructor evaluation checklist

### Grading Rubric
- Participation: 20%
- Exercises: 30%
- Knowledge checks: 20%
- Final project: 30%

Generated: ${new Date().toISOString()}`;
  }

  generatePlan(args) {
    const duration = args.duration || '4 hours';
    const format = args.format || 'workshop';
    const approach = args.approach || 'hands-on';

    return `# Course Implementation Plan

## Overview
- **Format**: ${format}
- **Total Duration**: ${duration}
- **Approach**: ${approach}
- **Delivery Mode**: Hybrid (supports in-person and remote)

## Module Structure

### Module 1: Foundations (45 minutes)
#### Learning Objectives
- Understand the core concepts and their importance
- Set up a working development environment
- Complete a basic hands-on example
- Identify key patterns and anti-patterns

#### Timeline
- 0:00-0:05 - Welcome and introductions
- 0:05-0:10 - Course overview and objectives
- 0:10-0:25 - Core concepts introduction
- 0:25-0:35 - Environment setup
- 0:35-0:45 - First hands-on exercise

#### Activities
- **Ice breaker**: Share experience and expectations (5 min)
- **Setup verification**: Ensure all tools working (10 min)
- **Guided practice**: Hello World example (10 min)

#### Materials
- Welcome slides (5-7 slides)
- Setup guide handout
- Troubleshooting checklist
- Exercise starter code

### Module 2: Core Concepts (60 minutes)
#### Learning Objectives
- Apply fundamental patterns in practice
- Build working examples from scratch
- Identify and avoid common pitfalls
- Debug typical issues independently

#### Timeline
- 0:00-0:20 - Deep dive into concepts
- 0:20-0:35 - Live coding demonstration
- 0:35-0:55 - Guided practice session
- 0:55-0:60 - Q&A and clarification

#### Activities
- **Follow-along coding**: Build together (15 min)
- **Pair programming**: Solve challenges (20 min)
- **Group discussion**: Share discoveries (5 min)

#### Materials
- Concept slides (10-12 slides)
- Code examples repository
- Exercise instructions
- Solution walkthroughs

### Module 3: Practical Application (75 minutes)
#### Learning Objectives
- Design and implement a complete solution
- Apply best practices consistently
- Debug and optimize implementations
- Collaborate effectively with peers

#### Timeline
- 0:00-0:10 - Project requirements overview
- 0:10-0:25 - Architecture and planning
- 0:25-0:60 - Implementation sprint
- 0:60-0:75 - Presentations and feedback

#### Activities
- **Planning session**: Design approach (15 min)
- **Implementation**: Build the project (35 min)
- **Show and tell**: Present solutions (15 min)

#### Materials
- Project specification document
- Architecture templates
- Reference implementation
- Presentation guidelines

### Module 4: Advanced Topics & Wrap-up (60 minutes)
#### Learning Objectives
- Explore advanced patterns and techniques
- Plan continued learning path
- Build professional network
- Apply knowledge to real scenarios

#### Timeline
- 0:00-0:20 - Advanced concepts overview
- 0:20-0:35 - Real-world case studies
- 0:35-0:45 - Resources and next steps
- 0:45-0:60 - Final Q&A and feedback

#### Activities
- **Group analysis**: Case study discussion (15 min)
- **Action planning**: Personal learning goals (10 min)
- **Networking**: Exchange contacts (5 min)

#### Materials
- Advanced topics slides
- Case study documents
- Resource compilation
- Feedback forms

## Instructional Flow

### Learning Progression
1. **Hook**: Start with compelling why
2. **Foundation**: Build core mental models
3. **Practice**: Apply with guidance
4. **Challenge**: Stretch with complexity
5. **Consolidate**: Reflect and connect
6. **Transfer**: Plan real-world application

### Engagement Strategies
- Vary activities every 15-20 minutes
- Mix individual, pair, and group work
- Include physical movement breaks
- Use multimedia and demonstrations
- Encourage questions throughout

## Facilitator Preparation

### Pre-Workshop (1 week before)
- [ ] Test all technical setups
- [ ] Review and customize materials
- [ ] Send pre-work to participants
- [ ] Prepare backup plans

### Day-of Setup (1 hour before)
- [ ] Test AV equipment
- [ ] Verify internet connectivity
- [ ] Arrange room layout
- [ ] Prepare materials stations

### Materials Checklist
- [ ] Slide decks loaded
- [ ] Handouts printed (+ 20% extra)
- [ ] Sticky notes and markers
- [ ] Extension cords
- [ ] Backup on USB drives

## Contingency Planning

### Technical Issues
- Cloud-based backup environment ready
- Offline versions of all materials
- Pre-recorded demo videos
- Pair struggling participants

### Timing Adjustments
- Optional sections marked clearly
- Bonus content for fast finishers
- Break points identified
- Buffer time distributed

Generated: ${new Date().toISOString()}`;
  }

  generateTasks(args) {
    const granularity = args.granularity || 'medium';
    
    return `# Course Development Tasks

## Task Overview
- **Total Tasks**: 15
- **Estimated Time**: 9.5 hours
- **Granularity**: ${granularity}

## High Priority Tasks (Must Have)

### TASK-001: Create Module 1 Welcome Slides
- **Type**: slides
- **Module**: 1
- **Time**: 45 minutes
- **Dependencies**: None
- **Output**: module1-welcome.md (Slidev)
- **Description**: Create 5-7 slides introducing workshop, objectives, and agenda

### TASK-002: Write Environment Setup Guide
- **Type**: documentation
- **Module**: 1
- **Time**: 60 minutes
- **Dependencies**: None
- **Output**: setup-guide.md
- **Description**: Step-by-step installation instructions with troubleshooting

### TASK-003: Design Module 2 Concept Slides
- **Type**: slides
- **Module**: 2
- **Time**: 90 minutes
- **Dependencies**: TASK-001
- **Output**: module2-concepts.md (Slidev)
- **Description**: 10-12 slides covering core concepts with examples

### TASK-004: Create Hands-on Exercise for Module 2
- **Type**: exercise
- **Module**: 2
- **Time**: 60 minutes
- **Dependencies**: TASK-003
- **Output**: module2-exercise.md
- **Description**: Progressive exercise with starter code and solutions

### TASK-005: Write Project Specification for Module 3
- **Type**: specification
- **Module**: 3
- **Time**: 45 minutes
- **Dependencies**: TASK-004
- **Output**: project-spec.md
- **Description**: Clear requirements for capstone project

## Medium Priority Tasks (Should Have)

### TASK-006: Create Module 1 Facilitator Notes
- **Type**: notes
- **Module**: 1
- **Time**: 30 minutes
- **Dependencies**: TASK-001, TASK-002
- **Output**: module1-facilitator.md
- **Description**: Timing, talking points, common issues

### TASK-007: Design Module 3 Architecture Templates
- **Type**: template
- **Module**: 3
- **Time**: 45 minutes
- **Dependencies**: TASK-005
- **Output**: architecture-templates.md
- **Description**: Starter templates for project structure

### TASK-008: Create Module 4 Advanced Topics Slides
- **Type**: slides
- **Module**: 4
- **Time**: 60 minutes
- **Dependencies**: TASK-003
- **Output**: module4-advanced.md (Slidev)
- **Description**: 8-10 slides on advanced patterns

### TASK-009: Write Troubleshooting Guide
- **Type**: documentation
- **Module**: All
- **Time**: 45 minutes
- **Dependencies**: TASK-002
- **Output**: troubleshooting.md
- **Description**: Common issues and solutions

### TASK-010: Create Knowledge Check Questions
- **Type**: assessment
- **Module**: All
- **Time**: 60 minutes
- **Dependencies**: TASK-003, TASK-008
- **Output**: knowledge-checks.md
- **Description**: 5 questions per module with answers

## Low Priority Tasks (Nice to Have)

### TASK-011: Design Feedback Forms
- **Type**: form
- **Module**: 4
- **Time**: 20 minutes
- **Dependencies**: None
- **Output**: feedback-forms.md
- **Description**: Session feedback and self-assessment

### TASK-012: Compile Resource List
- **Type**: documentation
- **Module**: 4
- **Time**: 30 minutes
- **Dependencies**: None
- **Output**: resources.md
- **Description**: Curated learning resources and references

### TASK-013: Create Bonus Exercises
- **Type**: exercise
- **Module**: All
- **Time**: 90 minutes
- **Dependencies**: TASK-004
- **Output**: bonus-exercises.md
- **Description**: Additional challenges for advanced learners

### TASK-014: Write Course README
- **Type**: documentation
- **Module**: All
- **Time**: 30 minutes
- **Dependencies**: All
- **Output**: README.md
- **Description**: Course overview and navigation guide

### TASK-015: Create Slide Templates
- **Type**: template
- **Module**: All
- **Time**: 45 minutes
- **Dependencies**: TASK-001
- **Output**: slide-templates.md
- **Description**: Reusable Slidev templates for consistency

## Task Dependencies

\`\`\`mermaid
graph TD
    TASK-001 --> TASK-003
    TASK-001 --> TASK-006
    TASK-002 --> TASK-006
    TASK-002 --> TASK-009
    TASK-003 --> TASK-004
    TASK-003 --> TASK-008
    TASK-003 --> TASK-010
    TASK-004 --> TASK-005
    TASK-004 --> TASK-013
    TASK-005 --> TASK-007
    TASK-008 --> TASK-010
    All[All Tasks] --> TASK-014
\`\`\`

## Execution Strategy

### Sprint 1 (Critical Path) - 4.5 hours
1. TASK-001: Welcome slides
2. TASK-002: Setup guide
3. TASK-003: Concept slides
4. TASK-004: Core exercise
5. TASK-005: Project spec

### Sprint 2 (Enhancement) - 3.5 hours
6. TASK-006: Facilitator notes
7. TASK-007: Architecture templates
8. TASK-008: Advanced slides
9. TASK-009: Troubleshooting
10. TASK-010: Knowledge checks

### Sprint 3 (Polish) - 1.5 hours
11. TASK-011: Feedback forms
12. TASK-012: Resource list
13. TASK-014: README
14. Review and refinement

Generated: ${new Date().toISOString()}`;
  }

  generateImplementation(task) {
    const taskLower = task.toLowerCase();
    
    if (taskLower.includes('slide') || taskLower.includes('welcome')) {
      return this.generateSlidevPresentation(task);
    } else if (taskLower.includes('exercise')) {
      return this.generateExercise(task);
    } else if (taskLower.includes('facilitator') || taskLower.includes('notes')) {
      return this.generateFacilitatorNotes(task);
    } else if (taskLower.includes('setup') || taskLower.includes('guide')) {
      return this.generateSetupGuide(task);
    } else {
      return this.generateGenericContent(task);
    }
  }

  generateSlidevPresentation(task) {
    return `---
theme: default
background: https://source.unsplash.com/1920x1080/?abstract
class: text-center
highlighter: shiki
lineNumbers: false
info: |
  ## ${task}
  Generated by CourseKit MCP
  
  Learn more at [GitHub](https://github.com/coursekit/mcp)
drawings:
  persist: false
transition: slide-left
title: Welcome to the Workshop
mdc: true
---

# Welcome to the Workshop

Building Amazing Things Together

<div class="pt-12">
  <span @click="$slidev.nav.next" class="px-2 py-1 rounded cursor-pointer" hover="bg-white bg-opacity-10">
    Press Space to start <carbon:arrow-right class="inline"/>
  </span>
</div>

<div class="abs-br m-6 flex gap-2">
  <button @click="$slidev.nav.openInEditor()" title="Open in Editor" class="text-xl slidev-icon-btn opacity-50 !border-none !hover:text-white">
    <carbon:edit />
  </button>
  <a href="https://github.com/slidevjs/slidev" target="_blank" alt="GitHub" title="Open in GitHub"
    class="text-xl slidev-icon-btn opacity-50 !border-none !hover:text-white">
    <carbon-logo-github />
  </a>
</div>

<!--
Welcome everyone! 
Today we'll explore practical techniques you can apply immediately.
Check: Everyone can see the screen clearly?
-->

---
transition: fade-out
---

# What We'll Cover Today

<v-clicks>

## 🎯 Learning Objectives
- Master the fundamentals
- Build practical examples
- Apply best practices
- Solve real problems

## 🛠 What You'll Build
- Working prototypes
- Production-ready code
- Reusable templates
- Personal toolkit

## 🤝 How We'll Learn
- Hands-on exercises
- Pair programming
- Group discussions
- Live coding

</v-clicks>

<!--
Each module builds on the previous one.
We'll check understanding before moving forward.
Questions are welcome at any time.
-->

---
layout: two-cols
layoutClass: gap-16
---

# Your Instructor

::left::

## Background
- 10+ years development experience
- Specialist in modern web technologies
- Passionate about teaching
- Open source contributor

## Philosophy
- Learn by doing
- Fail fast, learn faster
- Share knowledge freely
- Build community

::right::

## Today's Commitment
- <twemoji-white-check-mark /> Clear explanations
- <twemoji-white-check-mark /> Practical examples
- <twemoji-white-check-mark /> Individual support
- <twemoji-white-check-mark /> No one left behind

## Contact
- Email: instructor@workshop.dev
- GitHub: @instructor
- Slack: #workshop-channel

<!--
Quick introduction to build credibility.
Focus remains on participant success.
Contact info for follow-up questions.
-->

---
layout: intro
---

# Let's Get to Know Each Other

## Quick Introductions

Share with the group:
1. Your name
2. Your experience level
3. One thing you hope to learn

<div class="mt-8">
  <span class="text-2xl">We'll go around the room - 30 seconds each! ⏱️</span>
</div>

<!--
Keep introductions brief and focused.
Note common themes to reference later.
This builds psychological safety.
-->

---
layout: center
class: text-center
---

# Workshop Ground Rules

<div class="grid grid-cols-2 gap-8 mt-8">
  <div class="bg-blue-500 bg-opacity-10 p-6 rounded-lg">
    <h3 class="text-xl mb-4">✅ Please Do</h3>
    <ul class="text-left">
      <li>Ask questions anytime</li>
      <li>Help your neighbors</li>
      <li>Take breaks when needed</li>
      <li>Share your discoveries</li>
    </ul>
  </div>
  <div class="bg-red-500 bg-opacity-10 p-6 rounded-lg">
    <h3 class="text-xl mb-4">❌ Please Don't</h3>
    <ul class="text-left">
      <li>Suffer in silence</li>
      <li>Race ahead alone</li>
      <li>Assume it's "too basic"</li>
      <li>Worry about mistakes</li>
    </ul>
  </div>
</div>

<!--
Setting expectations creates safety.
Emphasize collaborative learning.
Mistakes are learning opportunities.
-->

---
layout: default
---

# Today's Agenda

<div class="grid grid-cols-2 gap-4">
  <div v-click class="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
    <h3 class="text-xl mb-2">Module 1: Foundations</h3>
    <p class="text-sm opacity-90">9:00 - 9:45 AM</p>
    <ul class="mt-3 text-sm">
      <li>Core concepts</li>
      <li>Environment setup</li>
      <li>First exercise</li>
    </ul>
  </div>
  <div v-click class="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
    <h3 class="text-xl mb-2">Module 2: Deep Dive</h3>
    <p class="text-sm opacity-90">9:45 - 10:45 AM</p>
    <ul class="mt-3 text-sm">
      <li>Advanced patterns</li>
      <li>Live coding</li>
      <li>Practice session</li>
    </ul>
  </div>
  <div v-click class="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
    <h3 class="text-xl mb-2">Module 3: Application</h3>
    <p class="text-sm opacity-90">11:00 AM - 12:15 PM</p>
    <ul class="mt-3 text-sm">
      <li>Project planning</li>
      <li>Implementation</li>
      <li>Presentations</li>
    </ul>
  </div>
  <div v-click class="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
    <h3 class="text-xl mb-2">Module 4: Next Steps</h3>
    <p class="text-sm opacity-90">12:15 - 1:15 PM</p>
    <ul class="mt-3 text-sm">
      <li>Advanced topics</li>
      <li>Resources</li>
      <li>Q&A</li>
    </ul>
  </div>
</div>

<div v-click class="mt-6 text-center text-gray-500">
  ☕ Breaks: 10:45-11:00 AM | 🍕 Lunch: After workshop
</div>

<!--
Visual timeline helps participants plan.
Breaks are important for retention.
Lunch networking opportunity after.
-->

---
layout: fact
---

# Ready to Begin?
## Let's dive into the fundamentals! 🚀

<!--
Transition slide to main content.
Energy check - is everyone ready?
-->

---
layout: end
class: text-center
---

# Thank You!

Keep learning, keep building, keep sharing

<div class="pt-4">
  <span class="text-sm opacity-75">
    Generated with CourseKit MCP | ${new Date().toISOString()}
  </span>
</div>

<!--
End on a high note.
Remind them of resources.
Encourage continued learning.
-->`;
  }

  generateExercise(task) {
    return `# Hands-On Exercise: ${task}

## Overview
This exercise reinforces the concepts we've just covered through practical application.

## Learning Objectives
Upon completing this exercise, you will be able to:
- Apply the core concepts in a practical scenario
- Debug common issues independently
- Build confidence through hands-on practice
- Recognize patterns for future use

## Prerequisites
- Completed Module 1 setup
- Basic understanding of concepts covered
- Development environment ready

## Time Allocation
- **Total Time**: 30 minutes
- **Setup**: 5 minutes
- **Implementation**: 20 minutes
- **Review**: 5 minutes

## Instructions

### Part 1: Setup (5 minutes)
1. Open your development environment
2. Create a new project directory: \`exercise-1\`
3. Initialize the project:
   \`\`\`bash
   mkdir exercise-1
   cd exercise-1
   npm init -y
   \`\`\`
4. Install required dependencies:
   \`\`\`bash
   npm install [required-packages]
   \`\`\`

### Part 2: Core Implementation (10 minutes)

#### Step 1: Create the foundation
\`\`\`javascript
// main.js
class ExerciseOne {
  constructor(options = {}) {
    this.config = {
      ...this.defaultConfig(),
      ...options
    };
  }
  
  defaultConfig() {
    return {
      // Your default configuration
    };
  }
  
  // TODO: Implement the process method
  process(input) {
    // Your implementation here
  }
}

module.exports = ExerciseOne;
\`\`\`

#### Step 2: Implement core logic
Your task is to implement the \`process\` method that:
1. Validates the input
2. Transforms the data according to specifications
3. Returns the processed result
4. Handles errors gracefully

#### Step 3: Add error handling
Ensure your solution handles:
- Invalid input types
- Empty inputs
- Edge cases
- Unexpected errors

### Part 3: Enhancement (10 minutes)

Extend your solution with:
1. **Logging**: Add debug logging for troubleshooting
2. **Performance**: Optimize for larger inputs
3. **Testing**: Create at least 3 test cases
4. **Documentation**: Add JSDoc comments

### Part 4: Testing Your Solution

Run these test cases to verify your implementation:

\`\`\`javascript
// test.js
const ExerciseOne = require('./main');
const exercise = new ExerciseOne();

// Test Case 1: Basic functionality
console.log('Test 1:', exercise.process('hello world'));
// Expected: 'HELLO WORLD'

// Test Case 2: Empty input
console.log('Test 2:', exercise.process(''));
// Expected: Error or default message

// Test Case 3: Special characters
console.log('Test 3:', exercise.process('hello@world.com!'));
// Expected: 'HELLO@WORLD.COM!'

// Test Case 4: Numbers
console.log('Test 4:', exercise.process('test123'));
// Expected: 'TEST123'
\`\`\`

## Hints

<details>
<summary>💡 Stuck? Click for hints</summary>

### Hint 1: Input Validation
Remember to check for:
- null or undefined values
- Type checking (is it a string?)
- Length constraints

### Hint 2: String Methods
Useful JavaScript string methods:
- \`.trim()\` - Remove whitespace
- \`.toUpperCase()\` - Convert to uppercase
- \`.toLowerCase()\` - Convert to lowercase
- \`.replace()\` - Replace patterns

### Hint 3: Error Handling Pattern
\`\`\`javascript
try {
  // Your processing logic
  if (!input) {
    throw new Error('Input required');
  }
  // Process the input
} catch (error) {
  // Handle the error
  return { error: error.message };
}
\`\`\`

</details>

## Complete Solution

<details>
<summary>🔓 Click to reveal the complete solution</summary>

\`\`\`javascript
// main.js - Complete Solution
class ExerciseOne {
  constructor(options = {}) {
    this.config = {
      ...this.defaultConfig(),
      ...options
    };
    this.processCount = 0;
  }
  
  defaultConfig() {
    return {
      uppercase: true,
      trim: true,
      addMetadata: true,
      maxLength: 1000
    };
  }
  
  process(input) {
    try {
      // Input validation
      if (input === null || input === undefined) {
        throw new Error('Input cannot be null or undefined');
      }
      
      if (typeof input !== 'string') {
        throw new TypeError(\`Expected string, got \${typeof input}\`);
      }
      
      if (input.length === 0) {
        return {
          success: false,
          message: 'Empty input provided',
          original: input
        };
      }
      
      if (input.length > this.config.maxLength) {
        throw new Error(\`Input exceeds maximum length of \${this.config.maxLength}\`);
      }
      
      // Processing
      let result = input;
      
      if (this.config.trim) {
        result = result.trim();
      }
      
      if (this.config.uppercase) {
        result = result.toUpperCase();
      }
      
      this.processCount++;
      
      // Return with metadata if configured
      if (this.config.addMetadata) {
        return {
          success: true,
          result: result,
          original: input,
          processedAt: new Date().toISOString(),
          processNumber: this.processCount,
          transformations: {
            trimmed: this.config.trim,
            uppercased: this.config.uppercase
          }
        };
      }
      
      return result;
      
    } catch (error) {
      // Error handling
      console.error('Processing error:', error.message);
      
      return {
        success: false,
        error: error.message,
        errorType: error.name,
        input: input,
        help: this.getErrorHelp(error)
      };
    }
  }
  
  getErrorHelp(error) {
    const errorHelp = {
      'TypeError': 'Please provide a valid string input',
      'Error': error.message.includes('length') 
        ? 'Try shortening your input' 
        : 'Please check your input and try again'
    };
    
    return errorHelp[error.name] || 'An unexpected error occurred';
  }
  
  // Bonus: Batch processing
  processBatch(inputs) {
    if (!Array.isArray(inputs)) {
      throw new TypeError('Batch processing requires an array');
    }
    
    return inputs.map((input, index) => ({
      index,
      ...this.process(input)
    }));
  }
  
  // Bonus: Async processing for large inputs
  async processAsync(input) {
    return new Promise((resolve, reject) => {
      // Simulate async operation
      setTimeout(() => {
        const result = this.process(input);
        if (result.success === false && result.error) {
          reject(result);
        } else {
          resolve(result);
        }
      }, 100);
    });
  }
  
  // Reset counter
  reset() {
    this.processCount = 0;
  }
  
  // Get statistics
  getStats() {
    return {
      totalProcessed: this.processCount,
      configuration: this.config
    };
  }
}

module.exports = ExerciseOne;

// test.js - Test Suite
const ExerciseOne = require('./main');

// Create instance with default config
const exercise = new ExerciseOne();

console.log('=== Exercise One Test Suite ===\\n');

// Test 1: Basic functionality
console.log('Test 1 - Basic:');
console.log(exercise.process('hello world'));
console.log('');

// Test 2: Empty input
console.log('Test 2 - Empty:');
console.log(exercise.process(''));
console.log('');

// Test 3: Special characters
console.log('Test 3 - Special:');
console.log(exercise.process('hello@world.com!'));
console.log('');

// Test 4: Numbers
console.log('Test 4 - Numbers:');
console.log(exercise.process('test123'));
console.log('');

// Test 5: Error handling
console.log('Test 5 - Error:');
console.log(exercise.process(123));
console.log('');

// Test 6: Null input
console.log('Test 6 - Null:');
console.log(exercise.process(null));
console.log('');

// Test 7: Batch processing
console.log('Test 7 - Batch:');
const batchResults = exercise.processBatch(['one', 'two', 'three']);
console.log(batchResults);
console.log('');

// Test 8: Custom configuration
console.log('Test 8 - Custom Config:');
const customExercise = new ExerciseOne({ 
  uppercase: false, 
  trim: true 
});
console.log(customExercise.process('  hello world  '));
console.log('');

// Test 9: Statistics
console.log('Test 9 - Statistics:');
console.log(exercise.getStats());
console.log('');

// Test 10: Async processing
console.log('Test 10 - Async:');
exercise.processAsync('async test')
  .then(result => console.log('Async result:', result))
  .catch(error => console.log('Async error:', error));
\`\`\`

### Explanation

The solution demonstrates several key concepts:

1. **Defensive Programming**: Comprehensive input validation
2. **Error Handling**: Try-catch blocks with meaningful error messages
3. **Configuration**: Flexible options pattern for customization
4. **Metadata**: Rich return objects with debugging information
5. **Extensibility**: Additional methods for batch and async processing
6. **Testing**: Comprehensive test coverage of edge cases

### Key Learning Points
- Always validate inputs before processing
- Provide meaningful error messages for debugging
- Use configuration objects for flexibility
- Include metadata for observability
- Consider both sync and async patterns
- Write comprehensive tests

</details>

## Reflection Questions

After completing this exercise, consider:

1. **What was the most challenging part?** Why do you think that was?
2. **What pattern would you reuse** in your own projects?
3. **How would you extend this** for production use?
4. **What additional error cases** should be handled?
5. **How would you test this** more thoroughly?

## Going Further

If you finished early, try these bonus challenges:

### Challenge 1: Performance Optimization
- Process 10,000 strings in under 100ms
- Implement caching for repeated inputs
- Add performance benchmarking

### Challenge 2: Advanced Features
- Add support for custom transformations
- Implement a plugin system
- Add internationalization support

### Challenge 3: Production Readiness
- Add comprehensive logging
- Implement rate limiting
- Add metrics collection
- Create a CLI interface

## Submission

When complete:
1. Save your work
2. Run all test cases
3. Be prepared to share your approach
4. Help others if you finish early

## Resources
- [MDN String Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- [Error Handling Best Practices](https://www.joyent.com/node-js/production/design/errors)
- [JavaScript Testing Guide](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

Generated: ${new Date().toISOString()}
Exercise created by CourseKit MCP`;
  }

  generateFacilitatorNotes(task) {
    return `# Facilitator Guide: ${task}

## Module Overview
**Duration**: 45 minutes
**Participants**: 15-25
**Format**: Interactive workshop
**Energy Level**: High energy start, maintain engagement

## Pre-Session Checklist
- [ ] Room setup complete (U-shape or pods)
- [ ] AV equipment tested
- [ ] Materials distributed
- [ ] Backup slides on USB
- [ ] WiFi password visible
- [ ] Name tags/tents available
- [ ] Timer ready
- [ ] Music playlist for breaks

## Detailed Timeline

### 0:00-0:05 - Opening & Energy Check
**Objective**: Set positive tone, gauge room energy

**Script**: 
"Good morning everyone! I'm genuinely excited about what we're going to build together today. Before we dive in, let's do a quick energy check - on a scale of 1-5, show me with your fingers how awake you're feeling. [Respond to energy level] Perfect, let's match that energy!"

**Actions**:
- Stand center stage, make eye contact
- Move around, don't stay static
- Note anyone showing low energy
- Adjust pace based on response

**Watch for**: Late arrivals, technical setup issues

### 0:05-0:10 - Introductions & Ice Breaker
**Objective**: Build psychological safety, understand audience

**Activity**: "Two Truths and a Dream"
- Name + role
- Two things true about their experience
- One thing they dream of building

**Facilitation**:
- Model first with your own introduction
- Keep time strictly (30 seconds each)
- Note common themes to reference
- Use names immediately after hearing them

**Common Issues**:
- People going too long → Use timer, gentle interruption
- Shyness → Start with volunteers, build momentum
- Technical folks → Keep it light, not a skills competition

### 0:10-0:25 - Core Content Delivery
**Objective**: Transfer key concepts, maintain engagement

**Teaching Strategy**:
1. **Hook** (2 min): Real problem story
2. **Concept** (5 min): Core idea with visual
3. **Example** (5 min): Live demonstration
4. **Check** (3 min): Understanding verification

**Key Messages**:
- "This isn't just theory - you'll use this today"
- "Common mistake is X, here's how to avoid it"
- "In production, this saves hours of debugging"

**Engagement Techniques**:
- Ask prediction questions: "What do you think happens next?"
- Use analogies: "This is like [familiar concept]"
- Physical props if applicable
- Vary voice tone and pace

**Energy Management**:
- If energy drops: Quick stand-and-stretch
- If confusion: Slow down, use simpler example
- If ahead of schedule: Add depth, not speed

### 0:25-0:35 - Environment Setup
**Objective**: Everyone has working environment

**Pre-emptive Solutions**:
- USB with offline installers ready
- Cloud backup environment link
- Buddy system for troubleshooting
- Clear "success indicator" defined

**Common Issues & Solutions**:

| Issue | Solution | Time Impact |
|-------|----------|-------------|
| Slow internet | Use local server | +5 min |
| Version conflicts | Provide specific versions | +3 min |
| OS differences | Have OS-specific guides | +2 min |
| Permissions | Run as admin/sudo | +2 min |

**Success Verification**:
"Everyone run \`npm test\` - you should see a green checkmark"

### 0:35-0:45 - First Hands-On Exercise
**Objective**: Build confidence with quick win

**Setup**:
- Clear success criteria stated
- Visual progress indicator
- Paired for support

**Monitoring**:
- Circulate continuously
- Look for frustrated faces
- Celebrate first success loudly
- Help strugglers discretely

**Time Warnings**:
- 5 minutes: "Halfway there!"
- 2 minutes: "Start wrapping up"
- 0 minutes: "Pencils down!"

## Speaking Notes & Key Points

### Concept Explanations

#### Topic 1: [Core Concept]
- **Analogy**: "Like a recipe, you need ingredients (data) and instructions (functions)"
- **Visual**: Diagram on slide 3, build it piece by piece
- **Common Confusion**: People think X, but actually Y
- **Check Question**: "How would you apply this to [scenario]?"

#### Topic 2: [Secondary Concept]
- **Build On**: References Topic 1 directly
- **Demonstration**: Live code, go slow, narrate everything
- **Pitfall**: "Don't do [common mistake], because [consequence]"
- **Practice**: Mini-exercise, 2 minutes, share results

### Handling Questions

**Great Questions to Get**:
- "How does this work with [advanced topic]?" → "Excellent question, we'll cover that in Module 3"
- "What about performance?" → "Critical consideration - here's the quick answer..."
- "Can I use [alternative]?" → "Yes, and here's how they compare..."

**Difficult Questions**:
- "This seems overcomplicated" → "I understand that feeling. Let me show you the problem it solves..."
- "We don't do it this way at my company" → "Great point - there are multiple valid approaches..."
- "Is this production-ready?" → "With these considerations, yes..."

**Parking Lot Items**:
- Keep visible list
- Promise follow-up
- Email resources later

## Energy & Engagement Management

### Energy Boosters
- **Physical**: Stand and stretch, walk to new seat
- **Mental**: Pair discussion, quick poll
- **Competitive**: Mini-challenge with prize
- **Collaborative**: Help neighbor succeed

### Warning Signs & Interventions

| Sign | Intervention |
|------|-------------|
| Glazed eyes | Switch to exercise |
| Side conversations | Bring into main discussion |
| Frustration | Individual support |
| Racing ahead | Bonus challenge ready |
| Checking phones | Re-engagement question |

### Maintaining Flow
- Transitions scripted and smooth
- Materials ready before needed
- Clear visual/verbal cues
- Background music during exercises
- Energy matching participant level

## Common Challenges & Solutions

### Technical Challenges

**Network Issues**:
- Pre-downloaded everything
- Local server option
- Phone hotspot backup
- Pair sharing

**Diverse Skill Levels**:
- Baseline exercise first
- Tiered challenges ready
- Pair strong with struggling
- "Office hours" during breaks

**Tool Problems**:
- Alternative tools listed
- Web-based backups
- Screenshots of expected results
- Pre-recorded demo video

### People Challenges

**Dominant Participant**:
- "Great point, let's hear from others"
- Give special task/role
- Speak privately during break
- Channel energy positively

**Silent Group**:
- Start with written responses
- Think-pair-share format
- Direct but soft questions
- Celebrate any participation

**Skeptical Audience**:
- Acknowledge concerns upfront
- Show real-world evidence
- Focus on pragmatic benefits
- Invite them to "try and see"

## Materials & Resources

### Required Materials
- [ ] Slides (main + backup)
- [ ] Exercise starter files
- [ ] Solution code
- [ ] Handout (physical or digital)
- [ ] Feedback forms
- [ ] Contact sheet

### Backup Materials
- [ ] Recorded demo video
- [ ] Cloud environment links
- [ ] Offline installers
- [ ] Printed slide notes
- [ ] Extra handouts (+25%)

### Support Resources
- Repository: github.com/workshop/module1
- Slides: slides.com/workshop/module1
- Help channel: slack.com/workshop-help
- Email: instructor@workshop.dev

## Post-Module Actions

### Immediate (0-5 minutes)
- [ ] Quick feedback temperature
- [ ] Address urgent questions
- [ ] Preview next module
- [ ] Encourage break activities

### During Break
- [ ] Help struggling participants
- [ ] Setup next module
- [ ] Review feedback cards
- [ ] Adjust plan if needed

### After Workshop
- [ ] Send follow-up resources
- [ ] Share solutions repository
- [ ] Connect on LinkedIn
- [ ] Request feedback survey

## Troubleshooting Quick Reference

- **Internet Down** → Local server on USB
- **Projector Fails** → Share screen to devices  
- **Over time** → Skip section 2.3 (marked optional)
- **Under time** → Use bonus exercise #3
- **Fire alarm** → Save work, resume from checkpoint

## Key Phrases That Work

✅ **Use These**:
- "Great question..."
- "That's a common challenge..."
- "You're absolutely right that..."
- "Let me show you..."
- "How does everyone feel about..."

❌ **Avoid These**:
- "That's wrong"
- "As I already said"
- "You should know this"
- "This is easy"
- "Obviously..."

## Notes Section

*Space for personal observations during delivery:*

---

---

---

Generated: ${new Date().toISOString()}
Guide created by CourseKit MCP`;
  }

  generateSetupGuide(task) {
    return `# Environment Setup Guide

## Overview
This guide will help you set up your development environment for the workshop. Please complete these steps before the session to ensure we can focus on learning rather than troubleshooting.

## Requirements

### System Requirements
- **OS**: Windows 10+, macOS 10.15+, or Ubuntu 20.04+
- **RAM**: 8GB minimum, 16GB recommended
- **Disk Space**: 5GB free space
- **Internet**: Stable connection for package downloads

### Required Software

#### 1. Node.js (Required)
- **Version**: 18.0.0 or higher
- **Download**: https://nodejs.org/
- **Verify**: \`node --version\` should show v18.0.0+

#### 2. Code Editor (Choose One)
- **VS Code** (Recommended): https://code.visualstudio.com/
- **Sublime Text**: https://www.sublimetext.com/
- **WebStorm**: https://www.jetbrains.com/webstorm/

#### 3. Git (Recommended)
- **Download**: https://git-scm.com/
- **Verify**: \`git --version\`

## Step-by-Step Installation

### Windows Installation

#### Step 1: Install Node.js
1. Download from https://nodejs.org/
2. Run the installer (use LTS version)
3. Check "Automatically install necessary tools"
4. Click through installation
5. Restart terminal
6. Verify: \`node --version\`

#### Step 2: Install VS Code
1. Download from https://code.visualstudio.com/
2. Run installer
3. Check "Add to PATH"
4. Install recommended extensions:
   - ESLint
   - Prettier
   - JavaScript (ES6) snippets

#### Step 3: Configure PowerShell (if needed)
\`\`\`powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
\`\`\`

### macOS Installation

#### Step 1: Install Homebrew (if not installed)
\`\`\`bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
\`\`\`

#### Step 2: Install Node.js
\`\`\`bash
brew install node
node --version  # Verify installation
\`\`\`

#### Step 3: Install VS Code
\`\`\`bash
brew install --cask visual-studio-code
\`\`\`

### Linux (Ubuntu/Debian) Installation

#### Step 1: Update System
\`\`\`bash
sudo apt update && sudo apt upgrade -y
\`\`\`

#### Step 2: Install Node.js
\`\`\`bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Verify installation
\`\`\`

#### Step 3: Install VS Code
\`\`\`bash
sudo snap install --classic code
\`\`\`

## Project Setup

### Step 1: Create Workshop Directory
\`\`\`bash
mkdir ~/workshop-projects
cd ~/workshop-projects
\`\`\`

### Step 2: Clone Workshop Repository
\`\`\`bash
git clone https://github.com/workshop/starter-kit.git
cd starter-kit
\`\`\`

### Step 3: Install Dependencies
\`\`\`bash
npm install
\`\`\`

### Step 4: Verify Setup
\`\`\`bash
npm test
\`\`\`

You should see:
\`\`\`
✓ Environment setup correctly
✓ All dependencies installed
✓ Ready for workshop!
\`\`\`

## Common Issues & Solutions

### Issue 1: Permission Denied (npm)

**Error**: \`EACCES: permission denied\`

**Solution**:
\`\`\`bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
\`\`\`

### Issue 2: Node Version Too Old

**Error**: \`Node version 14.x detected, 18.x required\`

**Solution**:
\`\`\`bash
# Using nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
nvm alias default 18
\`\`\`

### Issue 3: Corporate Proxy

**Error**: \`npm ERR! network tunneling socket could not be established\`

**Solution**:
\`\`\`bash
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
\`\`\`

### Issue 4: Windows Path Issues

**Error**: \`'npm' is not recognized as internal or external command\`

**Solution**:
1. Open System Properties
2. Click Environment Variables
3. Add to Path: \`C:\\Program Files\\nodejs\\\`
4. Restart terminal

### Issue 5: SSL Certificate Issues

**Error**: \`npm ERR! self signed certificate\`

**Solution** (temporary, not for production):
\`\`\`bash
npm config set strict-ssl false
\`\`\`

## VS Code Extensions

Install these recommended extensions:

### Essential
- **ESLint**: Linting and code quality
- **Prettier**: Code formatting
- **Live Server**: Local development server
- **Thunder Client**: API testing

### Helpful
- **GitLens**: Git visualization
- **Bracket Pair Colorizer**: Matching brackets
- **TODO Highlight**: Track TODOs
- **Path Intellisense**: File path autocomplete

### Installation Command
\`\`\`bash
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension ritwickdey.LiveServer
code --install-extension rangav.vscode-thunder-client
\`\`\`

## Pre-Workshop Checklist

Complete these to confirm ready status:

- [ ] Node.js installed (v18+)
- [ ] npm working (\`npm --version\`)
- [ ] Code editor installed
- [ ] Workshop repository cloned
- [ ] Dependencies installed (\`npm install\` successful)
- [ ] Test passing (\`npm test\` shows green)
- [ ] Can create and run a simple .js file

## Quick Verification Script

Save as \`verify-setup.js\` and run:

\`\`\`javascript
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Workshop Environment...\\n');

const checks = [
  {
    name: 'Node.js Version',
    command: 'node --version',
    validate: (output) => {
      const version = output.trim().replace('v', '');
      const major = parseInt(version.split('.')[0]);
      return major >= 18;
    },
    error: 'Node.js 18+ required'
  },
  {
    name: 'npm Version',
    command: 'npm --version',
    validate: (output) => output.trim().length > 0,
    error: 'npm not found'
  },
  {
    name: 'Git Version',
    command: 'git --version',
    validate: (output) => output.includes('git version'),
    error: 'Git not installed (optional but recommended)'
  }
];

let passed = 0;
let failed = 0;

checks.forEach(check => {
  try {
    const output = execSync(check.command, { encoding: 'utf8' });
    if (check.validate(output)) {
      console.log(\`✅ \${check.name}: \${output.trim()}\`);
      passed++;
    } else {
      console.log(\`❌ \${check.name}: \${check.error}\`);
      failed++;
    }
  } catch (error) {
    console.log(\`❌ \${check.name}: \${check.error}\`);
    failed++;
  }
});

console.log(\`\\n📊 Results: \${passed} passed, \${failed} failed\\n\`);

if (failed === 0) {
  console.log('🎉 Your environment is ready for the workshop!');
} else {
  console.log('⚠️  Please fix the issues above before the workshop.');
  console.log('📧 Need help? Contact workshop@support.dev');
}
\`\`\`

Run with:
\`\`\`bash
node verify-setup.js
\`\`\`

## Offline Setup Option

If you have limited internet, download these in advance:

1. **Offline Installer Package**: [Download Link] (500MB)
   - Contains Node.js, VS Code, and common packages
   
2. **Workshop Materials**: [Download Link] (50MB)
   - Slides, exercises, and solutions

3. **Documentation Pack**: [Download Link] (10MB)
   - MDN references, cheatsheets

## Getting Help

### Before the Workshop
- Email: setup@workshop.dev
- Slack: #workshop-setup
- Office Hours: Friday 3-4 PM (Zoom link in email)

### During the Workshop
- Raise your hand for immediate help
- Use the "Help" sticky note
- Pair with a neighbor
- Check troubleshooting guide

## Alternative Cloud Setup

If local setup fails, use our cloud environment:

1. Go to: https://workshop.cloud-ide.dev
2. Login with: workshop / [provided password]
3. Everything is pre-configured
4. Note: Limited to 4 hours usage

## Final Tips

1. **Test Everything**: Run through a simple example before workshop
2. **Arrive Early**: Come 15 minutes early if you have issues
3. **Bring Charger**: We'll be coding for several hours
4. **Have Backup**: Keep cloud environment link handy
5. **Stay Calm**: Setup issues are normal, we'll help!

---

Generated: ${new Date().toISOString()}
Setup guide created by CourseKit MCP

Questions? Contact workshop@support.dev`;
  }

  generateGenericContent(task) {
    return `# ${task}

## Overview
This document provides the content for: ${task}

## Purpose
[Describe the purpose of this content piece]

## Content

### Section 1: Introduction
[Introduction content relevant to the task]

### Section 2: Main Content
[Core content for the task]

### Section 3: Details
[Detailed information as needed]

### Section 4: Summary
[Summary and key takeaways]

## Additional Notes
- [Note 1]
- [Note 2]
- [Note 3]

## Resources
- [Resource 1]
- [Resource 2]
- [Resource 3]

## Next Steps
- [Action 1]
- [Action 2]
- [Action 3]

---

Generated: ${new Date().toISOString()}
Content created by CourseKit MCP`;
  }
}

// Initialize server
const server = new JSONRPCServer();
const courseKit = new CourseKitServer();

// Register MCP methods
server.register('initialize', async (params) => {
  await courseKit.loadProject();
  return {
    protocolVersion: '1.0',
    serverInfo: {
      name: 'coursekit-mcp',
      version: '0.2.0',
      description: 'Spec-driven course development toolkit'
    },
    capabilities: {
      tools: {
        list: true,
        call: true
      }
    }
  };
});

server.register('tools/list', async () => {
  return {
    tools: [
      {
        name: 'coursekit.constitution',
        description: 'Create or update course development principles and guidelines',
        inputSchema: {
          type: 'object',
          properties: {
            vision: { 
              type: 'string',
              description: 'High-level vision for the course/workshop'
            }
          },
          required: ['vision']
        }
      },
      {
        name: 'coursekit.specify',
        description: 'Define learning outcomes and requirements',
        inputSchema: {
          type: 'object',
          properties: {
            description: { 
              type: 'string',
              description: 'Course description with topic, audience, and goals'
            }
          },
          required: ['description']
        }
      },
      {
        name: 'coursekit.plan',
        description: 'Create course structure and instructional strategy',
        inputSchema: {
          type: 'object',
          properties: {
            format: { 
              type: 'string',
              enum: ['workshop', 'course', 'training'],
              description: 'Course format'
            },
            duration: {
              type: 'string',
              description: 'Time available (e.g., "2 hours", "3 days")'
            },
            approach: {
              type: 'string',
              description: 'Pedagogical approach (e.g., "hands-on", "lecture", "flipped")'
            }
          }
        }
      },
      {
        name: 'coursekit.tasks',
        description: 'Generate actionable content development tasks',
        inputSchema: {
          type: 'object',
          properties: {
            granularity: {
              type: 'string',
              enum: ['fine', 'medium', 'coarse'],
              default: 'medium'
            }
          }
        }
      },
      {
        name: 'coursekit.implement',
        description: 'Execute a specific task to create course materials',
        inputSchema: {
          type: 'object',
          properties: {
            task: {
              type: 'string',
              description: 'The task to implement (e.g., "Create slides for Module 1")'
            }
          },
          required: ['task']
        }
      }
    ]
  };
});

server.register('tools/call', async (params) => {
  const { name, arguments: args } = params;
  await courseKit.loadProject();
  
  switch(name) {
    case 'coursekit.constitution':
      return await courseKit.handleConstitution(args);
    case 'coursekit.specify':
      return await courseKit.handleSpecify(args);
    case 'coursekit.plan':
      return await courseKit.handlePlan(args);
    case 'coursekit.tasks':
      return await courseKit.handleTasks(args);
    case 'coursekit.implement':
      return await courseKit.handleImplement(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Log to stderr (MCP convention)
console.error('CourseKit MCP Server v0.2.0 started');
console.error('Waiting for JSON-RPC commands on stdin...');

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.error('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.error('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});
