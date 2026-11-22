# PetWise Backend (FastAPI + MongoDB)

REST API for PetWise. Python + FastAPI, MongoDB (NoSQL) through PyMongo, JWT login with bcrypt-hashed passwords.

## Project structure

```
backend/
├── app/
│   ├── main.py          # FastAPI app, CORS, routers; prepares the DB on startup
│   ├── config.py        # settings read from .env / environment variables
│   ├── database.py      # MongoDB connection, auto-increment ids, BaseEntity fields
│   ├── seed.py          # indexes, demo clinics, first admin (runs on every startup, safe to repeat)
│   ├── roles.py         # PET_OWNER / CLINIC_STAFF / ADMIN
│   ├── core/
│   │   ├── security.py  # password hashing, JWT tokens
│   │   └── deps.py      # current user + role checks
│   ├── schemas/         # request/response shapes (camelCase JSON)
│   └── routers/         # API endpoints
├── tests/               # pytest tests (fake in-memory MongoDB, never touch real data)
└── requirements.txt
```

## Database: collections

| Collection | From class diagram | Main fields |
|---|---|---|
| `users` | User, UserRole, Staff | full_name, email (unique), password_hash, role, clinic_id, department |
| `clinics` | Clinic / VeterinaryService / Schedule | name, city, opening_hours[], services[], appointment_duration_minutes |
| `pets` | Pet | owner_id → users, name, species, breed, age, weight_kg, image_url |
| `counters` | — | next id for each collection |

Every document has the BaseEntity fields: `_id`, `created_at`, `updated_at`, `status`.

## Setup

1. **Get a free MongoDB Atlas database** at https://www.mongodb.com/cloud/atlas.
   - Create a free (M0) cluster.
   - *Database Access*: add a database user.
   - *Network Access*: add `0.0.0.0/0` (allow from anywhere, needed for the online server).
   - *Connect → Drivers → Python*: copy the connection string.
2. **Create `backend/.env`**: copy `.env.example` and paste the connection string into `MONGODB_URL`.
3. **Install packages** (PowerShell, in the `backend` folder):
   ```powershell
   python -m venv .venv
   .venv\Scripts\python -m pip install -r requirements.txt
   ```

## Run locally

```powershell
.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
```

On first start the server creates the demo clinics and the admin account from `.env`.

- API docs (try every endpoint in the browser): http://localhost:8000/docs
- Then start the React app from the project root with `npm run dev`.

## Tests

```powershell
.venv\Scripts\python -m pytest -q
```

## Put it online (Render, free)

The repo has a `render.yaml` at the root.

1. Sign in at https://render.com with GitHub.
2. *New → Blueprint* → choose the `petwise` repository → Render reads `render.yaml`.
3. When asked, fill in `MONGODB_URL` (your Atlas string), `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
4. After deploy, open `https://<your-service>.onrender.com/api/health`. It should show `{"status":"ok"}`.

Free Render services sleep after 15 minutes without traffic. The first request after that takes
about a minute while it wakes up, so open the site a minute before a demo.

## API (module 1: authentication, users, clinics, pets)

| Method | Path | Who | What |
|---|---|---|---|
| POST | `/api/auth/register` | anyone | Sign up as `PET_OWNER` or `CLINIC_STAFF` (not `ADMIN`) |
| POST | `/api/auth/login` | anyone | Returns `{ accessToken, user }` |
| GET | `/api/auth/me` | logged in | Current user (server is the source of truth for the role) |
| PUT | `/api/auth/me` | logged in | Update own name / email / phone (not role) |
| GET | `/api/users` | admin | List all users |
| POST | `/api/users` | admin | Create a user of any role |
| PATCH | `/api/users/{id}` | admin | Change role, clinic, department, status |
| DELETE | `/api/users/{id}` | admin | Delete a user (and their pets) |
| GET | `/api/clinics` | anyone | List clinics (needed by the sign-up page) |
| GET | `/api/clinics/{id}` | anyone | One clinic |
| POST | `/api/clinics` | admin | Create clinic |
| PUT | `/api/clinics/{id}` | admin | Update clinic |
| GET | `/api/pets` | logged in | My pets only |
| POST | `/api/pets` | logged in | Add a pet (owner = the logged-in user) |
| GET | `/api/pets/{id}` | owner / admin | One pet (403 for anyone else) |
| PUT | `/api/pets/{id}` | owner / admin | Update a pet |
| DELETE | `/api/pets/{id}` | owner / admin | Delete a pet |

Send the token on protected calls as the header `Authorization: Bearer <accessToken>`.
