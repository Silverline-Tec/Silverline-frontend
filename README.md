# Silverline Sentinel Frontend

Silverline's tactical command-center UI is now the Sentinel product frontend. The app keeps the Silverline landing/dashboard visual language, but the dashboard is wired to the Sentinel central backend through Next.js server-side proxy routes.

## What This App Does

- `/` renders the Silverline landing page.
- `/dashboard` renders the live tactical dashboard.
- `/docs` renders the Sentinel backend and frontend documentation from this codebase.
- `/api/control/*` proxies dashboard-safe calls to `sentinel-backend`.
- The browser calls this frontend only; `SENTINEL_DASHBOARD_API_KEY` stays server-side.
- Documentation is no longer a separate deployment target for day-to-day use; keep new frontend/backend docs in `content/docs`.

## Required Backend

Start the central backend before expecting live dashboard data:

```bash
cd /home/swaynel/Documents/projects/sentinel/sentinel-backend
docker compose up -d --build
```

The frontend expects the central API on `http://127.0.0.1:8000` unless overridden.

## Environment

Create `.env.local`:

```bash
SENTINEL_BACKEND_URL=http://127.0.0.1:8000
SENTINEL_DASHBOARD_API_KEY=dev-dashboard-key
```

Use the same dashboard key configured in `sentinel-backend`.

## Local Development

```bash
pnpm install
pnpm dev
```

Open:

- `http://localhost:3000`
- `http://localhost:3000/dashboard`
- `http://localhost:3000/docs`

## Important Notes

- Live incidents, devices, stats, webhooks, and system metrics come from Sentinel central.
- Camera tiles currently show stream placeholders because the backend does not yet expose stream URLs.
- Map positions are deterministic grid placements from node IDs until GPS/lat-lng fields are added to the backend device model.
- The old mock dashboard data is only used as fallback when a component is rendered without backend props.
- This app intentionally avoids the generated shadcn/Radix component layer; keep UI primitives local and lightweight unless a specific interaction requires a dedicated dependency.
