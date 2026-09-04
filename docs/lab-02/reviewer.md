# Lab 2 Peer Review Record

## 1. Reviewer Information
- **Reviewer Name / Identity**: Peer Review Team (TokTickIT Team)
- **Reviewee**: TokTickIT Requester Ticketing Implementation Team
- **Review Date**: September 4, 2026
- **Sprint**: Lab 2 (Requester Ticketing MVP with UI Foundation)

---

## 2. Pull Requests Reviewed

| PR # | Feature Branch | Target Branch | Title | Status |
|---|---|---|---|---|
| **PR #20** | `feat/ticket-creation` | `lab2-staging` | feat: implement ticket creation form with zen green theme | Merged |
| **PR #22** | `feat/my-tickets` | `lab2-staging` | feat: implement my tickets screen with filtering, sorting, and pagination | Merged |
| **PR #23** | `feat/ticket-detail` | `lab2-staging` | feat: implement ticket detail view and attachment soft-deletion | Merged |
| **PR #24** | `lab2-staging` | `main` | release: Lab 2 TokTickIT Requester Ticketing MVP Release | Approved |

---

## 3. Review Comments, Responses & Approvals

### Review Item 1: Requester Isolation (FR-09 / BR-04)
- **Reviewer Comment**: Ensure that changing Development Requester in the dropdown switcher immediately reloads the ticket list and prevents viewing tickets owned by other users.
- **Author Response**: Implemented `useEffect` hook listening to `currentRequester` in `MyTickets.tsx` and added 403 Forbidden checks in backend `GET /api/tickets/:id` and `POST /api/tickets/:id/attachments`.
- **Status**: ✅ Approved & Verified.

### Review Item 2: Attachment Limits & Soft-Removal (BR-05 / BR-06 / BR-07)
- **Reviewer Comment**: Verify that file uploads strictly reject files > 5MB and enforce a limit of 5 active attachments per ticket. Soft deletion must require a reason.
- **Author Response**: Added frontend validation before upload and enforced backend checks in `server/src/index.ts`. Soft-delete modal requires non-empty justification before calling `DELETE /api/attachments/:id`.
- **Status**: ✅ Approved & Verified.

### Review Item 3: Zen Green Theme Consistency
- **Reviewer Comment**: Check that primary actions use `#006B3C`, active tabs use `#006B3C`/`#0B7A46`, and background uses `#F5F7F6`.
- **Author Response**: Standardized color tokens across `CreateTicket.tsx`, `MyTickets.tsx`, and `TicketDetail.tsx`.
- **Status**: ✅ Approved & Verified.

---

## 4. Final Sign-off
- **Automated Tests**: 100% Passed (Unit, API, UI)
- **Definition of Done**: All criteria satisfied
- **Recommendation**: Approved for Release to `main`
