# Tok TickIT - Test Plan & Execution Report (Sprint 4)

## 1. Traceability Matrix & Test Results

| Test ID | Type | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| API-01 | API | AC-01 | สร้าง Action Taken สำเร็จโดย IT Staff | ข้อมูลถูกบันทึกพร้อม Performed By อัตโนมัติ (Status 201) | `server/tests/lab-04/actions-taken.api.test.ts` | Pass |
| API-02 | API | AC-01 | Requester พยายามสร้าง Action Taken | ระบบปฏิเสธการทำงานด้วยรหัส 403 Forbidden | `server/tests/lab-04/actions-taken.api.test.ts` | Pass |
| API-03 | API | AC-03 | สร้าง Action Taken โดยเลือก Follow-up Required แต่ไม่กรอก Note | ระบบปฏิเสธด้วยรหัส 400 Bad Request | `server/tests/lab-04/actions-taken.api.test.ts` | Pass |
| API-04 | API | AC-02 | ดึงข้อมูล Requester Dashboard | คืนเฉพาะตัวเลขและข้อมูลตั๋วที่เป็นของตนเอง | `server/tests/lab-04/requester-dashboard.api.test.ts` | Pass |
| API-05 | API | AC-04 | Requester พยายามเปลี่ยนสถานะ Ticket เป็น Resolved โดยตรง | ระบบไม่อนุญาตและไม่เปลี่ยนสถานะ (Resolution Gate) | `server/tests/lab-04/ticket-workflow.api.test.ts` | Pass |
| API-06 | API | AC-02 | ดึงข้อมูล IT Staff Dashboard | คำนวณสรุปสถิติตั๋ว (New, Open, In Progress, Waiting, Assigned) พร้อม recent tickets และกั้นสิทธิ์ตามบทบาท | `server/tests/lab-04/staff-dashboard.api.test.ts` | Pass |
| API-07 | API | AC-02 | Dashboard Smoke Tests สำหรับ Auth & Role Enforcement | 401 unauth, 403 requester on staff, 200 staff on staff, 200 requester on requester | `server/tests/lab-04/dashboard-smoke.test.ts` | Pass |
| UI-01 | Component | AC-01 | การแสดงผลและการตรวจสอบ Validation ของฟอร์ม Action Taken | แจ้งเตือนเมื่อช่อง Follow-up Note ว่างเปล่า | `client/src/components/__tests__/ActionsTaken.test.tsx` | Pass |
| UI-02 | Component | AC-02 | การ Drill-down จากการ์ดบน IT Staff Dashboard | นำทางไปยังรายการตั๋วพร้อมพารามิเตอร์กรองสถานะถูกต้อง | `client/src/components/__tests__/StaffDashboard.test.tsx` | Pass |
| UI-03 | Component | AC-04 | การควบคุมสิทธิ์ตาม Transition Matrix และ Resolution Gate บน UI | ไม่แสดงตัวเลือก Resolved ให้ Requester และแสดงสถานะถัดไปตาม Matrix สำหรับ Staff | `client/src/components/__tests__/TicketWorkflow.test.tsx` | Pass |
| UI-04 | Component | AC-02 | การแสดงผลและการ Drill-down บน Requester Dashboard | แสดงการ์ดสถิติ 4 ใบและตารางตั๋วพร้อมคลิกดูรายละเอียด | `client/src/__tests__/lab-04/RequesterDashboard.test.tsx` | Pass |
| E2E-01 | E2E | AC-01, AC-04 | การทำงานครบวงจร: ล็อกอิน, บันทึก Action Taken, และ Resolution Gate | บันทึก Action และแสดงผลสถานะถูกต้องตามบทบาทบนเบราว์เซอร์ | `e2e/capture-lab4-screenshots.spec.ts` | Pass |

---

## 2. Full Regression Test Execution Summary (Local Environment)

การทดสอบในเครื่อง Local ยืนยันว่าฟีเจอร์เดิมจาก Sprint 1, 2, 3 และฟีเจอร์ใหม่ของ Sprint 4 ผ่านการทดสอบทั้งหมด 100% โดยไม่มีข้อผิดพลาด (0 Failures):

### 2.1 Backend API Test Suite (`server/`)
* **คำสั่งที่รัน:** `cd server && npm test` (`vitest run --fileParallelism=false`)
* **ผลลัพธ์:** **17 Test Files ผ่านทั้งหมด (17/17), รวม 71 Tests ผ่านทั้งหมด (71/71)**
* **ระยะเวลา:** 24.12 วินาที

| Test Suite / File | Category | Number of Tests | Status |
| :--- | :--- | :---: | :---: |
| `tests/lab-01/health.test.ts` | Sprint 1 Foundation | 1 | Pass |
| `tests/lab-01/categories.test.ts` | Sprint 1 Foundation | 1 | Pass |
| `tests/lab-02/create-ticket.api.test.ts` | Sprint 2 Requester Flow | 3 | Pass |
| `tests/lab-02/my-tickets.api.test.ts` | Sprint 2 Requester Flow | 5 | Pass |
| `tests/lab-02/ticket-detail.api.test.ts` | Sprint 2 Requester Flow | 3 | Pass |
| `tests/lab-02/attachments.api.test.ts` | Sprint 2 Requester Flow | 5 | Pass |
| `tests/lab-03/auth.api.test.ts` | Sprint 3 Auth & Security | 6 | Pass |
| `tests/lab-03/users-admin.api.test.ts` | Sprint 3 Admin & Safety Rules | 6 | Pass |
| `tests/lab-03/authorization.api.test.ts` | Sprint 3 RBAC Authorization | 4 | Pass |
| `tests/lab-03/staff-queue.api.test.ts` | Sprint 3 Staff Operations | 4 | Pass |
| `tests/lab-03/staff-ticket-detail.api.test.ts` | Sprint 3 Staff Operations | 2 | Pass |
| `tests/lab-03/comments-notes.api.test.ts` | Sprint 3 Staff Comments | 3 | Pass |
| `tests/lab-04/actions-taken.api.test.ts` | Sprint 4 Actions Taken (AC-01, AC-03) | 10 | Pass |
| `tests/lab-04/ticket-workflow.api.test.ts` | Sprint 4 Workflow & Resolution Gate (AC-04) | 8 | Pass |
| `tests/lab-04/staff-dashboard.api.test.ts` | Sprint 4 Staff Dashboard (AC-02) | 3 | Pass |
| `tests/lab-04/requester-dashboard.api.test.ts` | Sprint 4 Requester Dashboard (AC-02) | 3 | Pass |
| `tests/lab-04/dashboard-smoke.test.ts` | Sprint 4 Route Auth Smoke Tests | 4 | Pass |
| **รวม Backend ทั้งสิ้น** | | **71 Tests** | **Pass (100%)** |

### 2.2 Frontend Component Test Suite (`client/`)
* **คำสั่งที่รัน:** `cd client && npm test` (`vitest run`)
* **ผลลัพธ์:** **12 Test Files ผ่านทั้งหมด (12/12), รวม 42 Tests ผ่านทั้งหมด (42/42)**
* **ระยะเวลา:** 10.33 วินาที

| Test Suite / File | Category | Number of Tests | Status |
| :--- | :--- | :---: | :---: |
| `src/App.test.tsx` | Core Shell & Tabs Navigation | 5 | Pass |
| `src/components/__tests__/CreateTicket.test.tsx` | Ticket Creation Component | 2 | Pass |
| `src/components/__tests__/MyTickets.test.tsx` | My Tickets Table & Filters | 2 | Pass |
| `src/components/__tests__/TicketDetail.test.tsx` | Ticket Detail & Readonly Mode | 3 | Pass |
| `src/components/__tests__/ActionsTaken.test.tsx` | Actions Taken Component (AC-01) | 3 | Pass |
| `src/__tests__/lab-04/ActionsTaken.test.tsx` | Actions Taken Lab 4 Verification | 3 | Pass |
| `src/components/__tests__/TicketWorkflow.test.tsx` | Ticket Workflow Component (AC-04) | 9 | Pass |
| `src/__tests__/lab-04/TicketWorkflow.test.tsx` | Workflow Transition Matrix Verification | 4 | Pass |
| `src/components/__tests__/StaffDashboard.test.tsx` | IT Staff Dashboard Component | 1 | Pass |
| `src/__tests__/lab-04/StaffDashboard.test.tsx` | Staff Dashboard Metrics & Drill-down | 4 | Pass |
| `src/components/__tests__/RequesterDashboard.test.tsx` | Requester Dashboard Component | 1 | Pass |
| `src/__tests__/lab-04/RequesterDashboard.test.tsx` | Requester Dashboard Cards & Table | 5 | Pass |
| **รวม Frontend ทั้งสิ้น** | | **42 Tests** | **Pass (100%)** |

### 2.3 Type Check & Build Verification
* **Backend TypeScript Check:** `cd server && npx tsc --noEmit` -> **0 Errors (Pass)**
* **Frontend TypeScript Build:** `cd client && npm run build` (`tsc -b && vite build`) -> **0 Errors (Pass)**
