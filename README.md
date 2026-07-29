# LifeLedger

**Organize Your Life. Track What Matters. Never Miss a Deadline.**

LifeLedger is a full-stack SaaS-style personal life administration platform. It lets you securely track every record with an expiry or renewal date — passports, driving licenses, insurance policies, warranties, rental agreements, subscriptions, memberships, certificates, bills, and appliance service records — in one place, with smart reminders, a document vault, and a live dashboard.

---

## Features

- **Landing page** — hero, features, benefits, and CTA sections
- **Authentication** — register, login, JWT-protected sessions, forgot-password UI
- **Dashboard** — live stat cards, category breakdown, Action Center, upcoming expiries, recent activity feed
- **Life Items CRUD** — title, category, description, provider, dates, cost, reminders, notes
- **Document Vault** — upload, view, download, delete documents per record, plus a global vault view
- **Dynamic status engine** — Active / Expiring Soon / Expired computed live from expiry dates
- **Action Center** — Needs Immediate Attention / Due This Week / Upcoming / Everything Good
- **Search, filter & sort** — by title, provider, category, status, and date
- **Calendar view** — month grid showing every expiry date
- **Notifications** — unread/read, mark as read, mark all read, delete
- **Activity log** — every create/update/delete/upload is recorded
- **Settings** — profile, password change, notification preferences, account deletion
- **Security** — bcrypt password hashing, JWT auth, per-user data isolation, input validation, file-type/size validation

---

## Tech Stack

**Frontend:** React 18, React Router 6, Axios, Context API, react-hot-toast, lucide-react, Vite

**Backend:** Node.js, Express.js, JWT, bcrypt, multer, express-validator, dayjs, uuid

**Database:** MySQL 8 (via `mysql2`)

---

## Architecture

```
lifeledger/
├── client/                # React frontend (Vite)
│   └── src/
│       ├── components/    # Reusable UI components (common, layout, dashboard, lifeItems, documents)
│       ├── context/       # AuthContext (global auth state)
│       ├── hooks/         # useDebounce, etc.
│       ├── layouts/       # AuthLayout, DashboardLayout
│       ├── pages/         # Route-level pages
│       ├── services/      # Axios API service modules
│       └── utils/         # Formatting helpers
├── server/                # Express backend
│   ├── config/            # MySQL pool
│   ├── controllers/       # Route handler logic
│   ├── middleware/        # auth, upload, validation, error handling
│   ├── routes/            # Express routers
│   ├── utils/             # Activity logger, status/reminder calculator
│   └── uploads/documents/ # Uploaded files (gitignored)
├── database/
│   ├── schema.sql         # Full normalized schema
│   └── seed.sql           # Default categories
├── .env.example
└── README.md
```

React communicates with the backend **only** through REST APIs — it never touches MySQL directly.

---

## Database Schema

| Table | Purpose |
|---|---|
| `users` | Accounts, credentials, notification preferences |
| `categories` | System defaults + user-created custom categories |
| `life_items` | Core tracked records (passport, insurance, etc.) |
| `documents` | Uploaded files attached to a life item |
| `reminders` | Scheduled reminder dates per life item |
| `notifications` | In-app notification feed |
| `activity_logs` | Audit trail of every user action |

All tables use UUID primary keys, foreign keys with cascading deletes, indexes on frequently-queried columns, and `created_at` / `updated_at` timestamps.

---

## Installation

### Prerequisites
- Node.js 18+
- MySQL 8+

### 1. Clone and set up the database
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### 2. Backend
```bash
cd server
npm install
cp .env.example .env   # then edit DB credentials and JWT_SECRET
npm run dev             # starts on http://localhost:5000
```

### 3. Frontend
```bash
cd client
npm install
npm run dev              # starts on http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` requests to `http://localhost:5000` (see `client/vite.config.js`), so no separate client `.env` is required in development.

---

## Environment Variables

See `server/.env.example`:

| Variable | Description |
|---|---|
| `PORT` | Backend port (default 5000) |
| `CLIENT_URL` | Frontend origin, used for CORS |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | MySQL connection |
| `JWT_SECRET` | Secret used to sign JWTs — must be long and random in production |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `7d`) |
| `UPLOAD_DIR` | Directory for uploaded documents |
| `MAX_FILE_SIZE_MB` | Max upload size per file |

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in, receive JWT |
| GET | `/api/auth/me` | Current authenticated user |
| POST | `/api/auth/logout` | Log out (client discards token) |

### Life Items
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/life-items` | List (supports `q`, `category`, `status`, `sort`, `page`, `limit`) |
| GET | `/api/life-items/:id` | Get one item with its documents |
| POST | `/api/life-items` | Create |
| PUT | `/api/life-items/:id` | Update |
| DELETE | `/api/life-items/:id` | Soft delete |

### Categories
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/categories` | System + user categories |
| POST | `/api/categories` | Create custom category |
| DELETE | `/api/categories/:id` | Delete a custom category |

### Documents
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/documents?lifeItemId=` | List documents |
| POST | `/api/documents` | Upload (`multipart/form-data`) |
| GET | `/api/documents/:id/download` | Download a file |
| DELETE | `/api/documents/:id` | Delete a document |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/stats` | Counts, Action Center, upcoming expiries, category breakdown, recent activity |

### Notifications
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications?status=` | List (`unread`/`read`) |
| PUT | `/api/notifications/:id/read` | Mark one as read |
| PUT | `/api/notifications/read-all` | Mark all as read |
| DELETE | `/api/notifications/:id` | Delete |

### Activity
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/activity` | Paginated activity feed |

### Users / Settings
| Method | Endpoint | Description |
|---|---|---|
| PUT | `/api/users/profile` | Update name/phone |
| PUT | `/api/users/password` | Change password |
| PUT | `/api/users/preferences` | Update notification preferences |
| DELETE | `/api/users/account` | Permanently delete account |

All routes except `/api/auth/register` and `/api/auth/login` require `Authorization: Bearer <token>`.

---

## Security

- Passwords hashed with **bcrypt** (12 salt rounds)
- **JWT** authentication on every protected route
- Every query is scoped to `req.user.id` — users can only ever access their own data
- **express-validator** input validation on all write endpoints
- Parameterized SQL queries throughout (no string concatenation) — prevents SQL injection
- File uploads restricted by MIME type (PDF/JPG/PNG/WEBP) and size (`MAX_FILE_SIZE_MB`)
- Secrets and credentials kept in `.env`, never committed or hard-coded

---

## Future Improvements

- Real email delivery for reminders (currently reminder rows are created but not dispatched)
- Refresh tokens / silent re-authentication
- Role-based sharing of records (e.g. with family members)
- Recharts-based analytics on spend and category trends
- Server-driven push notifications
- Automated background job to promote `reminders` into `notifications`

