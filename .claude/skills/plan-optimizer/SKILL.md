# Plan Optimizer Skill

## Purpose
Creates realistic, engaging course plans with proper pacing, energy management, and variety of activities while respecting time constraints.

## MCP Tool Enhanced
`coursekit.plan` - Transforms basic duration/format into comprehensive instructional plans with detailed timelines and engagement strategies

## Value Proposition
Without this skill:
- Unrealistic time estimates
- Energy crashes after lunch
- Too much lecture, not enough practice
- Missing breaks and transitions
- Poor activity variety

With this skill:
- Accurate time allocations with buffers
- Energy curve management
- Optimal theory/practice ratios
- Strategic break placement
- Diverse engagement methods

## Information Gathering Flow

### Stage 1: Time & Format Analysis
**Questions to Ask:**
1. "Is this in-person, virtual, or hybrid?"
2. "What time of day? (morning start/afternoon/evening)"
3. "Single session or multiple days?"
4. "Any fixed constraints? (lunch time, hard stop, etc.)"

**What We're Building:**
- Realistic timeline with transitions
- Break schedule
- Energy curve planning
- Buffer time allocation

**Energy Curve Patterns:**
- Morning: High → Medium → Low (pre-lunch dip)
- Post-lunch: Low → Medium → High → Medium
- Late afternoon: Medium → Low
- Evening: Low → Medium (if energized)

### Stage 2: Activity Balance
**Questions to Ask:**
1. "What's your preferred lecture vs. hands-on ratio?"
2. "Individual work, pairs, or group activities?"
3. "How comfortable are you with participant discussions?"
4. "Any activities you definitely want to include/avoid?"

**What We're Building:**
- Activity type distribution
- Interaction patterns
- Engagement variety
- Instructor comfort zones

**Activity Types & Energy Levels:**
- **High Energy**: Hands-on coding, group challenges, competitions
- **Medium Energy**: Guided practice, pair work, demonstrations
- **Low Energy**: Lecture, video, individual reading
- **Re-energizers**: Stand-up discussions, polls, quick games

### Stage 3: Module Sequencing
**Questions to Ask:**
1. "Any dependencies between topics?"
2. "What's the most complex concept?"
3. "What quick win can we give them early?"
4. "What should they remember most?"

**What We're Building:**
- Logical learning progression
- Complexity curve
- Quick wins placement
- Memory optimization (primacy/recency)

### Stage 4: Logistics & Resources
**Questions to Ask:**
1. "How many participants expected?"
2. "Room setup possibilities?"
3. "What tech is available?"
4. "Any co-instructors or TAs?"

**What We're Building:**
- Room configuration
- Resource requirements
- Support structure
- Parallel activities planning

## Synthesis Pattern

```javascript
function optimizePlan(context, specification) {
  const timeline = generateTimeline(context.duration, context.format);
  const modules = allocateModules(specification.outcomes, timeline);
  
  return modules.map(module => {
    const energyLevel = calculateEnergyLevel(module.timeSlot);
    const activities = selectActivities(module.content, energyLevel);
    
    return {
      ...module,
      timing: addBuffers(module.duration),
      activities: balanceActivities(activities, context.preferences),
      energy_management: getEnergyStrategy(module.timeSlot),
      materials: identifyMaterials(activities),
      transitions: planTransitions(module.position)
    };
  });
}

function calculateEnergyLevel(timeSlot) {
  const hour = timeSlot.startHour;
  if (hour < 10) return 'high';
  if (hour < 12) return 'medium';
  if (hour < 14) return 'low'; // lunch dip
  if (hour < 16) return 'medium';
  return 'low';
}

function selectActivities(content, energyLevel) {
  const activityMap = {
    'high': ['hands-on', 'challenge', 'build'],
    'medium': ['guided-practice', 'discussion', 'demo'],
    'low': ['video', 'lecture', 'reflection']
  };
  
  return matchContentToActivities(content, activityMap[energyLevel]);
}
```

## Module Planning Framework

### Opening Module Pattern (High Energy)
- Hook: Problem/story (2 min)
- Introductions: Quick & engaging (5 min)
- Overview: Visual roadmap (3 min)
- Quick win: First success (10 min)
- Energy: Start strong, build confidence

### Content Module Pattern (Varying Energy)
- Review: Connect to previous (2 min)
- Concept: Introduce new idea (5-10 min)
- Demo: Show it working (5-10 min)
- Practice: Hands-on application (15-20 min)
- Debrief: Key takeaways (5 min)

### Closing Module Pattern (Medium Energy)
- Synthesis: Connect all pieces (10 min)
- Application: Real-world planning (10 min)
- Resources: Next steps (5 min)
- Celebration: Acknowledge achievement (5 min)

## Time Management Rules

### Buffer Allocation
- Between modules: 5 minutes (transitions)
- Complex activities: +20% time buffer
- First activity after break: +5 minutes (settling)
- Last activity before break: -5 minutes (wrap up)

### Break Scheduling
- Every 50-90 minutes: 10-15 minute break
- After intensive coding: 15 minute break
- Post-lunch: Account for 15-minute "warm-up"
- Never skip breaks to "save time"

## Example Interaction

```
Human: Create a plan for my 4-hour workshop

Assistant with Plan Optimizer Skill:

I'll help you create an optimized plan that maintains energy and maximizes 
learning. Let me understand your specific context.

**First, let's nail down the logistics:**

What's the format and schedule?
- In-person, virtual, or hybrid?
- Start time? (e.g., 9 AM, 1 PM)
- Single 4-hour block or split sessions?
- Any fixed constraints? (lunch at noon, hard stop, etc.)