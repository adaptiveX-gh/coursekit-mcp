/**
 * Material Analyzer
 *
 * Orchestrates material ingestion from multiple sources
 * and synthesizes extracted information into a unified format.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { extractPDFText, extractLearningOutcomes as pdfExtractLO, extractConcepts as pdfExtractConcepts } from './pdf-processor.js';
import { processMarkdown, extractLearningOutcomes as mdExtractLO, extractConcepts as mdExtractConcepts } from './markdown-processor.js';
import { fetchWebContent, extractHeadings, htmlToText } from './web-scraper.js';

/**
 * Analyze materials from multiple sources
 * @param {Object} sources - Object containing file paths and URLs
 * @param {Array<string>} sources.pdfPaths - Paths to PDF files
 * @param {Array<string>} sources.markdownPaths - Paths to markdown files
 * @param {Array<string>} sources.textPaths - Paths to text files (transcripts)
 * @param {Array<string>} sources.urls - Web URLs to fetch
 * @returns {Promise<Object>} Synthesized analysis with learning outcomes and concepts
 */
export async function analyzeMaterials(sources = {}) {
  const {
    pdfPaths = [],
    markdownPaths = [],
    textPaths = [],
    urls = []
  } = sources;

  const results = {
    success: true,
    materials: [],
    synthesized: {
      learningOutcomes: [],
      concepts: [],
      topics: [],
      examples: [],
      audience: {
        level: null,
        background: null,
        prerequisites: []
      }
    },
    metadata: {
      totalSources: pdfPaths.length + markdownPaths.length + textPaths.length + urls.length,
      processedAt: new Date().toISOString(),
      errors: [],
      warnings: []
    }
  };

  // Process PDFs
  for (const pdfPath of pdfPaths) {
    try {
      const result = await extractPDFText(pdfPath);
      results.materials.push({
        type: 'pdf',
        source: pdfPath,
        ...result
      });

      if (result.success && result.text) {
        // Extract learning outcomes from PDF text
        const outcomes = pdfExtractLO(result.text);
        results.synthesized.learningOutcomes.push(...outcomes.map(o => ({
          ...o,
          source_file: path.basename(pdfPath)
        })));

        // Extract concepts
        const concepts = pdfExtractConcepts(result.text);
        results.synthesized.concepts.push(...concepts.map(c => ({
          ...c,
          source_file: path.basename(pdfPath)
        })));
      }

      if (result.warnings) {
        results.metadata.warnings.push(...result.warnings);
      }
    } catch (error) {
      results.metadata.errors.push({
        source: pdfPath,
        error: error.message
      });
    }
  }

  // Process Markdown files
  for (const mdPath of markdownPaths) {
    try {
      const result = await processMarkdown(mdPath);
      results.materials.push({
        type: 'markdown',
        source: mdPath,
        ...result
      });

      if (result.success) {
        // Add learning outcomes
        results.synthesized.learningOutcomes.push(...result.learningOutcomes.map(o => ({
          ...o,
          source_file: path.basename(mdPath)
        })));

        // Add concepts
        results.synthesized.concepts.push(...result.concepts.map(c => ({
          ...c,
          source_file: path.basename(mdPath)
        })));

        // Extract topics from headers
        result.structure.headers.forEach(header => {
          if (header.level <= 2) {
            results.synthesized.topics.push({
              text: header.text,
              source_file: path.basename(mdPath),
              level: header.level
            });
          }
        });
      }
    } catch (error) {
      results.metadata.errors.push({
        source: mdPath,
        error: error.message
      });
    }
  }

  // Process text files (transcripts)
  for (const textPath of textPaths) {
    try {
      const content = await fs.readFile(textPath, 'utf-8');
      const result = {
        success: true,
        filepath: textPath,
        content: content,
        metadata: {
          filename: path.basename(textPath),
          lines: content.split('\n').length,
          words: content.split(/\s+/).length
        }
      };

      results.materials.push({
        type: 'transcript',
        source: textPath,
        ...result
      });

      // Extract learning outcomes using same logic as PDF
      const outcomes = pdfExtractLO(content);
      results.synthesized.learningOutcomes.push(...outcomes.map(o => ({
        ...o,
        source_file: path.basename(textPath)
      })));

      // Extract concepts
      const concepts = pdfExtractConcepts(content);
      results.synthesized.concepts.push(...concepts.map(c => ({
        ...c,
        source_file: path.basename(textPath)
      })));
    } catch (error) {
      results.metadata.errors.push({
        source: textPath,
        error: error.message
      });
    }
  }

  // Process URLs
  for (const url of urls) {
    try {
      const result = await fetchWebContent(url);
      results.materials.push({
        type: 'web',
        source: url,
        ...result
      });

      if (result.success && result.content) {
        // Extract headings as topics
        const headings = extractHeadings(result.html);
        headings.forEach(heading => {
          if (heading.level <= 2) {
            results.synthesized.topics.push({
              text: heading.text,
              source_url: url,
              level: heading.level
            });
          }
        });

        // Extract learning outcomes from web content
        const outcomes = pdfExtractLO(result.content);
        results.synthesized.learningOutcomes.push(...outcomes.map(o => ({
          ...o,
          source_url: url
        })));

        // Extract concepts
        const concepts = pdfExtractConcepts(result.content);
        results.synthesized.concepts.push(...concepts.map(c => ({
          ...c,
          source_url: url
        })));
      }

      if (result.warnings) {
        results.metadata.warnings.push(...result.warnings);
      }
    } catch (error) {
      results.metadata.errors.push({
        source: url,
        error: error.message
      });
    }
  }

  // Deduplicate and rank learning outcomes
  results.synthesized.learningOutcomes = deduplicateLearningOutcomes(
    results.synthesized.learningOutcomes
  );

  // Deduplicate and rank concepts
  results.synthesized.concepts = deduplicateConcepts(
    results.synthesized.concepts
  );

  // Deduplicate topics
  results.synthesized.topics = deduplicateTopics(
    results.synthesized.topics
  );

  // Infer audience characteristics from content
  results.synthesized.audience = inferAudience(results.materials);

  return results;
}

/**
 * Deduplicate learning outcomes and consolidate similar ones
 * @param {Array} outcomes - List of learning outcomes
 * @returns {Array} Deduplicated and ranked outcomes
 */
function deduplicateLearningOutcomes(outcomes) {
  const unique = [];
  const seen = new Set();

  outcomes.forEach(outcome => {
    // Normalize text for comparison
    const normalized = outcome.text.toLowerCase().trim();

    // Check if we've seen a very similar outcome
    let isDuplicate = false;
    for (const seenText of seen) {
      if (stringSimilarity(normalized, seenText) > 0.8) {
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      seen.add(normalized);
      unique.push(outcome);
    }
  });

  // Sort by confidence (high to low)
  return unique.sort((a, b) => {
    const confidenceOrder = { high: 3, medium: 2, low: 1 };
    return (confidenceOrder[b.confidence] || 0) - (confidenceOrder[a.confidence] || 0);
  });
}

/**
 * Deduplicate concepts
 * @param {Array} concepts - List of concepts
 * @returns {Array} Deduplicated concepts
 */
function deduplicateConcepts(concepts) {
  const uniqueMap = new Map();

  concepts.forEach(concept => {
    const key = concept.text.toLowerCase().trim();
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, concept);
    } else {
      // If duplicate, keep the one with higher confidence
      const existing = uniqueMap.get(key);
      const confidenceOrder = { high: 3, medium: 2, low: 1 };
      if ((confidenceOrder[concept.confidence] || 0) > (confidenceOrder[existing.confidence] || 0)) {
        uniqueMap.set(key, concept);
      }
    }
  });

  return Array.from(uniqueMap.values());
}

/**
 * Deduplicate topics
 * @param {Array} topics - List of topics
 * @returns {Array} Deduplicated topics
 */
function deduplicateTopics(topics) {
  const uniqueMap = new Map();

  topics.forEach(topic => {
    const key = topic.text.toLowerCase().trim();
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, topic);
    }
  });

  return Array.from(uniqueMap.values());
}

/**
 * Calculate string similarity (simple Jaccard similarity)
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Similarity score 0-1
 */
function stringSimilarity(str1, str2) {
  const words1 = new Set(str1.split(/\s+/));
  const words2 = new Set(str2.split(/\s+/));

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Infer audience characteristics from material content
 * @param {Array} materials - Processed materials
 * @returns {Object} Audience profile
 */
function inferAudience(materials) {
  const profile = {
    level: null,
    background: null,
    prerequisites: []
  };

  // Combine all text content
  let allText = '';
  materials.forEach(material => {
    if (material.content) {
      allText += ' ' + material.content;
    } else if (material.text) {
      allText += ' ' + material.text;
    }
  });

  const lowerText = allText.toLowerCase();

  // Infer level
  if (lowerText.includes('beginner') || lowerText.includes('introductory') || lowerText.includes('basics')) {
    profile.level = 'beginner';
  } else if (lowerText.includes('advanced') || lowerText.includes('expert') || lowerText.includes('mastery')) {
    profile.level = 'advanced';
  } else if (lowerText.includes('intermediate')) {
    profile.level = 'intermediate';
  }

  // Extract prerequisites (look for "prerequisite" or "require" sections)
  const prereqPattern = /(?:prerequisite|required|requirement)s?[:\s]+([^\n.]+)/gi;
  let match;
  while ((match = prereqPattern.exec(allText)) !== null) {
    const prereq = match[1].trim();
    if (prereq.length > 10 && prereq.length < 200) {
      profile.prerequisites.push(prereq);
    }
  }

  return profile;
}

export default {
  analyzeMaterials
};
