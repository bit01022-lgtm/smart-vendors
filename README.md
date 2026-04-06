# Intergrated E-procurement system

Role-based procurement platform built with React + Vite + a TypeScript API backend.

## Implemented

- JWT authentication with role-based access
- Role-based route protection (admin, client, procurement, vendor, finance)
- API-backed persisted data for:
  - client requests
  - procurement bids
  - vendor invoices
  - activity logs
- vendor registrations
- polling-based synchronization across dashboards

## Environment Variables

Create a `.env` file using `.env.example`:

- `VITE_API_BASE_URL` - backend URL for the frontend to call. Leave empty for same-host local development; set it to your Render backend URL in production.
- `JWT_SECRET` - required in production.
- `DATABASE_URL` - Neon PostgreSQL connection string used by Render.

## Deployment Layout

Use the services together like this:

- Neon: stores the PostgreSQL database and provides `DATABASE_URL`.
- Render: hosts the TypeScript API backend.
- Vercel: hosts the Vite frontend.

Production environment values:

- Render backend:
  - `DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=verify-full&channel_binding=require`
  - `JWT_SECRET=your-long-random-secret`
  - `NODE_ENV=production`
- Vercel frontend:
  - `VITE_API_BASE_URL=https://your-render-service.onrender.com`

## PostgreSQL Setup

Create the local database (example):

```bash
createdb smart_vendors
```

The backend auto-creates its `app_store` table on startup.

If you are deploying to Render and Neon, do not use `localhost` in production. The frontend should point to the Render URL, and the backend should point to Neon through `DATABASE_URL`.

## Run Locally

```bash
npm install
npm run server:dev
npm run dev
```

Frontend runs on Vite dev server and proxies `/api/*` to the backend.

## Build

```bash
npm run build
npm run server:build
npm run preview
```

## Final Setup Checklist

- Start backend API in production environment
- Set API base URL in hosting environment if backend is not local
- Configure JWT secret and secure transport (HTTPS)
- Verify role accounts and route access

## Role Test Matrix

Run these checks with separate accounts for each role.

- Client
  - Can sign up and login
  - Can create/edit/delete own request entries in UI
  - Cannot access `/admin`, `/finance`, `/procurement`, `/vendor`
- Vendor
  - Can login and see vendor dashboard only
  - Can submit/update bids
  - Can upload invoices and see own invoice list
  - Cannot read or update another vendor invoice doc
- Procurement
  - Can view and update client requests
  - Can select winning bids and update bid statuses
  - Can create activity logs
- Finance
  - Can view all vendor invoices
  - Can mark invoice payment status as paid
  - Cannot modify user profiles except own profile document
- Admin
  - Can view all workflows
  - Can read all user profiles
  - Can perform procurement/finance-level appData updates

## Pre-Launch Runbook

Use [PRELAUNCH_CHECKLIST.md](PRELAUNCH_CHECKLIST.md) for final go-live checks.
