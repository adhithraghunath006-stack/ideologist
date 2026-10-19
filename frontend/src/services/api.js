/**
 * Centralized API Client for Ideologist
 * Handles authorization tokens, error normalization, and multipart file uploads.
 */

const BASE_URL = 'https://ideologist.onrender.com/api';

function getToken() {
  return localStorage.getItem('ideologist_token');
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const token = getToken();

  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Only set application/json if body is not FormData
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.message || `Request failed with status ${res.status}`;
      const error = new Error(errorMsg);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  register: (userData) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  getMe: () => request('/auth/me'),
  updateProfile: (profileData) => request('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  }),

  // Ideas & Discovery
  getIdeas: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== 'All') {
        query.append(key, val);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/ideas${queryString}`);
  },
  getIdeaById: (id) => request(`/ideas/${id}`),
  calculateViability: (metrics) => request('/ideas/calculate', {
    method: 'POST',
    body: JSON.stringify(metrics)
  }),
  getMyIdeas: () => request('/ideas/user/my-ideas'),
  createIdea: (formData) => request('/ideas', {
    method: 'POST',
    body: formData
  }),
  updateIdea: (id, formData) => request(`/ideas/${id}`, {
    method: 'PUT',
    body: formData
  }),
  deleteIdea: (id) => request(`/ideas/${id}`, {
    method: 'DELETE'
  }),
  getDocumentDownloadUrl: (docId) => `${BASE_URL}/ideas/documents/${docId}/download`,

  // Investor Relations
  toggleSaveIdea: (idea_id) => request('/investor/saved/toggle', {
    method: 'POST',
    body: JSON.stringify({ idea_id })
  }),
  getSavedIdeas: () => request('/investor/saved'),
  expressInterest: (payload) => request('/investor/interest', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getMySentInterests: () => request('/investor/sent-interests'),
  getReceivedInterests: () => request('/investor/received-interests'),
  respondToInterest: (id, payload) => request(`/investor/interest/${id}/respond`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),

  // Pitch Events (Virtual Shark Tank)
  getPitchEvents: () => request('/pitch-events'),
  getPitchEventById: (id) => request(`/pitch-events/${id}`),
  applyToEvent: (id, payload) => request(`/pitch-events/${id}/apply`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  submitQuestion: (eventId, payload) => request(`/pitch-events/${eventId}/questions`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  replyToQuestion: (questionId, payload) => request(`/pitch-events/questions/${questionId}/reply`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),

  // Admin Controls
  getAdminStats: () => request('/admin/stats'),
  getAllSubmissions: (status) => {
    const query = status && status !== 'All' ? `?status=${encodeURIComponent(status)}` : '';
    return request(`/admin/submissions${query}`);
  },
  reviewSubmission: (id, payload) => request(`/admin/submissions/${id}/review`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),
  createEvent: (payload) => request('/admin/events', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  updateEventStatus: (id, status) => request(`/admin/events/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }),
  reviewEventApplication: (appId, payload) => request(`/admin/applications/${appId}/review`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),
  getAllUsers: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val && val !== 'All') query.append(key, val);
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/admin/users${queryString}`);
  },
  toggleUserStatus: (userId) => request(`/admin/users/${userId}/toggle-status`, {
    method: 'PUT'
  }),
  getAuditLogs: () => request('/admin/audit-logs'),

  // Location
  getCities: () => request('/locations/cities'),
  getLocationDetails: (city, industry) => {
    const q = industry ? `?industry=${encodeURIComponent(industry)}` : '';
    return request(`/locations/${encodeURIComponent(city)}${q}`);
  }
};
