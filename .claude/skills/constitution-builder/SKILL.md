# Constitution Builder Skill

## Purpose
This skill guides course creators through a structured interview process to develop a comprehensive course constitution, then uses the CourseKit MCP server to generate the final artifact.

## Core Capability
I help course creators develop robust constitutional documents by:
1. Asking targeted questions about their course vision
2. Gathering essential information systematically
3. Identifying gaps and suggesting improvements
4. Generating a complete constitution via CourseKit MCP

## Interview Process

### Phase 1: Vision & Purpose
I start by exploring the fundamental "why" of your course:

**Questions I'll Ask:**
- What problem does this course solve for learners?
- What transformation do you want learners to experience?
- What makes this course unique or necessary?
- What's the one thing learners MUST take away?

**What I'm Looking For:**
- Clear value proposition
- Measurable transformation
- Differentiation from existing offerings
- Core learning promise

### Phase 2: Audience Analysis
Next, I help you define your ideal learner:

**Questions I'll Ask:**
- What is your learners' current skill level?
- What challenges are they facing that brought them here?
- What are their time constraints and learning preferences?
- What tools/resources do they already have?
- What misconceptions might they have?

**What I'm Building:**
- Detailed learner personas
- Prerequisites list
- Learning style considerations
- Common blockers to address

### Phase 3: Learning Outcomes
I guide you through creating specific, measurable outcomes:

**Questions I'll Ask:**
- What specific skills will learners gain?
- How will they prove they've learned it?
- What will they be able to create/build/do afterward?
- How does this apply to their real work?

**What I'm Ensuring:**
- Outcomes follow Bloom's taxonomy
- Each outcome is measurable
- Clear success criteria
- Real-world application

### Phase 4: Pedagogical Approach
I help you define HOW the course will be taught:

**Questions I'll Ask:**
- How much should be lecture vs. hands-on?
- Should learners work alone, in pairs, or groups?
- How will you check understanding along the way?
- What's your approach to mistakes and failure?

**What I'm Establishing:**
- Teaching methodology
- Activity balance
- Assessment strategy
- Learning safety approach

### Phase 5: Constraints & Logistics
Finally, I identify practical boundaries:

**Questions I'll Ask:**
- How much time is available?
- What technology constraints exist?
- What's the maximum/minimum class size?
- What resources can you provide?
- What follow-up support is available?

**What I'm Documenting:**
- Time boundaries
- Technical requirements
- Scalability limits
- Resource availability
- Support structure

## Integration with CourseKit MCP

Once I've gathered all information, I'll:

1. **Synthesize** all responses into a comprehensive vision statement
2. **Call** `coursekit.constitution` with the enriched vision
3. **Review** the generated constitution with you
4. **Refine** any sections that need adjustment
5. **Validate** alignment with your original intent

## Usage Example

```
Human: I want to create a workshop on AI coding assistants.

Assistant using this skill: Excellent! Let's build a strong foundation for your AI coding assistants workshop. I'll guide you through some key questions to ensure we create a comprehensive constitution for your course.

Let's start with the core purpose:

**What problem are you solving?**
Think about your target developers - what struggle are they facing that your workshop addresses? For example:
- Are they overwhelmed by AI tool choices?
- Missing out on productivity gains?
- Making security mistakes with AI?
- Unable to convince their teams to adopt AI?

What specific problem brought you to create this workshop?

[After gathering all information...]

Based on everything you've shared, here's the comprehensive vision for your constitution:

"Create a transformative 4-hour hands-on workshop that empowers senior developers with 5+ years experience but no AI tool exposure to confidently integrate AI coding assistants into their daily workflow. The workshop solves the problem of talented developers falling behind the productivity curve due to AI tool hesitancy, providing them with practical, immediately-applicable skills in prompt engineering, code review, and AI-assisted debugging. Through paired exercises and real-world scenarios from enterprise development, participants will overcome their skepticism and build a personal AI toolkit they can use the moment they return to work. Success means participants leave capable of 2x productivity gains while maintaining code quality and security standards."

Shall I generate the complete constitution with this vision, or would you like to refine any aspects first?
```

## Benefits of This Skill

1. **Higher Quality Output**: Constitutions are comprehensive and well-thought-out
2. **Time Efficiency**: Avoids back-and-forth revisions
3. **Best Practices**: Ensures instructional design principles are followed
4. **Consistency**: All courses follow the same thorough process
5. **Learning**: Users understand what makes a good constitution

## Handoff to MCP

The skill prepares a rich, detailed vision that includes:
- Problem statement
- Target audience details  
- Success metrics
- Unique value proposition
- Constraints and boundaries
- Pedagogical principles

This enriched input produces far better MCP output than a simple one-line vision.

## Next Skills to Build

After validating this approach, we could add:
- **Specification Refiner**: Ensures learning outcomes are SMART
- **Plan Optimizer**: Validates time allocations and flow
- **Task Prioritizer**: Helps identify critical vs. nice-to-have tasks
- **Implementation Coach**: Guides content creation with templates
- **Quality Validator**: Reviews all artifacts for alignment

## Implementation Notes

This skill:
- Works alongside the CourseKit MCP, not replacing it
- Can be used with or without the MCP installed
- Provides value even if users manually create their constitution
- Builds user expertise through guided questioning
- Creates reusable templates from successful courses
