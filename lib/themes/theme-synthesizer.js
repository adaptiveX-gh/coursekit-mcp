/**
 * Theme Synthesizer
 *
 * Synthesizes themes by combining materials analysis with
 * constitutional principles to create aligned, pedagogically-sound themes.
 */

import { extractThemes } from './theme-extractor.js';

/**
 * Synthesize themes from materials and constitution
 * @param {Object} materialsAnalysis - Output from material-analyzer
 * @param {string} constitution - Constitution markdown content
 * @param {Object} options - Synthesis options
 * @returns {Object} Synthesized themes with alignment notes
 */
export async function synthesizeThemes(materialsAnalysis, constitution = null, options = {}) {
  const {
    granularity = 'medium',
    validateAlignment = true
  } = options;

  const result = {
    success: true,
    themes: [],
    metadata: {
      totalOutcomes: 0,
      themesGenerated: 0,
      alignmentScore: null,
      synthesizedAt: new Date().toISOString()
    },
    warnings: []
  };

  // Extract learning outcomes from materials
  const learningOutcomes = materialsAnalysis?.synthesized?.learningOutcomes || [];
  result.metadata.totalOutcomes = learningOutcomes.length;

  if (learningOutcomes.length === 0) {
    result.warnings.push('No learning outcomes found in materials');
    return result;
  }

  // Extract themes from learning outcomes
  const extractedThemes = extractThemes(learningOutcomes, { granularity });
  result.metadata.themesGenerated = extractedThemes.length;

  // If constitution provided, validate alignment
  if (constitution && validateAlignment) {
    const alignment = validateConstitutionalAlignment(extractedThemes, constitution);
    result.themes = alignment.alignedThemes;
    result.metadata.alignmentScore = alignment.score;
    result.warnings.push(...alignment.warnings);
  } else {
    result.themes = extractedThemes;
  }

  // Enhance themes with material context
  result.themes = enrichThemesWithMaterials(result.themes, materialsAnalysis);

  return result;
}

/**
 * Validate themes against constitutional principles
 * @param {Array} themes - Extracted themes
 * @param {string} constitution - Constitution content
 * @returns {Object} Alignment validation results
 */
function validateConstitutionalAlignment(themes, constitution) {
  const result = {
    alignedThemes: themes,
    score: 100, // Start with perfect score
    warnings: []
  };

  const constitutionLower = constitution.toLowerCase();

  // Extract key principles from constitution
  const principles = {
    learnerCentered: constitutionLower.includes('learner-centered') || constitutionLower.includes('learner centered'),
    activeLearning: constitutionLower.includes('active learning') || constitutionLower.includes('hands-on'),
    realWorld: constitutionLower.includes('real-world') || constitutionLower.includes('authentic'),
    progressive: constitutionLower.includes('progressive') || constitutionLower.includes('builds on'),
    inclusive: constitutionLower.includes('inclusive') || constitutionLower.includes('accessible')
  };

  // Check each theme for alignment
  themes.forEach((theme, index) => {
    const alignmentIssues = [];

    // Check if theme has higher-order thinking (applies principle of active learning)
    if (principles.activeLearning) {
      const hasHigherOrder = theme.bloom_levels.some(level =>
        ['apply', 'analyze', 'evaluate', 'create'].includes(level)
      );
      if (!hasHigherOrder) {
        alignmentIssues.push('Theme lacks higher-order learning outcomes (apply, analyze, evaluate, create)');
      }
    }

    // Check if theme has progressive difficulty (if constitution emphasizes it)
    if (principles.progressive && theme.bloom_levels.length > 1) {
      const bloomOrder = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'];
      const indices = theme.bloom_levels.map(l => bloomOrder.indexOf(l)).filter(i => i >= 0);
      if (indices.length > 1) {
        const isProgressive = indices.every((val, i, arr) => i === 0 || val >= arr[i - 1]);
        if (!isProgressive) {
          alignmentIssues.push('Theme bloom levels not in progressive order');
        }
      }
    }

    // Add alignment notes to theme
    if (alignmentIssues.length > 0) {
      result.alignedThemes[index].alignment_notes = alignmentIssues;
      result.score -= (10 / themes.length); // Reduce score for each misalignment
      result.warnings.push(`Theme "${theme.theme_name}": ${alignmentIssues.join('; ')}`);
    } else {
      result.alignedThemes[index].alignment_notes = ['Fully aligned with constitutional principles'];
    }
  });

  result.score = Math.max(0, Math.round(result.score));
  return result;
}

/**
 * Enrich themes with material context
 * @param {Array} themes - Themes to enrich
 * @param {Object} materialsAnalysis - Materials analysis data
 * @returns {Array} Enriched themes
 */
function enrichThemesWithMaterials(themes, materialsAnalysis) {
  const concepts = materialsAnalysis?.synthesized?.concepts || [];
  const topics = materialsAnalysis?.synthesized?.topics || [];

  return themes.map(theme => {
    // Find related concepts
    const relatedConcepts = concepts.filter(concept =>
      theme.keywords.some(keyword =>
        concept.text.toLowerCase().includes(keyword.toLowerCase())
      )
    ).slice(0, 5); // Limit to top 5

    // Find related topics
    const relatedTopics = topics.filter(topic =>
      theme.keywords.some(keyword =>
        topic.text.toLowerCase().includes(keyword.toLowerCase())
      )
    ).slice(0, 3); // Limit to top 3

    return {
      ...theme,
      related_concepts: relatedConcepts.map(c => c.text),
      related_topics: relatedTopics.map(t => t.text),
      source_materials: materialsAnalysis.materials
        .filter(m => m.success)
        .map(m => m.source || m.filepath)
        .slice(0, 3) // Limit to top 3 sources
    };
  });
}

/**
 * Generate theme suggestions based on gaps
 * @param {Array} themes - Current themes
 * @param {Object} constitution - Constitution content
 * @returns {Array} Suggested additional themes
 */
export function suggestAdditionalThemes(themes, constitution) {
  const suggestions = [];

  // Common pedagogical themes that might be missing
  const commonThemes = [
    {
      name: 'Introduction and Foundations',
      keywords: ['introduction', 'basics', 'fundamentals'],
      rationale: 'Most courses need an introductory theme'
    },
    {
      name: 'Practical Application',
      keywords: ['practice', 'hands-on', 'exercise'],
      rationale: 'Active learning requires practice opportunities'
    },
    {
      name: 'Advanced Topics',
      keywords: ['advanced', 'complex', 'expert'],
      rationale: 'Progressive learning includes advanced content'
    },
    {
      name: 'Integration and Synthesis',
      keywords: ['integrate', 'combine', 'capstone'],
      rationale: 'Learners benefit from synthesis opportunities'
    }
  ];

  // Check which common themes are missing
  commonThemes.forEach(commonTheme => {
    const exists = themes.some(theme =>
      commonTheme.keywords.some(kw =>
        theme.theme_name.toLowerCase().includes(kw) ||
        theme.keywords.some(tk => tk.includes(kw))
      )
    );

    if (!exists) {
      suggestions.push({
        suggested_theme: commonTheme.name,
        rationale: commonTheme.rationale,
        keywords: commonTheme.keywords,
        priority: 'medium'
      });
    }
  });

  return suggestions;
}

export default {
  synthesizeThemes,
  suggestAdditionalThemes
};
