// API Client with automatic JWT injection and error handling

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const getAuthToken = () => {
  return localStorage.getItem('cog_care_token') || '';
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('cog_care_token', token);
  } else {
    localStorage.removeItem('cog_care_token');
  }
};

export const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.message || `Request failed with status ${res.status}`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    // If network error (offline)
    if (!navigator.onLine || error.message.includes('Failed to fetch')) {
      error.isOffline = true;
    }
    throw error;
  }
};
