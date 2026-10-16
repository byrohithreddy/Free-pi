# Free Pi

**A developer-first payment collection and verification platform built around UPI.**

Free Pi gives merchants a hosted payment flow and a dashboard for creating payment requests, sharing UPI payment instructions, collecting customer details and UTR references, and reviewing transaction status. Developers can integrate payment creation into their own applications using an API key.

> **Project status:** Free Pi is an independent project under active development. Payment confirmation currently relies on merchant review and customer-submitted UTR details; it is **not bank-side payment verification**. Review the security and deployment notes before using it with real transactions.

[Repository](https://github.com/byrohithreddy/Free-pi) · [Report a bug](https://github.com/byrohithreddy/Free-pi/issues)

---

## Contents

- [Product overview](#product-overview)
- [Capabilities](#capabilities)
- [How the payment flow works](#how-the-payment-flow-works)
- [Architecture](#architecture)
- [Technology stack](#technology-stack)
- [Repository layout](#repository-layout)
- [Getting started](#getting-started)
- [Configuration and secrets](#configuration-and-secrets)
- [Database setup](#database-setup)
- [Run locally](#run-locally)
- [Deploy to Cloudflare](#deploy-to-cloudflare)
- [API reference](#api-reference)
- [Integrating payment creation](#integrating-payment-creation)
- [Security and operational considerations](#security-and-operational-considerations)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Product overview

Free Pi is designed for merchants and developers who need a lightweight way to create UPI payment requests without building the entire customer-facing payment experience themselves.

It combines a merchant dashboard, a hosted customer payment page, and an HTTP API. A payment request generates a UPI intent URL and QR-code URL, and customers can submit a UTR (Unique Transaction Reference) after attempting payment. Merchants review the submitted information and confirm or reject the request from the dashboard.

Free Pi does not itself move money, act as a bank, or provide a payment-gateway settlement rail. UPI transfers take place in the customer's UPI app.

## Capabilities

### Merchant workspace
- Merchant registration and login.
- Dashboard metrics and recent transaction activity.
- Transaction search, status filtering, pagination, and detail views.
- Merchant profile settings.
- API credential viewing and regeneration.
- Analytics views for transaction and collection trends.

### Payment collection
- Create payment requests with an amount and order ID.
- Generate UPI intent links and a QR-code URL for the request.
- Hosted customer payment page with customer-detail collection.
- Capture customer-submitted UTR references.
- Confirm or reject pending requests from the merchant workflow.
- Confirm a pending request by matching a submitted UTR.
- Query an order's payment status.

### Developer integration
- REST-style JSON API.
- JWT authentication for dashboard operations.
- Secret API-key authentication for payment creation.
- Paginated and filterable transaction listing.
- Public endpoints for customer payment pages and status lookup.

## How the payment flow works

1. **Create a request.** A merchant creates a payment request in the dashboard or through the API.
2. **Share payment instructions.** Free Pi returns a transaction ID, a hosted payment URL, a UPI intent URL, and a QR-code URL.
3. **Customer pays externally.** The customer opens a supported UPI app and completes or attempts the transfer there.
4. **Customer submits a UTR.** The hosted page can collect customer details and the UTR reference.
5. **Merchant verifies the payment.** The merchant checks the payment in their own UPI/bank records and confirms or rejects the request in Free Pi.
6. **Check the result.** The merchant can inspect the transaction in the dashboard or query the order-status endpoint.

**Important:** A submitted UTR is information supplied by the customer, not proof that funds have settled. The current implementation does not independently query a bank or UPI provider to verify the transfer. Do not automatically deliver goods or services solely because a customer submitted a UTR or because a request exists.

## Architecture

    ┌──────────────────────────────┐
    │ Browser / Merchant Dashboard │
    │ React + TypeScript + Vite    │
    └──────────────┬───────────────┘
                   │ HTTPS / JSON API
                   ▼
    ┌──────────────────────────────┐
    │ Cloudflare Worker            │
    │ Routing · Auth · API logic   │
    └──────────────┬───────────────┘
                   │ D1 binding
                   ▼
    ┌──────────────────────────────┐
    │ Cloudflare D1                │
    │ SQLite-compatible database   │
    └──────────────────────────────┘

    Customer payment page → UPI intent / QR URL → Customer's UPI app

The repository contains a Vite single-page frontend and a Cloudflare Worker API. The Worker uses Cloudflare D1 for persistence and Web Crypto APIs for token signing, password hashing, API-key hashing, and transaction integrity hashes. QR-code images are currently served through an external QR-code service.

## Technology stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Routing and data fetching | Wouter, TanStack Query |
| UI | Tailwind CSS, Radix UI primitives, Recharts, Lucide |
| API | Cloudflare Workers, JavaScript modules |
| Database | Cloudflare D1 (SQLite) |
| Authentication | HMAC-SHA-256 JWT, PBKDF2-SHA-256 password hashing, API keys |
| Deployment | Cloudflare Pages and Cloudflare Workers |
| QR rendering | External QR Server API |

## Repository layout

    Free-pi/
    ├── frontend/
    │   ├── public/                 # Static assets and Pages routing files
    │   ├── src/
    │   │   ├── api-client-react/   # API client and generated request hooks
    │   │   ├── components/         # Layout, dialogs, and UI components
    │   │   ├── hooks/              # Shared React hooks
    │   │   ├── lib/                # Authentication and utilities
    │   │   ├── pages/              # Landing, dashboard, payments, settings, etc.
    │   │   ├── App.tsx             # Application routes and providers
    │   │   └── main.tsx            # Frontend entry point
    │   ├── package.json
    │   └── vite.config.ts
    ├── worker/
    │   ├── src/
    │   │   ├── routes/             # Auth, merchant, payment, public, status APIs
    │   │   ├── middleware/         # Request authentication
    │   │   ├── lib/                # Auth/crypto, D1 queries, response helpers
    │   │   └── index.js            # Worker entry point and routing
    │   ├── schema.sql              # D1 schema and indexes
    │   ├── wrangler.toml           # Worker and D1 configuration
    │   └── package.json
    └── README.md

## Getting started

### Prerequisites

- Node.js 18 or later (use a currently supported LTS release where possible).
- npm or pnpm.
- A Cloudflare account for remote D1 and deployment.
- Wrangler CLI for Worker and D1 commands.

Clone the repository:

    git clone https://github.com/byrohithreddy/Free-pi.git
    cd Free-pi

## Configuration and secrets

### Frontend

The frontend reads VITE_API_URL to configure the API base URL. Set it to your Worker URL for local or deployed environments.

Create frontend/.env.local:

    VITE_API_URL=http://127.0.0.1:8787

For a deployed frontend, use your HTTPS Worker URL instead. Values prefixed with VITE_ are bundled into browser code; **never put secrets in frontend environment variables**.

### Worker secrets

Set these using Wrangler secrets. Generate unique random values for each environment; do not reuse example values from documentation or commit secrets to Git.

| Secret | Purpose |
|---|---|
| JWT_SECRET | Signs and verifies JWTs |
| TRANSACTION_SECRET | Signs transaction integrity data |
| API_KEY_SECRET | Intended for API-key-related cryptographic operations |

Generate a high-entropy secret locally, for example:

    openssl rand -hex 32

Then, from the worker/ directory, set each secret:

    npx wrangler secret put JWT_SECRET
    npx wrangler secret put TRANSACTION_SECRET
    npx wrangler secret put API_KEY_SECRET

Wrangler prompts you to enter each value. Keep the values in a password manager or secure deployment secret store.

The Worker also uses the following non-secret variables in worker/wrangler.toml:

| Variable | Purpose |
|---|---|
| FRONTEND_URL | Expected frontend origin for CORS and hosted payment links |
| NODE_ENV | Runtime environment label |

Update FRONTEND_URL to your actual frontend origin before deploying. Do not assume the example domain is yours.

## Database setup

The Worker expects a D1 database bound as DB. The checked-in worker/wrangler.toml contains a database name and ID for the existing project configuration. For your own deployment, create or select a D1 database and update the binding to match it.

From worker/:

    npx wrangler login
    npx wrangler d1 create upi-payments

Copy the database ID returned by Wrangler into worker/wrangler.toml, retaining the binding name DB. Then apply the schema to the database you intend to use.

For a local development database:

    npx wrangler d1 execute upi-payments --local --file=./schema.sql

For a remote database:

    npx wrangler d1 execute upi-payments --remote --file=./schema.sql

Verify the tables:

    npx wrangler d1 execute upi-payments --local --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"

Use --remote instead of --local when checking the deployed database. Confirm the selected database and environment before executing schema changes.

## Run locally

### 1. Start the API

    cd worker
    npm install
    npx wrangler dev

Wrangler normally serves the local Worker at http://127.0.0.1:8787. Configure local bindings and secrets in your Wrangler development setup. Never copy production secrets into a shared or committed local configuration.

### 2. Start the frontend

In a second terminal:

    cd frontend
    npm install

Create frontend/.env.local with the local API URL shown above, then run:

    npm run dev

Vite prints the local frontend URL in the terminal.

### 3. Validate the frontend

    cd frontend
    npm run typecheck
    npm run build

The frontend package also provides npm run serve to preview a production build locally. These commands validate the frontend only; they do not replace API, security, or end-to-end testing.

## Deploy to Cloudflare

### Deploy the Worker

1. Configure the D1 database binding in worker/wrangler.toml.
2. Set FRONTEND_URL to the exact deployed frontend origin.
3. Apply worker/schema.sql to the intended remote D1 database.
4. Set the Worker secrets listed above.
5. Deploy:

       cd worker
       npm install
       npx wrangler deploy

Record the deployed Worker URL. Do not publish secret values in logs, issues, or repository files.

### Deploy the frontend

1. Set the Cloudflare Pages build root to frontend.
2. Set the build command to npm run build.
3. Set the build output directory to dist.
4. Set VITE_API_URL to the deployed Worker URL as a Pages build environment variable.
5. Deploy the project, then verify the frontend and API can communicate.

The repository includes Pages routing files in frontend/public/; verify they are present in the generated output and that direct navigation to client-side routes works after deployment.

### Smoke-test the API

Replace the URL with your deployed Worker URL:

    curl https://YOUR-WORKER-URL/api/healthz

Expected response:

    {"status":"ok"}

A successful health check confirms that the endpoint responds; it does not prove that database operations, authentication, payment workflows, or production security are correctly configured.

## API reference

All routes are prefixed as shown. Request and response bodies use JSON unless otherwise noted. Protected endpoints require a valid JWT in the Authorization: Bearer <token> header, except payment creation, which accepts JWT or an API key through X-API-Key.

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| GET | / | Public | API service information |
| GET | /api/healthz | Public | Health check |
| POST | /api/auth/register | Public | Register a merchant |
| POST | /api/auth/login | Public | Authenticate a merchant |
| GET | /api/auth/me | JWT | Get the current merchant profile |
| POST | /api/payments | JWT or API key | Create a payment request |
| GET | /api/payments | JWT | List transactions with filters and pagination |
| GET | /api/payments/:transactionId | JWT | Get transaction details |
| POST | /api/payments/:transactionId/confirm | JWT | Confirm a pending transaction |
| POST | /api/payments/:transactionId/reject | JWT | Reject a pending transaction |
| POST | /api/payments/confirm-by-utr | JWT | Confirm a pending transaction by UTR match |
| GET | /api/merchant/stats | JWT | Get merchant dashboard statistics |
| PUT | /api/merchant/profile | JWT | Update merchant profile |
| POST | /api/merchant/api-keys/regenerate | JWT | Rotate API credentials |
| GET | /api/public/payment/:transactionId | Public | Get hosted payment page data |
| POST | /api/public/payment/:transactionId/customer | Public | Submit customer details |
| POST | /api/public/payment/:transactionId/utr | Public | Submit a UTR reference |
| POST | /api/check-status | Public | Check status by order ID |

### Transaction statuses

- PENDING — created and awaiting merchant review.
- CONFIRMED — marked confirmed by the merchant workflow.
- REJECTED — rejected by the merchant workflow.

These are application-level statuses, not a direct representation of bank settlement states.

## Integrating payment creation

The following example creates a request using a secret API key. Replace the URL and credentials with your own deployment values.

    curl -X POST "https://YOUR-WORKER-URL/api/payments" \
      -H "Content-Type: application/json" \
      -H "X-API-Key: YOUR_SECRET_API_KEY" \
      -d '{
        "amount": 5000,
        "orderId": "ORDER-1001",
        "description": "Example order"
      }'

The amount field is expressed in **paise** (the smallest INR unit). For example, 5000 represents ₹50.00. The API validates the amount range; inspect the implementation and response schema before integrating it into a live application.

A successful response includes a transaction identifier, payment URL, UPI intent URL, QR-code URL, and initial status. Use the returned hosted payment URL to direct the customer to the payment page.

**Credential handling**
- Send the secret API key only from trusted server-side code.
- Never embed secret API keys in a browser bundle, mobile app, public repository, or client-side JavaScript.
- Rotate a compromised key and update the server-side integration immediately.
- Treat customer-provided UTRs and client-visible transaction statuses as untrusted until independently verified.

## Security and operational considerations

Free Pi includes several security-oriented mechanisms, but the presence of security code does not establish production readiness. Before processing real payments, review and test at least the following:

- **Rate limiting:** the current Worker includes an in-memory, per-isolate request counter. This is not a globally coordinated or durable rate limiter; configure and test platform-level protections for the expected traffic and abuse model.
- **CORS:** set FRONTEND_URL to the exact trusted origin and verify preflight and error responses. Avoid permissive wildcard origins in production.
- **Secrets:** configure strong, unique secrets for each environment and rotate them according to an operational policy.
- **Payment verification:** confirmation is merchant-driven and UTR-based; there is no bank-side verification integration in the current flow.
- **QR-code dependency:** QR images are requested from an external service. Consider the privacy, availability, and dependency implications of sending payment data to a third party.
- **Authentication and authorization:** test token expiry, key rotation, ownership checks, brute-force resistance, and access to every protected route.
- **Data protection:** customer details, transaction records, UTRs, and credentials require appropriate access controls, retention policies, and handling.
- **Monitoring and recovery:** configure useful logs, alerting, backups, and a tested database recovery procedure.
- **Production validation:** run end-to-end tests against isolated test data and perform a security review before relying on the system for business-critical workflows.

Do not describe the project as PCI-compliant, bank-verified, audited, or production-hardened unless those claims have been independently established.

## Troubleshooting

### Frontend requests fail with CORS errors
- Confirm VITE_API_URL points to the intended Worker.
- Confirm FRONTEND_URL exactly matches the frontend origin, including scheme and hostname.
- Redeploy the Worker after changing its configuration.
- Inspect the browser network panel and Worker logs for the actual failing request.

### API returns authentication errors
- Log in again if the JWT has expired or the signing secret changed.
- Confirm protected routes use Authorization: Bearer <token>.
- For payment creation with an API key, use X-API-Key from server-side code.
- If keys were regenerated, update any integration using the old secret key.

### D1 reports a missing table or database
- Confirm the DB binding and database ID in worker/wrangler.toml.
- Check whether you are using the local or remote database.
- Apply schema.sql to the same database that the Worker is configured to use.

### A payment remains pending
A request remains pending until the merchant workflow confirms or rejects it. A customer-submitted UTR does not automatically prove that the transfer reached the merchant's account.

## Contributing

Contributions, bug reports, and focused improvements are welcome.

1. Open an issue describing the problem or proposed change.
2. Keep changes scoped and explain their impact.
3. Run the frontend typecheck and production build for frontend changes.
4. Test API and database changes against an isolated development database.
5. Never include credentials, customer information, production data, or secret values in commits or issue reports.

Please include reproducible steps and relevant sanitized logs when reporting bugs.

---

## Project maturity

Free Pi is an independent software project under active development. Its dashboard and API provide a foundation for UPI payment-request workflows, but operational controls, independent payment verification, and production assurance must be evaluated separately before adoption in a business-critical environment.
