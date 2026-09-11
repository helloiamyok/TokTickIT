# Sprint 3 Test Plan & Traceability Matrix

| Test ID | Type | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| API-01 | API | AC-01 | Valid login credentials | 200 OK, authenticated session cookie, sanitized profile returned | `server/tests/lab-03/auth.api.test.ts` | Pass |
| API-02 | API | AC-01 | Invalid credentials / missing user | 401 Unauthorized with safe error message | `server/tests/lab-03/auth.api.test.ts` | Pass |
| API-03 | API | BR-01 | Deactivated user attempts login | 403 Forbidden | `server/tests/lab-03/auth.api.test.ts` | Pass |
| API-04 | API | AC-02, BR-02 | User with `mustChangePassword` tries accessing queue | 403 Forbidden / Redirect instruction | `server/tests/lab-03/auth.api.test.ts` | Pass |
| API-05 | API | AC-03 | Requester accessing ticket list | Returns only tickets owned by authenticated user | `server/tests/lab-03/authorization.api.test.ts` | Pass |
| API-06 | API | AC-04, BR-04 | Requester attempts to GET or POST internal notes | 403 Forbidden without leaking note content | `server/tests/lab-03/comments-notes.api.test.ts` | Pass |
| API-07 | API | AC-05 | IT Staff claims ticket and updates IT Priority | 200 OK, ownership and priority updated | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Pass |
| API-08 | API | BR-11 | Invalid status transition (e.g. New -> Closed) | 422 Unprocessable Entity | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Pass |
| API-09 | API | AC-06, BR-06 | Admin attempts to deactivate their own account | 400 Bad Request with safety error message | `server/tests/lab-03/users-admin.api.test.ts` | Pass |
| API-10 | API | AC-06, BR-07 | Admin attempts to deactivate the last remaining active Admin | 400 Bad Request | `server/tests/lab-03/users-admin.api.test.ts` | Pass |
| E2E-01 | E2E | AC-01 | Full login and logout flow | Successful redirection to respective role landing page | `e2e/lab-03/authentication.spec.ts` | Pass |
| E2E-02 | E2E | AC-02 | Initial password login, mandatory prompt, and change | User forced to update password before app unlocks | `e2e/lab-03/first-login.spec.ts` | Pass |
| E2E-03 | E2E | AC-05 | IT Staff queue search, filter, ticket detail flow | Filter results update table, detail updates persist | `e2e/lab-03/staff-ticket-flow.spec.ts` | Pass |
| E2E-04 | E2E | AC-06 | Admin creates user, edits role, and tests safety locks | User created and displayed; self-deactivation disabled | `e2e/lab-03/user-administration.spec.ts` | Pass |