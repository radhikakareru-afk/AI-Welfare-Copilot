export const MOCK_ANALYTICS = {
  usersByState: [
    { state: "Maharashtra", count: 4200 },
    { state: "Uttar Pradesh", count: 3100 },
    { state: "Karnataka", count: 2400 },
    { state: "Gujarat", count: 1800 },
    { state: "Bihar", count: 1500 },
    { state: "Delhi", count: 1240 }
  ],
  popularCategories: [
    { name: "Agriculture", percentage: 35 },
    { name: "Education", percentage: 25 },
    { name: "Pension & Insurance", percentage: 20 },
    { name: "Health & Medical", percentage: 12 },
    { name: "Housing", percentage: 8 }
  ],
  mostViewedSchemes: [
    { name: "PM-Kisan Samman Nidhi", views: 4230 },
    { name: "Ayushman Bharat PMJAY", views: 3820 },
    { name: "Post-Matric SC/ST Scholarship", views: 2410 }
  ],
  mostFavoritedSchemes: [
    { name: "PM-Kisan Samman Nidhi", count: 1820 },
    { name: "Ayushman Bharat PMJAY", count: 1540 },
    { name: "PM Shram Yogi Maan-dhan", count: 980 }
  ],
  userGrowth: [
    { month: "Mar", count: 8500 },
    { month: "Apr", count: 10200 },
    { month: "May", count: 11800 },
    { month: "Jun", count: 13200 },
    { month: "Jul", count: 14500 },
    { month: "Aug", count: 15240 }
  ],
  syncLogs: [
    {
      id: "sync-102",
      provider: "MyScheme Central API",
      status: "success",
      added: 2,
      updated: 12,
      failed: 0,
      duration: "7.2s",
      started_at: "2026-08-16T05:45:00Z",
      completed_at: "2026-08-16T05:45:08Z",
      details: "Parsed 142 total schemes. 2 new schemes added (NFPwD, Mah Shetkari). 12 deadline strings updated."
    },
    {
      id: "sync-101",
      provider: "Maharashtra State Portal",
      status: "success",
      added: 0,
      updated: 5,
      failed: 0,
      duration: "2.1s",
      started_at: "2026-08-16T03:30:00Z",
      completed_at: "2026-08-16T03:30:02Z",
      details: "State scheme mappings refreshed. Synced deadlines with Maharashtra GR directives."
    },
    {
      id: "sync-100",
      provider: "National Scholarship Gateway",
      status: "failed",
      added: 0,
      updated: 0,
      failed: 14,
      duration: "15s",
      started_at: "2026-08-16T01:00:00Z",
      completed_at: "2026-08-16T01:00:15Z",
      error: "Error response code 503 Service Unavailable from scholarship.gov.in/api/v1/schemes.",
      details: "Sync pipeline terminated due to provider gateway timeout. Rescheduled execution active."
    }
  ]
};
