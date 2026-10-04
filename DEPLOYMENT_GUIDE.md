# 🚀 ClaimDesk 100% Free Deployment Guide

This guide walks you through deploying the complete **ClaimDesk** system (Frontend, Backend API, ML Service, and PostgreSQL Database) using **100% free resources**.

---

## 📑 Summary of Free Services

| Component | Free Host | What to Deploy |
| :--- | :--- | :--- |
| **Database** | [Neon.tech](https://neon.tech) | Managed Serverless PostgreSQL (0.5 GB Free) |
| **ML Microservice** | [Hugging Face Spaces](https://huggingface.co) or [Render.com](https://render.com) | Python FastAPI Container (`ml-service/`) |
| **Backend API** | [Render.com](https://render.com) or [Koyeb.com](https://koyeb.com) | Node.js / Express API (`backend/`) |
| **Frontend** | [Vercel.com](https://vercel.com) | React + Vite + Tailwind SPA (`frontend/`) |

---

## Step 1: Push Code to GitHub

1. Create a new repository on [GitHub](https://github.com/new) named `claimdesk`.
2. Push your project to GitHub:
   ```bash
   cd C:\Users\tgbst\.gemini\antigravity\scratch\claimdesk
   git init
   git add .
   git commit -m "feat: complete claimdesk platform with cloud deployment support"
   git branch -M main
   git remote add origin https://github.com/<your-username>/claimdesk.git
   git push -u origin main
   ```

---

## Step 2: Set Up Free PostgreSQL Database (Neon.tech)

1. Sign up for a free account at [Neon.tech](https://neon.tech).
2. Click **Create Project** -> Name it `claimdesk-db`.
3. In the Neon dashboard, navigate to the **SQL Editor** tab.
4. Open [`database/neon_init.sql`](./database/neon_init.sql) from this project, copy all its contents, paste them into the Neon SQL Editor, and click **Run**.
   - *This creates all tables, enums, triggers, and demo seed data automatically.*
5. On your Neon Dashboard, copy your **Connection String** (Postgres URL):
   ```
   postgresql://username:password@ep-xyz.region.neon.tech/neondb?sslmode=require
   ```

---

## Step 3: Deploy ML Microservice (Hugging Face Spaces or Render)

### Option A: Hugging Face Spaces (Recommended — 16 GB Free RAM)
1. Sign up at [Hugging Face](https://huggingface.co).
2. Click **New Space** -> Space Name: `claimdesk-ml`.
3. Choose **Docker** as Space SDK (Blank).
4. In your repository or files, upload the contents of `ml-service/` (`Dockerfile`, `requirements.txt`, `src/`, `models/`).
5. Your Space will build and provide a public URL:
   `https://<your-username>-claimdesk-ml.hf.space`
6. Test it in your browser:
   `https://<your-username>-claimdesk-ml.hf.space/health`

---

## Step 4: Deploy Backend API (Render.com)

1. Sign up at [Render.com](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your `claimdesk` GitHub repository.
4. Configure the service:
   - **Name**: `claimdesk-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
5. Under **Environment Variables**, add:
   | Key | Value |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `DATABASE_URL` | *(Your Neon.tech Postgres connection string from Step 2)* |
   | `ML_SERVICE_URL` | `https://<your-username>-claimdesk-ml.hf.space/analyze` |
   | `JWT_SECRET` | *(Any secure random 32+ character string)* |
   | `CORS_ORIGIN` | `*` *(or update to your Vercel frontend URL after Step 5)* |
6. Click **Deploy Web Service**.
7. Once deployed, copy your backend URL (e.g., `https://claimdesk-backend.onrender.com`).
8. Verify health at `https://claimdesk-backend.onrender.com/health`.

---

## Step 5: Deploy Frontend (Vercel.com)

1. Sign up at [Vercel.com](https://vercel.com).
2. Click **Add New...** -> **Project** -> Import your `claimdesk` repository.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://claimdesk-backend.onrender.com` *(Your Render URL from Step 4)* |
5. Click **Deploy**.
6. Vercel will build and assign you a live HTTPS domain (e.g., `https://claimdesk-app.vercel.app`).

---

## 🎯 Verification Checklist

- [ ] **Frontend Loads**: Navigate to your Vercel URL.
- [ ] **Login & Auth**: Log in as claimant (`alice@demo.com` / `Demo1234!`) or officer (`bob@demo.com` / `Demo1234!`).
- [ ] **Policy Verification**: Go to **File Claim**, enter policy `AV-AUTO-00101`, and verify the card & restrictions load.
- [ ] **Claim Intake & ML Triage**: Submit a claim with documents; verify status transitions and ML priority flag.
- [ ] **Officer Review**: Log in as officer, view dashboard, update claim status to `under_review` or `approved`.
