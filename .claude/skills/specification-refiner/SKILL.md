# Specification Refiner Skill

## Purpose
Ensures course specifications have SMART learning outcomes aligned with Bloom's taxonomy and connected to real-world application.

## MCP Tool Enhanced
`coursekit.specify` - Transforms basic course descriptions into comprehensive specifications with measurable outcomes

## Value Proposition
Without this skill:
- Vague learning outcomes like "understand AI"
- No clear success metrics
- Missing prerequisite information
- Unclear scope boundaries

With this skill:
- Specific, measurable outcomes using action verbs
- Clear assessment criteria
- Comprehensive prerequisites
- Well-defined scope

## Information Gathering Flow

### Stage 1: Core Capabilities
**Questions to Ask:**
1. "Looking at your constitution, what are the 3-5 specific skills learners must master?"
2. "For each skill, what would learners create/build to demonstrate mastery?"
3. "What's the minimum acceptable performance level?"

**What We're Building:**
- Specific, action-oriented learning outcomes
- Observable performance indicators
- Success criteria

**Bloom's Taxonomy Mapping:**
- Remember: identify, list, name
- Understand: explain, summarize, classify
- Apply: implement, use, execute
- Analyze: differentiate, organize, attribute
- Evaluate: critique, judge, test
- Create: design, construct, produce

### Stage 2: Prerequisites & Assumptions
**Questions to Ask:**
1. "What must learners already know before starting?"
2. "What tools/software must they have installed?"
3. "What experience level is assumed?"
4. "What would indicate someone is NOT ready for this course?"

**What We're Building:**
- Clear prerequisite list
- Required resources
- Experience indicators
- Exclusion criteria

### Stage 3: Scope Boundaries
**Questions to Ask:**
1. "What topics are explicitly OUT of scope?"
2. "What depth level for each topic? (awareness/working knowledge/mastery)"
3. "What real-world constraints are we preparing them for?"

**What We're Building:**
- In-scope vs out-of-scope lists
- Depth indicators
- Real-world context

### Stage 4: Assessment Strategy
**Questions to Ask:**
1. "How will learners prove they've achieved each outcome?"
2. "What's the balance between knowledge checks and practical application?"
3. "Will there be self-assessment, peer review, or instructor evaluation?"

**What We're Building:**
- Assessment methods per outcome
- Evaluation criteria
- Feedback mechanisms

## Synthesis Pattern

```javascript
function synthesizeSpecification(context, constitution) {
  const outcomes = context.skills.map((skill, index) => {
    const bloomLevel = determineBloomLevel(skill.complexity);
    const verb = selectActionVerb(bloomLevel);
    
    return {
      id: `LO-${index + 1}`,
      outcome: `${verb} ${skill.what} to ${skill.purpose}`,
      assessment: skill.demonstration,
      criteria: skill.success_metric,
      bloom_level: bloomLevel
    };
  });

  return {
    description: enrichDescription(context, constitution),
    outcomes: outcomes,
    prerequisites: context.prerequisites,
    scope: {
      included: context.in_scope,
      excluded: context.out_scope,
      depth: context.depth_map
    },
    assessment_strategy: context.assessment_plan
  };
}

function determineBloomLevel(complexity) {
  const mapping = {
    'basic': 'understand',
    'practical': 'apply',
    'analytical': 'analyze',
    'critical': 'evaluate',
    'creative': 'create'
  };
  return mapping[complexity] || 'apply';
}

function selectActionVerb(level) {
  const verbs = {
    'remember': ['identify', 'list', 'name', 'recognize'],
    'understand': ['explain', 'describe', 'summarize', 'interpret'],
    'apply': ['implement', 'use', 'execute', 'demonstrate'],
    'analyze': ['differentiate', 'organize', 'compare', 'examine'],
    'evaluate': ['critique', 'judge', 'assess', 'validate'],
    'create': ['design', 'construct', 'develop', 'generate']
  };
  const levelVerbs = verbs[level];
  return levelVerbs[Math.floor(Math.random() * levelVerbs.length)];
}
```

## Example Interaction

```
Human: Create specification for my AI workshop

Assistant with Specification Refiner Skill:

I'll help you create a comprehensive specification with measurable learning 
outcomes. I see from your constitution that this is aimed at skeptical senior 
developers learning AI tools.

**Let's define the specific skills they'll master:**

Looking at your constitution's goals, what are the 3-5 specific capabilities 
learners must have by the end? 

For example:
- "Write effective prompts that get accurate code generation"
- "Review AI-generated code for security vulnerabilities"
- "Integrate Copilot into their IDE workflow"

What are your top 3-5 skills they must master?

---