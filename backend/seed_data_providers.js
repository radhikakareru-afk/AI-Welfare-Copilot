const db = require('./db');

async function seedDataProviders() {
  console.log('Seeding / updating official government data providers...');

  try {
    // 1. Update ID 1
    await db.query(`
      UPDATE data_providers SET
        name = 'National Portal of India & Open Government Data',
        source_type = 'Central Government Platform',
        central_government = TRUE,
        state_government = FALSE,
        base_url = 'https://data.gov.in',
        description = 'Official central government portal and open data repository (OGD Platform India)',
        is_active = TRUE,
        updated_at = NOW()
      WHERE id = 1;
    `);

    // 2. Insert other official providers if not existing
    const providersToInsert = [
      {
        id: 2,
        name: 'MahaDBT State Welfare Portal',
        source_type: 'State Government Portal',
        central_government: false,
        state_government: true,
        base_url: 'https://mahadbt.maharashtra.gov.in',
        description: 'Direct Benefit Transfer platform, Government of Maharashtra',
        is_active: true
      },
      {
        id: 3,
        name: 'Department of Agriculture, Maharashtra',
        source_type: 'State Department Portal',
        central_government: false,
        state_government: true,
        base_url: 'https://krishi.maharashtra.gov.in',
        description: 'Krishi Vibhag official schemes and benefits portal, Maharashtra',
        is_active: true
      },
      {
        id: 4,
        name: 'Ministry of Agriculture & Farmers Welfare',
        source_type: 'Central Ministry Portal',
        central_government: true,
        state_government: false,
        base_url: 'https://pmkisan.gov.in',
        description: 'PM-KISAN and Central Agricultural Mechanization Portal',
        is_active: true
      },
      {
        id: 5,
        name: 'National Health Authority (PM-JAY)',
        source_type: 'Central Health Authority',
        central_government: true,
        state_government: false,
        base_url: 'https://pmjay.gov.in',
        description: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana official authority',
        is_active: true
      },
      {
        id: 6,
        name: 'MyScheme National Platform',
        source_type: 'National Scheme Aggregator',
        central_government: true,
        state_government: true,
        base_url: 'https://www.myscheme.gov.in',
        description: 'National Platform developed by MeitY and NeGD for scheme discovery',
        is_active: true
      }
    ];

    for (const p of providersToInsert) {
      const existing = await db.query('SELECT id FROM data_providers WHERE id = $1;', [p.id]);
      if (existing.rows.length === 0) {
        await db.query(`
          INSERT INTO data_providers (id, name, source_type, central_government, state_government, base_url, description, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW());
        `, [p.id, p.name, p.source_type, p.central_government, p.state_government, p.base_url, p.description, p.is_active]);
        console.log(`Inserted provider: ${p.name}`);
      } else {
        await db.query(`
          UPDATE data_providers SET
            name = $2, source_type = $3, central_government = $4, state_government = $5,
            base_url = $6, description = $7, is_active = $8, updated_at = NOW()
          WHERE id = $1;
        `, [p.id, p.name, p.source_type, p.central_government, p.state_government, p.base_url, p.description, p.is_active]);
        console.log(`Updated provider: ${p.name}`);
      }
    }

    // Set sequence to max(id)
    await db.query("SELECT setval(pg_get_serial_sequence('data_providers', 'id'), COALESCE(MAX(id), 1)) FROM data_providers;");

    // Map schemes to appropriate provider IDs based on official_website
    await db.query(`
      UPDATE schemes SET provider_id = 2 WHERE official_website LIKE '%mahadbt.maharashtra.gov.in%';
      UPDATE schemes SET provider_id = 3 WHERE official_website LIKE '%krishi.maharashtra.gov.in%';
      UPDATE schemes SET provider_id = 4 WHERE official_website LIKE '%pmkisan.gov.in%' OR official_website LIKE '%agrimachinery.nic.in%';
      UPDATE schemes SET provider_id = 5 WHERE official_website LIKE '%pmjay.gov.in%';
    `);

    const result = await db.query('SELECT id, name, base_url, is_active FROM data_providers ORDER BY id;');
    console.table(result.rows);
    console.log('Data providers seeded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding data providers:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDataProviders();
}

module.exports = seedDataProviders;
