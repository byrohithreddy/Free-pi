# Free Pi — Cloudflare Deployment

Complete migration of the UPI Payment Orchestrator from Node.js/Express/PostgreSQL to Cloudflare's infrastructure.

## Architecture

| Component | Original | Cloudflare |
|-----------|----------|------------|
| **Frontend** | Vite + React (Replit) | **Cloudflare Pages** |
| **Backend API** | Express.js + Node.js | **Cloudflare Workers** |
| **Database** | PostgreSQL (Supabase) | **Cloudflare D1 (SQLite)** |
| **QR Codes** | `qrcode` npm (Node.js) | **External API** (api.qrserver.com) |
| **Auth/Crypto** | `jsonwebtoken` + Node `crypto` | **Web Crypto API** (HMAC SHA-256) |
| **Passwords** | `bcryptjs` | **`bcryptjs`** (pure JS, unchanged) |
| **Secrets** | `.env` file | **Wrangler Secrets** |

## Folder Structure

```
cloudflare-deployment/
├── worker/                    # Cloudflare Worker (API)
│   ├── wrangler.toml          # Worker configuration
│   ├── schema.sql             # D1 database schema
│   ├── package.json           # Dependencies
│   └── src/
│       ├── index.js           # Main fetch handler + routing
│       ├── lib/
│       │   ├── auth.js        # JWT, password hashing, API keys, UPI URLs
│       │   ├── db.js          # D1 database queries
│       │   └── utils.js       # Shared response helpers
│       ├── middleware/
│       │   └── auth.js        # JWT & API key authentication
│       └── routes/
│           ├── auth.js        # /api/auth/* routes
│           ├── payments.js    # /api/payments* routes
│           ├── merchant.js    # /api/merchant/* routes
│           ├── public.js      # /api/public/* routes
│           └── statusChecker.js # /api/check-status route
├── frontend/                  # Cloudflare Pages (Dashboard)
│   ├── public/
│   │   ├── _redirects         # SPA routing for Pages
│   │   └── _routes.json       # Pages routing config
│   └── build.bat              # Build helper script
└── README.md                  # This file
```

---

## Step-by-Step Deployment Instructions

### Prerequisites

- **Node.js** 18+ installed
- **npm** or **pnpm** installed
- A **Cloudflare account** (free tier works)

### Step 1: Install Wrangler CLI

```bash
npm install -g wrangler
```

### Step 2: Login to Cloudflare

```bash
wrangler login
```

This opens a browser window. Authorize Wrangler to access your Cloudflare account.

### Step 3: Create the D1 Database

```bash
cd cloudflare-deployment/worker
wrangler d1 create upi-orchestrator-db
```

This will output something like:

```
✅ Successfully created DB 'upi-orchestrator-db'

[[d1_databases]]
binding = "DB"
database_name = "upi-orchestrator-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**⚠️ IMPORTANT:** Copy the `database_id` value and update it in `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "upi-orchestrator-db"
database_id = "PASTE_YOUR_DATABASE_ID_HERE"
```

### Step 4: Run the Database Schema

```bash
wrangler d1 execute upi-orchestrator-db --file=./schema.sql
```

Verify the tables were created:

```bash
wrangler d1 execute upi-orchestrator-db --command="SELECT name FROM sqlite_master WHERE type='table';"
```

### Step 5: Set All Secrets

You must set these secrets manually. Generate secure random values for each:

```bash
# JWT secret for signing authentication tokens (use a random 64-char hex string)
wrangler secret put JWT_SECRET
# When prompted, enter your secret value, e.g.: bc2b63d007e7828e9d1d8512b869aad6d6b15683c1bad0647793f8301f7c1bee

# Transaction hash secret for payment integrity verification
wrangler secret put TRANSACTION_SECRET
# When prompted, enter your secret value, e.g.: 1931cc25007247bc10d9ab9ae440dda48c4a923cbcd146a4da64cd9416665c5b

# API key hashing secret
wrangler secret put API_KEY_SECRET
# When prompted, enter your secret value, e.g.: 068031c7f6a3328e86b8724798bb1821f0218297e5303557947b15ab427bcdf4
```

**To generate new random secrets:**

```bash
# On Linux/Mac:
openssl rand -hex 32

# On Windows PowerShell:
-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Max 256) })
```

### Step 6: Install Worker Dependencies

```bash
cd cloudflare-deployment/worker
npm install
```

### Step 7: Deploy the Worker

```bash
wrangler deploy
```

This will output your Worker URL, something like:

```
https://upi-orchestrator-api.YOUR_SUBDOMAIN.workers.dev
```

**Save this URL** — you'll need it for the frontend.

### Step 8: Update Frontend URL in Worker

Update `wrangler.toml` with your actual Pages URL:

```toml
[vars]
FRONTEND_URL = "https://your-project.pages.dev"
```

Then redeploy:

```bash
wrangler deploy
```

### Step 9: Build and Deploy the Frontend

#### Option A: Direct deploy via Wrangler (Recommended)

1. Navigate to the original dashboard and build it with the correct API URL:

```bash
cd artifacts/upi-dashboard

# Create/update .env with your Worker URL
echo VITE_API_URL=https://upi-orchestrator-api.YOUR_SUBDOMAIN.workers.dev > .env

# Install dependencies and build
pnpm install
pnpm run build
```

2. Copy the SPA routing files into the build output:

```bash
copy cloudflare-deployment\frontend\public\_redirects artifacts\upi-dashboard\dist\_redirects
copy cloudflare-deployment\frontend\public\_routes.json artifacts\upi-dashboard\dist\_routes.json
```

3. Deploy to Cloudflare Pages:

```bash
wrangler pages deploy artifacts/upi-dashboard/dist --project-name=upi-dashboard
```

#### Option B: Connect to Git (CI/CD)

1. Push your code to a GitHub/GitLab repository
2. Go to **Cloudflare Dashboard** → **Pages** → **Create a project**
3. Connect your repository
4. Set build settings:
   - **Build command:** `cd artifacts/upi-dashboard && npm install && npm run build`
   - **Build output directory:** `artifacts/upi-dashboard/dist`
   - **Environment variable:** `VITE_API_URL` = `https://upi-orchestrator-api.YOUR_SUBDOMAIN.workers.dev`

### Step 10: Verify Deployment

1. **Test the API:**
```bash
curl https://upi-orchestrator-api.YOUR_SUBDOMAIN.workers.dev/api/healthz
# Should return: {"status":"ok"}
```

2. **Test the Frontend:**
   - Open `https://upi-dashboard.pages.dev` in your browser
   - You should see the Free Pi login page

3. **Test Registration:**
```bash
curl -X POST https://upi-orchestrator-api.YOUR_SUBDOMAIN.workers.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","businessName":"Test Shop","upiId":"test@upi"}'
```

---

## Secrets Reference

| Secret | Purpose | How to Generate |
|--------|---------|----------------|
| `JWT_SECRET` | Signs JWT authentication tokens | `openssl rand -hex 32` |
| `TRANSACTION_SECRET` | HMAC key for transaction hash integrity | `openssl rand -hex 32` |
| `API_KEY_SECRET` | Used for API key operations | `openssl rand -hex 32` |

**Set each with:**
```bash
wrangler secret put SECRET_NAME
```

## Environment Variables (wrangler.toml `[vars]`)

| Variable | Purpose | Example |
|----------|---------|---------|
| `FRONTEND_URL` | Frontend URL for CORS and payment links | `https://upi-dashboard.pages.dev` |
| `NODE_ENV` | Environment mode | `production` |

---

## API Routes Reference

All routes are prefixed with `/api/` and behave identically to the original Express server.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | None | API info |
| GET | `/api/healthz` | None | Health check |
| POST | `/api/auth/register` | None | Register merchant |
| POST | `/api/auth/login` | None | Login |
| GET | `/api/auth/me` | JWT | Get current merchant |
| POST | `/api/payments` | JWT or API Key | Create payment |
| GET | `/api/payments` | JWT | List payments |
| GET | `/api/payments/:id` | JWT | Get payment details |
| POST | `/api/payments/:id/confirm` | JWT | Confirm payment |
| POST | `/api/payments/:id/reject` | JWT | Reject payment |
| POST | `/api/payments/confirm-by-utr` | JWT | Auto-confirm by UTR |
| GET | `/api/merchant/stats` | JWT | Dashboard statistics |
| PUT | `/api/merchant/profile` | JWT | Update profile |
| POST | `/api/merchant/api-keys/regenerate` | JWT | Regenerate API keys |
| GET | `/api/public/payment/:id` | None | Public payment page data |
| POST | `/api/public/payment/:id/utr` | None | Submit UTR proof |
| POST | `/api/check-status` | None | Check order status |

---

## Key Migration Changes

### What Changed
- **Express** → Single `fetch()` handler with URL pattern matching
- **PostgreSQL** → D1 SQLite (all `$1 $2` → `?` placeholders)
- **Drizzle ORM** → Raw SQL queries via D1 binding
- **Node.js `crypto`** → Web Crypto API (`crypto.subtle`, `crypto.getRandomValues`)
- **`jsonwebtoken`** → Manual JWT with HMAC SHA-256 via Web Crypto
- **`qrcode` npm** → External API: `https://api.qrserver.com/v1/create-qr-code/`
- **`process.env`** → `env` parameter from Worker fetch handler
- **`pino` logging** → `console.log`/`console.error` (Workers runtime)
- **`express-rate-limit`** → Removed (use Cloudflare's built-in rate limiting or WAF rules)

### What Did NOT Change
- All API request/response shapes are identical
- All business logic (UPI intent URLs, UTR matching, etc.)
- Frontend code (zero changes needed)
- Password hashing (`bcryptjs` — pure JS, works everywhere)
- Authentication flow (JWT + API key)

---

## Troubleshooting

### "Database not found" error
Make sure you updated the `database_id` in `wrangler.toml` after running `wrangler d1 create`.

### CORS errors from frontend
Ensure `FRONTEND_URL` in `wrangler.toml` matches your Pages domain. The worker allows `*` origin by default.

### "Invalid or expired token" after deployment
If you changed `JWT_SECRET`, all existing tokens become invalid. Users will need to log in again.

### Rate limiting
Express rate limiting has been removed. Use **Cloudflare WAF Rules** or **Rate Limiting Rules** in the Cloudflare dashboard for equivalent protection.
