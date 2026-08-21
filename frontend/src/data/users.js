export const DEFAULT_CITIZEN_PROFILE = {
  full_name: "Rajesh Kumar",
  email: "citizen@welfare.gov.in",
  age: 32,
  date_of_birth: "1994-08-15",
  gender: "male",
  annual_income: 120000,
  state: "Maharashtra",
  district: "Pune",
  occupation: "Farmer",
  category: "OBC",
  education: "Secondary Education",
  is_disabled: false,
  disability_percentage: 0
};

export const MOCK_USERS_LIST = [
  { name: "Rajesh Kumar", email: "citizen@welfare.gov.in", state: "Maharashtra", date: "2026-05-12", status: "Active" },
  { name: "Amina Begum", email: "amina@example.com", state: "Karnataka", date: "2026-06-18", status: "Active" },
  { name: "Sukhwinder Singh", email: "sukhwinder@example.com", state: "Punjab", date: "2026-07-02", status: "Inactive" },
  { name: "Priya Sharma", email: "priya@example.com", state: "Uttar Pradesh", date: "2026-07-22", status: "Active" },
  { name: "Amit Patel", email: "amit.patel@example.com", state: "Gujarat", date: "2026-08-01", status: "Active" }
];

export const STATES_LIST = [
  "Maharashtra",
  "Karnataka",
  "Gujarat",
  "Uttar Pradesh",
  "Bihar",
  "Delhi",
  "Kerala",
  "Punjab",
  "Tamil Nadu",
  "Rajasthan"
];

export const OCCUPATIONS_LIST = [
  "Farmer",
  "Agricultural Worker",
  "Labourer",
  "Maid",
  "Street Vendor",
  "Rickshaw Puller",
  "Construction Worker",
  "Student",
  "Unemployed",
  "Driver",
  "Artisan"
];

export const CATEGORIES_LIST = [
  "General",
  "OBC",
  "SC",
  "ST"
];

export const EDUCATIONS_LIST = [
  "No Formal Education",
  "Primary Education",
  "Secondary Education",
  "Higher Secondary",
  "Diploma",
  "Undergraduate",
  "Postgraduate",
  "Ph.D"
];
