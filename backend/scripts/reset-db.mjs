import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Pool } from 'pg';

const DATABASE_URL = String(process.env.DATABASE_URL || '').trim();

if (!DATABASE_URL) {
  console.error('[reset] DATABASE_URL is required.');
  process.exit(1);
}

function stamp() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mi = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${yyyy}${mm}${dd}-${hh}${mi}${ss}`;
}

const initial = {
  users: [],
  appData: {
    clientRequests: [],
    procurementTenders: [],
    procurementBids: [],
    activityLogs: [],
    vendorInvoices: {},
    vendorRegistrations: {},
  },
};

async function run() {
  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS app_store (
        id SMALLINT PRIMARY KEY,
        data JSONB NOT NULL
      );
    `);

    const current = await pool.query('SELECT data FROM app_store WHERE id = 1 LIMIT 1;');
    const currentData = current.rows[0]?.data || null;

    const backupDir = path.resolve(process.cwd(), 'backend', 'backups');
    await fs.mkdir(backupDir, { recursive: true });
    const backupFile = path.join(backupDir, `app-store-before-reset-${stamp()}.json`);
    await fs.writeFile(backupFile, `${JSON.stringify(currentData, null, 2)}\n`, 'utf8');

    await pool.query(
      `
        INSERT INTO app_store (id, data)
        VALUES (1, $1::jsonb)
        ON CONFLICT (id)
        DO UPDATE SET data = EXCLUDED.data;
      `,
      [JSON.stringify(initial)]
    );

    console.log(`[reset] Backup saved: ${backupFile}`);
    console.log('[reset] app_store has been reset to an empty state.');
  } finally {
    await pool.end();
  }
}

run().catch((error) => {
  console.error('[reset] Failed to reset app_store.');
  console.error(error.message || error);
  process.exit(1);
});