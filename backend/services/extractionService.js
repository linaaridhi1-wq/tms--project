/**
 * Extraction Service — LLM Call #1
 * Turns raw PDF text into a structured JSON object with all tender fields.
 */

const { chat } = require('./openrouterClient');
const { smartTruncate } = require('./pdfService');

const SYSTEM_PROMPT = `You are a senior business analyst specializing in public and private sector tenders in the MENA and African region. Your expertise covers IT consulting, PMO, enterprise architecture, ISO certification, digital transformation, risk management, and training tenders.

You extract structured data from tender documents (cahiers des charges / appels d'offres).

CRITICAL RULES:
- Return ONLY valid JSON. No markdown. No code blocks. No explanation outside JSON.
- If a field is not found in the document, use null for numbers/dates or "Unknown" for strings.
- For requirements, extract every distinct requirement you can find — aim for completeness.
- Requirements categories: "Technical", "Financial", "Legal", "Operational", "Functional", "Quality".`;

/**
 * Build the extraction user prompt.
 * @param {string} rawText - raw PDF text (already smart-truncated)
 * @returns {string}
 */
function buildExtractionPrompt(rawText) {
  return `Extract all structured information from this tender document and return as a single JSON object matching EXACTLY this schema:

{
  "title": "Full official title of the tender",
  "sector": "One of: Government, Healthcare, Finance, Education, Telecom, Industry, Energy, Other",
  "tender_type": "One of: IT Consulting, PMO, Enterprise Architecture, Training, Risk & Compliance, Digital Transformation, ISO Certification, Data & AI, Strategic Consulting, Other",
  "client_name": "Name of the issuing organization",
  "client_size": "One of: SME, Large Enterprise, Government Body, International Organization",
  "estimated_budget_eur": <number in EUR, convert if needed, or null>,
  "deadline_date": "YYYY-MM-DD or null",
  "estimated_duration_weeks": <integer or null>,
  "geographic_location": "Country or region where work is performed",
  "requirements": [
    {
      "id": <integer starting at 1>,
      "category": "Technical|Financial|Legal|Operational|Functional|Quality",
      "description": "Clear description of the requirement",
      "priority": "Must Have|Should Have|Nice to Have"
    }
  ],
  "key_deliverables": ["deliverable 1", "deliverable 2"],
  "evaluation_criteria": ["criterion 1", "criterion 2"],
  "languages_required": ["French", "Arabic", "English"],
  "summary": "3-4 sentence plain language summary of this tender in French"
}

TENDER DOCUMENT TEXT:
${rawText}`;
}

/**
 * Extract structured data from raw PDF text using the LLM.
 * @param {string} rawText - raw text from the PDF
 * @returns {Promise<Object>} structured extraction result
 */
async function extractFromText(rawText) {
  const truncated = smartTruncate(rawText, 8000);
  const prompt = buildExtractionPrompt(truncated);

  const raw = await chat(
    [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    0.1, // low temperature for consistent structured output
    true, // JSON mode
  );

  // Parse and validate
  let parsed;
  try {
    // Strip any accidental markdown fences
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error(`Extraction LLM returned invalid JSON: ${e.message}\nRaw: ${raw.slice(0, 500)}`);
  }

  // Ensure requirements array exists
  if (!Array.isArray(parsed.requirements)) {
    parsed.requirements = [];
  }

  return parsed;
}

module.exports = { extractFromText };
