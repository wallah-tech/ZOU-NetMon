# ZOU NetMon – Docker Development Environment

This guide explains how to run the complete **ZOU NetMon** development stack inside Docker on any computer — Windows, macOS, or Linux.

## Architecture

| Service | Description | Port |
|---|---|---|
| **db** | PostgreSQL 17 (primary database) | `54322:5432` |
| **postgrest** | PostgREST v12 (auto REST API over Postgres) | internal |
| **gateway** | Nginx proxy emulating Supabase API on `/rest/v1` | `54321` |
| **web** | Vite dev server (React frontend) with hot reloading | `5173` |
| **poller** | Live network poller (pings routers, writes metrics) | — |
| **ai-analyzer** | AI anomaly/prediction engine | — |
| **influxdb** | InfluxDB 2.7 (time-series metrics store) | `8086` |
| **telegraf** | Telegraf SNMP poller (writes to InfluxDB) | — |
| **nfcapd** | NetFlow / IPFIX collector | `2055/udp`, `6343/udp` |
| **syslog** | syslog-ng receiver | `514/udp` |
| **grafana** | Grafana dashboards | `3000` |

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and **running**
- Git (to clone the repo)

## Quick Start

```bash
# 1. Clone the repository
git clone <repository-url>
cd ZOU-NetMon

# 2. Start Docker Desktop (Windows) — wait for the whale icon in the system tray
#    On macOS/Linux the Docker service typically auto-starts

# 3. Launch the entire stack
docker compose up --build

# 4. Open the web app
#    http://localhost:5173

# 5. Open Grafana dashboards
#    http://localhost:3000   (admin / ZouGrafana@2026!)

# 6. Open InfluxDB
#    http://localhost:8086   (admin / ZouAdmin@2026!)
```

## Login Credentials (Web App)

| Name | Email | Password | Role |
|---|---|---|---|
| Admin User | `admin@ict.gov.zw` | `Admin@2024` | Administrator (full access) |
| Network Operator | `netops@ict.gov.zw` | `Netops@2024` | Operator (read + manage alerts) |
| View Only User | `viewer@ict.gov.zw` | `Viewer@2024` | Viewer (read-only) |

## How the Database Works

The `db` container (Postgres 17) is auto-initialised from [`monitoring/db/init.sql`](monitoring/db/init.sql) on first start. This file contains:
- All table schemas (routers, alerts, traffic_data, anomalies, predictions, reports, settings)
- Row Level Security (RLS) policies
- Sample / seed data
- The `anon` and `authenticated` Postgres roles PostgREST needs

The `gateway` container (Nginx) proxies requests from **`http://localhost:54321/rest/v1/`** to PostgREST so the existing Supabase client code in the frontend and pollers works unchanged.

## Running Only Specific Services

```bash
# Just the database + API gateway (useful if running the web app natively with npm run dev)
docker compose up db postgrest gateway

# Full stack without rebuilding the image
docker compose up
```

## Stopping & Cleaning Up

```bash
# Stop everything (keeps data volumes)
docker compose down

# Stop and wipe all data volumes (fresh start)
docker compose down -v
```

## Moving to Another Computer

1. Copy (or `git clone`) the repository.
2. Install Docker Desktop.
3. Run `docker compose up --build`.

All dependencies, the database schema, and seed data are self-contained inside Docker. No manual installation of Node.js, PostgreSQL, or Supabase CLI is required.
