/**
 * Theme Extractor
 *
 * Clusters learning outcomes into semantic themes using
 * keyword analysis and similarity scoring.
 */

/**
 * Extract and cluster themes from learning outcomes
 * @param {Array} learningOutcomes - List of learning outcome objects
 * @param {Object} options - Clustering options
 * @returns {Array} Clustered themes with learning outcomes
 */
export function extractThemes(learningOutcomes, options = {}) {
  const {
    granularity = 'medium', // 'coarse' (5-8), 'medium' (8-12), 'fine' (12+)
    minOutcomesPerTheme = 2,
    useBloomLevels = true
  } = options;

  if (!learningOutcomes || learningOutcomes.length === 0) {
    return [];
  }

  // Extract keywords from each learning outcome
  const outcomesWithKeywords = learningOutcomes.map(outcome => ({
    ...outcome,
    keywords: extractKeywords(outcome.text)
  }));

  // Cluster outcomes by keyword similarity
  const clusters = clusterByKeywords(outcomesWithKeywords, granularity);

  // Convert clusters to themes
  const themes = clusters.map((cluster, index) => {
    const themeName = generateThemeName(cluster);
    const description = generateThemeDescription(cluster);
    const bloomLevels = useBloomLevels ? identifyBloomLevels(cluster) : [];

    return {
      theme_id: `theme_${index + 1}`,
      theme_name: themeName,
      description: description,
      learning_outcomes: cluster.map(o => o.text),
      bloom_levels: bloomLevels,
      estimated_hours: estimateTimeForTheme(cluster),
      keywords: getMostCommonKeywords(cluster, 5),
      confidence: calculateThemeConfidence(cluster)
    };
  });

  // Sort themes by estimated time (descending)
  return themes.sort((a, b) => b.estimated_hours - a.estimated_hours);
}

/**
 * Extract keywords from text
 * @param {string} text - Text to analyze
 * @returns {Array} List of keywords
 */
function extractKeywords(text) {
  // Remove common stop words
  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'will', 'with', 'able', 'how', 'what', 'when', 'where',
    'who', 'why', 'this', 'these', 'those', 'they', 'them', 'their'
  ]);

  // Extract words
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));

  // Remove duplicates
  return [...new Set(words)];
}

/**
 * Cluster outcomes by keyword similarity
 * @param {Array} outcomes - Outcomes with keywords
 * @param {string} granularity - Clustering granularity
 * @returns {Array} Clusters of outcomes
 */
function clusterByKeywords(outcomes, granularity) {
  if (outcomes.length === 0) return [];

  // Determine target number of clusters based on granularity
  const targetClusters = getTargetClusterCount(outcomes.length, granularity);

  // Simple hierarchical clustering approach
  const clusters = outcomes.map(o => [o]); // Start with each outcome in its own cluster

  // Merge similar clusters until we reach target count
  while (clusters.length > targetClusters && clusters.length > 1) {
    let maxSimilarity = -1;
    let mergeIndices = [0, 1];

    // Find most similar pair of clusters
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const similarity = calculateClusterSimilarity(clusters[i], clusters[j]);
        if (similarity > maxSimilarity) {
          maxSimilarity = similarity;
          mergeIndices = [i, j];
        }
      }
    }

    // Merge the most similar clusters
    const [i, j] = mergeIndices;
    clusters[i] = [...clusters[i], ...clusters[j]];
    clusters.splice(j, 1);
  }

  return clusters;
}

/**
 * Calculate similarity between two clusters
 * @param {Array} cluster1 - First cluster
 * @param {Array} cluster2 - Second cluster
 * @returns {number} Similarity score 0-1
 */
function calculateClusterSimilarity(cluster1, cluster2) {
  // Get all keywords from each cluster
  const keywords1 = new Set(cluster1.flatMap(o => o.keywords));
  const keywords2 = new Set(cluster2.flatMap(o => o.keywords));

  // Calculate Jaccard similarity
  const intersection = new Set([...keywords1].filter(k => keywords2.has(k)));
  const union = new Set([...keywords1, ...keywords2]);

  return intersection.size / union.size;
}

/**
 * Get target cluster count based on granularity
 * @param {number} outcomeCount - Number of outcomes
 * @param {string} granularity - Desired granularity
 * @returns {number} Target cluster count
 */
function getTargetClusterCount(outcomeCount, granularity) {
  const ranges = {
    coarse: [5, 8],
    medium: [8, 12],
    fine: [12, 20]
  };

  const [min, max] = ranges[granularity] || ranges.medium;

  // Scale to outcome count
  if (outcomeCount <= min) return Math.min(outcomeCount, min);
  if (outcomeCount >= max * 2) return max;

  // Linear interpolation
  return Math.floor(min + (outcomeCount / (max * 2)) * (max - min));
}

/**
 * Generate theme name from cluster
 * @param {Array} cluster - Cluster of outcomes
 * @returns {string} Theme name
 */
function generateThemeName(cluster) {
  const keywords = getMostCommonKeywords(cluster, 3);

  if (keywords.length === 0) {
    return `Theme ${Math.random().toString(36).substring(7)}`;
  }

  // Capitalize first letter of each keyword
  const capitalized = keywords.map(k =>
    k.charAt(0).toUpperCase() + k.slice(1)
  );

  // Join with appropriate connector
  if (capitalized.length === 1) {
    return capitalized[0];
  } else if (capitalized.length === 2) {
    return `${capitalized[0]} and ${capitalized[1]}`;
  } else {
    return capitalized.slice(0, -1).join(', ') + ', and ' + capitalized[capitalized.length - 1];
  }
}

/**
 * Generate theme description
 * @param {Array} cluster - Cluster of outcomes
 * @returns {string} Theme description
 */
function generateThemeDescription(cluster) {
  const keywords = getMostCommonKeywords(cluster, 5);
  const outcomeCount = cluster.length;

  return `Core concepts and skills related to ${keywords.slice(0, 3).join(', ')}. ` +
         `Covers ${outcomeCount} learning outcome${outcomeCount > 1 ? 's' : ''}.`;
}

/**
 * Get most common keywords from cluster
 * @param {Array} cluster - Cluster of outcomes
 * @param {number} limit - Maximum keywords to return
 * @returns {Array} Most common keywords
 */
function getMostCommonKeywords(cluster, limit) {
  const keywordCounts = new Map();

  cluster.forEach(outcome => {
    outcome.keywords.forEach(keyword => {
      keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
    });
  });

  return Array.from(keywordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([keyword]) => keyword);
}

/**
 * Identify Bloom's taxonomy levels in cluster
 * @param {Array} cluster - Cluster of outcomes
 * @returns {Array} Bloom levels present
 */
function identifyBloomLevels(cluster) {
  const bloomVerbs = {
    remember: ['identify', 'recognize', 'recall', 'list', 'name', 'define', 'describe'],
    understand: ['explain', 'summarize', 'interpret', 'classify', 'compare', 'discuss'],
    apply: ['apply', 'implement', 'use', 'demonstrate', 'solve', 'execute'],
    analyze: ['analyze', 'differentiate', 'examine', 'investigate', 'categorize'],
    evaluate: ['evaluate', 'assess', 'critique', 'judge', 'justify', 'recommend'],
    create: ['create', 'design', 'develop', 'construct', 'build', 'formulate']
  };

  const foundLevels = new Set();

  cluster.forEach(outcome => {
    const text = outcome.text.toLowerCase();

    for (const [level, verbs] of Object.entries(bloomVerbs)) {
      if (verbs.some(verb => text.includes(verb))) {
        foundLevels.add(level);
      }
    }
  });

  // Return in Bloom's hierarchy order
  const orderedLevels = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'];
  return orderedLevels.filter(level => foundLevels.has(level));
}

/**
 * Estimate time needed for theme
 * @param {Array} cluster - Cluster of outcomes
 * @returns {number} Estimated hours
 */
function estimateTimeForTheme(cluster) {
  const outcomeCount = cluster.length;
  const bloomLevels = identifyBloomLevels(cluster);

  // Base time per outcome
  let baseTime = 0.5; // 30 minutes per outcome

  // Adjust for Bloom level complexity
  if (bloomLevels.includes('create') || bloomLevels.includes('evaluate')) {
    baseTime *= 1.5; // Higher-order thinking takes longer
  }

  const total = outcomeCount * baseTime;

  // Round to nearest 0.5 hour
  return Math.round(total * 2) / 2;
}

/**
 * Calculate confidence score for theme
 * @param {Array} cluster - Cluster of outcomes
 * @returns {string} Confidence level
 */
function calculateThemeConfidence(cluster) {
  if (cluster.length < 2) {
    return 'low'; // Single outcome themes are less confident
  }

  // Calculate keyword cohesion
  const allKeywords = cluster.flatMap(o => o.keywords);
  const uniqueKeywords = new Set(allKeywords);
  const cohesion = 1 - (uniqueKeywords.size / allKeywords.length);

  if (cohesion > 0.5) return 'high';
  if (cohesion > 0.3) return 'medium';
  return 'low';
}

export default {
  extractThemes
};
