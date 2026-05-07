/**
 * PDF Service
 * Extracts raw text from an uploaded PDF file using pdf-parse.
 */

const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

/**
 * Extract text content from a PDF file.
 * @param {string} filePath - absolute path to the PDF file
 * @returns {Promise<string>} raw extracted text
 */
async function extractText(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text || '';
}

/**
 * Smart truncation: takes first + middle + last chunks of a long document.
 * This gives the LLM context from all parts of the document, not just the beginning.
 * @param {string} text
 * @param {number} maxChars
 * @returns {string}
 */
function smartTruncate(text, maxChars = 8000) {
  if (text.length <= maxChars) return text;

  const chunkSize = Math.floor(maxChars / 3);
  const first = text.slice(0, chunkSize);
  const middle = text.slice(Math.floor(text.length / 2) - Math.floor(chunkSize / 2), Math.floor(text.length / 2) + Math.floor(chunkSize / 2));
  const last = text.slice(text.length - chunkSize);

  return `${first}\n\n[...document continues...]\n\n${middle}\n\n[...document continues...]\n\n${last}`;
}

/**
 * Clean up a temporary uploaded file after processing.
 * @param {string} filePath
 */
function cleanupFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (e) {
    console.error('Failed to cleanup file:', filePath, e.message);
  }
}

module.exports = { extractText, smartTruncate, cleanupFile };
