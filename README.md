# TokTickIT — IT Service Desk Application (Lab 3)

Semester 1/2026. CPE 334 Introduction to Software Engineering in the Age of AI Agents.

TokTickIT เป็นระบบจัดการคำร้องงานไอที (IT Service Desk) แบบ Full-Stack พัฒนาด้วย React 18, Vite, TypeScript, Express, PostgreSQL และ Prisma ORM บนมาตรฐานการออกแบบ **Zen Green Theme**

ใน **Sprint 3** ระบบได้นำ Development Requester Selector ชั่วคราวของ Lab 2 ออก และแทนที่ด้วยระบบ **Authentication** เต็มรูปแบบ, การตรวจสอบสิทธิ์ตามบทบาทผ่านเซิร์ฟเวอร์ (**Server-side Role-based Authorization**), หน้าจอจัดการงานสำหรับทีมไอที (**IT Staff Ticket Queue & Operations**), และหน้าระบบจัดการผู้ใช้สำหรับผู้ดูแลระบบแบบมินิมอล (**Administrator User Management**)

---

## 🚀 Tech Stack

- **Frontend:** React 18 (TypeScript), Vite, Bootstrap 5 (Zen Green Design System), Vitest
- **Backend:** Node.js, Express (TypeScript), PostgreSQL, Prisma ORM, Vitest + Supertest
- **End-to-End Testing:** Playwright

---

## ✨ Features Implemented (Sprint 3)

- **Authentication & Security:** ล็อกอินด้วยอีเมลและรหัสผ่าน, บังคับเปลี่ยนรหัสผ่านเมื่อเข้าใช้งานครั้งแรก (Mandatory first-login password change), ล็อกเอาต์ปลอดภัย, และระบุตัวตนด้วย HTTP-only Cookies
- **Role-Based Authorization:** แยกระดับสิทธิ์เด็ดขาด 3 บทบาท (`Requester`, `IT Staff`, `Administrator`) ผ่าน Server-side middleware
- **Requester Continuity & Feedback:** ผู้ใช้ทั่วไปจัดการเฉพาะคำร้องตนเอง, ส่ง Public Comments โต้ตอบกับทีมงาน, และมีปุ่มระบุสถานะ "Problem Appears Resolved"
- **IT Staff Ticket Queue:** ตารางรวมคำร้อง ค้นหาข้อมูล (Search), กรองสถานะและระดับความสำคัญ (Filter), จัดเรียง (Sort), และแบ่งหน้า (Pagination)
- **IT Staff Ticket Detail & Operations:** รับงาน/มอบหมายงาน (Ownership assignment), ปรับระดับความสำคัญไอที (IT Priority), ดำเนินขั้นตอนสถานะ (Status transitions), และบันทึกหมายเหตุภายใน (Internal Notes) ที่ซ่อนจากผู้แจ้ง
- **Minimalist Administrator User Management:** ค้นหาและดูรายชื่อผู้ใช้, สร้างบัญชีใหม่พร้อมกำหนดสิทธิ์เดียว, ปรับสถานะเปิด/ปิดใช้งาน (Active/Inactive), ตั้งรหัสผ่านเริ่มต้นใหม่ พร้อมระบบป้องกันตนเอง (ห้ามปิดบัญชีตัวเอง / ห้ามปิดบัญชี Admin คนสุดท้าย)

---

## 🎨 Zen Green Theme Palette

- **Primary Green**: `#006B3C` (ปุ่มหลัก และสถานะนำทางที่เลือก)
- **Secondary Green**: `#0B7A46` (แถบป้ายสถานะ และการเน้นลำดับรอง)
- **Pale Green / Accent**: `#EAF6EF` (แถวที่เลือก หรือไฮไลต์คอนเทนเนอร์)
- **Neutral Background**: `#F5F7F6` (พื้นหลังโครงสร้างของแอปพลิเคชัน)

---

## 🔑 Test Accounts (Lab 3 Authentication)

| Role | Email | Initial Password | Notes |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@example.com` | `password123` | จัดการผู้ใช้งานและกำหนดสิทธิ์ระบบ |
| **IT Staff** | `staff@example.com` | `password123` | ดำเนินการคิวคำร้อง อัปเดตสถานะ และจดบันทึก Internal Notes |
| **Requester** | `user@example.com` | `password123` | บัญชีผู้แจ้งปัญหา (เข้าสู่ระบบครั้งแรกจะบังคับเปลี่ยนรหัสผ่าน) |

---

## 📂 Repository Structure

```text
toktickit/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   ├── tests/
│   │   ├── e2e/
│   │   │   └── lab-02-responsive-screenshots.spec.ts
│   │   ├── lab-02/
│   │   └── lab-03_tests/
│   │       ├── Login.test.tsx
│   │       ├── ChangePassword.test.tsx
│   │       ├── StaffTicketQueue.test.tsx
│   │       ├── StaffTicketDetail.test.tsx
│   │       └── UserManagement.test.tsx
│   ├── package.json
│   ├── playwright.config.ts
│   └── vite.config.ts
├── server/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   ├── tests/
│   │   ├── lab-02/
│   │   └── lab-03/
│   │       ├── auth.api.test.ts
│   │       ├── authorization.api.test.ts
│   │       ├── staff-queue.api.test.ts
│   │       ├── staff-ticket-detail.api.test.ts
│   │       ├── comments-notes.api.test.ts
│   │       └── users-admin.api.test.ts
│   └── package.json
├── docs/
│   ├── lab-01/
│   │   ├── ai_use.md
│   │   ├── reviewer.md
│   │   └── tests.md
│   ├── lab-02/
│   │   ├── specification.md
│   │   ├── tests.md
│   │   ├── ui-spec.md
│   │   ├── api-spec.md
│   │   ├── reviewer.md
│   │   └── ai-use.md
│   └── lab-03/
│       ├── specification.md
│       ├── tests.md
│       ├── ui-spec.md
│       ├── api-spec.md
│       ├── reviewer.md
│       └── ai-use.md
├── e2e/
│   ├── lab-02/
│   └── lab-03/
│       ├── authentication.spec.ts
│       ├── staff-ticket-flow.spec.ts
│       └── user-administration.spec.ts
├── artifacts/
│   ├── lab-02/
│   │   └── screenshots/
│   └── lab-03/
│       └── screenshots/
│           ├── authentication/
│           ├── staff-queue/
│           ├── staff-ticket-detail/
│           └── user-management/
├── .gitignore
└── README.md