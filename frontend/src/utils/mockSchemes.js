export const mockSchemes = [
  {
    id: "7a35e892-0b1a-4712-a1f9-90656a8dfa1c",
    official_id: "SCH-PM-KISAN",
    name: "PM-Kisan Samman Nidhi",
    tagline: "Direct income support for Indian landholding farmers.",
    category: "Agriculture",
    department: "Ministry of Agriculture and Farmers Welfare",
    portal_url: "https://pmkisan.gov.in",
    application_deadline: "2026-12-31T23:59:59Z",
    benefits: "Direct income support of ₹6,000 per year in three equal installments of ₹2,000 directly into the bank accounts of farming families.",
    description: "Pradhan Mantri Kisan Samman Nidhi is a central sector scheme that provides financial assistance to all landholding farmer families across the country to help them procure agricultural inputs and manage domestic needs.",
    rules: {
      age_min: 18,
      age_max: null,
      income_max: 300000,
      states_allowed: [],  // Empty means all states
      districts_allowed: [],
      genders_allowed: ["male", "female", "transgender", "other"],
      occupations_allowed: ["Farmer", "Cultivator", "Agricultural Worker"],
      categories_allowed: ["General", "OBC", "SC", "ST"],
      educations_allowed: [], // Empty means all education levels
      requires_disability: false,
      min_disability_percentage: 0
    },
    documents: [
      { document_name: "Aadhaar Card", description: "Mandatory identity proof linked with mobile number.", is_mandatory: true },
      { document_name: "Land Registry Records", description: "Documents showing ownership of agricultural land (Khatauni/Patta).", is_mandatory: true },
      { document_name: "Savings Bank Account details", description: "Passbook copy showing IFSC code for direct benefit transfer.", is_mandatory: true }
    ],
    steps: [
      { step_number: 1, title: "Access PM-Kisan Portal", description: "Visit the official PM-Kisan portal at https://pmkisan.gov.in." },
      { step_number: 2, title: "Register in Farmer Corner", description: "Navigate to the 'Farmers Corner' section and click on 'New Farmer Registration'." },
      { step_number: 3, title: "Enter Aadhaar & State", description: "Enter your Aadhaar number, choose your state, fill out the captcha, and click search." },
      { step_number: 4, title: "Fill Details & Upload Docs", description: "Fill in personal, bank, and land details. Upload digital scans of your land registry copy and bank passbook." },
      { step_number: 5, title: "Submit and Track", description: "Submit the registration. Save your reference ID to track registration status with your local block officer." }
    ]
  },
  {
    id: "60bc9d1a-43d9-4f76-8051-f2549a1adccb",
    official_id: "SCH-PM-SYM",
    name: "PM Shram Yogi Maan-dhan (PM-SYM)",
    tagline: "Assured monthly pension scheme for unorganized workers.",
    category: "Pension & Insurance",
    department: "Ministry of Labour and Employment",
    portal_url: "https://maandhan.in",
    application_deadline: null,
    benefits: "Guaranteed minimum monthly pension of ₹3,000 after attaining the age of 60 years. In case of death, 50% family pension to the spouse.",
    description: "A voluntary and contributory pension scheme for unorganized workers (like street vendors, rickshaw pullers, maids, ragpickers, construction workers, etc.) to ensure social security in old age.",
    rules: {
      age_min: 18,
      age_max: 40,
      income_max: 180000, // Rs. 15,000 per month
      states_allowed: [],
      districts_allowed: [],
      genders_allowed: ["male", "female", "transgender", "other"],
      occupations_allowed: ["Labourer", "Maid", "Street Vendor", "Rickshaw Puller", "Construction Worker", "Ragpicker", "Agriculture Labourer", "Driver"],
      categories_allowed: ["General", "OBC", "SC", "ST"],
      educations_allowed: [],
      requires_disability: false,
      min_disability_percentage: 0
    },
    documents: [
      { document_name: "Aadhaar Card", description: "Required for identity and biometric authentication.", is_mandatory: true },
      { document_name: "Savings Bank Account / Jan Dhan Account", description: "For auto-debit of monthly contributions.", is_mandatory: true },
      { document_name: "Mobile Number", description: "Active mobile connection for OTP verification and registration alerts.", is_mandatory: true }
    ],
    steps: [
      { step_number: 1, title: "Locate CSC", description: "Find the nearest Common Services Centre (CSC) or visit https://maandhan.in." },
      { step_number: 2, title: "Submit Documents", description: "Provide your Aadhaar Card, Bank account details, and mobile number to the CSC operator." },
      { step_number: 3, title: "Calculate Contribution", description: "The operator will calculate your monthly contribution (ranging from ₹55 to ₹200 based on entry age)." },
      { step_number: 4, title: "Biometric Authentication", description: "Perform biometric thumb-scanning verification to authenticate the registration." },
      { step_number: 5, title: "Receive Pension Card", description: "The system generates a unique Shram Yogi Pension Account Number (SPAN) and prints your Shram Yogi Card." }
    ]
  },
  {
    id: "30ac8f5d-7a6c-489e-9d2a-438910b8cf8d",
    official_id: "SCH-PMSC-POST",
    name: "Post-Matric Scholarship for SC/ST Students",
    tagline: "Financial assistance for students pursuing higher education.",
    category: "Education",
    department: "Ministry of Social Justice and Empowerment",
    portal_url: "https://scholarships.gov.in",
    application_deadline: "2026-10-31T23:59:59Z",
    benefits: "Full reimbursement of compulsory non-refundable fees (tuition fees) and an academic allowance up to ₹13,500 per year paid to the student.",
    description: "A flagship central scheme that offers financial support to scheduled caste (SC) and scheduled tribe (ST) students to reduce drop-out rates at post-matriculation (grade 11 and above) levels.",
    rules: {
      age_min: 15,
      age_max: 30,
      income_max: 250000,
      states_allowed: [],
      districts_allowed: [],
      genders_allowed: ["male", "female", "transgender", "other"],
      occupations_allowed: ["Student"],
      categories_allowed: ["SC", "ST"],
      educations_allowed: ["Secondary Education", "Higher Secondary", "Diploma", "Undergraduate", "Postgraduate"],
      requires_disability: false,
      min_disability_percentage: 0
    },
    documents: [
      { document_name: "Caste Certificate", description: "Official caste certificate proving SC/ST status issued by competent authority.", is_mandatory: true },
      { document_name: "Income Certificate", description: "Annual family income certificate showing income under ₹2.5 Lakhs.", is_mandatory: true },
      { document_name: "Mark sheet of Last Qualifying Exam", description: "Class 10th / 12th or semester transcript.", is_mandatory: true },
      { document_name: "Fee Receipt", description: "Receipt showing admission fee paid to current college/institution.", is_mandatory: true }
    ],
    steps: [
      { step_number: 1, title: "Register on National Scholarship Portal", description: "Visit NSP at https://scholarships.gov.in and complete one-time registration." },
      { step_number: 2, title: "Fill Application Form", description: "Log in with credentials and fill in academic details, institutional details, and caste category." },
      { step_number: 3, title: "Upload Documents", description: "Upload scanned copies of Caste Certificate, Income Certificate, Fee receipt, and previous marksheets." },
      { step_number: 4, title: "Institute Verification", description: "Submit details. Your college nodal officer will verify the application details digitally." },
      { step_number: 5, title: "Disbursal", description: "Once validated by District/State officers, funds are directly disbursed to your bank account." }
    ]
  },
  {
    id: "ab00123d-222a-44ab-9999-90cbc12a34bc",
    official_id: "SCH-AB-PMJAY",
    name: "Ayushman Bharat - PM Jan Arogya Yojana",
    tagline: "Cashless health cover for vulnerable families.",
    category: "Health & Medical",
    department: "National Health Authority",
    portal_url: "https://pmjay.gov.in",
    application_deadline: null,
    benefits: "Free cashless healthcare cover up to ₹5,00,000 per family per year for secondary and tertiary care hospitalization in any empaneled hospital.",
    description: "Ayushman Bharat PM-JAY is the largest health assurance scheme in the world, designed to cover diagnostic procedures, medical treatments, surgeries, and medicines for the bottom 40% vulnerable population of India.",
    rules: {
      age_min: null,
      age_max: null,
      income_max: 250000,
      states_allowed: [],
      districts_allowed: [],
      genders_allowed: ["male", "female", "transgender", "other"],
      occupations_allowed: ["Labourer", "Domestic Worker", "Sanitation Worker", "Ragpicker", "Rickshaw Puller", "Maid", "Unemployed", "Farmer"],
      categories_allowed: ["General", "OBC", "SC", "ST"],
      educations_allowed: [],
      requires_disability: false,
      min_disability_percentage: 0
    },
    documents: [
      { document_name: "Aadhaar Card / Ration Card", description: "Required to verify family mapping and identity.", is_mandatory: true },
      { document_name: "PMJAY Letter / HHD Number", description: "Official household ID letter from census survey or socio-economic database.", is_mandatory: false }
    ],
    steps: [
      { step_number: 1, title: "Check Eligibility Status", description: "Visit the website 'mera.pmjay.gov.in' or check eligibility using your mobile number." },
      { step_number: 2, title: "Locate Empaneled Hospital", description: "Locate any government hospital or registered private hospital in your district." },
      { step_number: 3, title: "Meet Ayushman Mitra", description: "Go to the hospital's 'Ayushman Help Desk' and meet the Ayushman Mitra coordinator." },
      { step_number: 4, title: "Provide Aadhaar/Ration Card", description: "Provide your ID cards for verification. The coordinator will perform biometric authentication." },
      { step_number: 5, title: "Get Cashless Treatment", description: "The hospital provides immediate cashless care, billing the scheme directly via the government portal." }
    ]
  },
  {
    id: "991a8f8c-23dd-4512-bcde-512bcda00129",
    official_id: "SCH-PMAY-G",
    name: "Pradhan Mantri Awas Yojana (Gramin)",
    tagline: "Financial subsidy to construct pucca houses.",
    category: "Housing",
    department: "Ministry of Rural Development",
    portal_url: "https://pmayg.nic.in",
    application_deadline: null,
    benefits: "Financial assistance of ₹1,20,000 in plains and ₹1,30,000 in hilly/difficult areas for house construction.",
    description: "PMAY-G aims to provide a clean, secure pucca house with basic amenities to all homeless householders and families living in dilapidated houses in rural parts of India.",
    rules: {
      age_min: 18,
      age_max: null,
      income_max: 300000,
      states_allowed: [],
      districts_allowed: [],
      genders_allowed: ["male", "female", "transgender", "other"],
      occupations_allowed: ["Labourer", "Farmer", "Unemployed", "Artisan"],
      categories_allowed: ["General", "OBC", "SC", "ST"],
      educations_allowed: [],
      requires_disability: false,
      min_disability_percentage: 0
    },
    documents: [
      { document_name: "Aadhaar Card", description: "Mandatory Aadhaar card copy.", is_mandatory: true },
      { document_name: "Ration Card", description: "Proof of family membership and financial classification.", is_mandatory: true },
      { document_name: "Job Card Number", description: "MGNREGA job card number for synchronization of manual labor component.", is_mandatory: false },
      { document_name: "Bank Account Details", description: "Passbook copy for direct installment transfers.", is_mandatory: true }
    ],
    steps: [
      { step_number: 1, title: "Gram Sabha Identification", description: "Beneficiary list is auto-prepared using SECC-2011 housing deprivation data and verified by Gram Sabha." },
      { step_number: 2, title: "Registration by Gram Panchayat", description: "GP officials register the beneficiary on the AwaasSoft portal." },
      { step_number: 3, title: "Bank and Aadhaar Linkage", description: "Upload bank account details and consent forms." },
      { step_number: 4, title: "Site Inspection", description: "Local inspector takes geo-tagged photos of the old mud house site." },
      { step_number: 5, title: "Release of Installments", description: "Sanction letter is generated and financial installments are disbursed in phases (foundation, lintel, completion)." }
    ]
  },
  {
    id: "f401d892-0b1a-4712-a1f9-90656a8dff3e",
    official_id: "SCH-MH-JYOTI",
    name: "Shetkari Karjmukti Yojna (Maharashtra)",
    tagline: "State-specific loan waiver for debt-stressed farmers.",
    category: "Agriculture",
    department: "Department of Agriculture, Maharashtra",
    portal_url: "https://mjpsky.maharashtra.gov.in",
    application_deadline: "2026-11-15T23:59:59Z",
    benefits: "Crop loan waiver up to ₹2,00,000 for outstanding crop loans taken by stress-affected farming families.",
    description: "Mahatma Jotirao Phule Shetkari Karjmukti Yojna is a state government initiative in Maharashtra providing critical debt relief to distressed farmers having crop loans with public sector, rural cooperative, or private banks.",
    rules: {
      age_min: 18,
      age_max: null,
      income_max: 400000,
      states_allowed: ["Maharashtra"], // Specific state constraint
      districts_allowed: [],
      genders_allowed: ["male", "female", "transgender", "other"],
      occupations_allowed: ["Farmer"],
      categories_allowed: ["General", "OBC", "SC", "ST"],
      educations_allowed: [],
      requires_disability: false,
      min_disability_percentage: 0
    },
    documents: [
      { document_name: "Aadhaar Card", description: "Must be linked to the crop loan account.", is_mandatory: true },
      { document_name: "Crop Loan Account Passbook", description: "Details of bank loan account showing outstanding balance.", is_mandatory: true },
      { document_name: "7/12 Land Utara Extraction", description: "Official land record showing ownership mapping in Maharashtra.", is_mandatory: true }
    ],
    steps: [
      { step_number: 1, title: "Bank Pre-list Submission", description: "Banks submit details of outstanding loan accounts directly to the state portal." },
      { step_number: 2, title: "Aadhaar Authentication", description: "Visit the local CSC center, search with loan account ID, and authenticate using fingerprint biometrics." },
      { step_number: 3, title: "Confirm List", description: "Verify that the loan amount appearing on the screen is accurate and confirm it." },
      { step_number: 4, title: "Grievance Filing (If any)", description: "If there's a mismatch in the loan waiver amount, file an appeal through the portal." },
      { step_number: 5, title: "Amount Credit", description: "State government credits the waiver amount directly to the farmer's loan account, clearing the balance." }
    ]
  },
  {
    id: "ee321a8d-2b99-4cda-bf90-30230230daef",
    official_id: "SCH-NFPWD",
    name: "National Fellowship for Persons with Disabilities",
    tagline: "Fellowship support for disabled scholars.",
    category: "Education",
    department: "Ministry of Social Justice and Empowerment",
    portal_url: "https://ugc.ac.in",
    application_deadline: "2026-09-30T23:59:59Z",
    benefits: "Fellowship of ₹37,000 per month for JRF and ₹42,000 per month for SRF, plus contingency allowances for post-graduate students pursuing Ph.D/M.Phil.",
    description: "The fellowship is awarded to students with disabilities to enable them to pursue higher research leading to degrees such as M.Phil and Ph.D in Universities and Colleges recognized by UGC.",
    rules: {
      age_min: 21,
      age_max: 45,
      income_max: 600000,
      states_allowed: [],
      districts_allowed: [],
      genders_allowed: ["male", "female", "transgender", "other"],
      occupations_allowed: ["Student"],
      categories_allowed: ["General", "OBC", "SC", "ST"],
      educations_allowed: ["Postgraduate", "M.Phil", "Ph.D"],
      requires_disability: true,
      min_disability_percentage: 40
    },
    documents: [
      { document_name: "Disability Certificate", description: "Medical certificate proving disability of 40% or more.", is_mandatory: true },
      { document_name: "Postgraduate Degree Marksheet", description: "Marksheet of PG degree with at least 55% marks.", is_mandatory: true },
      { document_name: "Admission Proof", description: "Proof of admission into M.Phil/Ph.D research course.", is_mandatory: true }
    ],
    steps: [
      { step_number: 1, title: "Apply Online via Portal", description: "Apply online at UGC's dedicated fellowship portal." },
      { step_number: 2, title: "Upload Certificates", description: "Upload research proposal, university admission letter, PG marksheet, and Disability Certificate." },
      { step_number: 3, title: "Screening Committee Selection", description: "UGC committee reviews all applications and publishes a merit list of selected fellows." },
      { step_number: 4, title: "Verification of Credentials", description: "Selected candidates verify physical documents at the designated university." }
    ]
  }
];
