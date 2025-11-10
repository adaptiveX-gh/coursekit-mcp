/**
 * Gap Identifier
 *
 * Identifies knowledge gaps and research needs in course plans.
 * This enables the self-auditing planner pattern where the plan
 * recognizes what information it needs to strengthen quality.
 */

/**
 * Identify research needs from a plan
 * @param {string} planMarkdown - Plan content in markdown
 * @param {Object} outline - Structured outline from plan-validator
 * @param {Object} context - Available context (themes, constitution, materials)
 * @returns {Object} Identified research needs
 */
export function identifyResearchNeeds(planMarkdown, outline, context = {}) {
  const needs = {
    hasGaps: false,
    researchNeeds: [],
    metadata: {
      totalGaps: 0,
      priorityBreakdown: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      },
      identifiedAt: new Date().toISOString()
    }
  };

  // Identify different types of gaps
  const dataGaps = identifyDataGaps(planMarkdown, outline);
  const exampleGaps = identifyExampleGaps(planMarkdown, outline);
  const evidenceGaps = identifyEvidenceGaps(planMarkdown, outline);
  const conceptGaps = identifyConceptGaps(planMarkdown, outline, context);

  // Aggregate all gaps
  needs.researchNeeds.push(...dataGaps);
  needs.researchNeeds.push(...exampleGaps);
  needs.researchNeeds.push(...evidenceGaps);
  needs.researchNeeds.push(...conceptGaps);

  // Update metadata
  needs.metadata.totalGaps = needs.researchNeeds.length;
  needs.hasGaps = needs.researchNeeds.length > 0;

  // Count by priority
  needs.researchNeeds.forEach(need => {
    if (needs.metadata.priorityBreakdown[need.priority] !== undefined) {
      needs.metadata.priorityBreakdown[need.priority]++;
    }
  });

  // Sort by priority (critical first)
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  needs.researchNeeds.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return needs;
}

/**
 * Identify gaps where data or statistics would strengthen the plan
 * @param {string} planMarkdown - Plan markdown
 * @param {Object} outline - Structured outline
 * @returns {Array} Data gap research needs
 */
function identifyDataGaps(planMarkdown, outline) {
  const gaps = [];

  // Patterns that suggest need for data
  const dataPatterns = [
    { pattern: /studies show/i, need: 'Citation for studies claim', priority: 'high' },
    { pattern: /research indicates/i, need: 'Research citation', priority: 'high' },
    { pattern: /industry data/i, need: 'Industry statistics source', priority: 'medium' },
    { pattern: /(\d+%)\s+of/i, need: 'Source for percentage statistic', priority: 'high' },
    { pattern: /most (?:companies|organizations)/i, need: 'Data supporting "most" claim', priority: 'medium' },
    { pattern: /proven to/i, need: 'Evidence for effectiveness claim', priority: 'high' },
    { pattern: /widely adopted/i, need: 'Adoption statistics', priority: 'medium' }
  ];

  dataPatterns.forEach(({ pattern, need, priority }) => {
    if (pattern.test(planMarkdown)) {
      const matches = planMarkdown.match(pattern);
      if (matches) {
        gaps.push({
          type: 'data',
          priority: priority,
          need: need,
          context: matches[0],
          suggested_search: `current statistics on ${need.toLowerCase()}`,
          location: 'plan document'
        });
      }
    }
  });

  return gaps;
}

/**
 * Identify gaps where examples or case studies would help
 * @param {string} planMarkdown - Plan markdown
 * @param {Object} outline - Structured outline
 * @returns {Array} Example gap research needs
 */
function identifyExampleGaps(planMarkdown, outline) {
  const gaps = [];

  // Check each module for activities that might need examples
  outline.modules.forEach(module => {
    const needsExample = module.activities.some(activity =>
      activity.description.toLowerCase().includes('example') ||
      activity.description.toLowerCase().includes('case study') ||
      activity.description.toLowerCase().includes('demonstration')
    );

    if (needsExample) {
      // Check if examples are actually provided
      const hasExamples = module.materials.some(material =>
        material.toLowerCase().includes('example') ||
        material.toLowerCase().includes('case')
      );

      if (!hasExamples) {
        gaps.push({
          type: 'example',
          priority: 'high',
          need: `Real-world example for ${module.module_name}`,
          context: `Module ${module.module_number} activities mention examples but none are listed in materials`,
          suggested_search: `${module.module_name} case study examples`,
          location: `module_${module.module_number}`
        });
      }
    }

    // Check for exercises that need examples
    if (module.learning_objectives.some(obj => obj.toLowerCase().includes('apply'))) {
      const hasWorkingExample = module.materials.some(m => m.toLowerCase().includes('starter code') || m.toLowerCase().includes('template'));

      if (!hasWorkingExample) {
        gaps.push({
          type: 'example',
          priority: 'medium',
          need: `Working example or template for ${module.module_name}`,
          context: `Module emphasizes application but lacks starter materials`,
          suggested_search: `${module.module_name} code examples templates`,
          location: `module_${module.module_number}`
        });
      }
    }
  });

  return gaps;
}

/**
 * Identify gaps where evidence or citations would strengthen claims
 * @param {string} planMarkdown - Plan markdown
 * @param {Object} outline - Structured outline
 * @returns {Array} Evidence gap research needs
 */
function identifyEvidenceGaps(planMarkdown, outline) {
  const gaps = [];

  // Claims that need evidence
  const claimPatterns = [
    { pattern: /improves? (productivity|efficiency|performance)/i, claim: 'productivity improvement', priority: 'high' },
    { pattern: /reduces? (time|cost|errors?)/i, claim: 'reduction benefit', priority: 'high' },
    { pattern: /best practice/i, claim: 'best practice designation', priority: 'medium' },
    { pattern: /recommended by/i, claim: 'recommendation source', priority: 'medium' },
    { pattern: /industry standard/i, claim: 'industry standard status', priority: 'medium' }
  ];

  claimPatterns.forEach(({ pattern, claim, priority }) => {
    const matches = planMarkdown.match(new RegExp(pattern, 'gi'));
    if (matches && matches.length > 0) {
      // Check if there's a citation nearby
      const hasCitation = /\[.*?\]\(.*?\)|\(\d{4}\)|doi:|https?:\/\//.test(planMarkdown);

      if (!hasCitation) {
        gaps.push({
          type: 'evidence',
          priority: priority,
          need: `Evidence supporting ${claim}`,
          context: `Plan makes claims about ${claim} without citations`,
          suggested_search: `research evidence ${claim}`,
          location: 'plan document'
        });
      }
    }
  });

  return gaps;
}

/**
 * Identify conceptual gaps based on available materials
 * @param {string} planMarkdown - Plan markdown
 * @param {Object} outline - Structured outline
 * @param {Object} context - Available context
 * @returns {Array} Concept gap research needs
 */
function identifyConceptGaps(planMarkdown, outline, context) {
  const gaps = [];

  // If no materials were ingested, all concepts need research
  if (!context.materials || context.materials.materials.length === 0) {
    outline.modules.forEach(module => {
      module.learning_objectives.forEach(objective => {
        // Extract key concept from objective
        const conceptMatch = objective.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/);
        if (conceptMatch) {
          gaps.push({
            type: 'concept',
            priority: 'high',
            need: `Deeper explanation of ${conceptMatch[1]}`,
            context: `Learning objective mentions ${conceptMatch[1]} but no source materials provided`,
            suggested_search: `${conceptMatch[1]} explanation tutorial`,
            location: `module_${module.module_number}`
          });
        }
      });
    });
  } else {
    // Check if plan introduces concepts not in materials
    const materialsConcepts = (context.materials.synthesized?.concepts || []).map(c => c.text.toLowerCase());

    outline.modules.forEach(module => {
      module.learning_objectives.forEach(objective => {
        const words = objective.toLowerCase().split(/\s+/);
        const keyTerms = words.filter(w => w.length > 5);

        keyTerms.forEach(term => {
          const inMaterials = materialsConcepts.some(concept => concept.includes(term));
          if (!inMaterials) {
            gaps.push({
              type: 'concept',
              priority: 'medium',
              need: `Background information on ${term}`,
              context: `Plan references "${term}" which wasn't found in source materials`,
              suggested_search: `${term} definition concepts`,
              location: `module_${module.module_number}`
            });
          }
        });
      });
    });
  }

  // Deduplicate concept gaps (keep highest priority)
  const uniqueGaps = [];
  const seen = new Map();

  gaps.forEach(gap => {
    const key = gap.need.toLowerCase();
    if (!seen.has(key) || priorityValue(gap.priority) < priorityValue(seen.get(key).priority)) {
      if (seen.has(key)) {
        const index = uniqueGaps.findIndex(g => g.need.toLowerCase() === key);
        uniqueGaps[index] = gap;
      } else {
        uniqueGaps.push(gap);
      }
      seen.set(key, gap);
    }
  });

  return uniqueGaps;
}

/**
 * Convert priority to numeric value for comparison
 * @param {string} priority - Priority level
 * @returns {number} Numeric priority
 */
function priorityValue(priority) {
  const values = { critical: 0, high: 1, medium: 2, low: 3 };
  return values[priority] || 999;
}

/**
 * Generate research_needs.json output
 * @param {Array} researchNeeds - List of research needs
 * @returns {Object} Formatted research needs object
 */
export function formatResearchNeeds(researchNeeds) {
  return {
    research_needs: researchNeeds.map((need, index) => ({
      id: `research_${index + 1}`,
      type: need.type,
      priority: need.priority,
      need: need.need,
      context: need.context,
      suggested_search: need.suggested_search,
      location: need.location,
      status: 'pending'
    })),
    metadata: {
      total_needs: researchNeeds.length,
      by_priority: researchNeeds.reduce((acc, need) => {
        acc[need.priority] = (acc[need.priority] || 0) + 1;
        return acc;
      }, {}),
      by_type: researchNeeds.reduce((acc, need) => {
        acc[need.type] = (acc[need.type] || 0) + 1;
        return acc;
      }, {}),
      generated_at: new Date().toISOString()
    }
  };
}

export default {
  identifyResearchNeeds,
  formatResearchNeeds
};
