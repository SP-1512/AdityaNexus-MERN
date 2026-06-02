const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const { protect, adminOnly } = require('../middleware/auth');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function callGemini(prompt, retries = 3, delay = 2000) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    return response.text || '{}';
  } catch (err) {
    const isRateLimit = err?.message?.includes('429') || err?.status === 429;
    if (isRateLimit && retries > 0) {
      await new Promise(r => setTimeout(r, delay));
      return callGemini(prompt, retries - 1, delay * 2);
    }
    throw err;
  }
}

// @POST /api/ai/analyze — analyze single admission
router.post('/analyze', protect, adminOnly, async (req, res) => {
  try {
    const { admission } = req.body;
    const prompt = `Analyze this Indian college admission record for institutional counseling: ${JSON.stringify(admission)}.
      Academic Context:
      - Program Stream: ${admission.stream}.
      - Preferred Branches (In order of priority): ${admission.branches.join(', ')}.
      - Board: ${admission.twelfthBoard}.
      - Reservation: Category ${admission.category}.
      - Entrance Exam: ${admission.entranceExam} with Score/Rank ${admission.entranceScore}.
      
      Task:
      1. Evaluate if the candidate qualifies for any of the preferred branches based on standard Indian merit criteria.
      2. Suggest which branch should be granted if any.
      3. If one is accepted, explain why the higher priority ones were rejected or why this one is the best fit.
      
      Respond ONLY in this exact JSON format:
      {
        "isValid": boolean,
        "errors": [],
        "eligibilityScore": number (0-100),
        "suggestedStatus": "Approved" | "Rejected" | "Pending",
        "suggestedBranch": string,
        "reason": string,
        "adminNoteDraft": string,
        "reservationCompliance": string
      }`;

    const text = await callGemini(prompt);
    res.json(JSON.parse(text));
  } catch (err) {
    res.status(500).json({
      isValid: false, errors: ['AI service unavailable'],
      eligibilityScore: 0, suggestedStatus: 'Pending',
      reason: 'AI analysis temporarily unavailable. Please review manually.',
      adminNoteDraft: 'Manual review required.',
      reservationCompliance: 'Unable to verify automatically.'
    });
  }
});

// @POST /api/ai/summarize — batch summary for admin dashboard
router.post('/summarize', protect, adminOnly, async (req, res) => {
  try {
    const { admissions } = req.body;
    if (!admissions || admissions.length === 0) {
      return res.json({ totalCount: 0, statusDistribution: [], categoryDistribution: [], keyObservations: ['No applications yet.'], dataQualityIssues: [] });
    }

    const prompt = `Summarize this cohort of Indian college admission applications: ${JSON.stringify(admissions)}.
      Report on branch priority trends and overall eligibility.
      
      Respond ONLY in this exact JSON format:
      {
        "totalCount": number,
        "statusDistribution": [{"name": string, "value": number}],
        "categoryDistribution": [{"name": string, "value": number}],
        "keyObservations": [string],
        "dataQualityIssues": [string]
      }`;

    const text = await callGemini(prompt);
    res.json(JSON.parse(text));
  } catch (err) {
    res.status(500).json({
      totalCount: req.body.admissions?.length || 0,
      statusDistribution: [], categoryDistribution: [],
      keyObservations: ['AI summarization temporarily unavailable.'],
      dataQualityIssues: []
    });
  }
});

module.exports = router;
