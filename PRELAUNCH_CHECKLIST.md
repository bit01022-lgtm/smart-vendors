# Intergrated E-procurement system Pre-Launch Checklist

Use this checklist right before going live.

## 1) Environment And Secrets

- [ ] Confirm production `.env` values are set in hosting platform settings.
- [ ] Confirm all required keys exist:
  - [ ] `VITE_API_BASE_URL` (if backend is not on the same host)
  - [ ] `DATABASE_URL` (Neon connection string on Render)
  - [ ] `JWT_SECRET` (backend secret on Render)
  - [ ] `NODE_ENV=production` (Render backend)
- [ ] Verify no secret values are committed to git.

## 2) Backend Configuration

- [ ] TypeScript API server is running in target environment.
- [ ] `JWT_SECRET` is set securely in backend environment.
- [ ] CORS is configured to allow your frontend domain.

## 3) API Health And Access

- [ ] Confirm health endpoint returns ok:

```bash
curl http://localhost:4000/api/health
```

- [ ] Confirm authenticated endpoints return `401` without token.
- [ ] Confirm role-protected endpoints enforce access rules.

## 4) Build And Deploy

- [ ] Clean install dependencies: `npm ci`
- [ ] Build project locally: `npm run build`
- [ ] Deploy frontend to Vercel.
- [ ] Deploy backend to Render.
- [ ] Open production URL and verify app loads.

## 5) Role-Based Smoke Test (Production)

Create one account for each role: `client`, `vendor`, `procurement`, `finance`, `admin`.

- [ ] Client can login and manage requests.
- [ ] Vendor can submit bids and upload invoices.
- [ ] Procurement can review requests, manage bids, select winners.
- [ ] Finance can review invoices and mark payments.
- [ ] Admin can view/administer workflows.
- [ ] Route protection works: users cannot access unauthorized dashboards.

## 6) Data And Migration Verification

- [ ] Legacy migration ran at least once for existing users.
- [ ] Data persists in backend storage under `backend/data/db.json`.
- [ ] No unexpected local fallback behavior in production.

## 7) Monitoring And Recovery

- [ ] Enable basic error tracking (Sentry or equivalent).
- [ ] Add at least one admin contact and escalation path.
- [ ] Document backup/export procedure for backend data storage.

## 8) Go-Live Signoff

- [ ] Security rules deployed and validated.
- [ ] All role tests passed.
- [ ] Stakeholder signoff complete.
- [ ] Go live.
