/**
 * Plan Validator
 *
 * Validates course plans for completeness, alignment, and quality.
 * Converts markdown plans to structured JSON for analysis.
 */

/**
 * Validate a course plan
 * @param {string} planMarkdown - Plan content in markdown
 * @param {Object} context - Context from other artifacts
 * @param {string} context.constitution - Constitution content
 * @param {string} context.specification - Specification content
 * @param {Object} context.themes - Themes data
 * @returns {Object} Validation results with issues and recommendations
 */
export function validatePlan(planMarkdown, context = {}) {
  const result = {
    valid: true,
    score: 100,
    issues: [],
    recommendations: [],
    outline: null,
    metadata: {
      validatedAt: new Date().toISOString()
    }
  };

  try {
    // Convert markdown plan to structured outline
    result.outline = planToOutline(planMarkdown);

    // Run validation checks
    const structureCheck = validateStructure(result.outline);
    const coverageCheck = validateCoverage(result.outline, context.themes);
    const timingCheck = validateTiming(result.outline);
    const alignmentCheck = validateAlignment(result.outline, context);

    // Aggregate issues
    result.issues.push(...structureCheck.issues);
    result.issues.push(...coverageCheck.issues);
    result.issues.push(...timingCheck.issues);
    result.issues.push(...alignmentCheck.issues);

    // Aggregate recommendations
    result.recommendations.push(...structureCheck.recommendations);
    result.recommendations.push(...coverageCheck.recommendations);
    result.recommendations.push(...timingCheck.recommendations);
    result.recommendations.push(...alignmentCheck.recommendations);

    // Calculate score
    const issueCount = result.issues.length;
    result.score = Math.max(0, 100 - (issueCount * 10));
    result.valid = result.score >= 60; // 60% is passing

  } catch (error) {
    result.valid = false;
    result.score = 0;
    result.issues.push({
      severity: 'critical',
      category: 'parsing',
      message: `Failed to parse plan: ${error.message}`
    });
  }

  return result;
}

/**
 * Convert markdown plan to structured JSON outline
 * @param {string} markdown - Plan markdown content
 * @returns {Object} Structured outline
 */
export function planToOutline(markdown) {
  const outline = {
    title: null,
    format: null,
    duration: null,
    modules: []
  };

  const lines = markdown.split('\n');
  let currentModule = null;
  let currentSection = null;

  lines.forEach((line, index) => {
    // Extract overview metadata
    if (line.includes('**Format**:')) {
      outline.format = line.split(':')[1].trim();
    }
    if (line.includes('**Total Duration**:')) {
      outline.duration = line.split(':')[1].trim();
    }

    // Module headers (### Module N: ...)
    const moduleMatch = line.match(/^###\s+Module\s+(\d+):\s+(.+)$/);
    if (moduleMatch) {
      currentModule = {
        module_id: `module_${moduleMatch[1]}`,
        module_number: parseInt(moduleMatch[1]),
        module_name: moduleMatch[2].trim(),
        learning_objectives: [],
        timeline: [],
        activities: [],
        materials: [],
        estimated_duration: null
      };
      outline.modules.push(currentModule);
      currentSection = null;
    }

    // Section headers (#### ...)
    const sectionMatch = line.match(/^####\s+(.+)$/);
    if (sectionMatch && currentModule) {
      currentSection = sectionMatch[1].trim();
    }

    // Learning Objectives
    if (currentSection === 'Learning Objectives' && line.trim().startsWith('-')) {
      const objective = line.trim().substring(1).trim();
      currentModule.learning_objectives.push(objective);
    }

    // Timeline entries (- HH:MM-HH:MM - ...)
    if (currentSection === 'Timeline' && line.trim().startsWith('-')) {
      const timelineMatch = line.match(/^\s*-\s*(\d+:\d+-\d+:\d+)\s*-\s*(.+)$/);
      if (timelineMatch) {
        currentModule.timeline.push({
          time: timelineMatch[1].trim(),
          activity: timelineMatch[2].trim()
        });
      }
    }

    // Activities
    if (currentSection === 'Activities' && line.trim().startsWith('-')) {
      const activityMatch = line.match(/^\s*-\s*\*\*(.+?)\*\*:\s*(.+?)(?:\((\d+)\s*min\))?$/);
      if (activityMatch) {
        currentModule.activities.push({
          type: activityMatch[1].trim(),
          description: activityMatch[2].trim(),
          duration: activityMatch[3] ? parseInt(activityMatch[3]) : null
        });
      }
    }

    // Materials
    if (currentSection === 'Materials' && line.trim().startsWith('-')) {
      const material = line.trim().substring(1).trim();
      currentModule.materials.push(material);
    }
  });

  // Calculate module durations from timeline
  outline.modules.forEach(module => {
    if (module.timeline.length > 0) {
      const firstTime = module.timeline[0].time.split('-')[0];
      const lastTime = module.timeline[module.timeline.length - 1].time.split('-')[1];
      module.estimated_duration = calculateDuration(firstTime, lastTime);
    }
  });

  return outline;
}

/**
 * Calculate duration between two time strings
 * @param {string} start - Start time (HH:MM)
 * @param {string} end - End time (HH:MM)
 * @returns {number} Duration in minutes
 */
function calculateDuration(start, end) {
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  return endMinutes - startMinutes;
}

/**
 * Validate plan structure
 * @param {Object} outline - Structured outline
 * @returns {Object} Validation results
 */
function validateStructure(outline) {
  const issues = [];
  const recommendations = [];

  // Check for modules
  if (outline.modules.length === 0) {
    issues.push({
      severity: 'critical',
      category: 'structure',
      message: 'Plan has no modules defined'
    });
  } else if (outline.modules.length < 2) {
    recommendations.push({
      category: 'structure',
      message: 'Consider breaking content into at least 2-3 modules for better pacing'
    });
  }

  // Check each module
  outline.modules.forEach((module, index) => {
    if (module.learning_objectives.length === 0) {
      issues.push({
        severity: 'high',
        category: 'structure',
        message: `Module ${module.module_number} has no learning objectives`
      });
    }

    if (module.timeline.length === 0) {
      issues.push({
        severity: 'medium',
        category: 'structure',
        message: `Module ${module.module_number} has no timeline defined`
      });
    }

    if (module.activities.length === 0) {
      recommendations.push({
        category: 'engagement',
        message: `Module ${module.module_number} should include hands-on activities`
      });
    }
  });

  return { issues, recommendations };
}

/**
 * Validate theme coverage
 * @param {Object} outline - Structured outline
 * @param {Object} themes - Themes data
 * @returns {Object} Validation results
 */
function validateCoverage(outline, themes) {
  const issues = [];
  const recommendations = [];

  if (!themes || !themes.themes) {
    recommendations.push({
      category: 'coverage',
      message: 'No themes defined to validate coverage against'
    });
    return { issues, recommendations };
  }

  // Extract all objectives from plan
  const planObjectives = outline.modules.flatMap(m => m.learning_objectives);

  // Check coverage of each theme
  themes.themes.forEach(theme => {
    const covered = theme.learning_outcomes.some(outcome =>
      planObjectives.some(planObj =>
        planObj.toLowerCase().includes(outcome.toLowerCase().substring(0, 20))
      )
    );

    if (!covered) {
      issues.push({
        severity: 'medium',
        category: 'coverage',
        message: `Theme "${theme.theme_name}" not covered in plan`,
        theme_id: theme.theme_id
      });
    }
  });

  return { issues, recommendations };
}

/**
 * Validate timing and pacing
 * @param {Object} outline - Structured outline
 * @returns {Object} Validation results
 */
function validateTiming(outline) {
  const issues = [];
  const recommendations = [];

  // Calculate total duration
  let totalMinutes = 0;
  outline.modules.forEach(module => {
    if (module.estimated_duration) {
      totalMinutes += module.estimated_duration;
    }
  });

  // Check if any module is too long
  outline.modules.forEach(module => {
    if (module.estimated_duration > 90) {
      recommendations.push({
        category: 'pacing',
        message: `Module ${module.module_number} is ${module.estimated_duration} minutes - consider adding a break or splitting into smaller modules`
      });
    }
  });

  // Check for breaks
  const hasBreaks = outline.modules.some(m =>
    m.timeline.some(t => t.activity.toLowerCase().includes('break'))
  );

  if (totalMinutes > 120 && !hasBreaks) {
    recommendations.push({
      category: 'pacing',
      message: `Course is ${Math.round(totalMinutes / 60)} hours but has no breaks scheduled`
    });
  }

  return { issues, recommendations };
}

/**
 * Validate alignment with constitution and specification
 * @param {Object} outline - Structured outline
 * @param {Object} context - Constitution and specification
 * @returns {Object} Validation results
 */
function validateAlignment(outline, context) {
  const issues = [];
  const recommendations = [];

  if (!context.constitution) {
    recommendations.push({
      category: 'alignment',
      message: 'No constitution to validate alignment against'
    });
    return { issues, recommendations };
  }

  const constitution = context.constitution.toLowerCase();

  // Check for active learning if constitution emphasizes it
  if (constitution.includes('active learning') || constitution.includes('hands-on')) {
    const hasActivities = outline.modules.every(m => m.activities.length > 0);
    if (!hasActivities) {
      issues.push({
        severity: 'medium',
        category: 'alignment',
        message: 'Constitution emphasizes active learning, but some modules lack hands-on activities'
      });
    }
  }

  return { issues, recommendations };
}

export default {
  validatePlan,
  planToOutline
};
