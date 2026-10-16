# Free Pi — UPI Payment Collection & Merchant Operations

<div align="center">

![Free Pi Banner](https://img.shields.io/badge/FREE%20PI-UPI%20Payment%20Operations-09090b?style=for-the-badge&logo=upi)

**Developer-First UPI Payment Requests, Hosted Checkout & Merchant Verification Workflow**

[![Platform](https://img.shields.io/badge/Platform-Cloudflare%20Workers-f38020?style=flat-square&logo=cloudflare)](https://workers.cloudflare.com/)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-3178c6?style=flat-square&logo=react)](https://react.dev/)
[![Build](https://img.shields.io/badge/Build-Vite-646cff?style=flat-square&logo=vite)](https://vite.dev/)
[![Database](https://img.shields.io/badge/Database-Cloudflare%20D1-faad3f?style=flat-square&logo=cloudflare)](https://developers.cloudflare.com/d1/)
[![License](https://img.shields.io/badge/License-Proprietary%20%2F%20All%20Rights%20Reserved-crimson?style=flat-square)](#-license--intellectual-property)

[Live Application](https://free-pi.pages.dev) • [API Endpoint](https://api.free-pi.pages.dev) • [Overview](#-overview) • [Architecture](#-system-architecture) • [Features](#-key-capabilities) • [API Surface](#-api-surface) • [Security](#-security--operational-boundaries) • [License](#-license--intellectual-property)

</div>

---

## 📌 Overview

**Free Pi** is a developer-oriented UPI payment-request and merchant operations platform. It combines a merchant dashboard, a hosted customer payment page, and a JSON API so applications can create payment requests without implementing the entire customer-facing workflow themselves.

Free Pi generates UPI intent instructions and QR-code URLs, captures customer details and customer-submitted UTR references, and gives merchants a place to review, confirm, or reject requests. The dashboard also provides transaction search, status filtering, analytics, profile management, and API credential controls.

The application is built around a serverless architecture using **React, TypeScript, Vite, Cloudflare Workers, and Cloudflare D1**.

> **Important payment boundary:** Free Pi is a payment-request and tracking tool, not a bank or payment processor. The current workflow does not independently verify bank settlement or query a UPI provider. A customer-submitted UTR is not proof that funds have reached the merchant. Merchants must independently verify the transfer before fulfilling an order.

---

## 🏛️ System Architecture

Free Pi uses a browser-based merchant interface connected to a Cloudflare Worker API, with Cloudflare D1 providing relational persistence.

```text
                    ┌─────────────────────────────────────┐
                    │         Free Pi Web Client          │
                    │      React + TypeScript + Vite      │
                    └──────────────────┬──────────────────┘
                                       │ HTTPS / JSON
                                       ▼
                    ┌─────────────────────────────────────┐
                    │       Cloudflare Worker API         │
                    │ Routing · Authentication · Logic   │
                    └──────────────────┬──────────────────┘
                                       │ D1 binding
                                       ▼
                    ┌─────────────────────────────────────┐
                    │          Cloudflare D1              │
                    │   Merchants · Transactions · Indexes│
                    └─────────────────────────────────────┘

       Hosted customer payment page
                    │
                    ├── UPI intent URL ──► Customer's UPI application
                    │
                    └── QR-code URL ─────► External QR rendering service
```

### 1. Frontend Application
The frontend is a single-page React application built with TypeScript and Vite. Wouter provides client-side routing, TanStack Query manages server-state requests, and reusable UI components support the dashboard and transaction workflows.

### 2. Serverless API Layer
The Worker entry point routes requests to dedicated modules for authentication, payment operations, merchant management, public payment pages, and order-status lookup. Shared utilities handle responses, cryptographic operations, and D1 queries.

### 3. Persistence Layer
Cloudflare D1 stores merchant profiles and payment transactions. The schema defines merchant and transaction records with indexes for merchant/status/date filtering, transaction IDs, order IDs, and UTR references.

### 4. External Payment Experience
Free Pi creates UPI intent URLs and uses an external QR-code service to render payment QR codes. The actual money transfer happens in the customer's UPI application; Free Pi does not hold or settle funds.

---

## 🔐 Security & Authentication Architecture

Free Pi implements authentication and credential-handling mechanisms appropriate to its current application design. These controls should not be interpreted as a completed independent security audit or a guarantee of production readiness.

- **JWT sessions:** The API issues HMAC-SHA-256 signed JWTs for authenticated merchant sessions. Tokens have a seven-day expiry in the current implementation.
- **Password hashing:** Passwords are hashed with PBKDF2-SHA-256 using a generated salt and 100,000 iterations.
- **API credentials:** Public and secret API keys are generated for merchants. API-key authentication supports payment creation.
- **Secret-key storage:** API secret keys are stored as hashes rather than retained as plaintext in the merchant record.
- **Credential rotation:** Merchants can regenerate API credentials. Integrations using a replaced secret key must be updated.
- **Parameterized SQL:** D1 queries use bound parameters for data values rather than directly concatenating user-provided values into SQL.
- **Transport and response headers:** The Worker redirects non-local HTTP requests to HTTPS and applies configured CORS and several browser security headers.

### Authentication Model

| Operation | Authentication |
|---|---|
| Merchant registration and login | Public endpoint |
| Current merchant profile | JWT |
| Dashboard payment listing and details | JWT |
| Confirm or reject a payment | JWT |
| Merchant statistics and profile updates | JWT |
| API credential regeneration | JWT |
| Create a payment request | JWT or API key |
| Hosted payment page data | Public transaction endpoint |
| Customer details and UTR submission | Public transaction endpoint |
| Order-status lookup | Public endpoint |

### Operational Security Notes

- Configure strong, unique Worker secrets for every environment.
- Keep secret API keys on trusted servers; never embed them in browser code or public repositories.
- Restrict CORS to the intended frontend origin.
- Review the in-memory per-isolate rate limiter before relying on it for abuse prevention; it is not a globally coordinated rate-limiting system.
- Validate merchant ownership and authorization paths as part of security testing.
- Do not treat customer-supplied UTR data or application status as independent evidence of payment settlement.

---

## 🔁 Payment Request & Verification Workflow

```text
  [ Merchant Dashboard / Integrating Server ]
                      │
                      ▼
            [ Create Payment Request ]
                      │
                      ▼
       [ Transaction + UPI Intent + QR URL ]
                      │
                      ▼
           [ Hosted Customer Payment Page ]
                      │
          ┌───────────┴────────────┐
          ▼                        ▼
 [ Customer Details ]      [ UPI App / QR Payment ]
                                   │
                                   ▼
                         [ Customer Submits UTR ]
                                   │
                                   ▼
                       [ Merchant Reviews Records ]
                                   │
                         ┌─────────┴─────────┐
                         ▼                   ▼
                    [ CONFIRMED ]        [ REJECTED ]
```

1. **Request creation:** The merchant creates a payment request from the dashboard or through the API.
2. **Payment instructions:** Free Pi returns a transaction identifier, hosted payment URL, UPI intent URL, and QR-code URL.
3. **Customer interaction:** The customer opens the hosted page, views the payment instructions, and can submit customer details.
4. **UTR submission:** The customer can submit a UTR reference associated with the attempted transfer.
5. **Merchant review:** The merchant reviews the transaction and evidence available through their own bank or UPI app.
6. **Status update:** The merchant confirms or rejects the pending transaction in Free Pi. A matching UTR can also be used by the application workflow to locate a pending transaction.
7. **Status lookup:** Integrating applications can query the status of an order.

**Verification limitation:** UTR matching is a workflow convenience, not bank verification. The application does not currently confirm transactions through a bank API, UPI provider webhook, or settlement reconciliation service.

---

## ✨ Key Capabilities

### 1. Merchant Operations Dashboard
- Dashboard statistics and recent transaction activity.
- Transaction detail views.
- Status-aware transaction monitoring.
- Merchant profile settings.
- Payment request creation from the dashboard.

### 2. Transaction Management
- Paginated transaction listings.
- Search across transaction, order, customer, email, and UTR fields.
- Filtering by pending, confirmed, and rejected status.
- Confirmation and rejection actions for pending transactions.
- Transaction details and timestamps.

### 3. Hosted UPI Payment Experience
- Hosted payment page per transaction.
- UPI intent URL generation.
- QR-code URL generation.
- Customer detail collection.
- UTR reference submission.
- Public order-status lookup.

### 4. Developer API
- JSON-based HTTP API.
- JWT-authenticated merchant operations.
- API-key authentication for payment creation.
- Transaction creation and retrieval.
- Status update operations.
- Merchant statistics and profile endpoints.

### 5. Analytics & Reporting Views
- Merchant-level transaction statistics.
- Confirmed collection and transaction status metrics.
- Collection growth calculations.
- Analytics views and charts for transaction activity.

---

## ⚙️ Transaction Rules & Business Logic

| Area | Current Application Behavior |
|---|---|
| Transaction identity | Each transaction receives a generated transaction ID and is associated with a merchant. |
| Amount representation | API amounts are represented in paise; ₹50.00 is 5,000 paise. |
| Initial state | New payment requests start with the PENDING status. |
| Confirmation | A pending transaction can be confirmed through the authenticated merchant workflow. |
| Rejection | A pending transaction can be rejected through the authenticated merchant workflow. |
| Processed transactions | Confirm/reject operations reject transactions that are no longer pending. |
| UTR matching | The application can locate a pending transaction for a merchant using a submitted UTR. |
| Merchant isolation | Merchant-scoped queries are used for transaction listing and merchant transaction operations. |
| Public customer flow | Public payment endpoints expose transaction-specific payment-page operations without a merchant dashboard session. |
| Status lookup | A public endpoint can check transaction status using an order ID. |
| Integrity metadata | The transaction model includes a transaction hash generated from transaction-related fields and a configured secret. |
| QR generation | QR images are delivered through an external QR-code service. |

These rules describe application behavior, not a guarantee of settlement, fraud detection, or payment-provider certification.

---

## 🗄️ Database Schema & Data Model

Free Pi uses Cloudflare D1, a SQLite-compatible relational database. The current schema centers on merchant identity and transaction lifecycle records.

### Core Tables

#### merchants

Stores merchant account and integration data.

| Field | Purpose |
|---|---|
| id | Primary key |
| email | Unique merchant login identifier |
| password_hash | Password hash |
| business_name | Merchant or business display name |
| upi_id | Merchant UPI ID / VPA |
| phone | Optional contact number |
| api_key_public | Unique public API key |
| api_key_secret_hash | Hashed secret API key |
| total_transactions | Stored transaction counter |
| total_collected | Stored collection counter |
| created_at, updated_at | Record timestamps |

#### transactions

Stores payment request and lifecycle information.

| Field | Purpose |
|---|---|
| id | Primary key |
| transaction_id | Unique application transaction identifier |
| merchant_id | Merchant relationship |
| amount, currency | Amount in paise and currency (INR by default) |
| order_id | Integrating merchant's order reference |
| description | Optional payment description |
| customer_name, customer_email, customer_phone | Customer details where supplied |
| upi_intent_url | Generated UPI payment instruction |
| qr_code_data_url | QR-code URL/data field used by the payment flow |
| status | Application transaction state |
| transaction_hash | Transaction integrity metadata |
| merchant_notes | Optional merchant review notes |
| utr_number | Submitted UTR reference |
| created_at, confirmed_at, updated_at | Lifecycle timestamps |

### Indexing Strategy

The schema defines indexes to support common transaction operations:
- Merchant, status, and creation-date queries.
- Transaction identifier lookup.
- Order ID lookup.
- UTR reference lookup.

### Data Integrity Boundaries

Relational constraints and indexes help structure application data. They do not by themselves prevent all payment fraud, guarantee exactly-once processing, or prove that a transfer settled with a bank. Those guarantees require separate application-level controls and external verification systems.

---

## 🧰 Technology Stack Matrix

| Layer | Technology | Purpose |
|---|---|---|
| Frontend framework | React, TypeScript | Merchant and customer-facing application |
| Build tooling | Vite | Frontend development and production build |
| Client routing | Wouter | Single-page application routes |
| Server state | TanStack Query | API data fetching and cache management |
| UI system | Tailwind CSS, Radix UI primitives | Layout and interface components |
| Charts | Recharts | Dashboard and analytics visualizations |
| Icons | Lucide React | Interface iconography |
| Edge runtime | Cloudflare Workers | HTTP API and business logic |
| Database | Cloudflare D1 / SQLite | Merchant and transaction persistence |
| Authentication | HMAC-SHA-256 JWT | Signed merchant session tokens |
| Password hashing | Web Crypto PBKDF2-SHA-256 | Password verification |
| API credential handling | Cryptographically generated keys and hashes | Merchant API authentication |
| QR rendering | External QR Server API | QR-code image generation |

---

## 📡 API Surface

The API uses JSON request and response bodies unless otherwise specified. Protected routes require a bearer JWT, while payment creation supports a JWT or an API key sent through the X-API-Key header.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | / | Public | API service information |
| GET | /api/healthz | Public | Health check |
| POST | /api/auth/register | Public | Register a merchant |
| POST | /api/auth/login | Public | Authenticate a merchant |
| GET | /api/auth/me | JWT | Get current merchant profile |
| POST | /api/payments | JWT / API key | Create a payment request |
| GET | /api/payments | JWT | List transactions |
| GET | /api/payments/:transactionId | JWT | Get transaction details |
| POST | /api/payments/:transactionId/confirm | JWT | Confirm a pending transaction |
| POST | /api/payments/:transactionId/reject | JWT | Reject a pending transaction |
| POST | /api/payments/confirm-by-utr | JWT | Find and confirm a pending transaction by UTR |
| GET | /api/merchant/stats | JWT | Get merchant statistics |
| PUT | /api/merchant/profile | JWT | Update merchant profile |
| POST | /api/merchant/api-keys/regenerate | JWT | Regenerate API credentials |
| GET | /api/public/payment/:transactionId | Public | Get hosted payment page data |
| POST | /api/public/payment/:transactionId/customer | Public | Submit customer details |
| POST | /api/public/payment/:transactionId/utr | Public | Submit a UTR reference |
| POST | /api/check-status | Public | Look up order status |

### Transaction Statuses

- PENDING — payment request is awaiting merchant review.
- CONFIRMED — transaction has been marked confirmed by the application workflow.
- REJECTED — transaction has been rejected by the application workflow.

These states describe Free Pi's records; they are not a direct feed from a bank or UPI settlement system.

### Example: Create a Payment Request

Example request using a server-side API key:

```bash
curl -X POST "https://api.free-pi.pages.dev/api/payments" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_SECRET_API_KEY" \
  -d '{
    "amount": 5000,
    "orderId": "ORDER-1001",
    "description": "Example order"
  }'
```

The amount is expressed in paise. In this example, 5000 represents ₹50.00. Use the returned transaction ID and hosted payment URL to connect the request to your customer journey.

**Never call this endpoint with a secret API key embedded in browser-side code.** Integrate from a trusted server and keep the key in a secure environment variable or secret manager.

---

## 🔒 Security & Operational Boundaries

Free Pi contains security-related controls, but a production deployment should be reviewed against its actual threat model and operating requirements.

- **Rate limiting:** the current request limiter is in-memory and per Worker isolate. It is not globally coordinated and should not be treated as the sole abuse-prevention control.
- **CORS configuration:** the Worker uses FRONTEND_URL when configured and falls back to a wildcard origin when it is not set. Production deployments should configure the exact trusted origin and verify behavior.
- **Secrets management:** JWT, transaction-integrity, and API-key-related secrets must be configured independently for each environment. Do not commit secret values.
- **Payment verification:** the current implementation relies on merchant review and UTR matching; it does not independently verify bank-side settlement.
- **External QR service:** QR-code generation relies on a third-party service. Evaluate the availability and privacy implications of sending UPI URLs to that provider.
- **Data protection:** merchant account data, customer details, order references, and UTRs should be handled with appropriate access controls and retention practices.
- **Monitoring and recovery:** establish logging, alerting, backup, and recovery procedures appropriate to the deployment.
- **Security testing:** test authentication expiry, authorization boundaries, transaction ownership, credential rotation, public endpoint abuse, and error handling before relying on the service for important payment workflows.

Do not describe Free Pi as bank-verified, audited, certified, or production-hardened unless those claims have been independently substantiated.

---

## 📁 Repository Structure

```text
Free-pi/
├── frontend/
│   ├── public/
│   │   ├── _redirects              # SPA routing rules for Cloudflare Pages
│   │   ├── _routes.json            # Pages routing configuration
│   │   ├── favicon.svg
│   │   └── opengraph.png
│   ├── src/
│   │   ├── api-client-react/
│   │   │   ├── generated/          # Typed API schemas and request hooks
│   │   │   └── custom-fetch.ts     # API request handling
│   │   ├── components/
│   │   │   ├── layout/             # Application layout
│   │   │   ├── modals/             # Payment creation and transaction details
│   │   │   └── ui/                 # Shared UI primitives
│   │   ├── hooks/                  # Shared React hooks
│   │   ├── lib/
│   │   │   └── auth.tsx            # Merchant authentication context
│   │   ├── pages/                  # Landing, dashboard, transactions, analytics,
│   │   │                           # API keys, settings, login, register and pay
│   │   ├── App.tsx                 # Routes and application providers
│   │   └── main.tsx                # Frontend entry point
│   ├── package.json
│   └── vite.config.ts
├── worker/
│   ├── src/
│   │   ├── lib/
│   │   │   ├── auth.js             # JWT, password and API-key utilities
│   │   │   ├── db.js               # D1 query helpers
│   │   │   └── utils.js            # Shared response helpers
│   │   ├── middleware/
│   │   │   └── auth.js             # JWT and API-key authentication
│   │   ├── routes/
│   │   │   ├── auth.js             # Registration, login, current merchant
│   │   │   ├── payments.js         # Payment lifecycle endpoints
│   │   │   ├── merchant.js         # Merchant profile, stats, API keys
│   │   │   ├── public.js            # Hosted payment and customer endpoints
│   │   │   └── statusChecker.js    # Public order-status lookup
│   │   └── index.js                # Worker entry point and route dispatch
│   ├── schema.sql                  # D1 tables and indexes
│   ├── wrangler.toml               # Worker and database configuration
│   └── package.json
└── README.md
```

---

## 🔒 License & Intellectual Property

**Copyright © 2026 Mushke Rohith Reddy. All Rights Reserved.**

### PROPRIETARY AND CONFIDENTIAL

Free Pi, including its source code, documentation, architecture, interface designs, database schema, business logic, and associated intellectual property, is proprietary to **Mushke Rohith Reddy**, except for third-party components governed by their respective licenses.

#### Terms & Usage Restrictions

1. **No Unauthorized Use:** You may not copy, modify, distribute, reproduce, sublicense, publish, sell, host, mirror, or commercially exploit this software or any portion of it without explicit prior written permission from the copyright holder.
2. **No Public Redistribution:** This project is not offered under the MIT, Apache, GPL, or another open-source license. Public repository visibility does not grant permission to reuse, deploy, fork, or redistribute the proprietary application.
3. **No Unauthorized Deployment:** Operating a production or commercial instance requires explicit written authorization from the copyright holder.
4. **No Repurposing of Proprietary Logic:** You may not extract or repurpose the project's proprietary application logic, workflows, or designs without authorization.
5. **Third-Party Components:** Dependencies and third-party services remain subject to their own licenses and terms. This notice does not override those separate rights.

For licensing inquiries, authorized deployments, institutional use, or commercial partnerships, contact:

**Email:** rohith2005hyd@gmail.com

---

<div align="center">

<sub>Designed & Architected by <b>Mushke Rohith Reddy</b></sub>

<sub>Free Pi — UPI Payment Request & Merchant Operations Platform</sub>

</div>
