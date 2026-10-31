# Tok TickIT - REST API Specification (Sprint 4)

## 1. Overview & Architectural Conventions

### 1.1 Authentication & Security Context
* ระบบใช้ Cookie-based Session / JWT Token ที่สืบทอดมาจาก Sprint 3 โดยระบุผู้ใช้และบทบาท (Role) อย่างปลอดภัย
* ฟิลด์ `performedById` ของ Action Taken จะถูกดึงจาก Token ของผู้ใช้ที่เข้าสู่ระบบโดยอัตโนมัติ (ห้ามรับหรือเขียนทับจาก Client Request Body โดยตรง เพื่อป้องกันการปลอมแปลงตัวตน)
* ป้องกัน IDOR (Insecure Direct Object References): Requester เข้าถึงได้เฉพาะ Tickets และ Actions ที่ตนเองเป็นเจ้าของเท่านั้น

### 1.2 Role-Based Access Control (RBAC) Matrix (Sprint 4)

| Endpoint | Requester | IT Staff | Administrator | รายละเอียด |
| :--- | :---: | :---: | :---: | :--- |
| `POST /api/tickets/:id/actions` | ❌ (403) | ✅ | ✅ | บันทึก Action Taken ใหม่ |
| `GET /api/tickets/:id/actions` | ✅ (Owned only) | ✅ | ✅ | ดึงประวัติ Actions Taken ของตั๋ว |
| `GET /api/dashboards/requester` | ✅ | ❌ (403) | ✅ | สรุปเมทริกซ์และ Recent Tickets ของ Requester |
| `GET /api/dashboards/staff` | ❌ (403) | ✅ | ✅ | สรุปเมทริกซ์และ Recent Tickets ของ IT Staff |
| `PATCH /api/staff/tickets/:id/status` | ❌ (403) | ✅ | ✅ | เปลี่ยนสถานะตั๋วและตรวจสอบ Resolution Gate |

---

## 2. Actions Taken Endpoints

### 2.1 Create Action Taken
* **Endpoint:** `POST /api/tickets/:id/actions`
* **Description:** สร้าง Action Taken รายการใหม่ภายใต้ Ticket ที่ระบุ
* **Authorization:** IT Staff, Administrator
* **Request Headers:**
  * `Content-Type: application/json`
* **URL Parameters:**
  * `id` (String | Integer): รหัสประจำ Ticket
* **Request Body:**
```json
{
  "actionDateTime": "2026-10-29T10:00:00.000Z",
  "actionDescription": "Checked hardware connectivity and replaced cable",
  "result": "Network link restored successfully",
  "followUpRequired": true,
  "followUpNote": "Check connectivity again tomorrow morning",
  "attachmentNotes": "network-log.png"
}
```
* **Validation Rules:**
  * `actionDateTime`: ต้องเป็น ISO-8601 String ที่ถูกต้อง (ค่าเริ่มต้นหากไม่ระบุคือเวลาปัจจุบัน)
  * `actionDescription`: String ความยาวระหว่าง 5 - 2,000 ตัวอักษร (Required)
  * `result`: String ความยาวไม่เกิน 2,000 ตัวอักษร (Optional/Nullable)
  * `followUpRequired`: Boolean (Required)
  * `followUpNote`: บังคับต้องมีและห้ามเว้นว่าง (String ความยาว $\ge$ 5 ตัวอักษร) หาก `followUpRequired == true` มิเช่นนั้นจะคืน 400 Bad Request
  * `attachmentNotes`: String ข้อความอ้างอิงไฟล์แนบ (Optional/Nullable)

* **Response (201 Created):**
```json
{
  "id": "act_101",
  "ticketId": "tkt_001",
  "actionDateTime": "2026-10-29T10:00:00.000Z",
  "actionDescription": "Checked hardware connectivity and replaced cable",
  "result": "Network link restored successfully",
  "performedById": "usr_it_01",
  "performedBy": {
    "id": "usr_it_01",
    "fullName": "Somchai Jaidee",
    "role": "IT Staff"
  },
  "followUpRequired": true,
  "followUpNote": "Check connectivity again tomorrow morning",
  "attachmentNotes": "network-log.png",
  "createdAt": "2026-10-29T10:05:00.000Z",
  "updatedAt": "2026-10-29T10:05:00.000Z"
}
```

* **Error Responses:**
  * `400 Bad Request`: ข้อมูลไม่ครบถ้วน หรือ `followUpRequired` เป็น true แต่ไม่มี `followUpNote`
    ```json
    {
      "error": "Follow-up note is required when followUpRequired is set to true"
    }
    ```
  * `401 Unauthorized`: ผู้ใช้ยังไม่ได้เข้าสู่ระบบ
  * `403 Forbidden`: ผู้ใช้ไม่ใช่ IT Staff หรือ Administrator
    ```json
    {
      "error": "Access denied. Only IT Staff and Administrator can record actions taken."
    }
    ```
  * `404 Not Found`: ไม่พบ Ticket ID ที่ระบุ
    ```json
    {
      "error": "Ticket not found"
    }
    ```

---

### 2.2 Get Actions Taken for Ticket
* **Endpoint:** `GET /api/tickets/:id/actions`
* **Description:** ดึงรายการ Actions Taken ทั้งหมดของ Ticket โดยเรียงลำดับตาม `actionDateTime` (หรือ `createdAt`) จากอดีตไปหาปัจจุบัน
* **Authorization:** Requester (เฉพาะ Ticket ที่ตนเองเป็นเจ้าของ), IT Staff, Administrator
* **URL Parameters:**
  * `id` (String | Integer): รหัสประจำ Ticket
* **Response (200 OK):**
```json
[
  {
    "id": "act_101",
    "ticketId": "tkt_001",
    "actionDateTime": "2026-10-29T10:00:00.000Z",
    "actionDescription": "Checked hardware connectivity and replaced cable",
    "result": "Network link restored successfully",
    "performedById": "usr_it_01",
    "performedBy": {
      "id": "usr_it_01",
      "fullName": "Somchai Jaidee",
      "role": "IT Staff"
    },
    "followUpRequired": true,
    "followUpNote": "Check connectivity again tomorrow morning",
    "attachmentNotes": "network-log.png",
    "createdAt": "2026-10-29T10:05:00.000Z",
    "updatedAt": "2026-10-29T10:05:00.000Z"
  }
]
```
* **Error Responses:**
  * `401 Unauthorized`: ไม่ได้เข้าสู่ระบบ
  * `403 Forbidden`: Requester พยายามเข้าถึง Ticket ที่ตนเองไม่ได้เป็นเจ้าของ
  * `404 Not Found`: ไม่พบ Ticket

---

## 3. Dashboard Endpoints

### 3.1 Requester Dashboard Summary
* **Endpoint:** `GET /api/dashboards/requester`
* **Description:** ดึงข้อมูลเมทริกซ์สรุปและตั๋วล่าสุดเฉพาะของ Requester ที่เข้าสู่ระบบ
* **Authorization:** Requester, Administrator
* **Response (200 OK):**
```json
{
  "metrics": {
    "openTickets": 3,
    "inProgress": 2,
    "resolved": 5,
    "closed": 12
  },
  "recentTickets": [
    {
      "id": "TKT-2026-001234",
      "title": "Laptop battery drains quickly",
      "status": "In Progress",
      "updatedAt": "2026-10-29T08:30:00.000Z"
    }
  ]
}
```
* **Error Responses:**
  * `401 Unauthorized`: ไม่ได้เข้าสู่ระบบ
  * `403 Forbidden`: ผู้ใช้ไม่ใช่ Requester หรือ Administrator

---

### 3.2 IT Staff Dashboard Summary
* **Endpoint:** `GET /api/dashboards/staff`
* **Description:** ดึงข้อมูลเมทริกซ์สรุปภาพรวมระบบและตั๋วที่ได้รับมอบหมายสำหรับ IT Staff
* **Authorization:** IT Staff, Administrator
* **Response (200 OK):**
```json
{
  "metrics": {
    "new": 14,
    "open": 23,
    "inProgress": 18,
    "waitingForRequester": 7,
    "myAssigned": 16
  },
  "recentTickets": [
    {
      "id": "TKT-2026-001234",
      "title": "Laptop battery drains quickly",
      "status": "In Progress",
      "updatedAt": "2026-10-29T08:30:00.000Z"
    }
  ]
}
```
* **Error Responses:**
  * `401 Unauthorized`: ไม่ได้เข้าสู่ระบบ
  * `403 Forbidden`: ผู้ใช้ไม่ใช่ IT Staff หรือ Administrator

---

## 4. Ticket Status Transition Matrix & Resolution Gate

### 4.1 Permitted Transitions
| สถานะปัจจุบัน (Current) | สถานะถัดไปที่อนุญาต (Permitted Next States) | ผู้มีสิทธิ์เปลี่ยน |
| :--- | :--- | :--- |
| `New` | `Open`, `Cancelled` | IT Staff, Administrator |
| `Open` | `In Progress`, `Waiting for Requester`, `Cancelled` | IT Staff, Administrator |
| `In Progress` | `Waiting for Requester`, `Resolved`, `Cancelled` | IT Staff, Administrator |
| `Waiting for Requester` | `In Progress`, `Resolved`, `Cancelled` | IT Staff, Administrator |
| `Resolved` | `Closed`, `Reopened` | IT Staff, Administrator |
| `Reopened` | `In Progress`, `Cancelled` | IT Staff, Administrator |
| `Closed` | *(Terminal State)* | - |
| `Cancelled` | *(Terminal State)* | - |

### 4.2 Resolution Gate Rule (BR-04)
* Requester มีสิทธิ์ส่งสัญญาณ `requesterResolutionIndicated: true` (ปัญหาได้รับการแก้ไขแล้วในมุมมองของผู้ใช้) เพื่อเป็นข้อเสนอแนะ (Advisory Note)
* **สถานะของ Ticket จะไม่เปลี่ยนเป็น `Resolved` โดยอัตโนมัติ**
* การเปลี่ยนเป็น `Resolved` จะเกิดขึ้นได้ต่อเมื่อ IT Staff หรือ Admin ดำเนินการผ่าน `PATCH /api/staff/tickets/:id/status` เท่านั้น

---

## 5. Concurrency & Safe Handling (Stale Update Prevention)

* ทุกการอัปเดตสถานะ Ticket หรือการบันทึกแก้ไขข้อมูล ต้องส่งฟิลด์ `updatedAt` หรือ Version token ร่วมด้วย
* **กระบวนการตรวจสอบ:**
  1. ฝั่ง Backend ดึงค่า `updatedAt` ปัจจุบันของ Ticket จากฐานข้อมูล
  2. เปรียบเทียบกับค่า `updatedAt` ที่ Client ส่งมา
  3. หากค่าไม่ตรงกัน แสดงว่ามีเจ้าหน้าที่ท่านอื่นหรือผู้ใช้อัปเดตข้อมูลไปก่อนหน้า (Stale Update)
  4. Backend จะปฏิเสธคำขอและตอบกลับด้วย HTTP Status:
     * `409 Conflict`
     ```json
     {
       "error": "Ticket has been modified by another user. Please refresh and try again.",
       "code": "STALE_UPDATE_CONFLICT"
     }
     ```
