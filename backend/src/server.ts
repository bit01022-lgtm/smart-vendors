import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

type Role = 'client' | 'procurement' | 'vendor' | 'finance' | 'admin';

type UserRecord = {
  uid: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  passwordHash: string;
  createdAt: string;
};

type AppDataStore = {
  clientRequests: unknown[];
  procurementTenders: unknown[];
  procurementBids: unknown[];
  activityLogs: unknown[];
  vendorInvoices: Record<string, unknown[]>;
  vendorRegistrations: Record<string, unknown[]>;
};

type Database = {
  users: UserRecord[];
  appData: AppDataStore;
};

type AuthPayload = {
  uid: string;
  role: Role;
  email: string;
};

type AuthedRequest = Request & {
  user?: AuthPayload;
};

const app = express();
const PORT = Number(process.env.PORT || 4000);
const DB_PATH = path.resolve(process.cwd(), 'backend/data/db.json');
const ALLOWED_ROLES: Role[] = ['client', 'procurement', 'vendor', 'finance', 'admin'];

function getJwtSecret(): string {
  const secret = String(process.env.JWT_SECRET || '').trim();
  const env = String(process.env.NODE_ENV || 'development').toLowerCase();

  if (secret) {
    return secret;
  }

  if (env === 'production') {
    throw new Error('JWT_SECRET is required in production.');
  }

  console.warn('JWT_SECRET is not set. Using local development fallback secret.');
  return 'smart-vendors-local-secret';
}

const JWT_SECRET = getJwtSecret();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

async function ensureDb(): Promise<void> {
  try {
    await fs.access(DB_PATH);
  } catch {
    const initial: Database = {
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

    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(initial, null, 2), 'utf8');
  }
}

async function readDb(): Promise<Database> {
  await ensureDb();
  const raw = await fs.readFile(DB_PATH, 'utf8');
  const parsed = JSON.parse(raw) as Partial<Database>;

  return {
    users: Array.isArray(parsed.users) ? (parsed.users as UserRecord[]) : [],
    appData: {
      clientRequests: Array.isArray(parsed.appData?.clientRequests) ? parsed.appData!.clientRequests : [],
      procurementTenders: Array.isArray(parsed.appData?.procurementTenders) ? parsed.appData!.procurementTenders : [],
      procurementBids: Array.isArray(parsed.appData?.procurementBids) ? parsed.appData!.procurementBids : [],
      activityLogs: Array.isArray(parsed.appData?.activityLogs) ? parsed.appData!.activityLogs : [],
      vendorInvoices:
        parsed.appData?.vendorInvoices && typeof parsed.appData.vendorInvoices === 'object'
          ? (parsed.appData.vendorInvoices as Record<string, unknown[]>)
          : {},
      vendorRegistrations:
        parsed.appData?.vendorRegistrations && typeof parsed.appData.vendorRegistrations === 'object'
          ? (parsed.appData.vendorRegistrations as Record<string, unknown[]>)
          : {},
    },
  };
}

async function writeDb(data: Database): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function stripPassword(user: UserRecord) {
  return {
    uid: user.uid,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

function signToken(user: UserRecord): string {
  return jwt.sign(
    {
      uid: user.uid,
      role: user.role,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function roleAllowed(user: AuthPayload | undefined, allowed: Role[]) {
  return Boolean(user && allowed.includes(user.role));
}

function authenticate(req: AuthedRequest, res: Response, next: NextFunction) {
  const authHeader = req.header('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ code: 'UNAUTHORIZED', message: 'Authentication required.' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ code: 'INVALID_TOKEN', message: 'Invalid or expired token.' });
  }
}

function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8
    && /[a-z]/.test(password)
    && /[A-Z]/.test(password)
    && /\d/.test(password)
    && /[^A-Za-z0-9]/.test(password)
  );
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/', (_req, res) => {
  res.status(200).json({
    ok: true,
    message: 'TypeScript API is running.',
    health: '/api/health',
    frontend: 'Open the frontend on your Vite URL (for example http://localhost:5177).',
  });
});

app.get('/api', (_req, res) => {
  res.status(200).json({
    ok: true,
    message: 'API root. Use /api/health for a quick health check.',
  });
});

app.post('/api/auth/signup', async (req, res) => {
  const { username, email, password, role } = req.body as {
    username?: string;
    email?: string;
    password?: string;
    role?: Role;
  };

  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedUsername = String(username || '').trim().toLowerCase();

  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    res.status(400).json({ code: 'INVALID_EMAIL', message: 'A valid email is required.' });
    return;
  }

  if (!normalizedUsername) {
    res.status(400).json({ code: 'INVALID_USERNAME', message: 'A username is required.' });
    return;
  }

  if (!password || !isStrongPassword(password)) {
    res.status(400).json({
      code: 'WEAK_PASSWORD',
      message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.',
    });
    return;
  }

  if (!role || !ALLOWED_ROLES.includes(role)) {
    res.status(400).json({ code: 'INVALID_ROLE', message: 'Selected role is not allowed.' });
    return;
  }

  const db = await readDb();

  if (db.users.some((user) => user.email === normalizedEmail)) {
    res.status(409).json({ code: 'EMAIL_IN_USE', message: 'That email is already registered.' });
    return;
  }

  if (db.users.some((user) => user.username === normalizedUsername)) {
    res.status(409).json({ code: 'USERNAME_TAKEN', message: 'That username is already taken.' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user: UserRecord = {
    uid: crypto.randomUUID(),
    name: normalizedUsername,
    username: normalizedUsername,
    email: normalizedEmail,
    role,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);
  await writeDb(db);

  res.status(201).json({ user: stripPassword(user) });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  const normalizedEmail = String(email || '').trim().toLowerCase();

  const db = await readDb();
  const user = db.users.find((entry) => entry.email === normalizedEmail);

  if (!user || !password) {
    res.status(401).json({ code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });
    return;
  }

  res.json({ token: signToken(user), user: stripPassword(user) });
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { email } = req.body as { email?: string };
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    res.status(400).json({ code: 'INVALID_EMAIL', message: 'A valid email is required.' });
    return;
  }

  res.json({ message: 'Password reset requested.' });
});

app.post('/api/auth/logout', (_req, res) => {
  res.json({ success: true });
});

app.get('/api/auth/me', authenticate, async (req: AuthedRequest, res) => {
  const db = await readDb();
  const user = db.users.find((entry) => entry.uid === req.user?.uid);

  if (!user) {
    res.status(404).json({ code: 'USER_NOT_FOUND', message: 'User not found.' });
    return;
  }

  res.json({ user: stripPassword(user) });
});

app.get('/api/app-data/clientRequests', authenticate, async (_req, res) => {
  const db = await readDb();
  res.json({ items: db.appData.clientRequests });
});

app.put('/api/app-data/clientRequests', authenticate, async (req: AuthedRequest, res) => {
  if (!roleAllowed(req.user, ['client', 'procurement', 'admin'])) {
    res.status(403).json({ code: 'FORBIDDEN', message: 'Not allowed to update client requests.' });
    return;
  }

  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  const db = await readDb();
  db.appData.clientRequests = items;
  await writeDb(db);
  res.json({ items });
});

app.get('/api/app-data/procurementTenders', authenticate, async (_req, res) => {
  const db = await readDb();
  res.json({ items: db.appData.procurementTenders });
});

app.put('/api/app-data/procurementTenders', authenticate, async (req: AuthedRequest, res) => {
  if (!roleAllowed(req.user, ['procurement', 'admin'])) {
    res.status(403).json({ code: 'FORBIDDEN', message: 'Not allowed to update tenders.' });
    return;
  }

  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  const db = await readDb();
  db.appData.procurementTenders = items;
  await writeDb(db);
  res.json({ items });
});

app.get('/api/app-data/procurementBids', authenticate, async (_req, res) => {
  const db = await readDb();
  res.json({ items: db.appData.procurementBids });
});

app.put('/api/app-data/procurementBids', authenticate, async (req: AuthedRequest, res) => {
  if (!roleAllowed(req.user, ['vendor', 'procurement', 'admin'])) {
    res.status(403).json({ code: 'FORBIDDEN', message: 'Not allowed to update bids.' });
    return;
  }

  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  const db = await readDb();
  db.appData.procurementBids = items;
  await writeDb(db);
  res.json({ items });
});

app.get('/api/app-data/activityLogs', authenticate, async (_req, res) => {
  const db = await readDb();
  res.json({ items: db.appData.activityLogs });
});

app.put('/api/app-data/activityLogs', authenticate, async (req: AuthedRequest, res) => {
  if (!roleAllowed(req.user, ['client', 'procurement', 'vendor', 'finance', 'admin'])) {
    res.status(403).json({ code: 'FORBIDDEN', message: 'Not allowed to update activity logs.' });
    return;
  }

  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  const db = await readDb();
  db.appData.activityLogs = items;
  await writeDb(db);
  res.json({ items });
});

app.get('/api/app-data/vendorInvoices/:uid', authenticate, async (req: AuthedRequest, res) => {
  const uidParam = req.params.uid;
  const uid = Array.isArray(uidParam) ? uidParam[0] : uidParam;
  const isOwner = req.user?.uid === uid;

  if (!isOwner && !roleAllowed(req.user, ['finance', 'admin'])) {
    res.status(403).json({ code: 'FORBIDDEN', message: 'Not allowed to read these invoices.' });
    return;
  }

  const db = await readDb();
  res.json({ items: db.appData.vendorInvoices[uid] || [] });
});

app.put('/api/app-data/vendorInvoices/:uid', authenticate, async (req: AuthedRequest, res) => {
  const uidParam = req.params.uid;
  const uid = Array.isArray(uidParam) ? uidParam[0] : uidParam;
  const isOwner = req.user?.uid === uid && req.user?.role === 'vendor';

  if (!isOwner && !roleAllowed(req.user, ['finance', 'admin'])) {
    res.status(403).json({ code: 'FORBIDDEN', message: 'Not allowed to update these invoices.' });
    return;
  }

  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  const db = await readDb();
  db.appData.vendorInvoices[uid] = items;
  await writeDb(db);
  res.json({ items });
});

app.get('/api/app-data/vendorRegistrations/:uid', authenticate, async (req: AuthedRequest, res) => {
  const uidParam = req.params.uid;
  const uid = Array.isArray(uidParam) ? uidParam[0] : uidParam;
  const isOwner = req.user?.uid === uid;

  if (!isOwner && !roleAllowed(req.user, ['admin'])) {
    res.status(403).json({ code: 'FORBIDDEN', message: 'Not allowed to read this registration.' });
    return;
  }

  const db = await readDb();
  res.json({ items: db.appData.vendorRegistrations[uid] || [] });
});

app.put('/api/app-data/vendorRegistrations/:uid', authenticate, async (req: AuthedRequest, res) => {
  const uidParam = req.params.uid;
  const uid = Array.isArray(uidParam) ? uidParam[0] : uidParam;
  const isOwner = req.user?.uid === uid && req.user?.role === 'vendor';

  if (!isOwner && !roleAllowed(req.user, ['admin'])) {
    res.status(403).json({ code: 'FORBIDDEN', message: 'Not allowed to update this registration.' });
    return;
  }

  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  const db = await readDb();
  db.appData.vendorRegistrations[uid] = items;
  await writeDb(db);
  res.json({ items });
});

app.get('/api/app-data/vendorRegistrations', authenticate, async (req: AuthedRequest, res) => {
  if (!roleAllowed(req.user, ['admin'])) {
    res.status(403).json({ code: 'FORBIDDEN', message: 'Not allowed to read all registrations.' });
    return;
  }

  const db = await readDb();
  const merged = Object.entries(db.appData.vendorRegistrations).flatMap(([uid, items]) =>
    (items || []).map((item) => ({
      ...(item as Record<string, unknown>),
      ownerUid: (item as Record<string, unknown>).ownerUid || uid,
    }))
  );

  res.json({ items: merged });
});

app.get('/api/app-data/vendorInvoices', authenticate, async (req: AuthedRequest, res) => {
  if (!roleAllowed(req.user, ['finance', 'admin'])) {
    res.status(403).json({ code: 'FORBIDDEN', message: 'Not allowed to read all invoices.' });
    return;
  }

  const db = await readDb();
  const merged = Object.entries(db.appData.vendorInvoices).flatMap(([uid, items]) =>
    (items || []).map((item) => ({
      ...(item as Record<string, unknown>),
      ownerUid: (item as Record<string, unknown>).ownerUid || uid,
    }))
  );

  res.json({ items: merged });
});

app.put('/api/app-data/vendorInvoices/all', authenticate, async (req: AuthedRequest, res) => {
  if (!roleAllowed(req.user, ['finance', 'admin'])) {
    res.status(403).json({ code: 'FORBIDDEN', message: 'Not allowed to update all invoices.' });
    return;
  }

  const items = Array.isArray(req.body?.items)
    ? (req.body.items as Record<string, unknown>[])
    : [];

  const grouped = items.reduce((acc: Record<string, unknown[]>, item: Record<string, unknown>) => {
    const ownerUid = String(item.ownerUid || 'anonymous');
    if (!acc[ownerUid]) {
      acc[ownerUid] = [];
    }

    acc[ownerUid].push(item);
    return acc;
  }, {});

  const db = await readDb();
  db.appData.vendorInvoices = grouped;
  await writeDb(db);
  res.json({ items });
});

app.listen(PORT, async () => {
  await ensureDb();
  console.log(`TypeScript API running on http://localhost:${PORT}`);
});
