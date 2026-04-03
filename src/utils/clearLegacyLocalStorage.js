const LEGACY_STORAGE_KEYS = [
  'sv_users',
  'sv_session',
  'clientRequests',
  'procurementBids',
  'vendorInvoices',
  'activityLogs',
];

const CLEANUP_FLAG_KEY = 'sv_legacy_cleanup_done';

export function clearLegacyLocalStorage() {
  if (typeof window === 'undefined') {
    return;
  }

  const isAlreadyCleared = window.localStorage.getItem(CLEANUP_FLAG_KEY) === '1';
  if (isAlreadyCleared) {
    return;
  }

  LEGACY_STORAGE_KEYS.forEach((key) => {
    window.localStorage.removeItem(key);
  });

  window.localStorage.setItem(CLEANUP_FLAG_KEY, '1');
}
