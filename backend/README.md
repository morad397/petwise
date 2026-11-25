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
| `vaccinations` | VaccinationRecord | pet_id, vaccine_name, date_administered, next_due_date, veterinarian |
| `treatments` | TreatmentRecord | pet_id, kind (VET_VISIT / MEDICATION), diagnosis, treatment_date, medication, appointment_id |
| `weights` | WeightRecord | pet_id, weight_kg, recorded_date |
| `reminders` | Reminder | user_id, pet_id, type, title, due_date, is_completed, source (set when created automatically) |
| `products` | Product / Category | name, category, price, stock_quantity, image_url, status |
| `carts` | Cart / CartItem | _id = user id, items [{product_id, quantity}] |
| `orders` | Order / OrderItem / Address | user_id, items (copied at order time), total_amount, payment_method, payment_status, status, shipping_address |
| `posts` | CommunityPost / Like | author_id, content, media_url, hashtags, liked_by [user ids], bookmarked_by, comment_count |
| `comments` | Comment | post_id, author_id, content |
| `post_reports` | — | post_id, reported_by, reason |
| `schedule_blocks` | Schedule | clinic_id, date, time, reason (times staff blocked) |
| `appointments` | Appointment | user_id, pet_id, clinic_id, service, appointment_date, appointment_time, status, suggested_date/time, staff_note |
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

### Module 2: medical records, reminders, appointments

| Method | Path | Who | What |
|---|---|---|---|
| GET/POST | `/api/pets/{id}/vaccinations` | owner, admin, clinic staff* | List / add vaccinations (a next due date creates a reminder) |
| PUT/DELETE | `/api/pets/{id}/vaccinations/{recordId}` | owner, admin, staff who added it | Change / delete |
| GET/POST | `/api/pets/{id}/treatments` | owner, admin, clinic staff* | Vet visits and medications |
| PUT/DELETE | `/api/pets/{id}/treatments/{recordId}` | owner, admin, staff who added it | Change / delete |
| GET/POST | `/api/pets/{id}/weights` | owner, admin, clinic staff* | Weight entries (pet weight follows the newest) |
| PUT/DELETE | `/api/pets/{id}/weights/{recordId}` | owner, admin, staff who added it | Change / delete |
| GET/POST | `/api/reminders` | logged in | My reminders / add one |
| PUT/DELETE | `/api/reminders/{id}` | owner of the reminder | Change / delete |
| POST | `/api/reminders/{id}/complete` | owner of the reminder | Mark done |
| POST | `/api/reminders/{id}/snooze` | owner of the reminder | Move later by N minutes |
| GET | `/api/clinics/{id}/slots?date=YYYY-MM-DD` | anyone | Free times (no double booking) |
| GET | `/api/appointments` | logged in | Owner: own · staff: own clinic · admin: all |
| POST | `/api/appointments` | pet owner | Book (status PENDING) |
| PUT | `/api/appointments/{id}` | pet owner | Change request (back to PENDING) |
| POST | `/api/appointments/{id}/cancel` | pet owner | Cancel |
| POST | `/api/appointments/{id}/accept-suggestion` | pet owner | Accept the clinic's suggested time |
| POST | `/api/appointments/{id}/status` | staff of that clinic, admin | CONFIRMED / REJECTED / RESCHEDULE_REQUESTED / IN_PROGRESS / COMPLETED |
| GET | `/api/staff/patients` | clinic staff | Pets with appointments at my clinic |
| GET | `/api/staff/schedule?date=YYYY-MM-DD` | clinic staff | My clinic's slots that day: free / booked / blocked |
| POST | `/api/staff/schedule/blocks` | clinic staff | Block a time (owners can no longer book it) |
| DELETE | `/api/staff/schedule/blocks/{id}` | clinic staff | Reopen a blocked time |

\* clinic staff only for pets that have an appointment at their own clinic.

### Module 4: shop, orders, community

| Method | Path | Who | What |
|---|---|---|---|
| GET | `/api/products` | anyone | Active products (`?include_hidden=true` for admin lists) |
| POST/PUT/DELETE | `/api/products[/{id}]` | admin | Manage products and stock |
| GET | `/api/cart` | logged in | My cart with current prices, total and stock |
| PUT | `/api/cart/items/{productId}` | logged in | Add / set quantity (refused above stock) |
| DELETE | `/api/cart/items/{productId}` · `/api/cart` | logged in | Remove an item / empty the cart |
| POST | `/api/orders` | logged in | Place order: re-checks stock, takes it, empties cart |
| GET | `/api/orders[/{id}]` | logged in | My orders (admin: all) |
| POST | `/api/orders/{id}/cancel` | order owner | Cancel while PROCESSING (stock back, refund) |
| POST | `/api/orders/{id}/status` | admin | SHIPPED / DELIVERED / CANCELLED |
| GET/POST | `/api/posts` | logged in | Feed (`?hashtag=`, `?saved=true`) / new post |
| PUT | `/api/posts/{id}` | author | Edit |
| DELETE | `/api/posts/{id}` | author, admin | Delete (with its comments) |
| POST | `/api/posts/{id}/like` · `/bookmark` · `/report` | logged in | Toggle like / save, report |
| GET/POST | `/api/posts/{id}/comments` | logged in | Comments |
| DELETE | `/api/comments/{id}` | author, admin | Delete a comment |

Payment is simulated (test environment): "TEST_PAYMENT" is marked paid with a fake reference,
"CASH_ON_DELIVERY" is paid on delivery. No card details are collected or stored.

Appointment flow: `PENDING` → `CONFIRMED` (owner gets a reminder) → `IN_PROGRESS` → `COMPLETED`
(saved as a vet visit in the pet's history). Staff can also `REJECTED` or suggest a new time
(`RESCHEDULE_REQUESTED`), which the owner accepts. Owners can cancel while it is open.

Send the token on protected calls as the header `Authorization: Bearer <accessToken>`.
