import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const source = path.resolve(root, 'backend/data/db.json');
const backupDir = path.resolve(root, 'backend/backups');

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

async function run() {
  await fs.access(source);
  await fs.mkdir(backupDir, { recursive: true });

  const target = path.join(backupDir, `db-${stamp()}.json`);
  await fs.copyFile(source, target);

  console.log(`Backup created: ${target}`);
}

run().catch((error) => {
  console.error('Backup failed:', error?.message || error);
  process.exit(1);
});
