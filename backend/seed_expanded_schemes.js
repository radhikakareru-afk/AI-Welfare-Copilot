const db = require('./db');

const expandedSchemes = [
  // 1. PM-KISAN Samman Nidhi
  {
    scheme_code: 'SCH-PM-KISAN',
    name: 'PM-Kisan Samman Nidhi',
    description: 'Pradhan Mantri Kisan Samman Nidhi is a central sector scheme that provides guaranteed income support of ₹6,000 per year to all landholding farmer families across India, payable in three equal four-monthly installments of ₹2,000 directly into Aadhaar-seeded bank accounts.',
    category_id: 6, // Farmers and Agriculture
    state: null, // All India
    target_audience: 'Small and marginal landholding farmer families across India',
    is_active: true,
    official_website: 'https://pmkisan.gov.in',
    benefits: [
      'Direct financial support of ₹6,000 per year transferred in three equal installments of ₹2,000 every four months.',
      '100% financial funding provided directly by the Central Government of India without intermediaries.',
      'Direct Benefit Transfer (DBT) linkage ensuring prompt and leak-proof remittance into Aadhaar-linked accounts.',
      'Comprehensive financial cushion to meet agricultural input costs (seeds, fertilizer, pest control) before every sowing cycle.'
    ],
    criteria: [
      { type: 'age', value: '18+', description: 'Applicant must be an adult aged 18 years or above.' },
      { type: 'occupation', value: 'Farmer, Agricultural Worker', description: 'Applicant must be an agricultural cultivator or farmer holding cultivable land in their name.' },
      { type: 'annual_income', value: '<=300000', description: 'Targeted at small and marginal farming families with annual household income up to ₹3,00,000.' }
    ],
    documents: [
      { name: 'Aadhaar Card', mandatory: true },
      { name: 'Land Ownership Records (7/12 Extract / Khatauni / RoR)', mandatory: true },
      { name: 'Aadhaar-seeded Bank Passbook with IFSC', mandatory: true },
      { name: 'Active Mobile Number linked with Aadhaar', mandatory: true }
    ],
    steps: [
      { step: 1, desc: 'Visit official PM-Kisan portal at https://pmkisan.gov.in' },
      { step: 2, desc: "Navigate to 'Farmers Corner' on homepage and select 'New Farmer Registration'." },
      { step: 3, desc: 'Enter Aadhaar number, state of residence, captcha code, and verify using mobile OTP.' },
      { step: 4, desc: 'Fill in rural/urban land ownership survey number, khasra/patta details, and bank credentials.' },
      { step: 5, desc: 'Submit registration and save the reference registration ID for status tracking.' }
    ]
  },

  // 2. PMKSY – Per Drop More Crop
  {
    scheme_code: 'SCH-PMKSY-PDMC',
    name: 'PMKSY – Per Drop More Crop',
    description: 'Centrally sponsored micro-irrigation scheme under Pradhan Mantri Krishi Sinchayee Yojana (PMKSY) implemented nationwide and via MahaDBT in Maharashtra. Focuses on maximizing farm water efficiency through drip and sprinkler irrigation systems, precision water application, and farm water harvesting.',
    category_id: 6, // Farmers and Agriculture
    state: null, // Central / All-India & Maharashtra
    target_audience: 'Small, marginal, and general landholding farmers adopting micro-irrigation',
    is_active: true,
    official_website: 'https://pmksy.gov.in',
    benefits: [
      '55% financial subsidy for Small and Marginal farmers (holding up to 2 hectares) on drip and sprinkler systems.',
      '45% financial subsidy for other general category farmers on micro-irrigation equipment.',
      'Maharashtra State top-up subsidy: Additional 25% for small/marginal and 30% for other farmers through MahaDBT (up to 75-80% total support).',
      'Reduces water usage by up to 40-50% and electricity costs while significantly raising crop yields.'
    ],
    criteria: [
      { type: 'age', value: '18+', description: 'Applicant must be an adult farmer aged 18 years or above.' },
      { type: 'occupation', value: 'Farmer, Agricultural Worker', description: 'Must be an agricultural landholder with cultivable land and an assured water source.' },
      { type: 'annual_income', value: '<=500000', description: 'Open to small, marginal, and general farming households with annual family income up to ₹5,00,000.' }
    ],
    documents: [
      { name: 'Aadhaar Card', mandatory: true },
      { name: '7/12 Land Records Extract and 8-A Holding Extract', mandatory: true },
      { name: 'Aadhaar-linked Bank Account Passbook', mandatory: true },
      { name: 'Micro-Irrigation Equipment Quotation from Authorized Dealer', mandatory: true },
      { name: 'Electricity Bill or Proof of Assured Water Source (Well/Borewell)', mandatory: true },
      { name: 'Caste Certificate (for SC/ST higher subsidy allocation)', mandatory: false }
    ],
    steps: [
      { step: 1, desc: 'Register or log in to the MahaDBT Farmer Portal (mahadbt.maharashtra.gov.in) or National PMKSY Portal.' },
      { step: 2, desc: "Under 'Irrigation Schemes', click on 'Per Drop More Crop (Micro Irrigation)'." },
      { step: 3, desc: 'Select preferred micro-irrigation type (Drip/Sprinkler), survey number, and registered equipment manufacturer.' },
      { step: 4, desc: 'Upload 7/12 extract, water source certificate, and dealer proforma invoice.' },
      { step: 5, desc: 'Receive online Pre-Sanction order, install the micro-irrigation setup, and submit geotagged invoice for DBT subsidy.' }
    ]
  },

  // 3. Sub-Mission on Farm Mechanization (SMAM)
  {
    scheme_code: 'SCH-SMAM-AGRI',
    name: 'Sub-Mission on Farm Mechanization (SMAM)',
    description: 'Flagship initiative by the Ministry of Agriculture & Farmers Welfare, implemented in Maharashtra through MahaDBT. Aims to increase reach of farm mechanization to small and marginal farmers, promoting custom hiring centers and subsidized equipment including tractors, power tillers, rotavators, crop reapers, and seed drills.',
    category_id: 6, // Farmers and Agriculture
    state: null, // Central / All-India & Maharashtra
    target_audience: 'Small, marginal, SC/ST, and women farmers seeking agricultural machinery subsidies',
    is_active: true,
    official_website: 'https://agrimachinery.nic.in',
    benefits: [
      '40% to 50% financial subsidy on the purchase of approved agricultural machinery and implements.',
      'Special 50% subsidy rate (up to ₹5,00,000) for Women farmers, SC/ST farmers, and small/marginal cultivators.',
      '40% subsidy rate (up to ₹4,00,000) for general category farmers.',
      'Up to 80% capital grant (up to ₹10 Lakhs) for establishing Custom Hiring Centers (CHCs) by farmer groups and SHGs.'
    ],
    criteria: [
      { type: 'age', value: '18+', description: 'Applicant must be at least 18 years of age.' },
      { type: 'occupation', value: 'Farmer, Agricultural Worker', description: 'Applicant must be an active agricultural landholder in India.' },
      { type: 'annual_income', value: '<=500000', description: 'Annual household income should generally be within ₹5,00,000 for maximum subsidy preference.' }
    ],
    documents: [
      { name: 'Aadhaar Card', mandatory: true },
      { name: '7/12 Land Records Extract and 8-A Extract', mandatory: true },
      { name: 'Aadhaar-seeded Bank Passbook', mandatory: true },
      { name: 'Farm Machinery Quotation from Authorized Dealer', mandatory: true },
      { name: 'Tractor Registration Certificate (RC Book) for tractor-mounted implements', mandatory: false },
      { name: 'Caste Certificate (for SC/ST affirmative subsidy rates)', mandatory: false }
    ],
    steps: [
      { step: 1, desc: 'Access MahaDBT Farmer Portal or National Agrimachinery Portal at https://agrimachinery.nic.in' },
      { step: 2, desc: "Navigate to 'Agricultural Mechanization (SMAM)' and pick equipment type (e.g., Rotavator, Power Tiller, Reaper)." },
      { step: 3, desc: 'Upload land records, tractor RC (if required), dealer quotation, and identity proofs.' },
      { step: 4, desc: 'Participate in the transparent computerized lottery selection run by the Agriculture Department.' },
      { step: 5, desc: 'Obtain Pre-Sanction letter, buy machinery from registered dealer within 30 days, and upload verification for DBT.' }
    ]
  },

  // 4. Bhausaheb Fundkar Phalbaag Lagvad Yojana
  {
    scheme_code: 'SCH-MH-FUNDKAR',
    name: 'Bhausaheb Fundkar Phalbaag Lagvad Yojana',
    description: 'A 100% Maharashtra State-funded horticulture scheme named after former Agriculture Minister Bhausaheb Fundkar. Provides comprehensive grants to farmers across 3 years for cultivating 16 designated perennial fruit crops (including Mango, Pomegranate, Guava, Custard Apple, Kagzi Lime, Sweet Orange, Cashew, Sapota, and Jamun) to ensure steady farm income.',
    category_id: 6, // Farmers and Agriculture (State: Maharashtra)
    state: 'Maharashtra',
    target_audience: 'Individual farmers in Maharashtra owning agricultural land suitable for horticulture',
    is_active: true,
    official_website: 'https://krishi.maharashtra.gov.in',
    benefits: [
      '100% financial subsidy on fruit plantation expenses disbursed over a 3-year phased cycle.',
      'Year 1: 50% subsidy for land preparation, pit digging, organic manure, and sapling plantation.',
      'Year 2: 30% subsidy based on a minimum plant survival rate of 75%.',
      'Year 3: 20% subsidy based on a minimum plant survival rate of 75%.',
      'Permits cultivation from 0.20 hectares up to a maximum ceiling of 6 hectares per farmer.'
    ],
    criteria: [
      { type: 'state', value: 'Maharashtra', description: 'Applicant must be a permanent resident of Maharashtra owning cultivable land in the state.' },
      { type: 'occupation', value: 'Farmer, Agricultural Worker', description: 'Applicant must be an agricultural landowner with perennial water availability.' },
      { type: 'age', value: '18+', description: 'Applicant must be at least 18 years of age.' },
      { type: 'annual_income', value: '<=800000', description: 'Annual household income should not exceed ₹8,00,000.' }
    ],
    documents: [
      { name: 'Aadhaar Card', mandatory: true },
      { name: '7/12 Land Records Extract showing perennial water source', mandatory: true },
      { name: '8-A Land Holding Extract', mandatory: true },
      { name: 'Aadhaar-seeded Bank Passbook', mandatory: true },
      { name: 'Self-declaration confirming no prior plantation subsidy on chosen survey number', mandatory: true },
      { name: 'Soil and Water Quality Testing Certificate', mandatory: false }
    ],
    steps: [
      { step: 1, desc: 'Login to Maharashtra MahaDBT Portal (mahadbt.maharashtra.gov.in) and navigate to Horticulture Schemes.' },
      { step: 2, desc: "Select 'Bhausaheb Fundkar Fruit Plantation Scheme' and choose fruit variety (e.g., Mango, Guava, Pomegranate)." },
      { step: 3, desc: 'Enter survey number and proposed acreage between 0.20 hectares and 6.00 hectares.' },
      { step: 4, desc: 'Upload 7/12 extract, water availability certificate, and signed self-declaration form.' },
      { step: 5, desc: 'Undergo spot verification by Taluka Agriculture Officer (TAO), receive pre-sanction, and commence plantation.' }
    ]
  },

  // 5. Government of India Post-Matric Scholarship
  {
    scheme_code: 'EDU001',
    name: 'Government of India Post-Matric Scholarship (SC/ST/OBC)',
    description: 'A premier centrally sponsored scheme implemented through Maharashtra MahaDBT and the National Scholarship Portal. Provides complete tuition fee reimbursement and monthly maintenance allowances to students from Scheduled Castes, Scheduled Tribes, and Other Backward Classes studying in higher secondary, graduation, post-graduation, and professional degree courses.',
    category_id: 1, // Education and Scholarships
    state: 'Maharashtra',
    target_audience: 'SC, ST, VJNT, and OBC students pursuing post-secondary and higher education in Maharashtra',
    is_active: true,
    official_website: 'https://mahadbt.maharashtra.gov.in',
    benefits: [
      '100% reimbursement of tuition fees, examination fees, and mandatory institutional fees.',
      'Monthly maintenance allowance up to ₹1,200/month for day scholars across degree programs.',
      'Monthly maintenance allowance up to ₹1,350/month for hostellers in professional and technical courses.',
      'Special annual book allowance and study tour assistance for professional course students.'
    ],
    criteria: [
      { type: 'state', value: 'Maharashtra', description: 'Applicant must be a domicile resident of Maharashtra.' },
      { type: 'category', value: 'SC, ST, OBC', description: 'Applicant must belong to recognized SC, ST, VJNT, or OBC social categories.' },
      { type: 'occupation', value: 'Student', description: 'Applicant must be enrolled as a regular student in post-matric recognized courses.' },
      { type: 'annual_income', value: '<=250000', description: 'Annual family income from all sources must not exceed ₹2,50,000.' },
      { type: 'age', value: '16-35', description: 'Applicant age must be between 16 and 35 years.' }
    ],
    documents: [
      { name: 'Aadhaar Card', mandatory: true },
      { name: 'Caste Certificate issued by Competent Authority', mandatory: true },
      { name: 'Caste Validity Certificate (for technical/professional courses)', mandatory: true },
      { name: 'Annual Income Certificate issued by Tahsildar (<= ₹2,50,000)', mandatory: true },
      { name: 'Previous Year Academic Marksheet (SSC / HSC / Degree)', mandatory: true },
      { name: 'College Bonafide Certificate & Current Year Fee Receipt', mandatory: true },
      { name: 'Aadhaar-seeded Bank Account Passbook', mandatory: true }
    ],
    steps: [
      { step: 1, desc: 'Visit Maharashtra MahaDBT portal (mahadbt.maharashtra.gov.in) and register using Aadhaar number.' },
      { step: 2, desc: "Navigate to 'Social Justice & Special Assistance Department' -> 'Government of India Post-Matric Scholarship'." },
      { step: 3, desc: 'Select admitted institute, university PRN number, degree course, and current academic year.' },
      { step: 4, desc: 'Upload caste certificate, caste validity, income certificate, and past year marksheets.' },
      { step: 5, desc: 'Submit application online and forward application acknowledgment to college scholarship nodal officer.' }
    ]
  },

  // 6. Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Shishyavrutti Scheme
  {
    scheme_code: 'SCH-MH-RCSM-EBC',
    name: 'Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Shishyavrutti Scheme',
    description: 'Maharashtra Government premier tuition fee assistance scheme administered by DHE and DTE. Grants 50% to 100% reimbursement of tuition fees and examination fees to meritorious students from General / Open category families with annual income up to ₹8,00,000 enrolled in higher secondary, diploma, engineering, medical, management, or degree programs.',
    category_id: 1, // Education and Scholarships
    state: 'Maharashtra',
    target_audience: 'Economically Backward Class (EBC) students of Maharashtra admitted to higher and technical courses',
    is_active: true,
    official_website: 'https://mahadbt.maharashtra.gov.in',
    benefits: [
      '50% reimbursement of tuition fees and exam fees in government-aided and private unaided professional colleges.',
      '100% fee concession for eligible students in government technical institutes and universities.',
      'Applicable across Engineering, Pharmacy, Architecture, MBA, MCA, MBBS, BDS, B.Sc Nursing, and Law programs.',
      'Direct electronic transfer to college treasury and student bank accounts.'
    ],
    criteria: [
      { type: 'state', value: 'Maharashtra', description: 'Applicant must be a permanent resident and domicile of Maharashtra.' },
      { type: 'occupation', value: 'Student', description: 'Must be admitted through Centralized Admission Process (CAP) in a recognized higher education institute.' },
      { type: 'annual_income', value: '<=800000', description: 'Annual household income must not exceed ₹8,00,000.' },
      { type: 'category', value: 'General, OBC, SC, ST', description: 'Open to General/EBC candidates not availing any other category fee exemption.' },
      { type: 'age', value: '16-35', description: 'Applicant age must be between 16 and 35 years.' }
    ],
    documents: [
      { name: 'Aadhaar Card', mandatory: true },
      { name: 'Maharashtra Domicile Certificate', mandatory: true },
      { name: 'Annual Family Income Certificate issued by Tahsildar (<= ₹8,00,000)', mandatory: true },
      { name: 'CAP Admission Allotment Letter', mandatory: true },
      { name: 'Previous Year Marksheet (Minimum 50% marks in qualifying exam)', mandatory: true },
      { name: 'College Bonafide Certificate & Fee Receipt', mandatory: true },
      { name: 'Ration Card / Family Declaration (Benefit capped at first 2 children)', mandatory: true }
    ],
    steps: [
      { step: 1, desc: 'Login to MahaDBT portal (mahadbt.maharashtra.gov.in) with Aadhaar authentication.' },
      { step: 2, desc: "Select 'Directorate of Higher Education' or 'Directorate of Technical Education'." },
      { step: 3, desc: "Apply for 'Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Shishyavrutti Yojna'." },
      { step: 4, desc: 'Fill in CAP allotment number, institute code, and upload income and domicile certificates.' },
      { step: 5, desc: 'Submit application online for college verification and subsequent state treasury disbursement.' }
    ]
  },

  // 7. Dr. Panjabrao Deshmukh Vasatigruh Nirvah Bhatta Yojna
  {
    scheme_code: 'SCH-MH-PANJABRAO',
    name: 'Dr. Panjabrao Deshmukh Vasatigruh Nirvah Bhatta Yojna',
    description: 'Maharashtra State hostel maintenance allowance scheme for children of registered agricultural labourers and small/marginal landholding farmers pursuing professional degree courses (Engineering, Architecture, Pharmacy, Medicine, Agriculture) who stay in registered government/private hostels or rented rooms away from home.',
    category_id: 1, // Education and Scholarships
    state: 'Maharashtra',
    target_audience: 'Hostel-staying children of small/marginal farmers & registered agricultural labourers in Maharashtra',
    is_active: true,
    official_website: 'https://mahadbt.maharashtra.gov.in',
    benefits: [
      'Financial maintenance allowance of ₹30,000 per academic year (10 months @ ₹3,000/month) for students studying in Mumbai MMRDA, Pune, Nagpur, and Aurangabad municipal corporation zones.',
      'Financial maintenance allowance of ₹20,000 per academic year (10 months @ ₹2,000/month) for students studying in other district headquarters.',
      'Direct Benefit Transfer (DBT) credit directly into the student Aadhaar-linked savings account.',
      'Relieves lodging and food cost burden for rural farming families supporting children in higher professional studies.'
    ],
    criteria: [
      { type: 'state', value: 'Maharashtra', description: 'Applicant must be a permanent domicile of Maharashtra.' },
      { type: 'occupation', value: 'Student', description: 'Must be admitted through CAP into an approved technical or professional degree course.' },
      { type: 'annual_income', value: '<=800000', description: 'Annual family income should not exceed ₹8,00,000 (separate higher allowance for <= ₹1,00,000).' },
      { type: 'age', value: '16-30', description: 'Applicant age must be between 16 and 30 years.' }
    ],
    documents: [
      { name: 'Aadhaar Card', mandatory: true },
      { name: 'Maharashtra Domicile Certificate', mandatory: true },
      { name: 'Small / Marginal Farmer Certificate (Alp-Bhudharak) or Registered Agricultural Labourer Card', mandatory: true },
      { name: 'Annual Family Income Certificate issued by Tahsildar (<= ₹8 Lakhs)', mandatory: true },
      { name: 'Hostel Admission Certificate from Warden or Registered Rent Agreement with Electricity Bill', mandatory: true },
      { name: 'College Bonafide Certificate & CAP Admission Confirmation Slip', mandatory: true }
    ],
    steps: [
      { step: 1, desc: 'Log into MahaDBT portal (mahadbt.maharashtra.gov.in).' },
      { step: 2, desc: "Navigate to 'Directorate of Technical Education' -> 'Dr. Panjabrao Deshmukh Vasatigruh Nirvah Bhatta Yojna'." },
      { step: 3, desc: 'Provide CAP allotment details and current residential hostel/rental address proof.' },
      { step: 4, desc: 'Upload parent Alp-Bhudharak / Labour card and Tahsildar income certificate.' },
      { step: 5, desc: 'Submit application and get verified by College Clerk for prompt DBT remittance.' }
    ]
  },

  // 8. State Government Open Merit Scholarship (Maharashtra)
  {
    scheme_code: 'SCH-MH-OPEN-MERIT',
    name: 'State Government Open Merit Scholarship (Maharashtra)',
    description: 'State Government merit scholarship administered by the Maharashtra Directorate of Higher Education (DHE). Awarded to meritorious students who have secured a minimum of 60% marks in the 10th (SSC) or 12th (HSC) board examination and are enrolled in regular undergraduate degree courses in recognized colleges across Maharashtra.',
    category_id: 1, // Education and Scholarships
    state: 'Maharashtra',
    target_audience: 'Meritorious students admitted to Arts, Commerce, Science, and Law in Maharashtra junior/senior colleges',
    is_active: true,
    official_website: 'https://mahadbt.maharashtra.gov.in',
    benefits: [
      'Direct merit stipend credited annually to cover textbooks, study materials, and examination expenses.',
      'Official merit recognition certificate issued by Government of Maharashtra Directorate of Higher Education.',
      'Renewal support through all consecutive years of undergraduate degree subject to passing with first class.',
      'Non-restrictive merit scholarship open to all social backgrounds fulfilling mark cut-offs.'
    ],
    criteria: [
      { type: 'state', value: 'Maharashtra', description: 'Applicant must be a domicile resident of Maharashtra.' },
      { type: 'occupation', value: 'Student', description: 'Must be enrolled in Arts, Commerce, Science, or Law degree programs in a recognized college.' },
      { type: 'age', value: '15-25', description: 'Applicant age must be between 15 and 25 years.' },
      { type: 'annual_income', value: '<=800000', description: 'Annual household income should generally be within ₹8,00,000.' }
    ],
    documents: [
      { name: 'Aadhaar Card', mandatory: true },
      { name: 'Maharashtra Domicile Certificate', mandatory: true },
      { name: 'SSC (10th) / HSC (12th) Marksheet demonstrating at least 60% aggregate marks', mandatory: true },
      { name: 'College Bonafide Certificate & Student Identity Card', mandatory: true },
      { name: 'Aadhaar-seeded Bank Passbook', mandatory: true }
    ],
    steps: [
      { step: 1, desc: 'Visit MahaDBT portal (mahadbt.maharashtra.gov.in).' },
      { step: 2, desc: "Select 'Directorate of Higher Education (DHE)' -> 'State Government Open Merit Scholarship'." },
      { step: 3, desc: 'Fill in 10th/12th board roll number, passing year, and secured marks percentage.' },
      { step: 4, desc: 'Upload marksheet and bonafide college admission receipt.' },
      { step: 5, desc: 'Submit before the annual academic deadline for college verification.' }
    ]
  },

  // 9. Mukhyamantri Majhi Ladki Bahin Yojana
  {
    scheme_code: 'SCH-MH-LADKI-BAHIN',
    name: 'Mukhyamantri Majhi Ladki Bahin Yojana',
    description: 'Landmark welfare initiative by the Government of Maharashtra launched in 2024 to foster economic self-reliance, nutritional security, and dignity among women. Provides unconditional monthly direct benefit transfers (DBT) of ₹1,500 directly into the Aadhaar-enabled bank accounts of married, widowed, divorced, deserted, and destitute women.',
    category_id: 5, // Women and Women Empowerment
    state: 'Maharashtra',
    target_audience: 'Women residents of Maharashtra aged 21 to 65 years with family income up to ₹2.5 Lakhs',
    is_active: true,
    official_website: 'https://ladkibahin.maharashtra.gov.in',
    benefits: [
      'Guaranteed direct benefit transfer of ₹1,500 per month (₹18,000 annually) directly into the woman bank account.',
      'Aadhaar-linked payment mechanism ensuring transparent, intermediate-free credit.',
      'Enables financial autonomy for healthcare, children nutrition, and household micro-savings.',
      'Covers married, widowed, divorced, deserted, and unmarried destitute women aged 21-65.'
    ],
    criteria: [
      { type: 'state', value: 'Maharashtra', description: 'Applicant must be a permanent resident of Maharashtra.' },
      { type: 'gender', value: 'Female, Women', description: 'Scheme is exclusively reserved for women beneficiaries.' },
      { type: 'age', value: '21-65', description: 'Applicant woman must be between 21 and 65 years of age.' },
      { type: 'annual_income', value: '<=250000', description: 'Annual household income must not exceed ₹2,50,000 (exempted if holding Yellow/Orange Ration Card).' }
    ],
    documents: [
      { name: 'Aadhaar Card', mandatory: true },
      { name: 'Maharashtra Domicile Certificate (or Ration Card / Voter ID / 15-year School Leaving Certificate)', mandatory: true },
      { name: 'Yellow or Orange Ration Card (or Tahsildar Income Certificate <= ₹2.5 Lakhs)', mandatory: true },
      { name: 'Aadhaar-seeded Bank Account Passbook with active DBT status', mandatory: true },
      { name: 'Hamipatra (Prescribed Self-Declaration Form)', mandatory: true }
    ],
    steps: [
      { step: 1, desc: "Visit official portal (ladkibahin.maharashtra.gov.in) or mobile app 'Nari Shakti Doot'." },
      { step: 2, desc: 'Create user profile with mobile OTP and Aadhaar authentication.' },
      { step: 3, desc: 'Fill in marital status, residential address in Maharashtra, and bank details.' },
      { step: 4, desc: 'Upload photograph, Aadhaar card, ration card/income proof, and signed Hamipatra.' },
      { step: 5, desc: 'Submit application to receive confirmation SMS and tracking application ID.' }
    ]
  },

  // 10. Maharashtra Mahila Kisan Sashaktikaran Initiative
  {
    scheme_code: 'SCH-MH-MKSP-WOMEN',
    name: 'Maharashtra Mahila Kisan Sashaktikaran Initiative',
    description: 'Flagship women-farmer empowerment program implemented jointly by Maharashtra State Rural Livelihoods Mission (UMED) and the Maharashtra Department of Agriculture. Empowers rural women farmers by building sustainable agro-ecological practices, organic farming clusters, custom hiring tool banks, and direct market linkage.',
    category_id: 5, // Women and Women Empowerment
    state: 'Maharashtra',
    target_audience: 'Women farmers, female smallholders, and Women Self-Help Groups (SHGs) in Maharashtra',
    is_active: true,
    official_website: 'https://krishi.maharashtra.gov.in',
    benefits: [
      'Financial grant support up to ₹15,000 for setting up organic kitchen gardens, vermicompost beds, and bio-fertilizer units.',
      'Priority allocation of subsidized farm machinery and tools through Village Custom Hiring Centers.',
      'Free distribution of high-yield certified seed kits for millets, pulses, and indigenous crops.',
      'Stipend for undergoing certified Agro-Ecological and Organic Farming Master Trainer programs.',
      'Collective marketing and branding support through Farmer Producer Companies (FPCs).'
    ],
    criteria: [
      { type: 'state', value: 'Maharashtra', description: 'Applicant must reside in rural Maharashtra.' },
      { type: 'gender', value: 'Female, Women', description: 'Reserved exclusively for women farmers and female agricultural workers.' },
      { type: 'occupation', value: 'Farmer, Agricultural Worker', description: 'Applicant must be an active female cultivator, tenant farmer, or agricultural labourer.' },
      { type: 'age', value: '18-60', description: 'Applicant age must be between 18 and 60 years.' },
      { type: 'annual_income', value: '<=300000', description: 'Targeted at low-income farming households with annual family income up to ₹3,00,000.' }
    ],
    documents: [
      { name: 'Aadhaar Card', mandatory: true },
      { name: '7/12 Land Records (in woman or family name) or Village Gram Panchayat Land Cultivation Certificate', mandatory: true },
      { name: 'Women Self-Help Group (SHG) Membership Certificate / Umed Registration ID', mandatory: true },
      { name: 'Aadhaar-linked Bank Passbook', mandatory: true }
    ],
    steps: [
      { step: 1, desc: 'Contact local Gram Panchayat Krishi Sahayak or UMED Village Organization (VO).' },
      { step: 2, desc: 'Register under the Mahila Kisan Krishi Sakhi database.' },
      { step: 3, desc: 'Submit group application or individual farmer profile with SHG credentials.' },
      { step: 4, desc: 'Undergo training at Taluka Agriculture Office or Krishi Vigyan Kendra (KVK).' },
      { step: 5, desc: 'Receive input subsidy, seed kits, and tool bank access via Direct Benefit Transfer.' }
    ]
  }
];

async function seed() {
  console.log('--- STARTING SCHEME EXPANSION SEEDER ---');
  
  try {
    // 1. Update / Ensure Categories
    console.log('1. Ensuring Categories in scheme_categories...');
    await db.query("UPDATE scheme_categories SET name = 'Education and Scholarships' WHERE id = 1");
    await db.query("UPDATE scheme_categories SET name = 'Women and Women Empowerment' WHERE id = 5");
    await db.query("UPDATE scheme_categories SET name = 'Farmers and Agriculture' WHERE id = 6");
    await db.query("UPDATE scheme_categories SET name = 'Pension and Insurance' WHERE id = 7");
    
    // Check if category 8 exists
    const cat8Check = await db.query('SELECT id FROM scheme_categories WHERE id = 8');
    if (cat8Check.rows.length === 0) {
      await db.query(`
        INSERT INTO scheme_categories (id, name, description) 
        VALUES (8, 'Maharashtra State Schemes', 'Flagship state welfare and socio-economic support initiatives for Maharashtra residents.')
      `);
    } else {
      await db.query(`
        UPDATE scheme_categories 
        SET name = 'Maharashtra State Schemes', description = 'Flagship state welfare and socio-economic support initiatives for Maharashtra residents.'
        WHERE id = 8
      `);
    }

    // 2. Iterate through expanded schemes
    console.log(`2. Processing ${expandedSchemes.length} Target Schemes...`);
    
    for (const schemeData of expandedSchemes) {
      const {
        scheme_code,
        name,
        description,
        category_id,
        state,
        target_audience,
        is_active,
        official_website,
        benefits,
        criteria,
        documents,
        steps
      } = schemeData;

      // Upsert scheme in schemes table
      const existingRes = await db.query('SELECT id FROM schemes WHERE scheme_code = $1', [scheme_code]);
      let schemeId;

      if (existingRes.rows.length > 0) {
        schemeId = existingRes.rows[0].id;
        console.log(`Updating existing scheme [${scheme_code}] (ID: ${schemeId}): ${name}`);
        await db.query(`
          UPDATE schemes SET 
            name = $1, 
            description = $2, 
            category_id = $3, 
            state = $4, 
            target_audience = $5, 
            is_active = $6, 
            official_website = $7,
            updated_at = NOW()
          WHERE id = $8
        `, [name, description, category_id, state, target_audience, is_active, official_website, schemeId]);
      } else {
        console.log(`Inserting new scheme [${scheme_code}]: ${name}`);
        const insertRes = await db.query(`
          INSERT INTO schemes (
            scheme_code, name, description, category_id, state, 
            target_audience, is_active, official_website, provider_id, 
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1, NOW(), NOW())
          RETURNING id;
        `, [scheme_code, name, description, category_id, state, target_audience, is_active, official_website]);
        schemeId = insertRes.rows[0].id;
      }

      // Refresh child tables for this scheme
      await db.query('DELETE FROM scheme_benefits WHERE scheme_id = $1', [schemeId]);
      await db.query('DELETE FROM scheme_eligibility_criteria WHERE scheme_id = $1', [schemeId]);
      await db.query('DELETE FROM scheme_documents WHERE scheme_id = $1', [schemeId]);
      await db.query('DELETE FROM scheme_application_steps WHERE scheme_id = $1', [schemeId]);

      // Insert Benefits
      for (const benefit of benefits) {
        await db.query(
          'INSERT INTO scheme_benefits (scheme_id, benefit) VALUES ($1, $2)',
          [schemeId, benefit]
        );
      }

      // Insert Eligibility Criteria
      for (const crit of criteria) {
        await db.query(
          'INSERT INTO scheme_eligibility_criteria (scheme_id, criteria_type, criteria_value, criteria_description) VALUES ($1, $2, $3, $4)',
          [schemeId, crit.type, crit.value, crit.description]
        );
      }

      // Insert Documents
      for (const doc of documents) {
        await db.query(
          'INSERT INTO scheme_documents (scheme_id, document_name, is_mandatory) VALUES ($1, $2, $3)',
          [schemeId, doc.name, doc.mandatory]
        );
      }

      // Insert Application Steps
      for (const st of steps) {
        await db.query(
          'INSERT INTO scheme_application_steps (scheme_id, step_number, step_description) VALUES ($1, $2, $3)',
          [schemeId, st.step, st.desc]
        );
      }
    }

    console.log('--- ALL SCHEMES SUCCESSFULLY SEEDED & SYNCHRONIZED ---');
    
    // Verify total scheme count and states
    const countRes = await db.query(`
      SELECT 
        COUNT(*) as total_schemes,
        COUNT(*) FILTER (WHERE state = 'Maharashtra') as maharashtra_schemes,
        COUNT(*) FILTER (WHERE state IS NULL) as central_schemes
      FROM schemes WHERE is_active = TRUE;
    `);
    console.log('Current Active Schemes Summary:', countRes.rows[0]);

    process.exit(0);
  } catch (err) {
    console.error('Error during seeding:', err);
    process.exit(1);
  }
}

seed();
