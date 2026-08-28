const express = require('express');
const router = express.Router();
const db = require('../db');

// Helper to map DB criteria rows to frontend rules structure
function getRulesFromCriteria(criteriaRows) {
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

  criteriaRows.forEach(row => {
    const val = row.criteria_value;
    if (!val) return;

    switch (row.criteria_type) {
      case 'age':
        if (val.includes('-')) {
          const [min, max] = val.split('-').map(Number);
          rules.age_min = min || null;
          rules.age_max = max || null;
        } else if (val.includes('+')) {
          rules.age_min = Number(val.replace('+', '')) || null;
        } else if (val.startsWith('<=')) {
          rules.age_max = Number(val.replace('<=', '')) || null;
        } else if (val.startsWith('<')) {
          rules.age_max = (Number(val.replace('<', '')) - 1) || null;
        } else if (val.startsWith('>=')) {
          rules.age_min = Number(val.replace('>=', '')) || null;
        } else if (val.startsWith('>')) {
          rules.age_min = (Number(val.replace('>', '')) + 1) || null;
        }
        break;
      case 'annual_income':
        if (val.startsWith('<=')) {
          rules.income_max = parseFloat(val.replace('<=', '')) || null;
        } else if (val.startsWith('<')) {
          rules.income_max = (parseFloat(val.replace('<', '')) - 1) || null;
        }
        break;
      case 'state':
        rules.states_allowed = val.split(',').map(s => s.trim());
        break;
      case 'district':
        rules.districts_allowed = val.split(',').map(d => d.trim());
        break;
      case 'gender':
        rules.genders_allowed = val.split(',').map(g => g.trim());
        break;
      case 'category':
        rules.categories_allowed = val.split(',').map(c => c.trim());
        break;
      case 'education':
        rules.educations_allowed = val.split(',').map(e => e.trim());
        break;
      case 'occupation':
        rules.occupations_allowed = val.split(',').map(o => o.trim());
        break;
      case 'disability_status':
        if (val.toLowerCase() === 'yes' || val.toLowerCase() === 'disabled') {
          rules.requires_disability = true;
          rules.min_disability_percentage = 40; // Default minimum
        }
        break;
    }
  });

  return rules;
}

// GET /api/categories
router.get('/categories', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM scheme_categories ORDER BY name;');
    res.json({ success: true, categories: rows });
  } catch (err) {
    console.error('Error fetching categories:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/schemes
router.get('/', async (req, res) => {
  try {
    const { rows: schemes } = await db.query(`
      SELECT 
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
      FROM schemes s
      LEFT JOIN scheme_categories c ON s.category_id = c.id
      WHERE s.is_active = TRUE;
    `);

    // Fetch rules/criteria for each scheme to map rules object
    const schemesWithRules = await Promise.all(
      schemes.map(async (s) => {
        // Fetch benefits aggregate
        const benRes = await db.query('SELECT benefit FROM scheme_benefits WHERE scheme_id = $1', [s.id]);
        const benefits = benRes.rows.map(r => r.benefit).join('\n');

        // Fetch criteria
        const critRes = await db.query('SELECT * FROM scheme_eligibility_criteria WHERE scheme_id = $1', [s.id]);
        const rules = getRulesFromCriteria(critRes.rows);

        return {
          ...s,
          benefits,
          rules
        };
      })
    );

    res.json({ success: true, schemes: schemesWithRules });
  } catch (err) {
    console.error('Error fetching schemes:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/schemes/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows: schemeRows } = await db.query(`
      SELECT 
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
      FROM schemes s
      LEFT JOIN scheme_categories c ON s.category_id = c.id
      WHERE s.id = $1;
    `, [id]);

    if (schemeRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Scheme not found' });
    }

    const scheme = schemeRows[0];

    // Fetch benefits
    const benRes = await db.query('SELECT benefit FROM scheme_benefits WHERE scheme_id = $1', [id]);
    scheme.benefits = benRes.rows.map(r => r.benefit).join('\n');

    // Fetch criteria and map rules
    const critRes = await db.query('SELECT * FROM scheme_eligibility_criteria WHERE scheme_id = $1', [id]);
    scheme.rules = getRulesFromCriteria(critRes.rows);

    // Fetch documents
    const docRes = await db.query('SELECT document_name, is_mandatory FROM scheme_documents WHERE scheme_id = $1', [id]);
    scheme.documents = docRes.rows.map(r => ({
      document_name: r.document_name,
      description: r.is_mandatory ? 'Mandatory document for application verification.' : 'Optional document.',
      is_mandatory: r.is_mandatory
    }));

    // Fetch steps
    const stepRes = await db.query('SELECT step_number, step_description FROM scheme_application_steps WHERE scheme_id = $1 ORDER BY step_number;', [id]);
    scheme.steps = stepRes.rows.map(r => ({
      step_number: r.step_number,
      title: `Step ${r.step_number}`,
      description: r.step_description
    }));

    res.json({ success: true, scheme });
  } catch (err) {
    console.error('Error fetching scheme details:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
