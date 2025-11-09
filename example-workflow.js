#!/usr/bin/env node

/**
 * CourseKit MCP - Example Usage
 * 
 * This script demonstrates how to use all five CourseKit tools
 * in sequence to develop a complete workshop.
 * 
 * In practice, you would use these through Claude or another
 * MCP-compatible client, but this shows the workflow.
 */

// Example workflow for creating an AI Coding Assistant Workshop

console.log("🚀 CourseKit Workshop Development Workflow\n");
console.log("=" .repeat(50));

// Phase 1: Constitution
console.log("\n📋 PHASE 1: CONSTITUTION");
console.log("-".repeat(30));
console.log("Creating governing principles...\n");

const constitutionInput = {
  tool: "coursekit.constitution",
  arguments: {
    vision: `Create a practical, hands-on workshop that transforms experienced developers 
    into effective AI coding assistant users. The workshop should demystify AI tools, 
    build confidence through practice, and establish best practices that developers 
    can immediately apply to their daily work. Focus on real-world scenarios, 
    common pitfalls, and proven patterns for AI-assisted development.`
  }
};

console.log("Input:", JSON.stringify(constitutionInput, null, 2));
console.log("\n✅ Constitution created: .coursekit/constitution.md");

// Phase 2: Specification
console.log("\n📝 PHASE 2: SPECIFICATION");
console.log("-".repeat(30));
console.log("Defining learning outcomes and requirements...\n");

const specificationInput = {
  tool: "coursekit.specify",
  arguments: {
    description: `"AI Coding Assistants for Senior Developers" - A 4-hour intensive workshop 
    for experienced developers (5+ years) who haven't yet adopted AI coding tools. 
    
    Topics to cover:
    - Understanding AI assistant capabilities and limitations
    - Effective prompt engineering for code generation
    - Using AI for code review and refactoring
    - Debugging with AI assistance
    - Security and privacy considerations
    - Integrating AI into existing workflows
    
    By the end, participants should be able to:
    - Write effective prompts for various coding tasks
    - Evaluate AI-generated code for correctness and quality
    - Use AI to accelerate debugging and problem-solving
    - Establish team guidelines for AI tool usage
    - Identify appropriate vs inappropriate use cases`
  }
};

console.log("Input:", JSON.stringify(specificationInput, null, 2));
console.log("\n✅ Specification created: .coursekit/specification.md");

// Phase 3: Plan
console.log("\n📅 PHASE 3: PLAN");
console.log("-".repeat(30));
console.log("Creating course structure and timeline...\n");

const planInput = {
  tool: "coursekit.plan",
  arguments: {
    format: "workshop",
    duration: "4 hours",
    approach: "hands-on"
  }
};

console.log("Input:", JSON.stringify(planInput, null, 2));
console.log("\n✅ Plan created: .coursekit/plan.md");
console.log("\nGenerated structure:");
console.log("  Module 1: Foundations (45 min)");
console.log("  Module 2: Core Concepts (60 min)");
console.log("  Module 3: Practical Application (75 min)");
console.log("  Module 4: Advanced Topics & Wrap-up (60 min)");

// Phase 4: Tasks
console.log("\n📋 PHASE 4: TASKS");
console.log("-".repeat(30));
console.log("Generating development task list...\n");

const tasksInput = {
  tool: "coursekit.tasks",
  arguments: {
    granularity: "medium"
  }
};

console.log("Input:", JSON.stringify(tasksInput, null, 2));
console.log("\n✅ Tasks created: .coursekit/tasks.md");
console.log("\nGenerated tasks summary:");
console.log("  High Priority: 5 tasks");
console.log("  Medium Priority: 4 tasks");
console.log("  Low Priority: 4 tasks");
console.log("  Total estimated time: 8.5 hours");

// Phase 5: Implementation
console.log("\n🔨 PHASE 5: IMPLEMENTATION");
console.log("-".repeat(30));
console.log("Executing tasks to create content...\n");

// Example: Implement multiple tasks
const tasksToImplement = [
  "Create welcome slides for Module 1",
  "Design hands-on exercise for prompt engineering",
  "Write facilitator notes for Module 1"
];

tasksToImplement.forEach((task, index) => {
  console.log(`\nTask ${index + 1}: ${task}`);
  
  const implementInput = {
    tool: "coursekit.implement",
    arguments: { task }
  };
  
  console.log("Input:", JSON.stringify(implementInput, null, 2));
  
  // Determine output type
  let outputFile = "";
  if (task.includes("slides")) {
    outputFile = `module1-welcome-slides.md (Slidev format)`;
  } else if (task.includes("exercise")) {
    outputFile = `prompt-engineering-exercise.md`;
  } else if (task.includes("notes")) {
    outputFile = `module1-facilitator-guide.md`;
  }
  
  console.log(`✅ Created: .coursekit/implementations/${outputFile}`);
});

// Summary
console.log("\n" + "=".repeat(50));
console.log("🎉 WORKSHOP DEVELOPMENT COMPLETE!");
console.log("=".repeat(50));

console.log("\n📁 Generated artifacts:");
console.log("   .coursekit/");
console.log("   ├── constitution.md");
console.log("   ├── specification.md");
console.log("   ├── plan.md");
console.log("   ├── tasks.md");
console.log("   └── implementations/");
console.log("       ├── module1-welcome-slides.md");
console.log("       ├── prompt-engineering-exercise.md");
console.log("       └── module1-facilitator-guide.md");

console.log("\n📊 Next steps:");
console.log("   1. Review and refine each artifact");
console.log("   2. Complete remaining tasks from task list");
console.log("   3. Test exercises and time estimates");
console.log("   4. Gather feedback from pilot run");
console.log("   5. Iterate based on learnings");

console.log("\n💡 Tips:");
console.log("   - Each phase builds on the previous one");
console.log("   - You can iterate on any phase as needed");
console.log("   - All content is version-controlled via Git");
console.log("   - Slidev presentations can be served with: npx slidev");

console.log("\n🔗 Resources:");
console.log("   - Slidev docs: https://sli.dev");
console.log("   - MCP docs: https://github.com/modelcontextprotocol");
console.log("   - Bloom's Taxonomy: https://cft.vanderbilt.edu/guides-sub-pages/blooms-taxonomy/");
