# Sprint 3 Engineering Specification: TokTickIT Authentication, Roles & Workflow

## 1. Sprint Goal
Deliver an enterprise-ready authentication and role-based authorization system replacing the temporary Lab 2 Requester selector, introducing IT Staff queue and workflow management, and establishing minimalist Administrator user management using the Zen Green design language.

## 2. Stakeholder Request
Replace the development-only Requester selector with secure email/password authentication and mandatory first-login password change. Preserve all completed Lab 2 Requester capabilities using the authenticated account. Enable IT Staff with an operational Ticket Queue, Ticket Detail, assignment, IT Priority management, status progression, Public Comments, and private Internal Notes. Provide Administrators with a minimal User Management interface to view, create, edit, activate/deactivate users, and issue initial passwords, while strictly enforcing backend security.

## 3. Scope
### Included
- Email and password authentication, session management, logout, and `/api/auth/me`.
- Mandatory first-login password change for accounts flagged with initial passwords.
- Three operational roles: Requester, IT Staff, and Administrator.
- Server-side role authorization and ticket ownership enforcement on all endpoints.
- IT Staff Ticket Queue with search, status/category/priority filters, sorting, and pagination.
- IT Staff Ticket Detail: ownership assignment/claim, IT Priority updates, status transitions, Public Comments (shared), and Internal Notes (IT/Admin only).
- Requester Ticket Detail regression: view owned tickets, post Public Comments, and mark "Problem Appears Resolved".
- Administrator User Management: list users, search, role filter, create user, edit basic info, set initial password, activate/deactivate user.
- Data migration preserving Lab 2 tickets/attachments and converting development requesters to authenticable accounts.

### Excluded
- Self-registration, public signup, email password reset, MFA, SSO, social login.
- IT Staff "Actions Taken" checklist (deferred to Lab 4).
- Multi-tenancy, departments, profile photos, audit logs, account history.
- Bulk user operations, user deletion (only deactivation is supported), CSV import/export.
- SLA calculations, automated escalation triggers, email/push notifications.

## 4. Functional Requirements
- **FR-01 (Authentication):** Users authenticate using registered email and valid password.
- **FR-02 (Mandatory Password Reset):** Users flagged with `mustChangePassword = true` are restricted exclusively to password change endpoints until fulfilled.
- **FR-03 (Session/Identity Management):** System securely maintains session/token and provides current user profile and role via `/api/auth/me`.
- **FR-04 (Requester Flow):** Requesters create, view, and manage only tickets they own. Requesters can post Public Comments and toggle problem resolution feedback.
- **FR-05 (IT Staff Queue):** IT Staff view all tickets across the system with pagination, search by summary/ticket number, and filters for status, category, and priority.
- **FR-06 (IT Operations):** IT Staff claim or assign ticket ownership, update IT Priority, and transition ticket status through permitted states.
- **FR-07 (Collaboration):** Support Public Comments visible to Requester, IT Staff, and Admin; support Internal Notes visible strictly to IT Staff and Admin.
- **FR-08 (User Administration):** Administrators view, search, filter, create, edit, activate/deactivate user accounts, and assign initial passwords.

## 5. Business Rules
- **BR-01:** Only active users (`isActive = true`) with valid credentials may authenticate.
- **BR-02:** A user marked as requiring a password change cannot enter the normal application until a new valid password is saved.
- **BR-03:** The authenticated user identity, not a requesterId supplied by the client, determines ownership of Requester operations.
- **BR-04:** Public Comments are visible to the Requester, IT Staff, and Administrator. Internal Notes are visible only to IT Staff and Administrator.
- **BR-05:** A Requester may indicate that the problem appears resolved, but cannot formally set the Ticket to Resolved or Closed.
- **BR-06:** An Administrator cannot deactivate their own account.
- **BR-07:** The system must prevent deactivating or removing the last active Administrator.
- **BR-08:** User accounts cannot be hard deleted; accounts are deactivated (`isActive = false`).
- **BR-09:** Email addresses must be globally unique across all users (case-insensitive).
- **BR-10:** Each user holds exactly one role (`Requester`, `IT Staff`, or `Administrator`).
- **BR-11:** Ticket Status transitions must follow permitted state paths:
  - `New` -> `Open`, `Cancelled`
  - `Open` -> `In Progress`, `Waiting for Requester`, `Cancelled`
  - `In Progress` -> `Waiting for Requester`, `Resolved`, `Cancelled`
  - `Waiting for Requester` -> `In Progress`, `Resolved`, `Cancelled`
  - `Resolved` -> `Closed`, `Reopened`
  - `Reopened` -> `In Progress`, `Cancelled`
  - `Closed` / `Cancelled` -> Terminal states.
- **BR-12:** Requested Priority is immutable by IT Staff. IT Priority defaults to Requested Priority upon ticket creation and may later be changed only by IT Staff or Administrator.

## 6. UI Specification Summary
Adheres to Zen Green design token conventions (`#1B4D3E` primary, accessible contrast, standard badges). Application Shell displays authenticated user full name and role badge, with a prominent Logout button. Detailed screen breakdowns and states are specified in `ui-spec.md`.

## 7. Data Changes
- **User Model:** `id`, `email` (unique), `passwordHash`, `fullName`, `role` (`Requester` | `IT Staff` | `Administrator`), `isActive` (boolean), `mustChangePassword` (boolean), `createdAt`, `updatedAt`.
- **Ticket Model:** Add `assignedToId` (FK -> `User.id`, nullable), `itPriority` (`LOW` | `MEDIUM` | `HIGH` | `URGENT`), `requesterResolutionIndicated` (boolean, default false).
- **Comment / Note Model:** `id`, `ticketId` (FK), `authorId` (FK -> `User.id`), `content` (text), `isInternal` (boolean), `createdAt`.
- **Migration Strategy:** Convert development requester records into authenticated `User` records with role `Requester`, assign hashed passwords, and remove temporary selector state.

## 8. API Contract Summary
Detailed endpoint signatures, status codes, and JSON schemas are specified in `api-spec.md`.
- Auth: `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`, `/api/auth/change-password`
- IT Staff Queue & Detail: `/api/staff/tickets`, `/api/staff/tickets/:id`, `/api/staff/tickets/:id/assign`, `/api/staff/tickets/:id/priority`, `/api/staff/tickets/:id/status`
- Comments & Notes: `/api/tickets/:id/comments`, `/api/staff/tickets/:id/internal-notes`
- Admin Users: `/api/admin/users`, `/api/admin/users/:id`, `/api/admin/users/:id/reset-password`

## 9. Acceptance Criteria
- **AC-01:** Given an active user with valid credentials, when the user logs in, then the backend establishes authenticated access and returns the permitted user identity and role.
- **AC-02:** Given a user who must change the initial password, when login succeeds, then normal application screens remain unavailable until a valid new password is saved.
- **AC-03:** Given an authenticated Requester, when the client supplies another requesterId, then the backend still applies the authenticated identity and does not return another Requester's data.
- **AC-04:** Given a Requester account, when an Internal Note endpoint is requested, then the operation is rejected without exposing note content.
- **AC-05:** Given an IT Staff user, when updating a ticket, they can assign ownership, adjust IT Priority, and advance status to permitted targets only.
- **AC-06:** Given an Administrator, attempting to deactivate their own account or the sole active Administrator returns 400 Bad Request with a clear error message.

## 10. Definition of Done
- [ ] Specification and API contract reviewed and approved via PR.
- [ ] Prisma migrations execute cleanly without loss of Lab 2 ticket/attachment data.
- [ ] Seed data loads at least 4 Requesters, 3 IT Staff, 1 Admin, plus inactive accounts.
- [ ] All unit, API integration, and E2E Playwright tests pass in CI/local environment.
- [ ] Responsive Zen Green UI verified across desktop, tablet, and mobile.
- [ ] No server-side security rules rely on client-side UI hiding.

## 11. Assumptions and Decisions
- **Session Mechanism:** HttpOnly, Secure cookie storing encrypted session tokens.
- **Password Hashing:** bcrypt with salt rounds >= 10.
- **Public vs. Internal Comments:** Consolidated in a single `TicketComment` entity with an `isInternal` boolean flag, strictly enforced by service-layer authorization.