const db = require('./db');
const { evaluateEligibilityForScheme } = require('./services/eligibilityService');

async function testIntegration() {
  console.log('=== RUNNING AI-WELFARE-COPILOT 26 SCHEMES INTEGRATION TEST ===\n');

  try {
    // 1. Schemes Query
    const { rows: schemes } = await db.query(`
      SELECT 
        s.id, 
        s.scheme_code, 
        s.name, 
        s.state, 
        s.is_active, 
        s.official_website,
        c.name AS category
      FROM schemes s
      LEFT JOIN scheme_categories c ON s.category_id = c.id
      WHERE s.is_active = TRUE
      ORDER BY s.id;
    `);

    console.log(`✓ Active schemes count in database: ${schemes.length}`);
    if (schemes.length < 26) {
      throw new Error(`Expected at least 26 schemes, got ${schemes.length}`);
    }

    // 2. Verify all 11 candidate schemes exist
    const newCandidateCodes = [
      'SCH-RKVY-RAFTAAR',
      'SCH-NFSM-AGRI',
      'SCH-MH-AGRI-MECH',
      'SCH-MH-SHASHWAT-SINCHAN',
      'SCH-MH-EKLAVYA',
      'SCH-MH-MERIT-JR',
      'SCH-MH-VIDYANIKETAN',
      'SCH-MH-DAKSHINA',
      'SCH-MH-OPEN-MERIT-JC',
      'SCH-PMMVY-WOMEN',
      'SCH-DAY-NRLM'
    ];

    console.log('\n--- Verifying The 11 Newly Inserted Schemes ---');
    for (const code of newCandidateCodes) {
      const found = schemes.find(s => s.scheme_code === code);
      if (!found) {
        throw new Error(`Target candidate scheme ${code} not found in database!`);
      }
      
      // Check child relations
      const [bRes, cRes, dRes, sRes] = await Promise.all([
        db.query('SELECT COUNT(*) FROM scheme_benefits WHERE scheme_id = $1', [found.id]),
        db.query('SELECT COUNT(*) FROM scheme_eligibility_criteria WHERE scheme_id = $1', [found.id]),
        db.query('SELECT COUNT(*) FROM scheme_documents WHERE scheme_id = $1', [found.id]),
        db.query('SELECT COUNT(*) FROM scheme_application_steps WHERE scheme_id = $1', [found.id])
      ]);

      const benCount = parseInt(bRes.rows[0].count, 10);
      const critCount = parseInt(cRes.rows[0].count, 10);
      const docCount = parseInt(dRes.rows[0].count, 10);
      const stepCount = parseInt(sRes.rows[0].count, 10);

      console.log(`  [PASS] ${code.padEnd(25)} | ID: ${String(found.id).padEnd(2)} | State: ${(found.state || 'All-India').padEnd(12)} | Category: ${found.category.padEnd(30)} | Ben:${benCount} Crit:${critCount} Docs:${docCount} Steps:${stepCount}`);
      
      if (benCount === 0 || critCount === 0 || docCount === 0 || stepCount === 0) {
        throw new Error(`Incomplete relational records for scheme ${code}`);
      }
    }

    // 3. Test Eligibility Engine Scenarios
    console.log('\n--- Testing Eligibility Service Logic with 26 Schemes ---');
    
    // Fetch all criteria
    const { rows: allCriteria } = await db.query('SELECT * FROM scheme_eligibility_criteria;');

    // Scenario A: Maharashtra Female Farmer (Age 32, Income 1.5L)
    const femaleFarmer = {
      age: 32,
      gender: 'female',
      state: 'Maharashtra',
      district: 'Pune',
      occupation: 'Farmer',
      category: 'OBC',
      annual_income: 150000,
      education: 'Secondary Education',
      is_disabled: false,
      disability_percentage: 0
    };

    console.log('\nScenario A: Female Farmer in Maharashtra (Age: 32, Income: 1.5L)');
    let eligibleCountA = 0;
    const eligibleA = [];
    for (const s of schemes) {
      const schemeCrit = allCriteria.filter(c => c.scheme_id == s.id);
      const evalRes = evaluateEligibilityForScheme(femaleFarmer, s, schemeCrit);
      if (evalRes.status === 'eligible') {
        eligibleCountA++;
        eligibleA.push(s.name);
      }
    }
    console.log(`  -> Total Qualified: ${eligibleCountA}`);
    eligibleA.forEach(name => console.log(`     - ${name}`));
    if (eligibleCountA < 8) {
      throw new Error(`Female farmer should qualify for multiple agriculture & women schemes, got only ${eligibleCountA}`);
    }

    // Scenario B: Maharashtra High Secondary Student (Age 17, Merit, Income 2L)
    const jrStudent = {
      age: 17,
      gender: 'male',
      state: 'Maharashtra',
      district: 'Kolhapur',
      occupation: 'Student',
      category: 'General',
      annual_income: 200000,
      education: 'Higher Secondary',
      is_disabled: false,
      disability_percentage: 0
    };

    console.log('\nScenario B: Junior College Student in Maharashtra (Age: 17, Income: 2L)');
    let jrStudentMatches = 0;
    for (const s of schemes) {
      const schemeCrit = allCriteria.filter(c => c.scheme_id == s.id);
      const evalRes = evaluateEligibilityForScheme(jrStudent, s, schemeCrit);
      if (evalRes.status === 'eligible') {
        jrStudentMatches++;
        console.log(`  -> Eligible: [${s.scheme_code}] ${s.name}`);
      }
    }
    if (jrStudentMatches < 3) {
      throw new Error('Junior student should qualify for junior scholarships and general schemes');
    }

    // Scenario C: Pregnant Mother / Rural Woman (Age 25, Income 1.8L)
    const pregnantWoman = {
      age: 25,
      gender: 'female',
      state: 'Maharashtra',
      district: 'Nashik',
      occupation: 'Unemployed',
      category: 'General',
      annual_income: 180000,
      education: 'Secondary Education',
      is_disabled: false,
      disability_percentage: 0
    };

    console.log('\nScenario C: Pregnant Mother / Rural Woman in Maharashtra (Age: 25, Income: 1.8L)');
    let pmmvyMatch = false;
    let nrlmMatch = false;
    let ladkiBahinMatch = false;
    for (const s of schemes) {
      const schemeCrit = allCriteria.filter(c => c.scheme_id == s.id);
      const evalRes = evaluateEligibilityForScheme(pregnantWoman, s, schemeCrit);
      if (evalRes.status === 'eligible') {
        console.log(`  -> Eligible: [${s.scheme_code}] ${s.name}`);
        if (s.scheme_code === 'SCH-PMMVY-WOMEN') pmmvyMatch = true;
        if (s.scheme_code === 'SCH-DAY-NRLM') nrlmMatch = true;
        if (s.scheme_code === 'SCH-MH-LADKI-BAHIN') ladkiBahinMatch = true;
      }
    }
    if (!pmmvyMatch || !nrlmMatch || !ladkiBahinMatch) {
      throw new Error(`Pregnant/rural woman must match PMMVY, DAY-NRLM, and Ladki Bahin! (Got PMMVY: ${pmmvyMatch}, NRLM: ${nrlmMatch}, LadkiBahin: ${ladkiBahinMatch})`);
    }

    // 4. Test Public Statistics Endpoint data
    const statsRes = await db.query(`
      SELECT 
        COUNT(*) FILTER (WHERE is_active = TRUE) AS active_schemes,
        COUNT(*) AS total_schemes,
        COUNT(*) FILTER (WHERE is_active = TRUE AND state IS NULL) AS central_schemes,
        COUNT(*) FILTER (WHERE is_active = TRUE AND state IS NOT NULL) AS state_schemes
      FROM schemes;
    `);
    console.log('\nPlatform Aggregate Statistics:', statsRes.rows[0]);
    if (parseInt(statsRes.rows[0].active_schemes, 10) !== 26) {
      throw new Error(`Expected exactly 26 active schemes in stats, got ${statsRes.rows[0].active_schemes}`);
    }

    console.log('\n✓ ALL 26 SCHEMES INTEGRATION TESTS PASSED PERFECTLY!');
    process.exit(0);
  } catch (err) {
    console.error('\n✗ TEST FAILED:', err.message);
    process.exit(1);
  }
}

testIntegration();
