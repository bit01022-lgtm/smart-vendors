const API_BASE = (() => {
  const configuredBase = import.meta.env.VITE_API_BASE_URL;
  if (configuredBase) {
    return String(configuredBase).replace(/\/+$/, '');
  }

  return '/api';
})();
const TOKEN_KEY = 'sv_auth_token';
const USER_KEY = 'sv_auth_user';
const REMEMBER_KEY = 'sv_auth_remember';
export const AUTH_CHANGED_EVENT = 'sv-auth-changed';

function notifyAuthChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }
}

function getActiveStorage() {
  const remember = localStorage.getItem(REMEMBER_KEY) === '1';
  return remember ? localStorage : sessionStorage;
}

function readToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null;
}

function writeSession(token, user, rememberMe) {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);

  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(REMEMBER_KEY, rememberMe ? '1' : '0');
  notifyAuthChanged();
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(REMEMBER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  notifyAuthChanged();
}

async function apiRequest(path, options = {}) {
  const token = readToken();
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || 'Request failed');
    error.code = payload.code;
    throw error;
  }

  return payload;
}

export const registerUser = async ({ username, email, password, role }) => {
  const normalizedUsername = username.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();

  return apiRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      username: normalizedUsername,
      email: normalizedEmail,
      password,
      role,
    }),
  });
};

export const loginUser = async ({ identifier, password, rememberMe = false }) => {
  const normalizedIdentifier = identifier.trim().toLowerCase();

  if (!normalizedIdentifier.includes('@')) {
    throw new Error('EMAIL_REQUIRED');
  }

  const payload = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: normalizedIdentifier, password }),
  });

  writeSession(payload.token, payload.user, rememberMe);
  return payload.user;
};

export const requestPasswordReset = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail.includes('@')) {
    throw new Error('EMAIL_REQUIRED');
  }

  await apiRequest('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email: normalizedEmail }),
  });
};

export const fetchCurrentUser = async () => {
  const token = readToken();
  if (!token) {
    return null;
  }

  const payload = await apiRequest('/auth/me');
  const storage = getActiveStorage();
  storage.setItem(USER_KEY, JSON.stringify(payload.user));
  return payload.user;
};

export const getStoredUser = () => {
  const raw = getActiveStorage().getItem(USER_KEY)
    || localStorage.getItem(USER_KEY)
    || sessionStorage.getItem(USER_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const getAuthToken = () => readToken();

export const logoutUser = async () => {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } finally {
    clearSession();
  }
};
