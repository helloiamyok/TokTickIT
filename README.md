# TokTickIT - Requester Ticketing MVP (Lab 2)

TokTickIT is an IT Service Desk ticketing system built for **CPE 334 (Introduction to Software Engineering in the Age of AI Agents)**.

Lab 2 delivers the **Requester-facing ticketing MVP** adhering to the **Zen Green Theme**, featuring Development Requester isolation, ticket creation with validation, ticket list with search/filter/pagination, and ticket detail with attachment soft-removal.

---

## 🚀 Getting Started & Setup Instructions

### Prerequisites
- Node.js (v20+ recommended)
- PostgreSQL (v14+)
- npm or pnpm

### 1. Database Setup
Ensure PostgreSQL is running locally and configure `server/.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/toktickit?schema=public"
PORT=3000
```

Run Prisma migrations and seed reference data (Categories, Related Systems, Requesters):
```bash
cd server
npm install
npx prisma migrate dev
npx prisma db seed
```

### 2. Run the Application

#### Start Backend Server:
```bash
cd server
npm run dev
```
Backend runs on `http://localhost:3000`.

#### Start Frontend Client:
```bash
cd client
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

---

## 🧪 Running Automated Tests

### Run Server API & Integration Tests
```bash
cd server
npm test
```

### Run Client Component & UI Tests
```bash
cd client
npm test
```

### Type Checking & Production Build
```bash
# Frontend type check & build
cd client
npm run build

# Backend type check
cd server
npx tsc --noEmit
```

---

## 📂 Project Structure

```
TokTickIT/
├── docs/lab-02/                # Sprint 2 Engineering Contract & Documentation
│   ├── specification.md        # Spec DD (FR, BR, AC, Scope, Data Model)
│   ├── tests.md                # Test DD & Traceability Matrix
│   ├── ui-spec.md              # Zen Green UI Design Tokens & Breakpoints
│   ├── api-spec.md             # REST API Contracts
│   ├── reviewer.md             # Peer Review Record & PR Approvals
│   └── ai-use.md               # AI Usage Reflection & Key Prompts
├── server/                     # Express + Prisma + PostgreSQL Backend
│   ├── prisma/                 # Prisma schema, migrations, and seed script
│   ├── src/                    # API endpoints and business logic
│   └── tests/lab-02/           # Server API automated test suites
├── client/                     # React + Vite + TypeScript Frontend
│   └── src/
│       ├── components/         # CreateTicket, MyTickets, TicketDetail, DevRequesterSwitcher
│       ├── context/            # RequesterContext (Active Persona Provider)
│       └── components/__tests__/# Client Vitest component test suites
└── README.md
```

---

## 🎨 Zen Green Theme Palette
- **Primary Green**: `#006B3C`
- **Secondary Green**: `#0B7A46`
- **Pale Green**: `#EAF6EF`
- **Background**: `#F5F7F6`
