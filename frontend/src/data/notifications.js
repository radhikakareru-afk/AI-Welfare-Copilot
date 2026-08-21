export const MOCK_NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "Welcome to AI Welfare Copilot!",
    message: "Complete your profile to automatically check eligibility for over 100+ state and central welfare schemes.",
    is_read: false,
    category: "System",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "notif-2",
    title: "Maharashtra loan waiver deadline approaching",
    message: "Shetkari Karjmukti Yojna applications close soon. Ensure your crop loan account is Aadhaar-linked.",
    is_read: false,
    category: "Deadlines",
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    deadline_scheme_id: "f401d892-0b1a-4712-a1f9-90656a8dff3e"
  },
  {
    id: "notif-3",
    title: "Ayushman Bharat verification active",
    message: "Empaneled hospitals are now conducting free biometric validation using only your Aadhaar and Ration cards.",
    is_read: true,
    category: "Scheme Updates",
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  }
];
