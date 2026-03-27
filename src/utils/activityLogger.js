// src/utils/activityLogger.js

// Utility to log procurement activities to localStorage for admin monitoring
export function logActivity({ type, reference, user, status }) {
  const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
  const newLog = {
    id: `ACT-${(logs.length + 1).toString().padStart(3, '0')}`,
    type,
    reference,
    user,
    date: new Date().toISOString().slice(0, 10),
    status,
  };
  logs.unshift(newLog); // newest first
  localStorage.setItem('activityLogs', JSON.stringify(logs));
}

export function getActivityLogs() {
  return JSON.parse(localStorage.getItem('activityLogs') || '[]');
}
