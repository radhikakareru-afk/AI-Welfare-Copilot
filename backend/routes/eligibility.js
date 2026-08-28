const express = require('express');
const router = express.Router();
const db = require('../db');
const { evaluateEligibilityForScheme } = require('../services/eligibilityService');

// GET /api/eligibility/:checkId
router.get('/:checkId', async (req, res) => {
  const { checkId } = req.params;
  try {
    const checkRes = await db.query('SELECT * FROM eligibility_checks WHERE id = $1;', [checkId]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Eligibility check log not found' });
    }

    const checkLog = checkRes.rows[0];

    const resultsRes = await db.query(`
      SELECT r.*, s.name AS scheme_name, s.scheme_code AS official_id
      FROM eligibility_results r
      JOIN schemes s ON r.scheme_id = s.id
      WHERE r.eligibility_check_id = $1;
    `, [checkId]);

    res.json({
      success: true,
      check: checkLog,
      results: resultsRes.rows
    });
  } catch (err) {
    console.error('Error fetching eligibility log:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/eligibility/check (Perform full eligibility evaluation for user)
router.post('/check', async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) {
    return res.status(400).json({ success: false, message: 'Please provide user_id' });
  }

  try {
    // 1. Fetch user profile
    const profileRes = await db.query('SELECT * FROM user_profiles WHERE user_id = $1;', [user_id]);
    if (profileRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User profile not found. Please complete your profile first.' });
    }
    const profile = profileRes.rows[0];

    // 2. Fetch all active schemes
    const schemesRes = await db.query('SELECT * FROM schemes WHERE is_active = TRUE;');
    const schemes = schemesRes.rows;

    if (schemes.length === 0) {
      return res.json({
        success: true,
        message: 'No active schemes found to evaluate.',
        results: []
      });
    }

    // 3. Evaluate each scheme
    const evaluationResults = [];
    let eligibleCount = 0;

    for (const scheme of schemes) {
      // Fetch eligibility criteria for this scheme
      const criteriaRes = await db.query('SELECT * FROM scheme_eligibility_criteria WHERE scheme_id = $1;', [scheme.id]);
      const criteria = criteriaRes.rows;

      // Evaluate
      const evaluation = evaluateEligibilityForScheme(profile, scheme, criteria);
      
      if (evaluation.status === 'eligible' || evaluation.status === 'partially_eligible') {
        eligibleCount++;
      }

      evaluationResults.push({
        scheme_id: scheme.id,
        scheme_name: scheme.name,
        scheme_code: scheme.scheme_code,
        status: evaluation.status,
        matchScore: evaluation.matchScore,
        reasons: evaluation.reasons
      });
    }

    // Calculate match percentage (percentage of schemes the user qualifies for)
    const matchPercentage = Math.round((eligibleCount / schemes.length) * 100);

    // 4. Save to eligibility_checks
    const checkInsert = await db.query(
      `INSERT INTO eligibility_checks (user_id, checked_at, total_schemes_found, match_percentage)
       VALUES ($1, NOW(), $2, $3)
       RETURNING id, checked_at, total_schemes_found, match_percentage;`,
      [user_id, schemes.length, matchPercentage]
    );

    const checkId = checkInsert.rows[0].id;

    // 5. Save details to eligibility_results
    for (const result of evaluationResults) {
      const reasonStr = result.reasons.join('\n');
      await db.query(
        `INSERT INTO eligibility_results (eligibility_check_id, scheme_id, status, match_score, reason)
         VALUES ($1, $2, $3, $4, $5);`,
        [checkId, result.scheme_id, result.status, result.matchScore, reasonStr]
      );
    }

    res.status(201).json({
      success: true,
      check_id: checkId,
      match_percentage: matchPercentage,
      results: evaluationResults
    });
  } catch (err) {
    console.error('Error conducting eligibility check:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
