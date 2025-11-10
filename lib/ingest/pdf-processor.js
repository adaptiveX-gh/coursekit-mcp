/**
 * PDF Text Extraction Utility
 *
 * Extracts text content from PDF files for analysis.
 * Uses pdf-parse library for text extraction.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { PDFParse } from 'pdf-parse';

/**
 * Extract text content from a PDF file
 * @param {string} filepath - Path to PDF file
 * @returns {Promise<Object>} Extracted content with metadata
 */
export async function extractPDFText(filepath) {
  try {
    // Validate file exists
    await fs.access(filepath);

    // Check file extension
    const ext = path.extname(filepath).toLowerCase();
    if (ext !== '.pdf') {
      throw new Error(`Expected PDF file, got ${ext}`);
    }

    // Read the PDF file
    const dataBuffer = await fs.readFile(filepath);

    // Parse PDF content using PDFParse class
    const parser = new PDFParse({ data: dataBuffer });
    const result = await parser.getText();

    // Get file stats for metadata
    const stats = await fs.stat(filepath);

    return {
      success: true,
      filepath: filepath,
      text: result.text,
      metadata: {
        filename: path.basename(filepath),
        size: stats.size,
        pages: result.pages || null,
        extractedAt: new Date().toISOString(),
        method: 'pdf-parse',
        info: result.info || {},
        version: result.version || null
      }
    };
  } catch (error) {
    return {
      success: false,
      filepath: filepath,
      error: error.message,
      help: 'Ensure file exists and is a valid PDF. If errors persist, the PDF may be corrupted or encrypted.'
    };
  }
}

/**
 * Extract structured learning outcomes from PDF text
 * Looks for common patterns like numbered lists, bullet points
 * @param {string} text - Extracted PDF text
 * @returns {Array} List of identified learning outcomes
 */
export function extractLearningOutcomes(text) {
  const outcomes = [];

  // Pattern 1: Numbered items (1., 2., etc.)
  const numberedPattern = /^\s*\d+[\.)]\s+(.+)$/gm;
  let match;
  while ((match = numberedPattern.exec(text)) !== null) {
    outcomes.push({
      text: match[1].trim(),
      source: 'numbered_list',
      confidence: 'high'
    });
  }

  // Pattern 2: Bullet points
  const bulletPattern = /^\s*[•\-\*]\s+(.+)$/gm;
  while ((match = bulletPattern.exec(text)) !== null) {
    const outcome = match[1].trim();
    // Only include if it looks like a learning outcome
    if (outcome.length > 20 && (
      outcome.toLowerCase().includes('understand') ||
      outcome.toLowerCase().includes('apply') ||
      outcome.toLowerCase().includes('create') ||
      outcome.toLowerCase().includes('analyze') ||
      outcome.toLowerCase().includes('demonstrate') ||
      outcome.toLowerCase().includes('able to')
    )) {
      outcomes.push({
        text: outcome,
        source: 'bullet_list',
        confidence: 'medium'
      });
    }
  }

  // Pattern 3: "Participants will..." or "Learners will..." statements
  const participantPattern = /(participants?|learners?|students?)\s+(will|shall|should|can)\s+(.+?)[\.;]/gi;
  while ((match = participantPattern.exec(text)) !== null) {
    outcomes.push({
      text: match[3].trim(),
      source: 'participant_statement',
      confidence: 'high'
    });
  }

  return outcomes;
}

/**
 * Extract key concepts and topics from PDF text
 * @param {string} text - Extracted PDF text
 * @returns {Array} List of identified concepts
 */
export function extractConcepts(text) {
  const concepts = [];

  // Look for section headers (all caps, title case with colons, etc.)
  const headerPattern = /^([A-Z][A-Z\s]{3,}|[A-Z][a-z\s]+:)/gm;
  let match;
  while ((match = headerPattern.exec(text)) !== null) {
    const concept = match[1].trim().replace(':', '');
    if (concept.length > 3 && concept.length < 60) {
      concepts.push({
        text: concept,
        type: 'header',
        confidence: 'medium'
      });
    }
  }

  return concepts;
}

export default {
  extractPDFText,
  extractLearningOutcomes,
  extractConcepts
};
