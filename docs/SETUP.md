# ClaimDesk — Setup Guide
## AV Insurance · Local Development

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Docker Desktop | 4.x+ | https://docker.com/products/docker-desktop |
| Node.js | 20 LTS | https://nodejs.org |
| Python | 3.11+ | https://python.org (for ML training) |
| Git | any | https://git-scm.com |

---

## Quick Start

### 1. Clone and configure environment

```powershell
cd C:\Users\tgbst\.gemini\antigravity\scratch\claimdesk
Copy-Item .env.example .env
```

`.env` defaults work out-of-the-box for local development. No changes required.

---

### 2. Fix Rollup / Vite native binary (Windows-only, one-time fix)

If you see `An Application Control policy has blocked this file` when running `npm run dev`:

```powershell
# Option A — Re-install with clean npm cache (most common fix)
cd frontend
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install

# Option B — Use --ignore-scripts flag
npm install --ignore-scripts

# Option C — If AppLocker/Windows Defender is blocking .node files,
# run the terminal as Administrator OR add an exclusion for the project folder
# in Windows Security > Virus & threat protection > Exclusions
```

---

### 3. Start the database and ML service via Docker

```powershell
docker compose up -d db adminer ml-service
```

Wait ~15 seconds for PostgreSQL to finish seeding.

Check services:
```powershell
docker compose ps
# All services should show "healthy"
```

Access Adminer (DB UI): http://localhost:8080
- Server: `db`
- Username: `postgres`
- Password: `postgres_dev_123`
- Database: `claimdesk`

---

### 4. Train the ML model (first time only, ~2 minutes)

```powershell
# Install Python dependencies
pip install -r ml-service/requirements.txt

# Generate synthetic dataset and train XGBoost model
python scripts/download_dataset.py
python scripts/train_model.py

# Expected output:
# AUC-ROC: 0.XX | F1: 0.XX | Model saved to ml-service/models/
```

---

### 5. Start the backend

```powershell
cd backend
npm install   # if not already done
npm run dev
# → Backend running on http://localhost:4000
```

Test: http://localhost:4000/health

---

### 6. Start the frontend

```powershell
cd frontend
npm install   # if not already done
npm run dev
# → Frontend running on http://localhost:5173
```

---

## Demo Accounts

All passwords: `Demo1234!`

| Role | Email | Can do |
|---|---|---|
| **Claimant** | alice@demo.com | File claims, view own claims, view status history |
| **Officer** | bob@demo.com | Review assigned claims, add notes, change status |
| **Officer** | carol@demo.com | Review assigned claims |
| **Supervisor** | dave@demo.com | All officer actions + close/reopen claims |

---

## Policy Numbers (for New Claim form)

| Policy Number | Type | Coverage |
|---|---|---|
| `AV-AUTO-00101` | 🚗 Automobile | \$50,000 (Alice's policy) |
| `AV-AUTO-00102` | 🚗 Automobile | \$75,000 |
| `AV-AUTO-00103` | 🚗 Automobile | \$30,000 |
| `AV-HLTH-00201` | 🏥 Health | \$100,000 (Alice's policy) |
| `AV-HLTH-00202` | 🏥 Health | \$250,000 |
| `AV-HLTH-00203` | 🏥 Health | \$150,000 (**inactive** — use to test inactive policy UX) |

---

## API Reference

Base URL: `http://localhost:4000`

### Auth
```
POST /auth/register   { email, password, full_name, role }
POST /auth/login      { email, password }
POST /auth/logout
```

### Policies
```
GET /policies?search=AV-AUTO-00101
GET /policies/:id
```

### Claims
```
GET  /claims                      (role-filtered)
GET  /claims/:id
POST /claims                      (multipart/form-data)
PATCH /claims/:id
DELETE /claims/:id
PATCH /claims/:id/status          { status, reason? }
```

### Notes & Events
```
GET  /claims/:id/notes
POST /claims/:id/notes            { content }
GET  /claims/:id/events
```

### FX Reference
```
GET /fx/convert?base=USD&target=INR&amount=10000
```

### ML Service (direct)
```
POST http://localhost:8000/analyze
{ policy_type, claim_amount, coverage_amount, injury_severity,
  incident_type OR treatment_type, description }
```

---

## State Machine

```
submitted → under_review → approved → closed
                        → rejected → closed
closed → submitted  (supervisor only — reopen)
```

---

## Full Docker Stack (optional — builds all services)

```powershell
# Build ML model first (required before docker compose up)
python scripts/train_model.py

docker compose up --build
# → All services on their respective ports
```

---

## Troubleshooting

| Issue | Fix |
|---|---|
| `Application Control policy blocked` | See Step 2 above — Windows AppLocker is blocking Rollup native binary |
| `pg_isready` not healthy | Wait 30s and retry — PostgreSQL is seeding |
| ML service unhealthy | Run `python scripts/train_model.py` first to generate model files |
| 401 Unauthorized | Token expired — logout and login again |
| CORS error | Check `CORS_ORIGIN` in `.env` matches your frontend URL |
