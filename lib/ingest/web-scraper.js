/**
 * Web Content Scraper
 *
 * Fetches and processes web pages for course material ingestion.
 * Handles HTML to text conversion and content extraction.
 */

import { promises as fs } from 'fs';

/**
 * Fetch and extract content from a URL
 * @param {string} url - URL to fetch
 * @returns {Promise<Object>} Extracted content with metadata
 */
export async function fetchWebContent(url) {
  try {
    // Validate URL
    const urlObj = new URL(url);

    // For MVP: Use native fetch (Node 18+)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CourseKit-MCP/0.2.0 (Educational Content Bot)'
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    const html = await response.text();

    // Extract text content from HTML
    const textContent = htmlToText(html);
    const metadata = extractMetadata(html);

    return {
      success: true,
      url: url,
      content: textContent,
      html: html,
      metadata: {
        title: metadata.title,
        description: metadata.description,
        contentType: contentType,
        fetchedAt: new Date().toISOString(),
        size: html.length,
        domain: urlObj.hostname
      },
      warnings: contentType.includes('text/html') ? [] : [
        `Content type is ${contentType}, expected text/html`
      ]
    };
  } catch (error) {
    return {
      success: false,
      url: url,
      error: error.message,
      help: 'Ensure URL is valid and accessible. Check network connection and firewall settings.'
    };
  }
}

/**
 * Convert HTML to plain text
 * Simple implementation - for production, use library like 'html-to-text'
 * @param {string} html - HTML content
 * @returns {string} Plain text
 */
export function htmlToText(html) {
  // Remove script and style elements
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode HTML entities (basic ones)
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");

  // Clean up whitespace
  text = text.replace(/\s+/g, ' ');
  text = text.replace(/\n\s*\n/g, '\n\n');
  text = text.trim();

  return text;
}

/**
 * Extract metadata from HTML
 * @param {string} html - HTML content
 * @returns {Object} Extracted metadata
 */
export function extractMetadata(html) {
  const metadata = {
    title: null,
    description: null,
    author: null,
    keywords: []
  };

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) {
    metadata.title = titleMatch[1].trim();
  }

  // Extract meta description
  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  if (descMatch) {
    metadata.description = descMatch[1].trim();
  }

  // Extract meta keywords
  const keywordsMatch = html.match(/<meta\s+name=["']keywords["']\s+content=["']([^"']+)["']/i);
  if (keywordsMatch) {
    metadata.keywords = keywordsMatch[1].split(',').map(k => k.trim());
  }

  // Extract author
  const authorMatch = html.match(/<meta\s+name=["']author["']\s+content=["']([^"']+)["']/i);
  if (authorMatch) {
    metadata.author = authorMatch[1].trim();
  }

  return metadata;
}

/**
 * Extract headings from HTML content
 * @param {string} html - HTML content
 * @returns {Array} List of headings with levels
 */
export function extractHeadings(html) {
  const headings = [];
  const headingPattern = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let match;

  while ((match = headingPattern.exec(html)) !== null) {
    headings.push({
      level: parseInt(match[1]),
      text: htmlToText(match[2]),
      html: match[2]
    });
  }

  return headings;
}

/**
 * Extract links from HTML content
 * @param {string} html - HTML content
 * @param {string} baseUrl - Base URL for relative links
 * @returns {Array} List of links with text
 */
export function extractLinks(html, baseUrl) {
  const links = [];
  const linkPattern = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = linkPattern.exec(html)) !== null) {
    const url = match[1];
    const text = htmlToText(match[2]);

    // Make URL absolute if it's relative
    let absoluteUrl = url;
    if (baseUrl && url.startsWith('/')) {
      const base = new URL(baseUrl);
      absoluteUrl = `${base.protocol}//${base.host}${url}`;
    }

    links.push({
      url: absoluteUrl,
      text: text,
      isRelative: url.startsWith('/')
    });
  }

  return links;
}

export default {
  fetchWebContent,
  htmlToText,
  extractMetadata,
  extractHeadings,
  extractLinks
};
