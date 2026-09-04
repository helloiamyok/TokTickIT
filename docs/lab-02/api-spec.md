# Lab 2 REST API Specification

## 1. Master Data Endpoints

### `GET /api/health`
- **Description**: Verifies service status.
- **Response 200 OK**:
```json
{ "status": "ok", "service": "TokTickIT API" }
```

### `GET /api/categories`
- **Description**: Retrieves all active ticket categories.
- **Response 200 OK**:
```json
[
  { "id": 1, "name": "Account and Access", "isActive": true },
  { "id": 2, "name": "Hardware", "isActive": true },
  { "id": 3, "name": "Software", "isActive": true },
  { "id": 4, "name": "Network", "isActive": true }
]
```

### `GET /api/related-systems`
- **Description**: Retrieves all active related systems.
- **Response 200 OK**:
```json
[
  { "id": 1, "name": "Corporate Laptop", "isActive": true },
  { "id": 2, "name": "Campus Wi-Fi", "isActive": true },
  { "id": 3, "name": "VPN", "isActive": true },
  { "id": 4, "name": "LEB2 App", "isActive": true },
  { "id": 5, "name": "Grade Submission App", "isActive": true },
  { "id": 6, "name": "Printer", "isActive": true }
]
```

### `GET /api/requesters/active`
- **Description**: Retrieves all active Development Requesters.
- **Response 200 OK**:
```json
[
  { "id": 1, "name": "Jennifer Anderson", "email": "jennifer.anderson@example.com", "isActive": true },
  { "id": 2, "name": "Michael Brown", "email": "michael.brown@example.com", "isActive": true },
  { "id": 3, "name": "David Lee", "email": "david.lee@example.com", "isActive": true },
  { "id": 4, "name": "Sarah Johnson", "email": "sarah.johnson@example.com", "isActive": true }
]
```

---

## 2. Ticket Endpoints

### `POST /api/tickets`
- **Description**: Creates a new ticket for the specified requester (FR-02, BR-01, BR-02).
- **Request Headers**: `x-requester-id: <id>` (optional if present in body)
- **Request Body**:
```json
{
  "requesterId": 1,
  "categoryId": 1,
  "relatedSystemId": 1,
  "requestedPriority": "HIGH",
  "summary": "Network down in Building B",
  "description": "Unable to connect to Wi-Fi in room 302."
}
```
- **Response 201 Created**:
```json
{
  "id": 1,
  "ticketNo": "TKT-2026-000001",
  "ticketNumber": "TKT-2026-000001",
  "summary": "Network down in Building B",
  "description": "Unable to connect to Wi-Fi in room 302.",
  "requestedPriority": "HIGH",
  "currentStatus": "NEW",
  "status": "NEW",
  "requesterId": 1,
  "categoryId": 1,
  "relatedSystemId": 1,
  "createdAt": "2026-09-04T10:00:00.000Z"
}
```
- **Errors**:
  - `400 Bad Request`: Validation failure (empty summary, invalid priority, etc.)

---

### `GET /api/tickets`
- **Description**: Retrieves a paginated, filtered, sorted list of tickets owned by the requester (FR-04, FR-05, FR-09).
- **Query Parameters**:
  - `requesterId` (required, or passed via `x-requester-id` header)
  - `search` (optional string): Searches in `ticketNo` and `summary`
  - `categoryId` (optional number or "ALL")
  - `priority` (optional enum: LOW, MEDIUM, HIGH, URGENT or "ALL")
  - `status` (optional enum: NEW, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED or "ALL")
  - `sortBy` (optional string, default: "createdAt")
  - `order` (optional: "asc" | "desc", default: "desc")
  - `page` (optional number, default: 1)
  - `limit` (optional number, default: 5)
- **Response 200 OK**:
```json
{
  "data": [
    {
      "id": 1,
      "ticketNo": "TKT-2026-000001",
      "ticketNumber": "TKT-2026-000001",
      "summary": "Network down in Building B",
      "requestedPriority": "HIGH",
      "currentStatus": "NEW",
      "status": "NEW",
      "createdAt": "2026-09-04T10:00:00.000Z",
      "category": { "id": 1, "name": "Account and Access" },
      "relatedSystem": { "id": 1, "name": "Campus Wi-Fi" }
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

### `GET /api/tickets/:id`
- **Description**: Retrieves single ticket detail including attachments (FR-06, FR-09).
- **Headers**: `x-requester-id: <id>`
- **Response 200 OK**:
```json
{
  "id": 1,
  "ticketNo": "TKT-2026-000001",
  "ticketNumber": "TKT-2026-000001",
  "summary": "Network down in Building B",
  "description": "Unable to connect to Wi-Fi in room 302.",
  "requestedPriority": "HIGH",
  "currentStatus": "NEW",
  "status": "NEW",
  "requesterId": 1,
  "createdAt": "2026-09-04T10:00:00.000Z",
  "category": { "name": "Account and Access" },
  "relatedSystem": { "name": "Campus Wi-Fi" },
  "attachments": []
}
```
- **Errors**:
  - `403 Forbidden`: When ticket belongs to another requester.
  - `404 Not Found`: Ticket does not exist.

---

## 3. Attachment Endpoints

### `POST /api/tickets/:id/attachments`
- **Description**: Uploads a permitted attachment to a ticket (FR-07, BR-05, BR-06).
- **Headers**: `x-requester-id: <id>`
- **Request Body**:
```json
{
  "requesterId": 1,
  "fileName": "screenshot.png",
  "fileSize": 102400,
  "fileType": "image/png",
  "filePath": "/uploads/screenshot.png"
}
```
- **Response 201 Created**:
```json
{
  "id": 1,
  "ticketId": 1,
  "fileName": "screenshot.png",
  "fileSize": 102400,
  "fileType": "image/png",
  "filePath": "/uploads/screenshot.png",
  "isDeleted": false,
  "createdAt": "2026-09-04T10:05:00.000Z"
}
```
- **Errors**:
  - `400 Bad Request`: Invalid file type, file size > 5MB, or already 5 active attachments.
  - `403 Forbidden`: When ticket belongs to another requester.

---

### `DELETE /api/attachments/:id`
- **Description**: Soft-removes an attachment with a mandatory justification reason (FR-08, BR-07).
- **Headers**: `x-requester-id: <id>`
- **Request Body**:
```json
{
  "requesterId": 1,
  "deletedReason": "Uploaded outdated screenshot"
}
```
- **Response 200 OK**:
```json
{
  "id": 1,
  "isDeleted": true,
  "deletedReason": "Uploaded outdated screenshot",
  "deletedAt": "2026-09-04T10:10:00.000Z"
}
```
- **Errors**:
  - `400 Bad Request`: Missing mandatory reason.
  - `403 Forbidden`: Attachment belongs to another requester.