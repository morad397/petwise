# PetWise

Pet-care platform: final project, Software Engineering, Kinneret Academic College.

- **Frontend:** React + Vite (this folder), hosted on Vercel (https://petwise-delta.vercel.app) and GitHub Pages
- **Backend:** Python FastAPI ([backend/](backend/README.md)), hosted on Render
- **Database:** MongoDB Atlas (NoSQL, cloud)

```
Browser ──> GitHub Pages (React) ──> Render (FastAPI) ──> MongoDB Atlas
```

## Run locally

1. Backend (one-time setup in [backend/README.md](backend/README.md)):
   ```powershell
   cd backend
   .venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
   ```
2. Frontend (second terminal, this folder):
   ```powershell
   npm install
   npm run dev
   ```
3. Open http://localhost:5173/petwise/

Locally the frontend calls `http://localhost:8000/api` (`.env.development`).

## Put it online

1. Deploy the backend to Render (steps in [backend/README.md](backend/README.md)).
2. Put the Render URL in `.env.production` (`VITE_API_URL=https://<service>.onrender.com/api`).
3. Publish the frontend to GitHub Pages:
   ```powershell
   npm run deploy
   ```
4. Open https://morad397.github.io/petwise/

## Progress (step 2: backend + API integration)

| Module | Status |
|---|---|
| 1. Authentication, roles, users, clinics, pets | Connected to MongoDB |
| 2. Medical records, reminders, appointments | Connected to MongoDB |
| 3. Clinic staff views | Appointments + patients connected; schedule blocking still local |
| 4. Shop, orders, community | Still localStorage |
| 5. Admin analytics, AI, notifications | Still localStorage |
