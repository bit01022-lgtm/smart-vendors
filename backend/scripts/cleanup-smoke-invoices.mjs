import 'dotenv/config';
import { Pool } from 'pg';

const DATABASE_URL = String(process.env.DATABASE_URL || '').trim();

if (!DATABASE_URL) {
  console.error('[cleanup] DATABASE_URL is required.');
  process.exit(1);
}

function isSmokeInvoice(invoice) {
  if (!invoice || typeof invoice !== 'object') return false;

  const id = String(invoice.id || '');
  const source = String(invoice.source || '').toLowerCase();
  const name = String(invoice.name || '').toLowerCase();
  const vendorName = String(invoice.vendorName || '').toLowerCase();

  return (
    id.startsWith('INV-SMOKE-') ||
    source === 'smoke' ||
    name.includes('smoke') ||
    vendorName.includes('smoke_')
  );
}

function containsSmoke(value) {
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    return (
      lower.includes('smoke') ||
      lower.includes('req-smoke') ||
      lower.includes('tnd-smoke') ||
      lower.includes('bid-smoke') ||
      lower.includes('act-smoke') ||
      lower.includes('inv-smoke')
    );
  }

  return false;
}

function isSmokeUser(user) {
  if (!user || typeof user !== 'object') return false;

  return [user.name, user.username, user.email].some(containsSmoke);
}

function isSmokeRequest(item) {
  if (!item || typeof item !== 'object') return false;

  return [item.id, item.clientName, item.title, item.description, item.source].some(containsSmoke);
}

function isSmokeTender(item) {
  if (!item || typeof item !== 'object') return false;

  return [item.id, item.title, item.category, item.subcategory].some(containsSmoke);
}

function isSmokeBid(item) {
  if (!item || typeof item !== 'object') return false;

  return [item.id, item.tenderId, item.vendor, item.notes].some(containsSmoke);
}

function isSmokeLog(item) {
  if (!item || typeof item !== 'object') return false;

  return [item.id, item.type, item.reference, item.user, item.status].some(containsSmoke);
}

function isSmokeRegistration(entry) {
  if (!entry || typeof entry !== 'object') return false;

  return [entry.id, entry.ownerUid, entry.vendorEmail, entry.companyName, entry.companyEmail, entry.companyAddress].some(containsSmoke);
}

function cleanseArray(items, predicate) {
  const list = Array.isArray(items) ? items : [];
  return list.filter((item) => !predicate(item));
}

async function run() {
  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    const result = await pool.query('SELECT data FROM app_store WHERE id = 1 LIMIT 1;');
    const data = result.rows[0]?.data;

    if (!data || typeof data !== 'object') {
      console.log('[cleanup] No app_store data found. Nothing to clean.');
      return;
    }

    const appData = data.appData && typeof data.appData === 'object' ? data.appData : {};
    const vendorInvoices =
      appData.vendorInvoices && typeof appData.vendorInvoices === 'object' ? appData.vendorInvoices : {};

    let removed = 0;
    const cleanedInvoices = {};

    for (const [uid, items] of Object.entries(vendorInvoices)) {
      const list = Array.isArray(items) ? items : [];
      const kept = list.filter((invoice) => !isSmokeInvoice(invoice));
      removed += list.length - kept.length;
      cleanedInvoices[uid] = kept;
    }

    const cleanedUsers = cleanseArray(data.users, isSmokeUser);
    removed += (Array.isArray(data.users) ? data.users.length : 0) - cleanedUsers.length;

    const cleanedClientRequests = cleanseArray(appData.clientRequests, isSmokeRequest);
    removed += (Array.isArray(appData.clientRequests) ? appData.clientRequests.length : 0) - cleanedClientRequests.length;

    const cleanedTenders = cleanseArray(appData.procurementTenders, isSmokeTender);
    removed += (Array.isArray(appData.procurementTenders) ? appData.procurementTenders.length : 0) - cleanedTenders.length;

    const cleanedBids = cleanseArray(appData.procurementBids, isSmokeBid);
    removed += (Array.isArray(appData.procurementBids) ? appData.procurementBids.length : 0) - cleanedBids.length;

    const cleanedLogs = cleanseArray(appData.activityLogs, isSmokeLog);
    removed += (Array.isArray(appData.activityLogs) ? appData.activityLogs.length : 0) - cleanedLogs.length;

    const cleanedRegistrations = {};
    const registrations =
      appData.vendorRegistrations && typeof appData.vendorRegistrations === 'object' ? appData.vendorRegistrations : {};

    for (const [uid, items] of Object.entries(registrations)) {
      const list = Array.isArray(items) ? items : [];
      const kept = list.filter((entry) => !isSmokeRegistration(entry));
      removed += list.length - kept.length;
      cleanedRegistrations[uid] = kept;
    }

    if (removed === 0) {
      console.log('[cleanup] No smoke data found.');
      return;
    }

    const nextData = {
      ...data,
      users: cleanedUsers,
      appData: {
        ...appData,
        clientRequests: cleanedClientRequests,
        procurementTenders: cleanedTenders,
        procurementBids: cleanedBids,
        activityLogs: cleanedLogs,
        vendorInvoices: cleanedInvoices,
        vendorRegistrations: cleanedRegistrations,
      },
    };

    await pool.query('UPDATE app_store SET data = $1::jsonb WHERE id = 1;', [JSON.stringify(nextData)]);
    console.log(`[cleanup] Removed ${removed} smoke record(s).`);
  } finally {
    await pool.end();
  }
}

run().catch((error) => {
  console.error('[cleanup] Failed to remove smoke data.');
  console.error(error.message || error);
  process.exit(1);
});