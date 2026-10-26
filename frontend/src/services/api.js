const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5001';

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });

    const result = await response.json();
    if (!response.ok) {
      const error = new Error(result.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = result;
      throw error;
    }

    return result;
  } catch (err) {
    // If localhost failed due to host resolution on Windows, try 127.0.0.1 fallback
    if (API_URL.includes('localhost') && (err.name === 'TypeError' || err.message?.includes('fetch'))) {
      const fallbackUrl = API_URL.replace('localhost', '127.0.0.1');
      try {
        const fallbackResponse = await fetch(`${fallbackUrl}${path}`, {
          ...options,
          headers,
        });
        const fallbackResult = await fallbackResponse.json();
        if (!fallbackResponse.ok) {
          const error = new Error(fallbackResult.message || `Request failed with status ${fallbackResponse.status}`);
          error.status = fallbackResponse.status;
          error.data = fallbackResult;
          throw error;
        }
        return fallbackResult;
      } catch (fallbackErr) {
        throw err;
      }
    }
    throw err;
  }
}

async function authRequest(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(`${AUTH_API_URL}${path}`, {
      ...options,
      headers,
    });

    const result = await response.json();
    if (!response.ok) {
      const error = new Error(result.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = result;
      throw error;
    }

    return result;
  } catch (err) {
    // If primary auth service is unreachable, attempt fallback to core backend
    if ((err.name === 'TypeError' || err.message?.includes('fetch')) && AUTH_API_URL !== API_URL) {
      try {
        const fallbackResponse = await fetch(`${API_URL}${path}`, {
          ...options,
          headers,
        });
        const fallbackResult = await fallbackResponse.json();
        if (!fallbackResponse.ok) {
          const error = new Error(fallbackResult.message || `Request failed with status ${fallbackResponse.status}`);
          error.status = fallbackResponse.status;
          error.data = fallbackResult;
          throw error;
        }
        return fallbackResult;
      } catch (fallbackErr) {
        throw err;
      }
    }
    throw err;
  }
}

export const api = {
  // Test Database Connection
  testDb: () => request('/api/test-db'),
  testAuthDb: () => authRequest('/api/auth/test-db'),

  // Public Platform Statistics
  getPublicStatistics: () => request('/api/public/statistics'),

  // Schemes
  getSchemes: () => request('/api/schemes'),
  getScheme: (id) => request(`/api/schemes/${id}`),
  getCategories: () => request('/api/categories'),

  // Auth (Python Flask Backend)
  requestOtp: (email) => authRequest('/api/auth/request-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  verifyOtp: (email, otp) => authRequest('/api/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  }),
  login: (email, password) => authRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  register: (email, password, full_name, state, district, verification_token) => authRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, full_name, state, district, verification_token }),
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
  getAdminStats: (adminId) => request('/api/admin/stats', {
    headers: { 'x-user-id': String(adminId) }
  }),
  getAdminSchemes: (adminId) => request('/api/admin/schemes', {
    headers: { 'x-user-id': String(adminId) }
  }),
  updateSchemeStatus: (adminId, schemeId, isActive) => request(`/api/admin/schemes/${schemeId}/status`, {
    method: 'PUT',
    headers: { 'x-user-id': String(adminId) },
    body: JSON.stringify({ is_active: isActive }),
  }),
  triggerSync: (adminId = 1) => request('/api/admin/sync', {
    method: 'POST',
    headers: { 'x-user-id': String(adminId) }
  }),
  getSyncLogs: (adminId = 1) => request('/api/admin/sync/logs', {
    headers: { 'x-user-id': String(adminId) }
  }),
  getSyncStatus: (adminId = 1) => request('/api/admin/sync/status', {
    headers: { 'x-user-id': String(adminId) }
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
