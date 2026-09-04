# Lab 2 Test Plan, Traceability Matrix, and Results

## 1. Test Strategy
Testing covers multiple levels to ensure high quality and full traceability to Acceptance Criteria:
- **Unit & Component Tests (Client)**: Form validation, UI states (empty, no-results, loaded, error), dynamic badges, and isolation.
- **API & Integration Tests (Server)**: Master data fetching, ticket creation (with unique `TKT-YYYY-XXXXXX` format), user isolation (FR-09), attachment limits (5MB, 5 active files), and soft-removal with mandatory reason.

---

## 2. Planned-Test Table & Traceability Matrix

| Test ID | Level | AC Ref | Description | Expected Result | Automated Test File | Final Status |
|---|---|---|---|---|---|---|
| **API-01** | API | AC-01 | Create ticket with valid data | 201 Created; returns valid ticketNo | `server/tests/lab-02/create-ticket.api.test.ts` | **Pass** |
| **API-02** | API | AC-01 | Create ticket missing summary | 400 Bad Request; validation message | `server/tests/lab-02/create-ticket.api.test.ts` | **Pass** |
| **API-03** | API | AC-02 | Create ticket with inactive requester | 400 Bad Request; rejected | `server/tests/lab-02/create-ticket.api.test.ts` | **Pass** |
| **API-04** | API | AC-03 | Owner retrieves ticket detail | 200 OK; returns complete ticket & attachments | `server/tests/lab-02/ticket-detail.api.test.ts` | **Pass** |
| **API-05** | API | AC-03 | Non-owner access ticket detail | 403 Forbidden (Isolation) | `server/tests/lab-02/ticket-detail.api.test.ts` | **Pass** |
| **API-06** | API | AC-04 | Upload permitted attachment (<= 5MB) | 201 Created; attachment created | `server/tests/lab-02/attachments.api.test.ts` | **Pass** |
| **API-07** | API | AC-04 | Upload invalid type or > 5MB file | 400 Bad Request; validation error | `server/tests/lab-02/attachments.api.test.ts` | **Pass** |
| **API-08** | API | AC-05 | Soft remove attachment with reason | 200 OK; `isDeleted=true` | `server/tests/lab-02/attachments.api.test.ts` | **Pass** |
| **API-09** | API | AC-05 | Soft remove without reason | 400 Bad Request; requires mandatory reason | `server/tests/lab-02/attachments.api.test.ts` | **Pass** |
| **API-10** | API | AC-06 | Paginated ticket list by requester | 200 OK; returns only owned tickets | `server/tests/lab-02/my-tickets.api.test.ts` | **Pass** |
| **API-11** | API | AC-06 | Search and filter tickets | 200 OK; matching tickets returned | `server/tests/lab-02/my-tickets.api.test.ts` | **Pass** |
| **UI-01** | UI | AC-01 | Create ticket form render & validation | Field errors displayed on empty submit | `client/src/components/__tests__/CreateTicket.test.tsx` | **Pass** |
| **UI-02** | UI | AC-06 | My Tickets list & empty state render | Populated table & empty state illustration | `client/src/components/__tests__/MyTickets.test.tsx` | **Pass** |
| **UI-03** | UI | AC-03 | Ticket detail read-only & 403 state | Detail shown, 403 banner on cross-requester | `client/src/components/__tests__/TicketDetail.test.tsx` | **Pass** |
| **UI-04** | UI | AC-02 | App shell & System status check | Full navigation tabs & health check | `client/src/App.test.tsx` | **Pass** |

---

## 3. Test Execution Commands & Passing Output

### Server Tests
```bash
cd server
npm test
```
**Output**: `6 passed (6 test files, 18 passed tests)`

### Client Tests
```bash
cd client
npm test
```
**Output**: `4 passed (4 test files, 11 passed tests)`