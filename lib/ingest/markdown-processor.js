/**
 * Markdown Content Processor
 *
 * Processes markdown files to extract structured content,
 * learning outcomes, and key concepts.
 */

import { promises as fs } from 'fs';
import path from 'path';

/**
 * Extract content from markdown file
 * @param {string} filepath - Path to markdown file
 * @returns {Promise<Object>} Processed markdown content with metadata
 */
export async function processMarkdown(filepath) {
  try {
    // Validate file exists
    await fs.access(filepath);

    // Check file extension
    const ext = path.extname(filepath).toLowerCase();
    if (!['.md', '.markdown', '.txt'].includes(ext)) {
      throw new Error(`Expected markdown file, got ${ext}`);
    }

    // Read file content
    const content = await fs.readFile(filepath, 'utf-8');
    const stats = await fs.stat(filepath);

    // Extract structure
    const structure = parseMarkdownStructure(content);
    const outcomes = extractLearningOutcomes(content);
    const concepts = extractConcepts(content);

    return {
      success: true,
      filepath: filepath,
      content: content,
      structure: structure,
      learningOutcomes: outcomes,
      concepts: concepts,
      metadata: {
        filename: path.basename(filepath),
        size: stats.size,
        lines: content.split('\n').length,
        characters: content.length,
        words: content.split(/\s+/).length,
        headers: structure.headers.length,
        processedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    return {
      success: false,
      filepath: filepath,
      error: error.message,
      help: 'Ensure file exists and is readable'
    };
  }
}

/**
 * Parse markdown structure (headers, lists, code blocks)
 * @param {string} content - Markdown content
 * @returns {Object} Structured representation
 */
export function parseMarkdownStructure(content) {
  const lines = content.split('\n');
  const structure = {
    headers: [],
    lists: [],
    codeBlocks: [],
    links: []
  };

  let inCodeBlock = false;
  let currentCodeBlock = null;

  lines.forEach((line, index) => {
    // Headers
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      structure.headers.push({
        level: headerMatch[1].length,
        text: headerMatch[2].trim(),
        line: index + 1
      });
    }

    // Code blocks
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        currentCodeBlock = {
          language: line.trim().slice(3).trim() || 'text',
          start: index + 1,
          content: []
        };
        inCodeBlock = true;
      } else {
        currentCodeBlock.end = index + 1;
        structure.codeBlocks.push(currentCodeBlock);
        inCodeBlock = false;
      }
    } else if (inCodeBlock) {
      currentCodeBlock.content.push(line);
    }

    // Lists
    const listMatch = line.match(/^\s*([•\-\*\+]|\d+\.)\s+(.+)$/);
    if (listMatch) {
      structure.lists.push({
        type: listMatch[1].match(/\d+\./) ? 'ordered' : 'unordered',
        text: listMatch[2].trim(),
        line: index + 1
      });
    }

    // Links
    const linkPattern = /\[([^\]]+)\]\(([^\)]+)\)/g;
    let linkMatch;
    while ((linkMatch = linkPattern.exec(line)) !== null) {
      structure.links.push({
        text: linkMatch[1],
        url: linkMatch[2],
        line: index + 1
      });
    }
  });

  return structure;
}

/**
 * Extract learning outcomes from markdown content
 * @param {string} content - Markdown content
 * @returns {Array} List of identified learning outcomes
 */
export function extractLearningOutcomes(content) {
  const outcomes = [];

  // Look for sections that might contain learning outcomes
  const loPatterns = [
    /## Learning Outcomes?\s*\n([\s\S]+?)(?=\n##|\n---|\Z)/i,
    /## Objectives?\s*\n([\s\S]+?)(?=\n##|\n---|\Z)/i,
    /## Goals?\s*\n([\s\S]+?)(?=\n##|\n---|\Z)/i,
    /## You will learn\s*\n([\s\S]+?)(?=\n##|\n---|\Z)/i
  ];

  for (const pattern of loPatterns) {
    const match = content.match(pattern);
    if (match) {
      const section = match[1];

      // Extract bullet points or numbered items
      const items = section.match(/^\s*([•\-\*\+]|\d+\.)\s+(.+)$/gm);
      if (items) {
        items.forEach(item => {
          const text = item.replace(/^\s*([•\-\*\+]|\d+\.)\s+/, '').trim();
          outcomes.push({
            text: text,
            source: 'learning_outcomes_section',
            confidence: 'high'
          });
        });
      }

      break; // Only process first matching section
    }
  }

  // If no explicit learning outcomes section, look for Bloom's verbs
  if (outcomes.length === 0) {
    const bloomVerbs = [
      'understand', 'explain', 'describe', 'identify', 'recognize',
      'apply', 'implement', 'use', 'demonstrate', 'solve',
      'analyze', 'compare', 'contrast', 'examine', 'investigate',
      'evaluate', 'assess', 'critique', 'justify', 'recommend',
      'create', 'design', 'develop', 'build', 'construct'
    ];

    const lines = content.split('\n');
    lines.forEach((line, index) => {
      const lowerLine = line.toLowerCase();
      const hasBloomVerb = bloomVerbs.some(verb => lowerLine.includes(verb));

      if (hasBloomVerb && (
        lowerLine.includes('will') ||
        lowerLine.includes('able to') ||
        lowerLine.includes('should')
      )) {
        outcomes.push({
          text: line.replace(/^\s*([•\-\*\+]|\d+\.)\s+/, '').trim(),
          source: 'bloom_verb_statement',
          confidence: 'medium',
          line: index + 1
        });
      }
    });
  }

  return outcomes;
}

/**
 * Extract key concepts from markdown content
 * @param {string} content - Markdown content
 * @returns {Array} List of identified concepts
 */
export function extractConcepts(content) {
  const concepts = [];
  const structure = parseMarkdownStructure(content);

  // Use headers as concepts
  structure.headers.forEach(header => {
    // Filter out generic headers
    const genericHeaders = ['introduction', 'overview', 'conclusion', 'summary', 'notes', 'references'];
    if (!genericHeaders.includes(header.text.toLowerCase())) {
      concepts.push({
        text: header.text,
        type: 'header',
        level: header.level,
        line: header.line,
        confidence: header.level <= 3 ? 'high' : 'medium'
      });
    }
  });

  // Look for bold or emphasized terms (might indicate key concepts)
  const emphasisPattern = /(\*\*|__)([\w\s]+)\1/g;
  let match;
  while ((match = emphasisPattern.exec(content)) !== null) {
    const term = match[2].trim();
    if (term.length > 3 && term.length < 40 && !concepts.find(c => c.text === term)) {
      concepts.push({
        text: term,
        type: 'emphasized',
        confidence: 'low'
      });
    }
  }

  return concepts;
}

export default {
  processMarkdown,
  parseMarkdownStructure,
  extractLearningOutcomes,
  extractConcepts
};
