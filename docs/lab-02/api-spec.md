# Lab 2 REST API Specification

## 1. Master Data Endpoints

### GET /api/requesters/active
- **Description**: Returns all active development requesters.
- **Response 200 OK**:
```json
[
  { "id": 1, "name": "Jennifer Anderson", "email": "jennifer@example.com", "isActive": true }
]


```json
[
  { "id": 1, "name": "Hardware" },
  { "id": 2, "name": "Software" },
  { "id": 3, "name": "Network" },
  { "id": 4, "name": "Account and Access" }
]

```json
[
  { "id": 1, "name": "Corporate Laptop" },
  { "id": 2, "name": "Campus Wi-Fi" },
  { "id": 3, "name": "VPN" }
]

 2. Ticket Endpoints
POST /api/tickets
Headers: x-requester-id: <number>

Request Body:
```json
{
  "requesterId": 1,
  "categoryId": 1,
  "relatedSystemId": 1,
  "requestedPriority": "MEDIUM",
  "summary": "Laptop battery drains quickly",
  "description": "My laptop battery is draining much faster than usual."
}

{
  "id": 1,
  "ticketNo": "TKT-2026-000001",
  "currentStatus": "NEW",
  "summary": "Laptop battery drains quickly",
  "createdAt": "2026-08-31T08:00:00.000Z"
}

{
  "data": [
    {
      "id": 1,
      "ticketNo": "TKT-2026-000001",
      "summary": "Laptop battery drains quickly",
      "category": { "name": "Hardware" },
      "requestedPriority": "MEDIUM",
      "itPriority": "MEDIUM",
      "currentStatus": "NEW",
      "createdAt": "2026-08-31T08:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 8,
    "totalCount": 1,
    "totalPages": 1
  }
}