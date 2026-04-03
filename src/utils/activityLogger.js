import { addActivityLog, getActivityLogs as getActivityLogsFromDb } from '../services/dataService';

export async function logActivity({ type, reference, user, status }) {
  const newLog = {
    id: `ACT-${Date.now().toString().slice(-6)}`,
    type,
    reference,
    user,
    date: new Date().toISOString().slice(0, 10),
    status,
  };

  await addActivityLog(newLog);
}

export async function getActivityLogs() {
  return getActivityLogsFromDb([]);
}
