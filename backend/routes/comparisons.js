const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/comparisons (Create new comparison session)
router.post('/', async (req, res) => {
  const { user_id } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO scheme_comparisons (user_id, created_at) VALUES ($1, NOW()) RETURNING *;',
      [user_id || null] // user_id can be null for guests
    );
    res.status(201).json({ success: true, comparison: rows[0] });
  } catch (err) {
    console.error('Error creating comparison:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/comparisons/:comparisonId/items (Add scheme to comparison)
router.post('/:comparisonId/items', async (req, res) => {
  const { comparisonId } = req.params;
  const { scheme_id } = req.body;

  if (!scheme_id) {
    return res.status(400).json({ success: false, message: 'Please provide scheme_id' });
  }

  try {
    // Check if already in comparison
    const check = await db.query(
      'SELECT id FROM comparison_items WHERE comparison_id = $1 AND scheme_id = $2;',
      [comparisonId, scheme_id]
    );

    if (check.rows.length > 0) {
      return res.json({ success: true, message: 'Scheme already added to this comparison' });
    }

    // Limit check (max 3 items in comparison)
    const countCheck = await db.query(
      'SELECT COUNT(*) FROM comparison_items WHERE comparison_id = $1;',
      [comparisonId]
    );

    if (parseInt(countCheck.rows[0].count) >= 3) {
      return res.status(400).json({ success: false, message: 'Maximum of 3 schemes can be compared side-by-side' });
    }

    const { rows } = await db.query(
      'INSERT INTO comparison_items (comparison_id, scheme_id) VALUES ($1, $2) RETURNING *;',
      [comparisonId, scheme_id]
    );

    res.status(201).json({ success: true, item: rows[0] });
  } catch (err) {
    console.error('Error adding comparison item:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/comparisons/:comparisonId (Fetch comparison items with details)
router.get('/:comparisonId', async (req, res) => {
  const { comparisonId } = req.params;
  try {
    const { rows: items } = await db.query(
      `SELECT 
        s.id, 
        s.scheme_code AS official_id, 
        s.name, 
        s.description, 
        s.state, 
        s.target_audience, 
        s.is_active, 
        s.application_start, 
        s.application_end AS application_deadline, 
        s.official_website AS portal_url, 
        c.name AS category
      FROM comparison_items ci
      JOIN schemes s ON ci.scheme_id = s.id
      LEFT JOIN scheme_categories c ON s.category_id = c.id
      WHERE ci.comparison_id = $1;`,
      [comparisonId]
    );

    // Fetch rules and benefits for each compared scheme
    const itemsWithDetails = await Promise.all(
      items.map(async (s) => {
        // Fetch benefits
        const benRes = await db.query('SELECT benefit FROM scheme_benefits WHERE scheme_id = $1', [s.id]);
        const benefits = benRes.rows.map(r => r.benefit).join('\n');

        // Fetch criteria and map rules
        const critRes = await db.query('SELECT * FROM scheme_eligibility_criteria WHERE scheme_id = $1', [s.id]);
        
        // Helper mapping to rules object (similar to schemes.js)
        const rules = {
          age_min: null,
          age_max: null,
          income_max: null,
          states_allowed: [],
          districts_allowed: [],
          genders_allowed: [],
          occupations_allowed: [],
          categories_allowed: [],
          educations_allowed: [],
          requires_disability: false,
          min_disability_percentage: 0
        };

        critRes.rows.forEach(row => {
          const val = row.criteria_value;
          if (!val) return;
          switch (row.criteria_type) {
            case 'age':
              if (val.includes('-')) {
                const [min, max] = val.split('-').map(Number);
                rules.age_min = min;
                rules.age_max = max;
              } else if (val.includes('+')) {
                rules.age_min = Number(val.replace('+', ''));
              }
              break;
            case 'annual_income':
              if (val.startsWith('<=')) rules.income_max = parseFloat(val.replace('<=', ''));
              break;
            case 'state':
              rules.states_allowed = val.split(',').map(item => item.trim());
              break;
            case 'district':
              rules.districts_allowed = val.split(',').map(item => item.trim());
              break;
            case 'gender':
              rules.genders_allowed = val.split(',').map(item => item.trim());
              break;
            case 'category':
              rules.categories_allowed = val.split(',').map(item => item.trim());
              break;
            case 'education':
              rules.educations_allowed = val.split(',').map(item => item.trim());
              break;
            case 'occupation':
              rules.occupations_allowed = val.split(',').map(item => item.trim());
              break;
            case 'disability_status':
              if (val.toLowerCase() === 'yes' || val.toLowerCase() === 'disabled') {
                rules.requires_disability = true;
                rules.min_disability_percentage = 40;
              }
              break;
          }
        });

        return {
          ...s,
          benefits,
          rules
        };
      })
    );

    res.json({ success: true, schemes: itemsWithDetails });
  } catch (err) {
    console.error('Error fetching comparison details:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/comparisons/:comparisonId/items/:schemeId (Remove item from comparison)
router.delete('/:comparisonId/items/:schemeId', async (req, res) => {
  const { comparisonId, schemeId } = req.params;
  try {
    const { rowCount } = await db.query(
      'DELETE FROM comparison_items WHERE comparison_id = $1 AND scheme_id = $2;',
      [comparisonId, schemeId]
    );

    if (rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Item not found in this comparison' });
    }

    res.json({ success: true, message: 'Comparison item deleted successfully' });
  } catch (err) {
    console.error('Error deleting comparison item:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
