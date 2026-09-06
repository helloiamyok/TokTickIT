# TokTickIT - Requester Ticketing MVP (Lab 2)

TokTickIT is a responsive, full-stack IT Service Desk ticketing MVP built with React, Vite, TypeScript, Node.js, Express, PostgreSQL, and Prisma. Developed for **CPE 334 Introduction to Software Engineering in the Age of AI Agents**.

Lab 2 delivers the **Requester-facing ticketing MVP** adhering to the **Zen Green Theme**, featuring Development Requester isolation, ticket creation with strict validations, searchable/paginated ticket lists, and ticket detail views with attachment soft-removal workflows.

---

## ✨ Features Implemented (Sprint 2)
- **Simulated Development Requester Context:** Dynamically select active testing personas loaded from PostgreSQL without production authentication overhead.
- **Create Ticket Flow:** Structured submission workflow with comprehensive validation rules, attachment size/count limits, and backend-generated official Ticket Numbers (`TKT-YYYY-XXXXXX`).
- **My Tickets Management:** Paginated list view supporting keyword search, multi-field filtering (category, status), sorting, responsive card transformation, and complete multi-requester data isolation.
- **Ticket Detail & Attachment Lifecycle:** Read-only ticket overview, attachment downloads, 5 active file restrictions (<= 5 MB), and soft-removal with mandatory reason logging.
- **Zen Green UI Design System:** Consistent semantic color tokens and responsive layouts verified for Desktop (≥992px), Tablet (768–991px), and Mobile (<768px).

---

## 🎨 Zen Green Theme Palette
- **Primary Green**: `#006B3C` (Primary actions, active navigation states)
- **Secondary Green**: `#0B7A46` (Accent badges, secondary highlights)
- **Pale Green / Accent**: `#EAF6EF` (Selected rows, soft highlights)
- **Neutral Background**: `#F5F7F6` (App shell container background)

---

## 🚀 Getting Started & Setup Instructions

### Prerequisites
- Node.js (v18+ or v20+ recommended)
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


# TokTickIT - Requester Ticketing MVP (Lab 2)

A responsive, full-stack IT ticketing minimum viable product built with React, Node.js, Express, PostgreSQL, and Prisma. Developed for **CPE 334 Introduction to Software Engineering in the Age of AI Agents**.

## Features Implemented (Sprint 2)
- **Simulated Development Requester Context:** Select active testing personas loaded dynamically from PostgreSQL without production authentication.
- **Create Ticket:** Structured submission flow with field validations, attachment constraints, and backend-generated official Ticket Numbers.
- **My Tickets:** Paginated list view supporting keyword search, multi-field filtering, sorting, responsive card transformations, and complete multi-requester data isolation.
- **Ticket Detail & Attachments:** Read-only ticket overview, attachment downloads, max 5 active file restrictions (<= 5 MB), and soft-removal with mandatory reason logging.
- **Zen Green UI Design System:** Consistent color tokens (`#006B3C`, `#0B7A46`, `#EAF6EF`, `#F5F7F6`) and responsive layouts verified for Desktop (≥992px), Tablet (768–991px), and Mobile (<768px).

---

## Project Structure
```text
TokTickIT/
├── client/                      # React frontend application
├── server/                      # Express backend API & Prisma ORM
├── docs/lab-02/                 # Lab 2 specification & audit documentation
│   ├── specification.md
│   ├── tests.md
│   ├── ui-spec.md
│   ├── api-spec.md
│   ├── reviewer.md
│   └── ai-use.md
└── artifacts/lab-02/screenshots/ # Verification evidence across viewports