# TokTickIT — IT Service Desk Application (Lab 4)

Semester 1/2026. CPE 334 Introduction to Software Engineering in the Age of AI Agents.

TokTickIT เป็นระบบจัดการคำร้องงานไอที (IT Service Desk) แบบ Full-Stack พัฒนาด้วย React 18, Vite, TypeScript, Express, PostgreSQL และ Prisma ORM บนมาตรฐานการออกแบบ **Zen Green Theme**

ใน **Sprint 4 (Lab 4)** ระบบได้รับการต่อยอดขยายขีดความสามารถหลัก 3 ส่วน ได้แก่ ระบบบันทึกการปฏิบัติงานจริง (**Actions Taken Tracking**), เวิร์กโฟลว์สถานะตั๋วและประตูปิดงาน (**Ticket Workflow & Resolution Gate**), แดชบอร์ดสรุปสถิติตามบทบาทผู้ใช้ (**Role-Based Dashboards: IT Staff & Requester**), พร้อมการตรวจสอบความเสถียรและความเข้ากันได้ย้อนหลังแบบสมบูรณ์ (**Hardening & Full Regression**) ครอบคลุมการทำงานตั้งแต่ Lab 1 ถึง Lab 3

---

## 🚀 Tech Stack

- **Frontend:** React 18 (TypeScript), Vite, Vanilla CSS + Bootstrap 5 (Zen Green Design System), Vitest + React Testing Library
- **Backend:** Node.js, Express (TypeScript), PostgreSQL, Prisma ORM, Vitest + Supertest
- **End-to-End Testing & Visual Evidence:** Playwright

---

## ✨ Features Implemented (Sprint 4)

### 1. Actions Taken Tracking (Issues #2 & #3)
- **1-to-Many Relationship:** ตารางข้อมูล `ActionTaken` ผูกกับ `Ticket` บันทึกประวัติการลงมือปฏิบัติงานจริงของทีมไอทีหลายรายการภายใต้ตั๋วใบเดียว
- **Auto-populated Performed By:** บันทึกผู้ปฏิบัติงานจริงอัตโนมัติจากเซสชันล็อกอินของ IT Staff/Admin
- **Strict Form Validation (BR-05):** หากเลือก `followUpRequired === true` ระบบบังคับกรอก `followUpNote` ทันที พร้อมแนบหมายเหตุไฟล์ประกอบ (`attachmentNotes`)
- **Role-Gated Interface:** ฝั่ง Requester แสดงผลประวัติการแก้ไขแบบอ่านอย่างเดียว (Read-Only) โปร่งใสแต่ไม่สามารถเพิ่มหรือแก้ไขข้อมูลได้

### 2. Ticket Workflow & Resolution Gate (Issue #4)
- **8-Status Transition Matrix (BR-04):** ควบคุมการเปลี่ยนสถานะของตั๋วอย่างเคร่งครัด ได้แก่ `NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED`, `CLOSED`, `REOPENED`, `CANCELLED`
- **Resolution Gate Enforcement (BR-03):** ป้องกันไม่ให้ Requester เปลี่ยนสถานะตั๋วเป็น `RESOLVED` หรือ `CLOSED` ได้โดยตรง (ส่งคืน 403 Forbidden เสมอ)
- **Advisory Resolution Indication:** Requester ทำได้เพียงกดส่งสัญญาณแจ้งเตือน "Mark as Problem Solved (Advisory)" พร้อมบันทึกข้อความแนะนำ โดยการปิดงานจริงต้องกระทำโดย IT Staff หรือ Administrator เท่านั้น
- **Optimistic UI & Audit Badges:** ป้ายสถานะตั๋วอัปเดตแบบเรียลไทม์ พร้อมแสดงบันทึกเวลาและการแก้ไขล่าสุด

### 3. Role-Based Dashboards (Issue #5)
- **IT Staff Dashboard (`/it/dashboard`):** สรุปการ์ดสถิติ Aggregate 5 รายการ (`New`, `Open`, `In Progress`, `Waiting for Requester`, `My Assigned`) พร้อมระบบ Drill-down คลิกที่การ์ดแล้วนำทางไปยังหน้ารายการตั๋วที่กรองสถานะนั้นๆ และตาราง Recent Tickets
- **Requester Dashboard (`/dashboard`):** แสดงสถิติตั๋วของตนเอง (`Open Tickets`, `In Progress`, `Resolved`, `Closed`)
- **Strict Data Isolation (BR-06):** Requester Dashboard กรองข้อมูลเฉพาะตั๋วที่ผู้ใช้นั้นเป็นเจ้าของเท่านั้น ไม่มีการรั่วไหลของข้อมูลตั๋วข้ามบัญชี

### 4. Hardening & Full Regression (Issue #6)
- **Full Regression Integrity:** ผ่านการทดสอบระดับ Automated Tests 100% ทั้งฝั่ง Backend (17 ไฟล์, 71 tests) และ Frontend (12 ไฟล์, 42 tests) ครอบคลุม Authentication, Comments, Internal Notes, Attachments, User Management และ Ticket Creation เดิม
- **Zen Green Accessibility & Responsive:** รองรับการใช้งานแบบ Responsive สมบูรณ์ทั้ง Desktop (1280px), Tablet (768px), และ Mobile (390px) ตามเกณฑ์ WCAG AA

---

## 🎨 Zen Green Theme Palette

- **Primary Green**: `#006B3C` (ปุ่มหลัก และสถานะนำทางที่เลือก)
- **Secondary Green**: `#0B7A46` (แถบป้ายสถานะ และการเน้นลำดับรอง)
- **Pale Green / Accent**: `#EAF6EF` (แถวที่เลือก หรือไฮไลต์คอนเทนเนอร์)
- **Neutral Background**: `#F5F7F6` (พื้นหลังโครงสร้างของแอปพลิเคชัน)
- **Border / Divider**: `#E5E7EB` (เส้นขอบและกรอบการ์ด)

---

## 🔑 Test Accounts (Sprint 4 Seed Credentials)

รหัสผ่านเริ่มต้นสำหรับทุกบัญชีคือ `Password123!` (ยกเว้น Emily Davis สำหรับทดสอบ First-Login Change Password):

| Role | Email | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Administrator** | `john.smith@tiktockit.com` | `Password123!` | จัดการผู้ใช้งาน กำหนดสิทธิ์ และดูแลระบบภาพรวม |
| **IT Staff** | `michael.brown@tiktockit.com` | `Password123!` | ดำเนินการคิวงาน, บันทึก Actions Taken, และเปลี่ยนสถานะตั๋ว |
| **IT Staff** | `sarah.johnson@tiktockit.com` | `Password123!` | เจ้าหน้าที่ไอทีร่วมปฏิบัติงาน |
| **Requester 1** | `jennifer.anderson@tiktockit.com` | `Password123!` | บัญชีผู้แจ้งปัญหาหลัก (เจ้าของตั๋ว Ticket 1) |
| **Requester 2** | `amanda.clark@tiktockit.com` | `Password123!` | บัญชีผู้แจ้งปัญหาสำหรับทดสอบ Data Isolation บนแดชบอร์ด |
| **Requester 3** | `emily.davis@tiktockit.com` | `InitialPassword123!` | บัญชีสำหรับทดสอบ Mandatory First-Login Password Change |

---

## 🛠️ Getting Started & Local Development

### 1. Prerequisites
- Node.js (v20+)
- PostgreSQL (v15+)

### 2. Environment Setup
สร้างไฟล์ `.env` ในโฟลเดอร์ `server/`:
```env
DATABASE_URL="postgresql://postgres:123456789@localhost:5432/toktickit?schema=public"
JWT_SECRET="lab3-jwt-secret-key-334"
PORT=3000
NODE_ENV=development
```

### 3. Database Migration & Idempotent Seed
```bash
cd server
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
```

### 4. Running Development Servers
- **Backend Server (Port 3000):**
  ```bash
  cd server
  npm run dev
  ```
- **Frontend Client (Port 5173):**
  ```bash
  cd client
  npm run dev
  ```

### 5. Running Automated Tests
- **Backend API Tests (Vitest):**
  ```bash
  cd server
  npm test
  # หรือเจาะจงเฉพาะ Lab 4:
  npx vitest run --fileParallelism=false tests/lab-04
  ```
- **Frontend Component Tests (Vitest):**
  ```bash
  cd client
  npm test
  ```
- **Automated Evidence Capture (Playwright):**
  ```bash
  node scripts/capture_all_lab4_evidence.mjs
  ```

---

## 📂 Repository Structure

```text
TokTickIT/
├── client/
│   ├── src/
│   │   ├── __tests__/
│   │   │   └── lab-04/
│   │   │       ├── ActionsTaken.test.tsx
│   │   │       ├── TicketWorkflow.test.tsx
│   │   │       ├── StaffDashboard.test.tsx
│   │   │       └── RequesterDashboard.test.tsx
│   │   ├── components/
│   │   │   ├── ActionsTakenSection.tsx
│   │   │   ├── TicketWorkflow.tsx
│   │   │   ├── StaffDashboard.tsx
│   │   │   ├── RequesterDashboard.tsx
│   │   │   ├── TicketDetail.tsx
│   │   │   └── MyTickets.tsx
│   │   ├── constants/
│   │   │   └── ticketWorkflow.ts
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   └── pages/
│   │       ├── StaffDashboard.tsx
│   │       ├── RequesterDashboard.tsx
│   │       ├── StaffTicketQueue.tsx
│   │       ├── StaffTicketDetail.tsx
│   │       └── UserManagement.tsx
│   └── package.json
├── server/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── actionTakenController.ts
│   │   │   ├── dashboardController.ts
│   │   │   ├── ticketWorkflowController.ts
│   │   │   └── user.controller.ts
│   │   ├── routes/
│   │   │   ├── actionTaken.routes.ts
│   │   │   ├── dashboard.routes.ts
│   │   │   ├── ticketRoutes.ts
│   │   │   └── staff.routes.ts
│   │   ├── constants/
│   │   │   └── ticketWorkflow.ts
│   │   └── lib/
│   │       └── prisma.ts
│   ├── tests/
│   │   ├── lab-01/
│   │   ├── lab-02/
│   │   ├── lab-03/
│   │   └── lab-04/
│   │       ├── actions-taken.api.test.ts
│   │       ├── ticket-workflow.api.test.ts
│   │       ├── staff-dashboard.api.test.ts
│   │       ├── requester-dashboard.api.test.ts
│   │       └── dashboard-smoke.test.ts
│   └── package.json
├── docs/
│   ├── lab-01/
│   ├── lab-02/
│   ├── lab-03/
│   └── lab-04/
│       ├── specification.md
│       ├── tests.md
│       ├── ui-spec.md
│       ├── api-spec.md
│       ├── reviewer.md
│       └── ai-use.md
├── artifacts/
│   ├── lab-02/
│   ├── lab-03/
│   └── lab-04/
│       └── screenshots/
├── scripts/
│   ├── capture_all_lab2_evidence.mjs
│   └── capture_all_lab4_evidence.mjs
├── .gitignore
├── package.json
└── README.md
```