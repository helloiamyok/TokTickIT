# Lab 2 Test Plan and Traceability Matrix

## 1. Planned Tests Table

| Test ID | Level | AC Ref | Description | Expected Result | Target Test File | Status |
|---|---|---|---|---|---|---|
| **API-01** | API | AC-01 | Create ticket with valid data | 201 Created; returns valid ticketNo | `server/tests/lab-02/create-ticket.api.test.ts` | Planned |
| **API-02** | API | AC-01 | Create ticket missing summary | 400 Bad Request; validation message | `server/tests/lab-02/create-ticket.api.test.ts` | Planned |
| **API-03** | API | AC-03 | Get ticket belonging to other requester | 403 Forbidden | `server/tests/lab-02/ticket-detail.api.test.ts` | Planned |
| **API-04** | API | AC-04 | Upload attachment > 5MB | 400 Bad Request; size error | `server/tests/lab-02/attachments.api.test.ts` | Planned |
| **API-05** | API | AC-05 | Soft remove attachment with reason | 200 OK; isDeleted marked true | `server/tests/lab-02/attachments.api.test.ts` | Planned |
| **API-06** | API | AC-06 | Filter tickets by category and requester | 200 OK; returns only owned filtered items | `server/tests/lab-02/my-tickets.api.test.ts` | Planned |
| **UI-01** | UI | AC-02 | Redirect to Requester select if unselected | Shows selector screen | `client/src/tests/lab-02/RequesterSelect.test.tsx` | Planned |
| **UI-02** | UI | AC-01 | Display inline error on empty submit | Field level red errors displayed | `client/src/tests/lab-02/CreateTicket.test.tsx` | Planned |
| **E2E-01** | E2E | AC-01, AC-06 | Full flow: Select user -> Create -> View in My Tickets | Ticket appears in list with correct ID | `e2e/lab-02/requester-ticket-flow.spec.ts` | Planned |

## 2. Test Execution Commands
- Unit / API / UI Tests: `npm test`
- E2E Tests: `npx playwright test`-