// ── API CONFIG ────────────────────────────────────────────────────
const API_BASE = 'http://localhost:5000/api';

// ── TOKEN HELPERS ─────────────────────────────────────────────────
const getToken = () => sessionStorage.getItem('rg_token');
const setToken = (t) => sessionStorage.setItem('rg_token', t);
const clearToken = () => sessionStorage.removeItem('rg_token');

// ── BASE FETCH ────────────────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

// ── AUTH ──────────────────────────────────────────────────────────
const Auth = {
  login: async (username, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    setToken(data.token);
    return data;
  },
  logout: () => clearToken(),
  isLoggedIn: () => !!getToken(),
  getMe: () => apiFetch('/auth/me'),
  changePassword: (current, newPass) => apiFetch('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword: current, newPassword: newPass })
  })
};

// ── APPOINTMENTS ──────────────────────────────────────────────────
const Appointments = {
  book: (data) => apiFetch('/appointments', { method: 'POST', body: JSON.stringify(data) }),
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/appointments?${q}`);
  },
  getToday: () => apiFetch('/appointments/today'),
  getStats: () => apiFetch('/appointments/stats'),
  updateStatus: (id, body) => apiFetch(`/appointments/${id}/status`, {
    method: 'PATCH', body: JSON.stringify(body)
  }),
  delete: (id) => apiFetch(`/appointments/${id}`, { method: 'DELETE' })
};

// ── SERVICES ──────────────────────────────────────────────────────
const Services = {
  getAll: (category) => apiFetch(`/services${category ? `?category=${category}` : ''}`),
  create: (data) => apiFetch('/services', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/services/${id}`, { method: 'DELETE' })
};

// ── LEADS ─────────────────────────────────────────────────────────
const Leads = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/leads?${q}`);
  },
  updateStatus: (id, status) => apiFetch(`/leads/${id}/status`, {
    method: 'PATCH', body: JSON.stringify({ status })
  })
};
