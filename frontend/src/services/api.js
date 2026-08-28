const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || `Request failed with status ${response.status}`);
  }

  return result;
}

export const api = {
  // Test Database Connection
  testDb: () => request('/api/test-db'),

  // Schemes
  getSchemes: () => request('/api/schemes'),
  getScheme: (id) => request(`/api/schemes/${id}`),
  getCategories: () => request('/api/categories'),

  // Auth & Profile
  login: (email, password) => request('/api/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  register: (email, password, full_name, state, district) => request('/api/users', {
    method: 'POST',
    body: JSON.stringify({ email, password, full_name, state, district }),
  }),
  getUser: (id) => request(`/api/users/${id}`),
  getProfile: (userId) => request(`/api/users/${userId}/profile`),
  saveProfile: (userId, profileData) => request(`/api/users/${userId}/profile`, {
    method: 'PUT',
    body: JSON.stringify(profileData),
  }),

  // Admin Operations
  getAdminUsers: (adminId) => request('/api/admin/users', {
    headers: { 'x-user-id': String(adminId) }
  }),
  updateUserStatus: (adminId, userId, isActive) => request(`/api/admin/users/${userId}/status`, {
    method: 'PUT',
    headers: { 'x-user-id': String(adminId) },
    body: JSON.stringify({ is_active: isActive }),
  }),

  // Favorites
  getFavorites: (userId) => request(`/api/users/${userId}/favorites`),
  addFavorite: (userId, schemeId) => request('/api/favorites', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, scheme_id: schemeId }),
  }),
  removeFavorite: (userId, schemeId) => request(`/api/users/${userId}/schemes/${schemeId}`, {
    method: 'DELETE',
  }),

  // Recently Viewed
  getRecentlyViewed: (userId) => request(`/api/users/${userId}/recently-viewed`),
  addRecentlyViewed: (userId, schemeId) => request('/api/recently-viewed', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, scheme_id: schemeId }),
  }),

  // Eligibility
  checkEligibility: (userId) => request('/api/eligibility/check', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  }),
  getEligibilityCheck: (checkId) => request(`/api/eligibility/${checkId}`),

  // Notifications
  getNotifications: (userId) => request(`/api/users/${userId}/notifications`),
  markNotificationAsRead: (id) => request(`/api/notifications/${id}/read`, {
    method: 'PUT',
  }),
  markAllNotificationsAsRead: (userId) => request(`/api/users/${userId}/notifications/read-all`, {
    method: 'PUT',
  }),

  // Comparisons
  createComparison: (userId) => request('/api/comparisons', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  }),
  addComparisonItem: (comparisonId, schemeId) => request(`/api/comparisons/${comparisonId}/items`, {
    method: 'POST',
    body: JSON.stringify({ scheme_id: schemeId }),
  }),
  getComparison: (comparisonId) => request(`/api/comparisons/${comparisonId}`),
  removeComparisonItem: (comparisonId, schemeId) => request(`/api/comparisons/${comparisonId}/items/${schemeId}`, {
    method: 'DELETE',
  }),
};
export default api;
