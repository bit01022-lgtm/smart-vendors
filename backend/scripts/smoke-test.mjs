const API_BASE = process.env.API_BASE_URL || 'http://localhost:4000';
const PASSWORD = 'Passw0rd!';

function stamp() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mi = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${yyyy}${mm}${dd}${hh}${mi}${ss}`;
}

async function api(path, { method = 'GET', token, body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await res.json().catch(() => ({}));

  if (!res.ok) {
    const code = payload.code ? ` (${payload.code})` : '';
    throw new Error(`${method} ${path} failed${code}: ${payload.message || res.statusText}`);
  }

  return payload;
}

async function signupAndLogin(role, id) {
  const email = `${role}_${id}@example.com`;
  const username = `${role}_${id}`;

  await api('/api/auth/signup', {
    method: 'POST',
    body: { username, email, password: PASSWORD, role },
  });

  const login = await api('/api/auth/login', {
    method: 'POST',
    body: { email, password: PASSWORD },
  });

  return {
    role,
    email,
    token: login.token,
    user: login.user,
  };
}

async function run() {
  const id = stamp();

  console.log('[smoke] Checking API health...');
  const health = await api('/api/health');
  if (!health.ok) {
    throw new Error('Health check returned non-ok result.');
  }

  console.log('[smoke] Creating role accounts...');
  const client = await signupAndLogin('client', `smoke_client_${id}`);
  const procurement = await signupAndLogin('procurement', `smoke_proc_${id}`);
  const vendor = await signupAndLogin('vendor', `smoke_vendor_${id}`);
  const finance = await signupAndLogin('finance', `smoke_fin_${id}`);
  const admin = await signupAndLogin('admin', `smoke_admin_${id}`);

  console.log('[smoke] Client -> Request creation...');
  const reqId = `REQ-SMOKE-${id}`;
  const requests = await api('/api/app-data/clientRequests', { token: client.token });
  const nextRequests = [
    ...(Array.isArray(requests.items) ? requests.items : []),
    {
      id: reqId,
      clientName: 'Smoke Client',
      title: 'Smoke Request',
      description: 'Smoke test request',
      category: 'Computing Hardware',
      subcategory: 'Laptops',
      priority: 'High',
      budgetMin: 1000,
      budgetMax: 2000,
      dateRequired: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      status: 'Pending',
      source: 'smoke',
      createdAt: new Date().toISOString(),
    },
  ];
  await api('/api/app-data/clientRequests', {
    method: 'PUT',
    token: client.token,
    body: { items: nextRequests },
  });

  const procRequests = await api('/api/app-data/clientRequests', { token: procurement.token });
  if (!procRequests.items?.some((item) => item.id === reqId)) {
    throw new Error('Procurement cannot see client request.');
  }

  console.log('[smoke] Procurement -> Tender creation...');
  const tenderId = `TND-SMOKE-${id}`;
  const tenders = await api('/api/app-data/procurementTenders', { token: procurement.token });
  const nextTenders = [
    ...(Array.isArray(tenders.items) ? tenders.items : []),
    {
      id: tenderId,
      title: 'Smoke Tender',
      category: 'Computing Hardware',
      subcategory: 'Laptops',
      budget: { min: 1100, max: 1900 },
      deadline: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      status: 'Open',
      attachments: [],
    },
  ];
  await api('/api/app-data/procurementTenders', {
    method: 'PUT',
    token: procurement.token,
    body: { items: nextTenders },
  });

  const vendorTenders = await api('/api/app-data/procurementTenders', { token: vendor.token });
  if (!vendorTenders.items?.some((item) => item.id === tenderId)) {
    throw new Error('Vendor cannot see procurement tender.');
  }

  console.log('[smoke] Vendor -> Bid + Invoice...');
  const bidId = `BID-SMOKE-${id}`;
  const bids = await api('/api/app-data/procurementBids', { token: vendor.token });
  const nextBids = [
    ...(Array.isArray(bids.items) ? bids.items : []),
    {
      id: bidId,
      tenderId,
      vendor: vendor.email,
      amount: 1500,
      notes: 'Smoke bid',
      files: [],
      date: new Date().toISOString().slice(0, 10),
      status: 'Submitted',
    },
  ];
  await api('/api/app-data/procurementBids', {
    method: 'PUT',
    token: vendor.token,
    body: { items: nextBids },
  });

  const procBids = await api('/api/app-data/procurementBids', { token: procurement.token });
  if (!procBids.items?.some((item) => item.id === bidId)) {
    throw new Error('Procurement cannot see vendor bid.');
  }

  const invoiceId = `INV-SMOKE-${id}`;
  await api(`/api/app-data/vendorInvoices/${vendor.user.uid}`, {
    method: 'PUT',
    token: vendor.token,
    body: {
      items: [
        {
          id: invoiceId,
          ownerUid: vendor.user.uid,
          vendorName: vendor.email,
          po: `PO-SMOKE-${id}`,
          name: 'Smoke Invoice',
          amount: 1500,
          submissionDate: new Date().toISOString().slice(0, 10),
          status: 'Submitted',
        },
      ],
    },
  });

  console.log('[smoke] Finance -> Invoice visibility...');
  const allInvoices = await api('/api/app-data/vendorInvoices', { token: finance.token });
  if (!allInvoices.items?.some((item) => item.id === invoiceId)) {
    throw new Error('Finance cannot see vendor invoice.');
  }

  console.log('[smoke] Activity log visibility...');
  const logs = await api('/api/app-data/activityLogs', { token: admin.token });
  const logId = `ACT-SMOKE-${id}`;
  const nextLogs = [
    {
      id: logId,
      type: 'Smoke Event',
      reference: tenderId,
      user: 'Smoke Runner',
      date: new Date().toISOString().slice(0, 10),
      status: 'OK',
    },
    ...(Array.isArray(logs.items) ? logs.items : []),
  ];
  await api('/api/app-data/activityLogs', {
    method: 'PUT',
    token: vendor.token,
    body: { items: nextLogs },
  });

  const logsAfter = await api('/api/app-data/activityLogs', { token: admin.token });
  if (!logsAfter.items?.some((item) => item.id === logId)) {
    throw new Error('Admin cannot see new activity log item.');
  }

  console.log('[smoke] PASS');
  console.log(`SMOKE_OK REQUEST=${reqId} TENDER=${tenderId} BID=${bidId} INVOICE=${invoiceId} LOG=${logId}`);
}

run().catch((error) => {
  console.error('[smoke] FAIL');
  console.error(error.message || error);
  process.exit(1);
});
