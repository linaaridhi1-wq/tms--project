/**
 * AI Controller
 * Orchestrates the full AI pipeline:
 *   PDF → extract → score → store → return
 *
 * Routes:
 *   POST /api/tenders/:id/analyze     → Full pipeline with PDF upload
 *   GET  /api/tenders/:id/analysis    → Retrieve stored extraction
 *   GET  /api/tenders/:id/score       → Retrieve stored TFS score
 */

const path = require('path');
const { extractText, cleanupFile } = require('../services/pdfService');
const { extractFromText } = require('../services/extractionService');
const { scoreTender } = require('../services/scoringService');
const { TenderAiAnalysis, TenderScore, Tender } = require('../models');

/**
 * POST /api/tenders/:id/analyze
 * Accepts a multipart PDF upload, runs the full AI pipeline,
 * stores results in DB, and returns the full analysis.
 */
async function analyze(req, res) {
  const tenderId = parseInt(req.params.id, 10);

  if (!req.file) {
    return res.status(400).json({ message: 'Aucun fichier PDF fourni.' });
  }

  const filePath = req.file.path;
  const filename = req.file.originalname;

  // Verify tender exists
  const tender = await Tender.findByPk(tenderId);
  if (!tender) {
    cleanupFile(filePath);
    return res.status(404).json({ message: 'Appel d\'offres introuvable.' });
  }

  // Create a pending analysis record immediately
  let analysisRecord = await TenderAiAnalysis.create({
    tender_id: tenderId,
    filename,
    status: 'pending',
  });

  // Run the pipeline asynchronously (respond immediately with analysis_id for polling)
  // For simplicity in this version, we run synchronously and respond when done.
  try {
    // ── Step 1: Extract PDF text ──────────────────────────────────────
    console.log(`[AI] Step 1/3: Extracting PDF text from "${filename}"…`);
    const rawText = await extractText(filePath);

    if (!rawText || rawText.trim().length < 50) {
      throw new Error('Le PDF ne contient pas assez de texte lisible. Vérifiez que le PDF n\'est pas scanné (image uniquement).');
    }

    // ── Step 2: LLM Extraction ────────────────────────────────────────
    console.log(`[AI] Step 2/3: Calling LLM for structured extraction…`);
    const extracted = await extractFromText(rawText);

    // Update analysis record with extraction results
    await analysisRecord.update({
      raw_text: rawText.slice(0, 50000), // store first 50k chars
      extracted_title: extracted.title,
      sector: extracted.sector,
      tender_type: extracted.tender_type,
      client_name: extracted.client_name,
      client_size: extracted.client_size,
      estimated_budget_eur: extracted.estimated_budget_eur,
      deadline_date: extracted.deadline_date,
      estimated_duration_weeks: extracted.estimated_duration_weeks,
      geographic_location: extracted.geographic_location,
      requirements: extracted.requirements || [],
      key_deliverables: extracted.key_deliverables || [],
      evaluation_criteria: extracted.evaluation_criteria || [],
      languages_required: extracted.languages_required || [],
      summary: extracted.summary,
      status: 'extracting',
    });

    // ── Step 3: Hybrid Scoring ────────────────────────────────────────
    console.log(`[AI] Step 3/3: Running hybrid TFS scoring…`);
    const scoreResult = await scoreTender(extracted, []); // RAG is Phase 3

    // Delete any previous score for this tender
    await TenderScore.destroy({ where: { tender_id: tenderId } });

    // Store the score
    const scoreRecord = await TenderScore.create({
      tender_id: tenderId,
      analysis_id: analysisRecord.analysis_id,
      total_score: scoreResult.total_score,
      label: scoreResult.label,
      service_match_score: scoreResult.service_match_score,
      sector_fit_score: scoreResult.sector_fit_score,
      budget_alignment_score: scoreResult.budget_alignment_score,
      timeline_score: scoreResult.timeline_score,
      geographic_score: scoreResult.geographic_score,
      past_similarity_score: scoreResult.past_similarity_score || 0,
      strengths: scoreResult.strengths || [],
      risks: scoreResult.risks || [],
      recommendation: scoreResult.recommendation,
      reasoning: scoreResult.reasoning,
      similar_past_tenders: [],
    });

    // Mark analysis as completed
    await analysisRecord.update({ status: 'completed' });

    // Cleanup temp file
    cleanupFile(filePath);

    console.log(`[AI] Pipeline complete for tender ${tenderId}. TFS: ${scoreResult.total_score} (${scoreResult.label})`);

    // Return full result
    return res.json({
      success: true,
      analysis: {
        analysis_id: analysisRecord.analysis_id,
        tender_id: tenderId,
        filename,
        extracted_title: extracted.title,
        sector: extracted.sector,
        tender_type: extracted.tender_type,
        client_name: extracted.client_name,
        client_size: extracted.client_size,
        estimated_budget_eur: extracted.estimated_budget_eur,
        deadline_date: extracted.deadline_date,
        estimated_duration_weeks: extracted.estimated_duration_weeks,
        geographic_location: extracted.geographic_location,
        requirements: extracted.requirements || [],
        key_deliverables: extracted.key_deliverables || [],
        evaluation_criteria: extracted.evaluation_criteria || [],
        languages_required: extracted.languages_required || [],
        summary: extracted.summary,
      },
      score: {
        total_score: scoreResult.total_score,
        label: scoreResult.label,
        service_match_score: scoreResult.service_match_score,
        sector_fit_score: scoreResult.sector_fit_score,
        budget_alignment_score: scoreResult.budget_alignment_score,
        timeline_score: scoreResult.timeline_score,
        geographic_score: scoreResult.geographic_score,
        past_similarity_score: scoreResult.past_similarity_score || 0,
        strengths: scoreResult.strengths || [],
        risks: scoreResult.risks || [],
        recommendation: scoreResult.recommendation,
        reasoning: scoreResult.reasoning,
      },
    });

  } catch (err) {
    console.error('[AI] Pipeline error:', err);
    cleanupFile(filePath);

    // Update analysis record with error
    await analysisRecord.update({
      status: 'failed',
      error_message: err.message,
    }).catch(() => {});

    return res.status(500).json({
      message: 'Erreur lors de l\'analyse IA.',
      detail: err.message,
    });
  }
}

/**
 * GET /api/tenders/:id/analysis
 * Retrieve the stored AI extraction for a tender.
 */
async function getAnalysis(req, res) {
  const tenderId = parseInt(req.params.id, 10);
  try {
    const analysis = await TenderAiAnalysis.findOne({
      where: { tender_id: tenderId },
      order: [['created_at', 'DESC']],
    });
    if (!analysis) return res.status(404).json({ message: 'Aucune analyse trouvée.' });
    return res.json(analysis);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur.' });
  }
}

/**
 * GET /api/tenders/:id/score
 * Retrieve the stored TFS score for a tender.
 */
async function getScore(req, res) {
  const tenderId = parseInt(req.params.id, 10);
  try {
    const score = await TenderScore.findOne({
      where: { tender_id: tenderId },
      order: [['created_at', 'DESC']],
    });
    if (!score) return res.status(404).json({ message: 'Aucun score trouvé.' });
    return res.json(score);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur.' });
  }
}

/**
 * GET /api/ai/history
 * Returns the history of all AI analyses (latest first) with their scores.
 */
async function getHistory(req, res) {
  try {
    const history = await TenderAiAnalysis.findAll({
      where: { status: 'completed' },
      order: [['created_at', 'DESC']],
      attributes: ['analysis_id', 'tender_id', 'filename', 'extracted_title', 'created_at'],
    });
    
    // For each analysis, fetch the corresponding score
    const results = [];
    for (let h of history) {
      const score = await TenderScore.findOne({ where: { analysis_id: h.analysis_id } });
      results.push({
        analysis: h,
        score: score ? { total_score: score.total_score, label: score.label } : null
      });
    }
    
    return res.json(results);
  } catch (err) {
    console.error('[AI History]', err);
    return res.status(500).json({ message: 'Erreur lors du chargement de l\'historique.' });
  }
}

module.exports = { analyze, getAnalysis, getScore, getHistory };
