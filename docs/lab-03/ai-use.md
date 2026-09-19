# Sprint 3 AI Tool Usage Log

## Overview
This document logs the AI tools, prompts, verification mechanisms, and corrections applied during the development of Sprint 3 (TokTickIT - Role-Based Access Control, IT Staff Workflows, and Administrator User Management).

---

## 1. AI Tool Details
- **Primary AI Assistant:** Antigravity (Google DeepMind Advanced Agentic Coding)
- **Model:** Gemini 2.5 Pro / Advanced Agentic Architecture
- **Context & Tools Utilized:**
  - Automated Terminal Execution (`powershell`)
  - Full-stack code editing tools (`replace_file_content`, `multi_replace_file_content`, `write_to_file`)
  - Headless Browser Automation (`Playwright`) for E2E testing & responsive screenshots
  - Vitest Unit & Supertest API Test Runners

---

## 2. Sprint 3 Issue Breakdown & AI Interaction Log

### Issue 1: Contract & Specification Setup
- **Goal:** Draft comprehensive requirements (`specification.md`), UI specification (`ui-spec.md`), and API endpoints (`api-spec.md`).
- **AI Contribution:** Authored formal specifications matching all BR (Business Rules) and AC (Acceptance Criteria) defined in the Handout.
- **Verification:** Verified requirement trace matrix against Sprint 3 guidelines.

### Issue 3: Authentication & Security Foundation
- **Goal:** JWT HTTP-only cookies, password hashing with bcrypt, mandatory password change flow.
- **AI Contribution:** Implemented express middlewares (`authenticate`, `requireRole`), auth controller endpoints (`/api/auth/login`, `/api/auth/me`, `/api/auth/change-password`, `/api/auth/logout`), and client auth context.
- **Verification:** 6 Vitest API tests (`tests/lab-03/auth.api.test.ts`) covering valid/invalid logins, deactivated users, and first-login password enforcement.

### Issue 5 & 6: IT Staff Ticket Queue & Operations
- **Goal:** Ticket queue with search/filter/pagination, claim/assign functionality, IT priority adjustment, status transition matrix, public comments, and internal notes.
- **AI Contribution:** Implemented server routes (`/api/staff/tickets`, `/api/staff/tickets/:id/*`), role-guarded comments/notes with amber-styled internal notes, and `StaffTicketQueue.tsx` / `StaffTicketDetail.tsx` pages.
- **Verification:** 9 Vitest API tests covering authorization, queue filters, status transitions, and internal note isolation.

### Issue 7: Requester Regression & "Problem Appears Resolved"
- **Goal:** Ownership isolation for requesters, hiding internal notes, and problem resolved workflow.
- **AI Contribution:** Removed development requester selector, enforced `req.user.id` filtering for tickets and detail views.
- **Verification:** Re-ran all Sprint 2 regression tests and ownership checks.

### Issue 8: Administrator User Management
- **Goal:** Minimalist user management CRUD, initial password reset, and Safety Rules (BR-06: self-deactivation prevention, BR-07: last active administrator protection).
- **AI Contribution:** Created `/api/admin/users` routes and `UserManagement.tsx` with modal forms and UI/backend safety locks.
- **Verification:** 6 Vitest API tests in `tests/lab-03/users-admin.api.test.ts`.

### Issue 9: Playwright End-to-End Testing
- **Goal:** Playwright browser automation for 3 key user flows (Auth, IT Staff queue/notes, Admin user creation & safety).
- **AI Contribution:** Created `authentication.spec.ts`, `staff-ticket-flow.spec.ts`, and `user-administration.spec.ts`.
- **Verification:** 5/5 Playwright tests passing in headless Chromium.

### Issue 10: Visual Inspection, Responsive Checklist & Release
- **Goal:** Capture screenshots across Desktop, Tablet, Mobile for Part 5-9 and integrate documentation.
- **AI Contribution:** Created automated screenshot capture script `e2e/capture-screenshots.spec.ts` capturing 22 screenshots into `artifacts/lab-03/screenshots/`.
- **Verification:** All 22 screenshots successfully generated and verified.

---

## 3. Human & Peer Verification Summary
- All business rules (BR-01 through BR-12) and acceptance criteria (AC-01 through AC-06) verified via automated test suites.
- Total Vitest API Tests: **43 passed** (12 suites).
- Total Playwright E2E Tests: **5 passed**.
- Total Visual Screenshots: **22 images** across Desktop, Tablet, and Mobile viewports.
