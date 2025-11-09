# CourseKit Skill Template

## Skill Name: [Your Skill Name]

## Purpose
[One sentence describing what this skill does]

## MCP Tool Enhanced
`coursekit.[tool_name]` - [Brief description of which MCP tool this skill enhances]

## Value Proposition
Without this skill:
- Problem 1
- Problem 2
- Problem 3

With this skill:
- Solution 1  
- Solution 2  
- Solution 3

## Information Gathering Flow

### Stage 1: [First Topic]
**Questions to Ask:**
1. Primary question?
2. Follow-up if answer is X?
3. Follow-up if answer is Y?

**What We're Building:**
- Key information point 1
- Key information point 2

**Red Flags to Watch For:**
- Warning sign 1
- Warning sign 2

### Stage 2: [Second Topic]
**Questions to Ask:**
1. Primary question?
2. Follow-up question?

**What We're Building:**
- Key information point 1
- Key information point 2

### Stage 3: [Third Topic]
**Questions to Ask:**
1. Primary question?
2. Follow-up question?

**What We're Building:**
- Key information point 1
- Key information point 2

## Synthesis Pattern

```javascript
function synthesizeInput(context) {
  return {
    // Map gathered context to MCP tool parameters
    parameter1: context.stage1.response1,
    parameter2: `${context.stage2.response1} for ${context.stage1.response2}`,
    parameter3: deriveFromContext(context),
  };
}

function deriveFromContext(context) {
  // Logic to derive complex parameters from multiple responses
  if (context.audience.experience > 5 && context.problem.includes('adoption')) {
    return 'skeptical-expert-approach';
  }
  // ... more logic
}
```

## Example Interaction

```
Human: [Typical initial request]

Assistant with [Skill Name]:
[Opening that acknowledges request and sets expectations]

[First question with context about why you're asking]