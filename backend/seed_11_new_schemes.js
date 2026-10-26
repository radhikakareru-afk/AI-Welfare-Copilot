const db = require('./db');

const newSchemes = [
  // 1. Rashtriya Krishi Vikas Yojana (RKVY-RAFTAAR)
  {
    scheme_code: 'SCH-RKVY-RAFTAAR',
    name: 'Rashtriya Krishi Vikas Yojana (RKVY-RAFTAAR)',
    description: 'Remunerative Approaches for Agriculture and Allied Sectors Rejuvenation (RKVY-RAFTAAR) is a flagship central scheme aimed at making farming a remunerative economic activity through agricultural infrastructure strengthening, post-harvest asset creation, value addition, risk mitigation, and promotion of agri-business entrepreneurship.',
    category_id: 6, // Farmers and Agriculture
    state: null, // Central / All-India
    target_audience: 'Farmers, Farmer Producer Organizations (FPOs), and Agri-entrepreneurs across India',
    is_active: true,
    official_website: 'https://rkvy.nic.in',
    benefits: [
      'Financial grant assistance up to ₹5 Lakhs (Idea to PoC stage) and up to ₹25 Lakhs (Seed stage) for agri-startups and innovative farming ventures.',
      'Subsidies for community farm infrastructure including custom hiring centers, cold chains, drying yards, and grain storage godowns.',
      'Grants-in-aid to Farmer Producer Organizations (FPOs) for value addition, farm processing units, and direct market linkage.',
      'Incentivizes states to enhance public investment in agriculture and allied sectors to achieve higher productivity.'
    ],
    criteria: [
      { type: 'age', value: '18+', description: 'Applicant must be an adult aged 18 years or above.' },
      { type: 'occupation', value: 'Farmer, Agricultural Worker', description: 'Applicant must be an agricultural cultivator, member of an FPO, or agri-entrepreneur.' },
      { type: 'annual_income', value: '<=800000', description: 'Applicant or household income generally within ₹8,00,000 for individual farmer preference.' }
    ],
    documents: [
      { name: 'Aadhaar Card', mandatory: true },
      { name: 'Land Ownership Records (7/12 extract / Patta) or FPO Registration Certificate', mandatory: true },
      { name: 'Detailed Project Report (DPR) / Agri-Business Plan', mandatory: true },
      { name: 'Aadhaar-seeded Bank Account Details with IFSC', mandatory: true }
    ],
    steps: [
      { step: 1, desc: 'Visit the official RKVY portal at https://rkvy.nic.in or designated State Agriculture Department window.' },
      { step: 2, desc: 'Register profile under farmer, cooperative, FPO, or agri-entrepreneur stream.' },
      { step: 3, desc: 'Submit Detailed Project Report (DPR) detailing proposed agri-infrastructure or farming enterprise.' },
      { step: 4, desc: 'Project appraisal by State Level Project Screening Committee (SLPSC).' },
      { step: 5, desc: 'Sanction by State Level Sanctioning Committee (SLSC) followed by milestone-based DBT fund release.' }
    ]
  },

  // 2. National Food Security Mission (NFSM)
  {
    scheme_code: 'SCH-NFSM-AGRI',
    name: 'National Food Security Mission (NFSM)',
    description: 'Centrally sponsored mission launched by the Department of Agriculture & Farmers Welfare to increase the production and productivity of food grains (pulses, oilseeds, coarse cereals, and nutri-cereals) through cluster demonstrations, distribution of high-yielding certified seeds, soil ameliorants, and water-saving devices.',
    category_id: 6, // Farmers and Agriculture
    state: null, // Central / All-India & Maharashtra
    target_audience: 'Farmers cultivating food grains, pulses, coarse cereals, and oilseeds across India',
    is_active: true,
    official_website: 'https://nfsm.gov.in',
    benefits: [
      '50% financial subsidy on high-yield certified seed mini-kits of pulses, millets, and coarse grains.',
      'Financial aid of ₹5,000 to ₹7,500 per hectare for cluster demonstrations of improved agricultural technologies.',
      '50% subsidy on plant protection chemicals, bio-fertilizers, and micronutrients.',
      'Subsidized distribution of seed drills, cono-weeders, and knapsack sprayers to boost grain yield.'
    ],
    criteria: [
      { type: 'age', value: '18+', description: 'Applicant must be an adult farmer aged 18 years or above.' },
      { type: 'occupation', value: 'Farmer, Agricultural Worker', description: 'Applicant must hold cultivable agricultural land.' },
      { type: 'annual_income', value: '<=500000', description: 'Targeted at small, marginal, and general farming families with annual income up to ₹5,00,000.' }
    ],
    documents: [
      { name: 'Aadhaar Card', mandatory: true },
      { name: '7/12 Land Records Extract and 8-A Holding Extract', mandatory: true },
      { name: 'Aadhaar-seeded Bank Passbook', mandatory: true },
      { name: 'Caste Certificate (for SC/ST priority allocations)', mandatory: false }
    ],
    steps: [
      { step: 1, desc: 'Access MahaDBT Farmer Portal (mahadbt.maharashtra.gov.in) or NFSM portal at https://nfsm.gov.in.' },
      { step: 2, desc: "Select 'Special Schemes for Crop Diversification / NFSM Pulses & Oilseeds'." },
      { step: 3, desc: 'Choose proposed crop demonstration or subsidized certified seed requirement.' },
      { step: 4, desc: 'Upload 7/12 land records and bank account details.' },
      { step: 5, desc: 'Receive seed distribution allotment at local Taluka Agriculture Office or Krishi Seva Kendra.' }
    ]
  },

  // 3. State Agriculture Mechanization Scheme (Maharashtra)
  {
    scheme_code: 'SCH-MH-AGRI-MECH',
    name: 'State Agriculture Mechanization Scheme',
    description: '100% State-funded agricultural mechanization initiative by the Government of Maharashtra to provide tractor and agricultural implement subsidies to farmers in Maharashtra who could not be accommodated under Central SMAM quotas.',
    category_id: 6, // Farmers and Agriculture
    state: 'Maharashtra',
    target_audience: 'Small, marginal, SC, ST, and women farmers residing and owning farmland in Maharashtra',
    is_active: true,
    official_website: 'https://krishi.maharashtra.gov.in',
    benefits: [
      'Up to 50% capital subsidy (capped at ₹1,25,000) for purchasing tractors (up to 40 PTO HP).',
      'Up to 50% subsidy (up to ₹1,00,000) on power tillers and self-propelled agricultural machinery.',
      '40% to 50% subsidy on tractor-drawn implements including rotavators, MB ploughs, and crop harvesters.',
      'Direct DBT remittance into the farmer Aadhaar-linked bank account upon physical verification.'
    ],
    criteria: [
      { type: 'state', value: 'Maharashtra', description: 'Applicant must be a permanent resident of Maharashtra owning cultivable farmland.' },
      { type: 'occupation', value: 'Farmer, Agricultural Worker', description: 'Applicant must be an active farmer.' },
      { type: 'age', value: '18+', description: 'Applicant must be at least 18 years of age.' },
      { type: 'annual_income', value: '<=800000', description: 'Annual household income should not exceed ₹8,00,000.' }
    ],
    documents: [
      { name: 'Aadhaar Card', mandatory: true },
      { name: 'Maharashtra 7/12 Land Records Extract and 8-A Holding Extract', mandatory: true },
      { name: 'Aadhaar-seeded Bank Passbook', mandatory: true },
      { name: 'Price Quotation from Registered Agricultural Equipment Dealer', mandatory: true },
      { name: 'Caste Certificate (for SC/ST higher subsidy quota)', mandatory: false },
      { name: 'Tractor RC Book (if applying for tractor-mounted implements)', mandatory: false }
    ],
    steps: [
      { step: 1, desc: 'Login to Maharashtra MahaDBT Portal (mahadbt.maharashtra.gov.in).' },
      { step: 2, desc: "Navigate to 'Agriculture Mechanization' -> 'State Agriculture Mechanization Scheme'." },
      { step: 3, desc: 'Select machinery category (Tractor, Rotavator, Thresher, Harvester) and approved dealer.' },
      { step: 4, desc: 'Upload 7/12 extract, dealer quotation, and Aadhaar verification.' },
      { step: 5, desc: 'Participate in online computerized lottery, receive Pre-Sanction, purchase machine, and claim DBT subsidy.' }
    ]
  },

  // 4. Chief Minister Sustainable Agriculture Irrigation Scheme
  {
    scheme_code: 'SCH-MH-SHASHWAT-SINCHAN',
    name: 'Chief Minister Sustainable Agriculture Irrigation Scheme',
    description: 'Flagship Maharashtra State scheme (मुख्यमंत्री शाश्वत कृषी सिंचन योजना) dedicated to drought-proofing agriculture by funding individual farm ponds (Shettale), plastic lining for farm ponds to prevent water seepage, and top-up micro-irrigation subsidies for farmers in declared scarcity and distressed districts.',
    category_id: 6, // Farmers and Agriculture
    state: 'Maharashtra',
    target_audience: 'Farmers in drought-prone, rain-fed, and suicide-affected talukas of Maharashtra',
    is_active: true,
    official_website: 'https://krishi.maharashtra.gov.in',
    benefits: [
      'Financial assistance of ₹75,000 (or 50% of cost) for plastic lining of individual farm ponds (Shettale Astari-karan).',
      'Supplementary assistance of ₹50,000 for construction of individual farm ponds.',
      'Additional top-up subsidy for drip and sprinkler irrigation in vulnerable districts.',
      'Ensures protective irrigation for kharif and rabi crops during extended dry spells.'
    ],
    criteria: [
      { type: 'state', value: 'Maharashtra', description: 'Applicant must be a resident farmer of Maharashtra.' },
      { type: 'occupation', value: 'Farmer, Agricultural Worker', description: 'Applicant must hold cultivable land of minimum 0.60 hectares.' },
      { type: 'age', value: '18+', description: 'Applicant must be at least 18 years of age.' },
      { type: 'annual_income', value: '<=800000', description: 'Annual household income should generally be within ₹8,00,000.' }
    ],
    documents: [
      { name: 'Aadhaar Card', mandatory: true },
      { name: '7/12 Land Records Extract with minimum 0.60 hectares land holding', mandatory: true },
      { name: '8-A Land Holding Extract', mandatory: true },
      { name: 'Aadhaar-seeded Bank Passbook', mandatory: true },
      { name: 'Self-Declaration confirming no prior farm pond subsidy received', mandatory: true }
    ],
    steps: [
      { step: 1, desc: 'Access MahaDBT Farmer Portal (mahadbt.maharashtra.gov.in) with Aadhaar credentials.' },
      { step: 2, desc: "Select 'Irrigation Schemes' -> 'Mukhyamantri Shashwat Krishi Sinchan Yojana'." },
      { step: 3, desc: "Choose component: 'Individual Farm Pond (Shettale)' or 'Farm Pond Plastic Lining'." },
      { step: 4, desc: 'Upload 7/12 extract and self-declaration form.' },
      { step: 5, desc: 'Undergo GPS-tagged spot inspection by Agriculture Assistant and receive pre-sanction order.' }
    ]
  },

  // 5. Eklavya Scholarship
  {
    scheme_code: 'SCH-MH-EKLAVYA',
    name: 'Eklavya Scholarship',
    description: 'State scholarship administered by the Maharashtra Directorate of Higher Education (DHE) to support meritorious graduate students pursuing postgraduate studies in recognized universities and colleges in Maharashtra who come from low-income families.',
    category_id: 1, // Education and Scholarships
    state: 'Maharashtra',
    target_audience: 'Meritorious postgraduate students in Arts, Science, Commerce, and Law in Maharashtra',
    is_active: true,
    official_website: 'https://mahadbt.maharashtra.gov.in',
    benefits: [
      'Direct financial scholarship of ₹5,000 per academic year credited via DBT.',
      'Helps cover postgraduate university fees, research dissertation expenses, and reference materials.',
      'Encourages meritorious degree holders to pursue academic excellence in post-graduation.'
    ],
    criteria: [
      { type: 'state', value: 'Maharashtra', description: 'Applicant must be a permanent domicile of Maharashtra.' },
      { type: 'occupation', value: 'Student', description: 'Enrolled in full-time postgraduate degree in Arts, Science, Commerce, or Law.' },
      { type: 'annual_income', value: '<=75000', description: 'Annual family income from all sources must not exceed ₹75,000.' },
      { type: 'age', value: '18-35', description: 'Applicant age must be between 18 and 35 years.' }
    ],
    documents: [
      { name: 'Aadhaar Card', mandatory: true },
      { name: 'Maharashtra Domicile Certificate', mandatory: true },
      { name: 'Annual Family Income Certificate issued by Tahsildar (<= ₹75,000)', mandatory: true },
      { name: 'Graduation Degree Marksheet (Min 60% for Arts/Law, 70% for Science/Commerce)', mandatory: true },
      { name: 'Postgraduate College Bonafide Certificate & Fee Receipt', mandatory: true },
      { name: 'Aadhaar-seeded Bank Account Passbook', mandatory: true }
    ],
    steps: [
      { step: 1, desc: 'Open Maharashtra MahaDBT Portal (mahadbt.maharashtra.gov.in).' },
      { step: 2, desc: "Select 'Directorate of Higher Education' -> 'Eklavya Scholarship'." },
      { step: 3, desc: 'Enter graduation board/university marksheet percentage and PG course enrollment details.' },
      { step: 4, desc: 'Upload Tahsildar income certificate, domicile certificate, and college bonafide receipt.' },
      { step: 5, desc: 'Submit application for online college verification and subsequent treasury DBT disbursement.' }
    ]
  },

  // 6. Assistance to Meritorious Students Scholarship – Junior Level
  {
    scheme_code: 'SCH-MH-MERIT-JR',
    name: 'Assistance to Meritorious Students Scholarship – Junior Level',
    description: 'Merit scholarship granted by the Directorate of Higher Education, Maharashtra, to top-ranking meritorious students in Class 10 (SSC) continuing their higher secondary education in junior colleges across Maharashtra.',
    category_id: 1, // Education and Scholarships
    state: 'Maharashtra',
    target_audience: 'Meritorious students passing Class 10 (SSC) and pursuing Class 11 and 12 in Maharashtra',
    is_active: true,
    official_website: 'https://mahadbt.maharashtra.gov.in',
    benefits: [
      'Monthly financial merit scholarship paid for 10 months each in Class 11 and Class 12.',
      'Covers junior college stationery, textbook procurement, and laboratory fees.',
      'Official certificate of scholastic merit from Maharashtra State Government.'
    ],
    criteria: [
      { type: 'state', value: 'Maharashtra', description: 'Applicant must be a domicile resident of Maharashtra.' },
      { type: 'occupation', value: 'Student', description: 'Must be enrolled in regular Class 11 or 12 in a recognized junior college in Maharashtra.' },
      { type: 'age', value: '14-20', description: 'Applicant age must be between 14 and 20 years.' },
      { type: 'annual_income', value: '<=800000', description: 'Annual household income should generally be within ₹8,00,000.' }
    ],
    documents: [
      { name: 'Aadhaar Card', mandatory: true },
      { name: 'Class 10 (SSC) Marksheet demonstrating high merit rank', mandatory: true },
      { name: 'Junior College Bonafide Certificate and Admission Receipt', mandatory: true },
      { name: 'Maharashtra Domicile Certificate', mandatory: true },
      { name: 'Aadhaar-linked Bank Passbook', mandatory: true }
    ],
    steps: [
      { step: 1, desc: 'Visit MahaDBT Portal at https://mahadbt.maharashtra.gov.in.' },
      { step: 2, desc: "Choose 'Directorate of Higher Education' -> 'Assistance to Meritorious Students Scholarship - Junior Level'." },
      { step: 3, desc: 'Enter SSC exam roll number, aggregate score, and Junior College admission confirmation.' },
      { step: 4, desc: 'Upload 10th marksheet and bonafide admission letter.' },
      { step: 5, desc: 'Submit for Principal verification and direct stipend credit into bank account.' }
    ]
  },

  // 7. Government Vidyaniketan Scholarship
  {
    scheme_code: 'SCH-MH-VIDYANIKETAN',
    name: 'Government Vidyaniketan Scholarship',
    description: 'Dedicated state scholarship for students who completed schooling from Government Vidyaniketan institutions (special state residential schools for talented rural students in Maharashtra) and secured at least 60% marks in SSC, assisting their transition into higher secondary colleges.',
    category_id: 1, // Education and Scholarships
    state: 'Maharashtra',
    target_audience: 'Students passing Class 10 from recognized Government Vidyaniketan residential schools in Maharashtra',
    is_active: true,
    official_website: 'https://mahadbt.maharashtra.gov.in',
    benefits: [
      'Monthly financial scholarship of ₹100/month for 10 months each academic year in Junior College.',
      'Special academic encouragement for rural talented students from state Vidyaniketan schools.',
      'Direct electronic remittance into student savings account.'
    ],
    criteria: [
      { type: 'state', value: 'Maharashtra', description: 'Applicant must be a domicile of Maharashtra.' },
      { type: 'occupation', value: 'Student', description: 'Passed Class 10 from a Government Vidyaniketan school and admitted to Class 11/12.' },
      { type: 'age', value: '14-20', description: 'Applicant age must be between 14 and 20 years.' },
      { type: 'annual_income', value: '<=800000', description: 'Annual household income should not exceed ₹8,00,000.' }
    ],
    documents: [
      { name: 'Aadhaar Card', mandatory: true },
      { name: 'SSC Marksheet (Minimum 60% aggregate marks)', mandatory: true },
      { name: 'Government Vidyaniketan School Leaving Certificate / School Bonafide', mandatory: true },
      { name: 'Junior College Bonafide Certificate', mandatory: true },
      { name: 'Aadhaar-seeded Bank Passbook', mandatory: true }
    ],
    steps: [
      { step: 1, desc: 'Register on MahaDBT Portal (mahadbt.maharashtra.gov.in).' },
      { step: 2, desc: "Under 'Directorate of Higher Education', select 'Government Vidyaniketan Scholarship'." },
      { step: 3, desc: 'Provide Vidyaniketan school passing credentials and 10th marks percentage.' },
      { step: 4, desc: 'Upload Vidyaniketan school certificate and junior college admission receipt.' },
      { step: 5, desc: 'Submit form online for college nodal officer endorsement.' }
    ]
  },

  // 8. State Government Dakshina Adhichatra Scholarship
  {
    scheme_code: 'SCH-MH-DAKSHINA',
    name: 'State Government Dakshina Adhichatra Scholarship',
    description: 'Prestigious legacy scholarship offered by the Government of Maharashtra to meritorious students enrolled in master degree programs in non-agricultural universities, Institute of Science, Mumbai, and recognized post-graduate departments across Maharashtra.',
    category_id: 1, // Education and Scholarships
    state: 'Maharashtra',
    target_audience: 'Meritorious postgraduate students enrolled in recognized universities and research institutions in Maharashtra',
    is_active: true,
    official_website: 'https://mahadbt.maharashtra.gov.in',
    benefits: [
      'Financial scholarship allowance of ₹250 per month for 10 months each academic year during postgraduate study.',
      'Exemption from specialized laboratory and library tuition surcharges in government institutes.',
      'Highly valued academic credential for future doctoral fellowships.'
    ],
    criteria: [
      { type: 'state', value: 'Maharashtra', description: 'Applicant must be a permanent resident of Maharashtra.' },
      { type: 'occupation', value: 'Student', description: 'Enrolled in master degree programs in non-agricultural universities or specialized colleges in Maharashtra.' },
      { type: 'age', value: '20-30', description: 'Applicant age must be between 20 and 30 years.' },
      { type: 'annual_income', value: '<=800000', description: 'Annual household income should generally be within ₹8,00,000.' }
    ],
    documents: [
      { name: 'Aadhaar Card', mandatory: true },
      { name: 'Maharashtra Domicile Certificate', mandatory: true },
      { name: 'Undergraduate Degree Final Marksheet with First Class honors', mandatory: true },
      { name: 'Postgraduate University Department Admission Bonafide', mandatory: true },
      { name: 'Aadhaar-linked Bank Account Details', mandatory: true }
    ],
    steps: [
      { step: 1, desc: 'Login to MahaDBT Portal (mahadbt.maharashtra.gov.in).' },
      { step: 2, desc: "Select 'Directorate of Higher Education' -> 'State Government Dakshina Adhichatra Scholarship'." },
      { step: 3, desc: 'Fill in graduation details, university department registration, and master specialization.' },
      { step: 4, desc: 'Upload degree transcript, domicile certificate, and departmental bonafide certificate.' },
      { step: 5, desc: 'Submit application for University Scrutiny Officer verification.' }
    ]
  },

  // 9. Open Merit Scholarships in Junior College
  {
    scheme_code: 'SCH-MH-OPEN-MERIT-JC',
    name: 'Open Merit Scholarships in Junior College',
    description: 'State Government scholarship administered by the Maharashtra DHE for students who secured high merit (minimum 60% marks in SSC) and are enrolled in regular 11th and 12th standards in junior colleges across Maharashtra.',
    category_id: 1, // Education and Scholarships
    state: 'Maharashtra',
    target_audience: 'Students admitted to Class 11 and 12 in Arts, Science, Commerce, and Law streams in Maharashtra',
    is_active: true,
    official_website: 'https://mahadbt.maharashtra.gov.in',
    benefits: [
      'Scholarship allowance of ₹50 per month for 10 months per year throughout Class 11 and 12.',
      'Guaranteed merit support for secondary school high-achievers pursuing higher secondary education.',
      'Direct electronic disbursement via MahaDBT into the student bank account.'
    ],
    criteria: [
      { type: 'state', value: 'Maharashtra', description: 'Applicant must be a permanent resident of Maharashtra.' },
      { type: 'occupation', value: 'Student', description: 'Must be enrolled in Class 11 or 12 in a recognized junior college in Maharashtra.' },
      { type: 'age', value: '14-20', description: 'Applicant age must be between 14 and 20 years.' },
      { type: 'annual_income', value: '<=800000', description: 'Annual household income should generally be within ₹8,00,000.' }
    ],
    documents: [
      { name: 'Aadhaar Card', mandatory: true },
      { name: 'SSC (Class 10) Marksheet (Minimum 60% aggregate marks)', mandatory: true },
      { name: 'Junior College Bonafide Certificate & Admission Fee Receipt', mandatory: true },
      { name: 'Maharashtra Domicile Certificate', mandatory: true },
      { name: 'Aadhaar-seeded Bank Passbook', mandatory: true }
    ],
    steps: [
      { step: 1, desc: 'Access MahaDBT portal at https://mahadbt.maharashtra.gov.in.' },
      { step: 2, desc: "Select 'Directorate of Higher Education' -> 'Open Merit Scholarships in Junior College'." },
      { step: 3, desc: 'Enter 10th standard board roll number, passing year, and marks percentage.' },
      { step: 4, desc: 'Upload marksheet and Junior College admission confirmation receipt.' },
      { step: 5, desc: 'Finalize application and forward receipt to Junior College Principal.' }
    ]
  },

  // 10. Pradhan Mantri Matru Vandana Yojana (PMMVY)
  {
    scheme_code: 'SCH-PMMVY-WOMEN',
    name: 'Pradhan Mantri Matru Vandana Yojana (PMMVY)',
    description: 'Centrally sponsored direct benefit transfer (DBT) conditional cash transfer scheme under the Ministry of Women and Child Development providing financial incentive to pregnant women and lactating mothers for wage compensation during childbirth and to promote institutional delivery and immunization.',
    category_id: 5, // Women and Women Empowerment
    state: null, // Central / All-India
    target_audience: 'Pregnant Women and Lactating Mothers (PW&LM) across all states in India',
    is_active: true,
    official_website: 'https://pmmvy.wcd.gov.in',
    benefits: [
      'Financial benefit of ₹5,000 in two installments for the first living child (₹3,000 on early registration and ANC, ₹2,000 after birth registration and full primary vaccination).',
      'Financial incentive of ₹6,000 in a single installment for the second child, provided the second child is a girl (promoting girl child welfare).',
      'All benefits transferred directly into the woman Aadhaar-seeded bank account through Direct Benefit Transfer (DBT).',
      'Compensates for wage loss, promotes improved nutrition, and enhances institutional deliveries.'
    ],
    criteria: [
      { type: 'gender', value: 'Female, Women', description: 'Scheme is exclusively reserved for pregnant women and lactating mothers.' },
      { type: 'age', value: '19-45', description: 'Mother age must be at least 19 years at the time of pregnancy.' },
      { type: 'annual_income', value: '<=800000', description: 'Open to vulnerable families with annual household income up to ₹8,00,000 or holding Ration Card / E-Shram.' }
    ],
    documents: [
      { name: 'Mother Aadhaar Card', mandatory: true },
      { name: 'Mother and Child Protection (MCP) Card / RCH Portal Registration ID', mandatory: true },
      { name: 'Aadhaar-seeded Bank Account Details of the Mother', mandatory: true },
      { name: 'Child Birth Certificate (for 2nd installment / girl child incentive)', mandatory: true },
      { name: 'Proof of Eligibility (E-Shram Card / Ration Card / Income Certificate <= ₹8L)', mandatory: true }
    ],
    steps: [
      { step: 1, desc: 'Visit the official PMMVY portal at https://pmmvy.wcd.gov.in or visit local Anganwadi Center / ASHA worker.' },
      { step: 2, desc: 'Register using mobile number and Mother Aadhaar authentication.' },
      { step: 3, desc: 'Fill in LMP (Last Menstrual Period) date and Mother and Child Protection (MCP) card details.' },
      { step: 4, desc: 'Upload MCP card pages showing Antenatal Check-up (ANC) and bank account details.' },
      { step: 5, desc: 'Submit application for verification by Anganwadi Worker (AWW) and Child Development Project Officer (CDPO).' }
    ]
  },

  // 11. Deendayal Antyodaya Yojana – National Rural Livelihoods Mission (DAY-NRLM)
  {
    scheme_code: 'SCH-DAY-NRLM',
    name: 'Deendayal Antyodaya Yojana – National Rural Livelihoods Mission (DAY-NRLM)',
    description: 'Flagship national mission under the Ministry of Rural Development to alleviate rural poverty through sustainable community institutions for women. Mobilizes rural women into Self-Help Groups (SHGs), Village Organizations (VOs), and Cluster Level Federations (CLFs), providing revolving capital funds, livelihood grants, and low-interest bank credit for micro-enterprises.',
    category_id: 5, // Women and Women Empowerment
    state: null, // Central / All-India
    target_audience: 'Rural women, members of Women Self-Help Groups (SHGs) and federations across India',
    is_active: true,
    official_website: 'https://nrlm.gov.in',
    benefits: [
      'Revolving Fund (RF) of ₹20,000 to ₹30,000 directly granted to newly formed women SHGs to establish credit discipline.',
      'Community Investment Fund (CIF) up to ₹2.5 Lakhs per SHG to finance members income-generating micro-enterprises.',
      'Collateral-free bank loan credit linkage up to ₹10 Lakhs with Interest Subvention reducing effective interest to 7% per annum.',
      'Livelihood skill training, digital financial literacy, and market linkages through SARAS exhibitions and the GeM portal.'
    ],
    criteria: [
      { type: 'gender', value: 'Female, Women', description: 'Scheme targets rural women organized into Self-Help Groups.' },
      { type: 'age', value: '18-65', description: 'Beneficiary woman must be between 18 and 65 years of age.' },
      { type: 'annual_income', value: '<=300000', description: 'Targeted at poor and vulnerable rural households with annual income up to ₹3,00,000.' }
    ],
    documents: [
      { name: 'Aadhaar Card of Woman Member', mandatory: true },
      { name: 'Women Self-Help Group (SHG) Passbook / Resolution Document', mandatory: true },
      { name: 'Village Gram Panchayat Resident Verification or Ration Card', mandatory: true },
      { name: 'Individual and Group Aadhaar-linked Bank Passbooks', mandatory: true }
    ],
    steps: [
      { step: 1, desc: 'Connect with the local Gram Panchayat Community Resource Person (CRP) or UMED/NRLM block coordinator.' },
      { step: 2, desc: 'Join or form a 10–20 member Women Self-Help Group (SHG) in your village.' },
      { step: 3, desc: 'Open a savings bank account in the SHG name and practice the Panchasutra (regular meetings, savings, internal lending, repayment, and bookkeeping).' },
      { step: 4, desc: 'Submit SHG micro-credit investment plan through the Village Organization (VO).' },
      { step: 5, desc: 'Receive Revolving Fund (RF) and Community Investment Fund (CIF) directly through DBT into the group account.' }
    ]
  }
];

async function seed11Schemes() {
  console.log('=== SEEDING 11 NEW CANDIDATE GOVERNMENT SCHEMES ===\n');

  try {
    // 1. Initial count check
    const initialRes = await db.query('SELECT COUNT(*) FROM schemes;');
    const initialCount = parseInt(initialRes.rows[0].count, 10);
    console.log(`Initial total schemes in database: ${initialCount}`);

    let newlyInsertedCount = 0;
    let skippedCount = 0;

    for (const s of newSchemes) {
      // Duplicate check by scheme_code OR exact name
      const dupCheck = await db.query(
        'SELECT id, scheme_code, name FROM schemes WHERE scheme_code = $1 OR LOWER(name) = LOWER($2);',
        [s.scheme_code, s.name]
      );

      if (dupCheck.rows.length > 0) {
        console.log(`[SKIP - DUPLICATE] Scheme already exists: ${dupCheck.rows[0].scheme_code} - ${dupCheck.rows[0].name}`);
        skippedCount++;
        continue;
      }

      // Insert new scheme
      const insertRes = await db.query(`
        INSERT INTO schemes (
          scheme_code, name, description, category_id, state, 
          target_audience, is_active, official_website, provider_id, 
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1, NOW(), NOW())
        RETURNING id;
      `, [
        s.scheme_code,
        s.name,
        s.description,
        s.category_id,
        s.state,
        s.target_audience,
        s.is_active,
        s.official_website
      ]);

      const schemeId = insertRes.rows[0].id;
      newlyInsertedCount++;
      console.log(`[INSERTED] (${newlyInsertedCount}/11) ID: ${schemeId} | Code: ${s.scheme_code} | Name: ${s.name}`);

      // Insert Benefits
      for (const b of s.benefits) {
        await db.query(
          'INSERT INTO scheme_benefits (scheme_id, benefit) VALUES ($1, $2);',
          [schemeId, b]
        );
      }

      // Insert Eligibility Criteria
      for (const crit of s.criteria) {
        await db.query(
          'INSERT INTO scheme_eligibility_criteria (scheme_id, criteria_type, criteria_value, criteria_description) VALUES ($1, $2, $3, $4);',
          [schemeId, crit.type, crit.value, crit.description]
        );
      }

      // Insert Documents
      for (const doc of s.documents) {
        await db.query(
          'INSERT INTO scheme_documents (scheme_id, document_name, is_mandatory) VALUES ($1, $2, $3);',
          [schemeId, doc.name, doc.mandatory]
        );
      }

      // Insert Application Steps
      for (const step of s.steps) {
        await db.query(
          'INSERT INTO scheme_application_steps (scheme_id, step_number, step_description) VALUES ($1, $2, $3);',
          [schemeId, step.step, step.desc]
        );
      }
    }

    // Final count check
    const finalRes = await db.query('SELECT COUNT(*) FROM schemes WHERE is_active = TRUE;');
    const finalCount = parseInt(finalRes.rows[0].count, 10);
    console.log(`\nNewly inserted: ${newlyInsertedCount}`);
    console.log(`Skipped duplicates: ${skippedCount}`);
    console.log(`Final total active schemes in database: ${finalCount}`);

    if (finalCount < 26) {
      throw new Error(`Expected at least 26 schemes, but database has ${finalCount}`);
    }

    console.log('\n✓ SEEDING COMPLETED SUCCESSFULLY! Database now has ' + finalCount + ' unique schemes.');
    process.exit(0);
  } catch (err) {
    console.error('\n✗ Error during seeding:', err);
    process.exit(1);
  }
}

seed11Schemes();
