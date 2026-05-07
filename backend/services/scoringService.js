/**
 * Scoring Service — Hybrid TFS Scoring
 * Step 1: Fast rule-based pre-score (deterministic, no API call)
 * Step 2: LLM refinement — returns final TFS JSON with reasoning
 */

const { chat } = require('./openrouterClient');
const COMPANY_PROFILE = require('../config/companyProfile');

const SCORING_SYSTEM_PROMPT = `You are a senior bid/no-bid analyst at Yellomind, a consulting firm specializing in digital transformation, PMO, enterprise architecture, ISO certification, risk management, and AI.

You receive:
1. A pre-computed rule-based score (starting point — not final)
2. Extracted tender data
3. The Yellomind company profile

Your job: refine the scores intelligently, add your expert reasoning, and return ONLY valid JSON. No markdown. No explanation outside JSON. Be precise and actionable.`;

/**
 * Rule-based pre-score — fast, deterministic, no API.
 * @param {Object} data - extracted tender data
 * @returns {Object} dimension scores object
 */
function computeRuleScore(data) {
  const reqText = (data.requirements || [])
    .map((r) => r.description || '')
    .join(' ')
    .toLowerCase();

  const titleText = ((data.title || '') + ' ' + (data.summary || '')).toLowerCase();
  const fullText = reqText + ' ' + titleText;

  // ── Service Match (0-30) ──────────────────────────────────────────
  let serviceMatchRaw = 0;
  for (const service of COMPANY_PROFILE.service_catalog) {
    const hits = service.keywords.filter((kw) => fullText.includes(kw.toLowerCase())).length;
    serviceMatchRaw += hits * 4;
  }
  const serviceMatch = Math.min(serviceMatchRaw, 30);

  // ── Sector Fit (0-20) ─────────────────────────────────────────────
  const sectorFit = COMPANY_PROFILE.sectors
    .map((s) => s.toLowerCase())
    .includes((data.sector || '').toLowerCase())
    ? 20
    : 6;

  // ── Budget Alignment (0-15) ───────────────────────────────────────
  let budgetAlignment = 8; // neutral default (unknown budget)
  if (data.estimated_budget_eur && data.estimated_budget_eur > 0) {
    const { min, max } = COMPANY_PROFILE.typical_budget_range_eur;
    if (data.estimated_budget_eur >= min && data.estimated_budget_eur <= max) {
      budgetAlignment = 15; // perfect fit
    } else if (data.estimated_budget_eur < min * 0.5) {
      budgetAlignment = 3; // too small
    } else if (data.estimated_budget_eur < min) {
      budgetAlignment = 8; // slightly below range
    } else if (data.estimated_budget_eur <= max * 1.5) {
      budgetAlignment = 11; // slightly above range — possible but resource heavy
    } else {
      budgetAlignment = 7; // well above range — risky
    }
  }

  // ── Timeline Feasibility (0-15) ───────────────────────────────────
  let timelineScore = 12; // default: assume feasible
  if (data.estimated_duration_weeks) {
    const { min, max } = COMPANY_PROFILE.average_project_duration_weeks;
    if (data.estimated_duration_weeks < 2) {
      timelineScore = 4; // unrealistically short
    } else if (data.estimated_duration_weeks >= min && data.estimated_duration_weeks <= max) {
      timelineScore = 15; // perfect
    } else if (data.estimated_duration_weeks > max * 1.5) {
      timelineScore = 10; // very long, manageable but complex
    } else {
      timelineScore = 12;
    }
  }

  // ── Geographic Fit (0-10) ─────────────────────────────────────────
  const loc = (data.geographic_location || '').toLowerCase();
  const regions = COMPANY_PROFILE.regions.map((r) => r.toLowerCase());
  const geoMatch = regions.some((r) => loc.includes(r) || r.includes(loc.split(' ')[0]));
  const geographicScore = geoMatch ? 10 : 3;

  return {
    serviceMatch,
    sectorFit,
    budgetAlignment,
    timelineScore,
    geographicScore,
    preTotal: serviceMatch + sectorFit + budgetAlignment + timelineScore + geographicScore,
  };
}

/**
 * Build the scoring prompt for the LLM.
 */
function buildScoringPrompt(data, preScore, similarProposals = []) {
  const pastWins = (similarProposals || []).filter((s) => s.result === 'Won').length;
  const pastSimilarityScore = Math.min(pastWins * 5 + (similarProposals || []).length * 1, 10);

  return `YELLOMIND COMPANY PROFILE:
${JSON.stringify(COMPANY_PROFILE, null, 2)}

TENDER EXTRACTED DATA:
${JSON.stringify(data, null, 2)}

SIMILAR PAST PROPOSALS RETRIEVED:
${JSON.stringify(similarProposals, null, 2)}

PRE-COMPUTED RULE-BASED SCORES (refine these):
${JSON.stringify(preScore, null, 2)}

Past Similarity Score (pre-computed): ${pastSimilarityScore}/10

INSTRUCTIONS:
- Refine each dimension score based on deeper analysis of the tender content
- The total_score must equal the sum of all dimension scores
- Label must match: 80-100="High Fit", 60-79="Medium Fit", 40-59="Low Fit", 0-39="Poor Fit"
- Be specific and reference actual requirements from the tender in your reasoning

Return ONLY this JSON (no other text):
{
  "total_score": <integer 0-100>,
  "label": <"High Fit" | "Medium Fit" | "Low Fit" | "Poor Fit">,
  "service_match_score": <integer 0-30>,
  "sector_fit_score": <integer 0-20>,
  "budget_alignment_score": <integer 0-15>,
  "timeline_score": <integer 0-15>,
  "geographic_score": <integer 0-10>,
  "past_similarity_score": <integer 0-10>,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "risks": ["risk 1", "risk 2"],
  "recommendation": "One clear, actionable sentence: what Yellomind should do with this tender",
  "reasoning": "3-4 sentences explaining the score, referencing specific tender requirements"
}`;
}

/**
 * Score a tender using hybrid rule-based + LLM approach.
 * @param {Object} extractedData - structured extraction from extractionService
 * @param {Array} similarProposals - similar past proposals from RAG (can be empty)
 * @returns {Promise<Object>} TFS result object
 */
async function scoreTender(extractedData, similarProposals = []) {
  // Step 1: Rule-based pre-score
  const preScore = computeRuleScore(extractedData);

  // Step 2: LLM refinement
  const prompt = buildScoringPrompt(extractedData, preScore, similarProposals);

  const raw = await chat(
    [
      { role: 'system', content: SCORING_SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    0.15,
    true,
  );

  let result;
  try {
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    result = JSON.parse(cleaned);
  } catch (e) {
    // Fallback: use rule-based score if LLM fails
    console.error('Scoring LLM JSON parse failed, using rule-based fallback:', e.message);
    const total = preScore.preTotal;
    result = {
      total_score: total,
      label: total >= 80 ? 'High Fit' : total >= 60 ? 'Medium Fit' : total >= 40 ? 'Low Fit' : 'Poor Fit',
      service_match_score: preScore.serviceMatch,
      sector_fit_score: preScore.sectorFit,
      budget_alignment_score: preScore.budgetAlignment,
      timeline_score: preScore.timelineScore,
      geographic_score: preScore.geographicScore,
      past_similarity_score: 0,
      strengths: ['Score calculé par règles — LLM indisponible'],
      risks: ['Vérifier manuellement la pertinence'],
      recommendation: 'Analyser manuellement ce dossier.',
      reasoning: 'Score calculé par règles automatiques (LLM temporairement indisponible).',
    };
  }

  // Ensure total_score is consistent
  result.total_score = Math.max(0, Math.min(100, result.total_score || 0));

  // Re-derive label from score for consistency
  const s = result.total_score;
  result.label = s >= 80 ? 'High Fit' : s >= 60 ? 'Medium Fit' : s >= 40 ? 'Low Fit' : 'Poor Fit';

  return result;
}

module.exports = { scoreTender, computeRuleScore };
