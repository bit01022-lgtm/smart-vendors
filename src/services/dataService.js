import { getAuthToken } from './authService';

const API_BASE = (() => {
  const configuredBase = import.meta.env.VITE_API_BASE_URL;
  if (configuredBase) {
    return String(configuredBase).replace(/\/+$/, '');
  }

  return '/api';
})();
const POLL_INTERVAL_MS = 2500;

async function apiRequest(path, options = {}) {
  const token = getAuthToken();
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

function subscribePolling(getter, callback, fallbackItems = []) {
  let active = true;

  const run = async () => {
    if (!active) {
      return;
    }

    try {
      const items = await getter(fallbackItems);
      callback(items);
    } catch {
      callback(fallbackItems);
    }
  };

  run();
  const timer = setInterval(run, POLL_INTERVAL_MS);

  return () => {
    active = false;
    clearInterval(timer);
  };
}

export const getClientRequests = async (fallbackItems = []) => {
  try {
    const payload = await apiRequest('/app-data/clientRequests');
    return Array.isArray(payload.items) ? payload.items : fallbackItems;
  } catch {
    return fallbackItems;
  }
};

export const saveClientRequests = async (items) => {
  const payload = await apiRequest('/app-data/clientRequests', {
    method: 'PUT',
    body: JSON.stringify({ items }),
  });

  return payload.items;
};

export const subscribeClientRequests = (callback, fallbackItems = []) =>
  subscribePolling(getClientRequests, callback, fallbackItems);

export const getProcurementTenders = async (fallbackItems = []) => {
  try {
    const payload = await apiRequest('/app-data/procurementTenders');
    return Array.isArray(payload.items) ? payload.items : fallbackItems;
  } catch {
    return fallbackItems;
  }
};

export const saveProcurementTenders = async (items) => {
  const payload = await apiRequest('/app-data/procurementTenders', {
    method: 'PUT',
    body: JSON.stringify({ items }),
  });

  return payload.items;
};

export const subscribeProcurementTenders = (callback, fallbackItems = []) =>
  subscribePolling(getProcurementTenders, callback, fallbackItems);

export const getProcurementBids = async (fallbackItems = []) => {
  try {
    const payload = await apiRequest('/app-data/procurementBids');
    return Array.isArray(payload.items) ? payload.items : fallbackItems;
  } catch {
    return fallbackItems;
  }
};

export const saveProcurementBids = async (items) => {
  const payload = await apiRequest('/app-data/procurementBids', {
    method: 'PUT',
    body: JSON.stringify({ items }),
  });

  return payload.items;
};

export const subscribeProcurementBids = (callback, fallbackItems = []) =>
  subscribePolling(getProcurementBids, callback, fallbackItems);

export const getVendorInvoices = async (uid, fallbackItems = []) => {
  try {
    const payload = await apiRequest(`/app-data/vendorInvoices/${uid || 'anonymous'}`);
    return Array.isArray(payload.items) ? payload.items : fallbackItems;
  } catch {
    return fallbackItems;
  }
};

export const saveVendorInvoices = async (uid, items) => {
  const payload = await apiRequest(`/app-data/vendorInvoices/${uid || 'anonymous'}`, {
    method: 'PUT',
    body: JSON.stringify({ items }),
  });

  return payload.items;
};

export const subscribeVendorInvoices = (uid, callback, fallbackItems = []) =>
  subscribePolling((fallback) => getVendorInvoices(uid, fallback), callback, fallbackItems);

export const getVendorRegistration = async (uid, fallbackValue = null) => {
  try {
    const payload = await apiRequest(`/app-data/vendorRegistrations/${uid || 'anonymous'}`);
    const items = Array.isArray(payload.items) ? payload.items : [];
    return items[0] || fallbackValue;
  } catch {
    return fallbackValue;
  }
};

export async function saveVendorRegistration(uid, registration) {
  await apiRequest(`/app-data/vendorRegistrations/${uid || 'anonymous'}`, {
    method: 'PUT',
    body: JSON.stringify({ items: [registration] }),
  });

  return registration;
}

export const subscribeVendorRegistration = (uid, callback, fallbackValue = null) =>
  subscribePolling(
    async () => {
      const item = await getVendorRegistration(uid, fallbackValue);
      return item ? [item] : [];
    },
    (items) => callback(items[0] || fallbackValue),
    fallbackValue ? [fallbackValue] : []
  );

export async function getAllVendorRegistrations() {
  const payload = await apiRequest('/app-data/vendorRegistrations');
  return Array.isArray(payload.items) ? payload.items : [];
}

export function subscribeAllVendorRegistrations(callback) {
  return subscribePolling(getAllVendorRegistrations, callback, []);
}

export async function getAllVendorInvoices() {
  const payload = await apiRequest('/app-data/vendorInvoices');
  return Array.isArray(payload.items) ? payload.items : [];
}

export function subscribeAllVendorInvoices(callback) {
  return subscribePolling(getAllVendorInvoices, callback, []);
}

export async function saveAllVendorInvoices(invoices) {
  const payload = await apiRequest('/app-data/vendorInvoices/all', {
    method: 'PUT',
    body: JSON.stringify({ items: invoices }),
  });

  return payload.items;
}

export const getActivityLogs = async (fallbackItems = []) => {
  try {
    const payload = await apiRequest('/app-data/activityLogs');
    return Array.isArray(payload.items) ? payload.items : fallbackItems;
  } catch {
    return fallbackItems;
  }
};

export const saveActivityLogs = async (items) => {
  const payload = await apiRequest('/app-data/activityLogs', {
    method: 'PUT',
    body: JSON.stringify({ items }),
  });

  return payload.items;
};

export const subscribeActivityLogs = (callback, fallbackItems = []) =>
  subscribePolling(getActivityLogs, callback, fallbackItems);

export async function addActivityLog(log) {
  const existing = await getActivityLogs([]);
  const nextLogs = [log, ...existing].slice(0, 500);
  await saveActivityLogs(nextLogs);
  return nextLogs;
}
