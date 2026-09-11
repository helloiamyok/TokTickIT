# Sprint 3 REST API Specification: Authentication, Roles & Workflow

## 1. Overview & Architectural Conventions

### 1.1 Authentication & Security
- **Mechanism:** Secure, HTTP-only session cookie (or encrypted Bearer token) verified on every protected route.
- **Identity Source:** The server-side authenticated session determines user identity and permissions. Client-supplied IDs in bodies/headers cannot override authentication (BR-03).
- **Password Security:** Salted and hashed using `bcrypt` (work factor $\ge$ 10).
- **Mandatory Password Change:** Users with `mustChangePassword: true` can access only `/api/auth/me`, `/api/auth/change-password`, and `/api/auth/logout`. All other endpoints return `403 Forbidden` with `{ "error": "Password change required before accessing system resources", "code": "PASSWORD_CHANGE_REQUIRED" }`.

### 1.2 Role-Based Access Control (RBAC) Matrix

| Endpoint Group | Requester | IT Staff | Administrator |
|:---|:---:|:---:|:---:|
| **Auth (`/api/auth/*`)** | ✅ | ✅ | ✅ |
| **Requester Tickets (`/api/tickets/*`)** | ✅ (Owned only) | ✅ (All) | ✅ (All) |
| **IT Queue & Workflow (`/api/staff/tickets/*`)** | ❌ (403) | ✅ | ✅ |
| **Public Comments (`/api/tickets/:id/comments`)** | ✅ (Owned only) | ✅ | ✅ |
| **Internal Notes (`/api/staff/tickets/:id/internal-notes`)** | ❌ (403) | ✅ | ✅ |
| **User Management (`/api/admin/users/*`)** | ❌ (403) | ❌ (403) | ✅ |

### 1.3 Standard HTTP Status Codes
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Validation failure or business rule violation (e.g., self-deactivation of admin).
- `401 Unauthorized`: Missing, expired, or invalid credentials.
- `403 Forbidden`: Authenticated user lacks required role or resource ownership.
- `404 Not Found`: Target resource does not exist.
- `422 Unprocessable Entity`: Invalid state transition or unprocessable payload.
- `500 Internal Server Error`: Unexpected server failure.

---

## 2. Authentication & Session Endpoints

### 2.1 User Login
- **Endpoint:** `POST /api/auth/login`
- **Access:** Public
- **Description:** Authenticates user via email and password, establishing a session.
- **Request Body:**
```json
{
  "email": "jennifer.anderson@example.com",
  "password": "Password123!"
}
```
- **Response 200 OK:**
```json
{
  "user": {
    "id": 1,
    "email": "jennifer.anderson@example.com",
    "fullName": "Jennifer Anderson",
    "role": "Requester",
    "isActive": true,
    "mustChangePassword": false
  }
}
```
- **Error Responses:**
  - `401 Unauthorized`:
    ```json
    { "error": "Invalid email or password" }
    ```
  - `403 Forbidden` (BR-01 Deactivated Account):
    ```json
    { "error": "Account is deactivated. Please contact an administrator." }
    ```

---

### 2.2 User Logout
- **Endpoint:** `POST /api/auth/logout`
- **Access:** Authenticated (Any role)
- **Description:** Invalidates the current session and clears cookies.
- **Response 200 OK:**
```json
{
  "message": "Logged out successfully"
}
```

---

### 2.3 Get Current User Session (`/me`)
- **Endpoint:** `GET /api/auth/me`
- **Access:** Authenticated (Any role)
- **Description:** Returns the active user's identity, role, and password state.
- **Response 200 OK:**
```json
{
  "user": {
    "id": 1,
    "email": "jennifer.anderson@example.com",
    "fullName": "Jennifer Anderson",
    "role": "Requester",
    "isActive": true,
    "mustChangePassword": false
  }
}
```
- **Response 401 Unauthorized:**
```json
{ "error": "Authentication required" }
```

---

### 2.4 Mandatory & Self Password Change
- **Endpoint:** `POST /api/auth/change-password`
- **Access:** Authenticated (Any role)
- **Description:** Updates the user's password and sets `mustChangePassword = false`.
- **Request Body:**
```json
{
  "currentPassword": "TempPassword123!",
  "newPassword": "NewSecurePassword456!"
}
```
- **Validation Rules:**
  - `newPassword` $\ge$ 8 characters.
  - Contains at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character.
  - `newPassword` cannot be identical to `currentPassword`.
- **Response 200 OK:**
```json
{
  "message": "Password changed successfully"
}
```
- **Response 400 Bad Request:**
```json
{
  "error": "Password does not meet complexity requirements (min 8 chars, uppercase, lowercase, number, special char)."
}
```

---

## 3. Requester Ticket Endpoints (Regression & Enhanced)

### 3.1 Create Ticket
- **Endpoint:** `POST /api/tickets`
- **Access:** Authenticated (Requester)
- **Description:** Creates a ticket owned by the authenticated requester.
- **Request Body:**
```json
{
  "categoryId": 1,
  "relatedSystemId": 2,
  "requestedPriority": "HIGH",
  "summary": "VPN connection drops every 5 minutes",
  "description": "When connecting from home, the client disconnects repeatedly."
}
```
- **Response 201 Created:**
```json
{
  "id": 101,
  "ticketNo": "TKT-2026-000101",
  "summary": "VPN connection drops every 5 minutes",
  "description": "When connecting from home, the client disconnects repeatedly.",
  "requestedPriority": "HIGH",
  "itPriority": "HIGH",
  "currentStatus": "NEW",
  "requesterResolutionIndicated": false,
  "requesterId": 1,
  "assignedToId": null,
  "createdAt": "2026-09-11T08:00:00.000Z"
}
```

---

### 3.2 List Owned Tickets (My Tickets)
- **Endpoint:** `GET /api/tickets`
- **Access:** Authenticated (Requester)
- **Query Parameters:**
  - `search` (string): Filters by `ticketNo` or `summary`.
  - `categoryId` (number | "ALL")
  - `priority` ("LOW" | "MEDIUM" | "HIGH" | "URGENT" | "ALL")
  - `status` ("NEW" | "OPEN" | "IN_PROGRESS" | "WAITING_FOR_REQUESTER" | "RESOLVED" | "CLOSED" | "CANCELLED" | "ALL")
  - `page` (number, default: 1)
  - `limit` (number, default: 5)
  - `sortBy` (string, default: "createdAt")
  - `order` ("asc" | "desc", default: "desc")
- **Response 200 OK:**
```json
{
  "data": [
    {
      "id": 101,
      "ticketNo": "TKT-2026-000101",
      "summary": "VPN connection drops every 5 minutes",
      "requestedPriority": "HIGH",
      "itPriority": "HIGH",
      "currentStatus": "NEW",
      "requesterResolutionIndicated": false,
      "createdAt": "2026-09-11T08:00:00.000Z",
      "category": { "id": 1, "name": "Network" },
      "relatedSystem": { "id": 2, "name": "VPN" }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

---

### 3.3 Requester Resolution Feedback
- **Endpoint:** `PATCH /api/tickets/:id/resolution-feedback`
- **Access:** Authenticated (Requester - Owned Ticket Only)
- **Description:** Allows requester to toggle whether the issue appears resolved (BR-05).
- **Request Body:**
```json
{
  "problemAppearsResolved": true
}
```
- **Response 200 OK:**
```json
{
  "id": 101,
  "ticketNo": "TKT-2026-000101",
  "requesterResolutionIndicated": true,
  "currentStatus": "IN_PROGRESS"
}
```

---

## 4. IT Staff Queue & Workflow Endpoints

### 4.1 IT Staff Ticket Queue
- **Endpoint:** `GET /api/staff/tickets`
- **Access:** Authenticated (`IT Staff`, `Administrator`)
- **Query Parameters:**
  - `search` (string): Keyword for Ticket Number or Summary.
  - `status` (string | "ALL"): Target ticket status.
  - `category` (number | "ALL"): Target category ID.
  - `itPriority` (string | "ALL"): `LOW` | `MEDIUM` | `HIGH` | `URGENT`.
  - `assignedToId` (number | "UNASSIGNED" | "ALL"): Filter by assigned IT staff.
  - `page` (number, default: 1), `limit` (number, default: 10).
  - `sortBy` (string, default: "createdAt"), `order` ("asc" | "desc", default: "desc").
- **Response 200 OK:**
```json
{
  "data": [
    {
      "id": 101,
      "ticketNo": "TKT-2026-000101",
      "summary": "VPN connection drops every 5 minutes",
      "category": { "id": 1, "name": "Network" },
      "relatedSystem": { "id": 2, "name": "VPN" },
      "requestedPriority": "HIGH",
      "itPriority": "HIGH",
      "currentStatus": "IN_PROGRESS",
      "requesterResolutionIndicated": false,
      "requester": {
        "id": 1,
        "fullName": "Jennifer Anderson",
        "email": "jennifer.anderson@example.com"
      },
      "assignedTo": {
        "id": 2,
        "fullName": "Michael Brown",
        "email": "michael.brown@example.com"
      },
      "createdAt": "2026-09-11T08:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 87,
    "totalPages": 9
  }
}
```

---

### 4.2 Get Detailed Ticket (Staff View)
- **Endpoint:** `GET /api/staff/tickets/:id`
- **Access:** Authenticated (`IT Staff`, `Administrator`)
- **Response 200 OK:**
```json
{
  "id": 101,
  "ticketNo": "TKT-2026-000101",
  "summary": "VPN connection drops every 5 minutes",
  "description": "When connecting from home, the client disconnects repeatedly.",
  "category": { "id": 1, "name": "Network" },
  "relatedSystem": { "id": 2, "name": "VPN" },
  "requestedPriority": "HIGH",
  "itPriority": "HIGH",
  "currentStatus": "IN_PROGRESS",
  "requesterResolutionIndicated": false,
  "requester": {
    "id": 1,
    "fullName": "Jennifer Anderson",
    "email": "jennifer.anderson@example.com"
  },
  "assignedTo": {
    "id": 2,
    "fullName": "Michael Brown",
    "email": "michael.brown@example.com"
  },
  "attachments": [],
  "createdAt": "2026-09-11T08:00:00.000Z",
  "updatedAt": "2026-09-11T09:30:00.000Z"
}
```

---

### 4.3 Assign or Claim Ticket
- **Endpoint:** `PATCH /api/staff/tickets/:id/assign`
- **Access:** Authenticated (`IT Staff`, `Administrator`)
- **Description:** Assigns the ticket to an IT Staff member or clears assignment.
- **Request Body:**
```json
{
  "assignedToId": 2
}
```
*(Pass `null` to unassign)*
- **Response 200 OK:**
```json
{
  "id": 101,
  "ticketNo": "TKT-2026-000101",
  "assignedToId": 2,
  "assignedTo": {
    "id": 2,
    "fullName": "Michael Brown"
  }
}
```

---

### 4.4 Update IT Priority (BR-12)
- **Endpoint:** `PATCH /api/staff/tickets/:id/priority`
- **Access:** Authenticated (`IT Staff`, `Administrator`)
- **Description:** Updates the internal IT Priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`). `requestedPriority` remains immutable.
- **Request Body:**
```json
{
  "itPriority": "URGENT"
}
```
- **Response 200 OK:**
```json
{
  "id": 101,
  "ticketNo": "TKT-2026-000101",
  "requestedPriority": "HIGH",
  "itPriority": "URGENT"
}
```

---

### 4.5 Transition Ticket Status (BR-11)
- **Endpoint:** `PATCH /api/staff/tickets/:id/status`
- **Access:** Authenticated (`IT Staff`, `Administrator`)
- **Description:** Moves ticket along permitted lifecycle state transitions.
- **Request Body:**
```json
{
  "status": "WAITING_FOR_REQUESTER"
}
```
- **Permitted Transition Paths (BR-11):**
  - `NEW` $\rightarrow$ `OPEN`, `CANCELLED`
  - `OPEN` $\rightarrow$ `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `CANCELLED`
  - `IN_PROGRESS` $\rightarrow$ `WAITING_FOR_REQUESTER`, `RESOLVED`, `CANCELLED`
  - `WAITING_FOR_REQUESTER` $\rightarrow$ `IN_PROGRESS`, `RESOLVED`, `CANCELLED`
  - `RESOLVED` $\rightarrow$ `CLOSED`, `REOPENED`
  - `REOPENED` $\rightarrow$ `IN_PROGRESS`, `CANCELLED`
  - `CLOSED`, `CANCELLED`: Terminal
- **Response 200 OK:**
```json
{
  "id": 101,
  "ticketNo": "TKT-2026-000101",
  "currentStatus": "WAITING_FOR_REQUESTER",
  "updatedAt": "2026-09-11T10:00:00.000Z"
}
```
- **Response 422 Unprocessable Entity:**
```json
{
  "error": "Invalid status transition from NEW to CLOSED. Permitted target states: OPEN, CANCELLED."
}
```

---

## 5. Collaboration Endpoints (Public Comments & Internal Notes)

### 5.1 Public Comments (Shared Stream)
- **Endpoints:**
  - `GET /api/tickets/:id/comments`
  - `POST /api/tickets/:id/comments`
- **Access:** 
  - `GET`: Authenticated (Ticket Owner, IT Staff, Admin)
  - `POST`: Authenticated (Ticket Owner, IT Staff, Admin)
- **POST Request Body:**
```json
{
  "content": "We have reconfigured your VPN profile. Please test connecting again."
}
```
- **Response 201 Created:**
```json
{
  "id": 501,
  "ticketId": 101,
  "content": "We have reconfigured your VPN profile. Please test connecting again.",
  "isInternal": false,
  "author": {
    "id": 2,
    "fullName": "Michael Brown",
    "role": "IT Staff"
  },
  "createdAt": "2026-09-11T10:15:00.000Z"
}
```

---

### 5.2 Internal Notes (IT Staff / Admin Only) (BR-04, AC-04)
- **Endpoints:**
  - `GET /api/staff/tickets/:id/internal-notes`
  - `POST /api/staff/tickets/:id/internal-notes`
- **Access:** Authenticated (`IT Staff`, `Administrator` strictly). Requesters attempting access receive `403 Forbidden`.
- **POST Request Body:**
```json
{
  "content": "Root cause: RADIUS server certificate expired on gateway-02."
}
```
- **Response 201 Created:**
```json
{
  "id": 601,
  "ticketId": 101,
  "content": "Root cause: RADIUS server certificate expired on gateway-02.",
  "isInternal": true,
  "author": {
    "id": 2,
    "fullName": "Michael Brown",
    "role": "IT Staff"
  },
  "createdAt": "2026-09-11T10:20:00.000Z"
}
```
- **Requester Attempt (403 Forbidden):**
```json
{
  "error": "Forbidden: Internal notes are restricted to IT Staff and Administrators."
}
```

---

## 6. Administrator User Management Endpoints

### 6.1 List Users
- **Endpoint:** `GET /api/admin/users`
- **Access:** Authenticated (`Administrator` only)
- **Query Parameters:**
  - `search` (string): Matches `fullName` or `email`.
  - `role` ("Requester" | "IT Staff" | "Administrator" | "ALL")
  - `status` ("ACTIVE" | "INACTIVE" | "ALL")
  - `page` (number, default: 1), `limit` (number, default: 10).
- **Response 200 OK:**
```json
{
  "data": [
    {
      "id": 1,
      "email": "jennifer.anderson@example.com",
      "fullName": "Jennifer Anderson",
      "role": "Requester",
      "isActive": true,
      "mustChangePassword": false,
      "createdAt": "2026-09-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "email": "michael.brown@example.com",
      "fullName": "Michael Brown",
      "role": "IT Staff",
      "isActive": true,
      "mustChangePassword": false,
      "createdAt": "2026-09-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 15,
    "totalPages": 2
  }
}
```

---

### 6.2 Create User
- **Endpoint:** `POST /api/admin/users`
- **Access:** Authenticated (`Administrator` only)
- **Description:** Creates a new account with an initial temporary password (flags `mustChangePassword: true`).
- **Request Body:**
```json
{
  "fullName": "Alex Thompson",
  "email": "alex.thompson@example.com",
  "role": "IT Staff",
  "isActive": true,
  "initialPassword": "TempPassword123!"
}
```
- **Response 201 Created:**
```json
{
  "id": 16,
  "fullName": "Alex Thompson",
  "email": "alex.thompson@example.com",
  "role": "IT Staff",
  "isActive": true,
  "mustChangePassword": true,
  "createdAt": "2026-09-11T11:00:00.000Z"
}
```
- **Response 400 Bad Request (Duplicate Email - BR-09):**
```json
{
  "error": "Email address is already registered."
}
```

---

### 6.3 Edit User & Status Toggle (BR-06, BR-07, BR-08)
- **Endpoint:** `PATCH /api/admin/users/:id`
- **Access:** Authenticated (`Administrator` only)
- **Request Body:**
```json
{
  "fullName": "Alex Thompson Jr.",
  "role": "IT Staff",
  "isActive": false
}
```
- **Response 200 OK:**
```json
{
  "id": 16,
  "fullName": "Alex Thompson Jr.",
  "email": "alex.thompson@example.com",
  "role": "IT Staff",
  "isActive": false,
  "updatedAt": "2026-09-11T11:15:00.000Z"
}
```
- **Error Responses (Self-Protection & Last Admin Locks):**
  - Self-deactivation attempted (BR-06):
    ```json
    { "error": "Administrators cannot deactivate their own account." }
    ```
  - Deactivating the last active Admin (BR-07):
    ```json
    { "error": "Cannot deactivate the sole remaining active Administrator." }
    ```

---

### 6.4 Reset User Initial Password
- **Endpoint:** `POST /api/admin/users/:id/reset-password`
- **Access:** Authenticated (`Administrator` only)
- **Request Body:**
```json
{
  "newInitialPassword": "TempPassword456!"
}
```
- **Response 200 OK:**
```json
{
  "message": "Initial password set. User will be required to change password upon next login.",
  "userId": 16,
  "mustChangePassword": true
}
```

---

## 7. Master Data & Utility Endpoints

### 7.1 List Active IT Staff for Assignment Dropdown
- **Endpoint:** `GET /api/staff/users`
- **Access:** Authenticated (`IT Staff`, `Administrator`)
- **Response 200 OK:**
```json
[
  { "id": 2, "fullName": "Michael Brown", "email": "michael.brown@example.com" },
  { "id": 3, "fullName": "David Lee", "email": "david.lee@example.com" },
  { "id": 4, "fullName": "Sarah Johnson", "email": "sarah.johnson@example.com" }
]
```