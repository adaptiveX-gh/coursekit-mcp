# Task Generator Skill

## Purpose
Creates comprehensive, prioritized task lists with accurate time estimates, dependencies, and resource requirements for efficient course development.

## MCP Tool Enhanced
`coursekit.tasks` - Transforms basic task generation into strategic work breakdown with critical path analysis and resource optimization

## Value Proposition
Without this skill:
- Generic task list without priorities
- Unrealistic time estimates
- Missing dependencies
- No parallel work identification
- Resource conflicts

With this skill:
- Priority-based task sequencing
- Data-driven time estimates
- Clear dependency mapping
- Parallel work opportunities
- Resource optimization

## Information Gathering Flow

### Stage 1: Development Resources
**Questions to Ask:**
1. "Who's available to help develop content? Just you or a team?"
2. "How many hours per week can you dedicate?"
3. "What's your deadline for completion?"
4. "Any tasks you're particularly fast/slow at?"

**What We're Building:**
- Resource availability map
- Realistic timeline
- Personal velocity factors
- Deadline alignment

**Time Estimation Factors:**
- First time creating: 1.5x base time
- Experienced creator: 0.75x base time
- Team collaboration: 1.2x for coordination
- Solo development: 1x base time

### Stage 2: Content Preferences
**Questions to Ask:**
1. "What content are you most excited to create?"
2. "What parts feel most daunting?"
3. "Any existing materials to adapt?"
4. "Prefer to polish as you go or iterate quickly?"

**What We're Building:**
- Motivation-based sequencing
- Risk identification
- Reuse opportunities
- Quality vs. speed tradeoffs

### Stage 3: Tool & Format Decisions
**Questions to Ask:**
1. "What tools will you use for slides? (PowerPoint/Slidev/Google Slides)"
2. "How will you create exercises? (GitHub/CodePen/Local files)"
3. "Documentation format? (Markdown/Docx/PDF)"
4. "Any required templates or branding?"

**What We're Building:**
- Tool-specific task adjustments
- Format requirements
- Template needs
- Brand compliance tasks

### Stage 4: Quality & Review Process
**Questions to Ask:**
1. "Will anyone review the content?"
2. "Need pilot testing?"
3. "Accessibility requirements?"
4. "Translation needs?"

**What We're Building:**
- Review cycles
- Testing tasks
- Compliance checks
- Localization tasks

## Task Prioritization Framework

### Priority Levels
```javascript
function prioritizeTasks(tasks, context) {
  return tasks.map(task => ({
    ...task,
    priority: calculatePriority(task, context),
    effort: estimateEffort(task, context),
    value: estimateValue(task, context),
    risk: assessRisk(task, context)
  })).sort((a, b) => {
    // Sort by WSJF (Weighted Shortest Job First)
    const wsjfA = (a.value * a.risk) / a.effort;
    const wsjfB = (b.value * b.risk) / b.effort;
    return wsjfB - wsjfA;
  });
}
```

### Priority Categories

**P0 - Critical Path** (Must have for minimum viable course)
- Core content slides
- Essential exercises
- Basic setup guide
- Assessment materials

**P1 - Enhanced Experience** (Significantly improves quality)
- Facilitator notes
- Solution walkthroughs
- Troubleshooting guides
- Visual aids

**P2 - Nice to Have** (Adds polish)
- Bonus exercises
- Alternative approaches
- Extended resources
- Video supplements

**P3 - Future Enhancements** (Post-launch improvements)
- Advanced topics
- Recorded demos
- Online versions
- Automated grading

## Task Dependencies Mapping

```javascript
function mapDependencies(tasks) {
  const dependencyGraph = {
    'constitution': [],
    'specification': ['constitution'],
    'plan': ['specification'],
    'slides-module-1': ['plan'],
    'exercise-module-1': ['slides-module-1'],
    'slides-module-2': ['plan'],
    'exercise-module-2': ['slides-module-2'],
    'facilitator-notes': ['all-slides'],
    'setup-guide': [],  // Can be done in parallel
    'assessment': ['all-exercises'],
    'final-review': ['all-content']
  };
  
  return tasks.map(task => ({
    ...task,
    dependencies: dependencyGraph[task.id] || [],
    canStartWhen: calculateEarliestStart(task, dependencyGraph)
  }));
}
```

## Time Estimation Model

### Base Time Estimates
- **Slides**: 3-5 minutes per slide creation
- **Exercises**: 45-90 minutes per exercise with solution
- **Documentation**: 30-60 minutes per guide page
- **Review**: 20% of creation time
- **Testing**: 30% of creation time

### Adjustment Factors
```javascript
function adjustTimeEstimate(baseTime, factors) {
  let adjusted = baseTime;
  
  // Experience factor
  adjusted *= factors.experienceLevel || 1.0;
  
  // Complexity factor
  adjusted *= factors.complexity || 1.0;
  
  // Quality factor (polish level)
  adjusted *= factors.qualityTarget || 1.0;
  
  // Collaboration overhead
  if (factors.teamSize > 1) {
    adjusted *= 1 + (0.1 * factors.teamSize);
  }
  
  // Add buffer
  adjusted *= 1.2; // 20% buffer
  
  return Math.ceil(adjusted);
}
```

## Sprint Planning

### Sprint Structure
```javascript
function planSprints(tasks, context) {
  const sprintDuration = context.hoursPerSprint;
  const sprints = [];
  let currentSprint = { tasks: [], hours: 0 };
  
  for (const task of tasks) {
    if (currentSprint.hours + task.effort <= sprintDuration) {
      currentSprint.tasks.push(task);
      currentSprint.hours += task.effort;
    } else {
      sprints.push(currentSprint);
      currentSprint = { tasks: [task], hours: task.effort };
    }
  }
  
  if (currentSprint.tasks.length > 0) {
    sprints.push(currentSprint);
  }
  
  return sprints.map((sprint, index) => ({
    ...sprint,
    number: index + 1,
    focus: determineFocus(sprint.tasks),
    deliverables: sprint.tasks.map(t => t.output)
  }));
}
```

## Example Interaction

```
Human: Generate tasks for my workshop

Assistant with Task Generator Skill:

I'll help you create a strategic task list with realistic time estimates and 
clear priorities. Let me understand your development context.

**First, let's assess your resources:**

Development capacity:
- Will you be developing this solo or with a team?
- How many hours per week can you dedicate?
- When do you need everything complete?
- What type of content creation are you fastest at? (slides/code/writing)