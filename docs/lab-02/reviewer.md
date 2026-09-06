# Lab 2: Peer Review Record & Audit Evidence

## 1. Reviewer & Metadata Information
- **Reviewee / Author:** Rattananan Siriponwat (TokTickIT Implementation Lead)
- **Reviewer Names:** Panuwat Boonsak, Krittamate Niyomtham (Peer Review Team)
- **Review Date:** September 4–6, 2026
- **Sprint / Milestone:** Lab 2 (Requester Ticketing MVP with Zen Green UI Foundation)
- **Target Integration Branch:** `lab2-staging`
- **Final Release Branch:** `main`

---

## 2. Pull Requests Reviewed & Branch Flow

| PR # | Feature Branch | Target Branch | Title & Scope | Status |
| :---: | :--- | :--- | :--- | :---: |
| **#12** | `feat/spec-and-test-plan` | `lab2-staging` | **Issue 1:** Sprint Specification & Test Planning Contract | Merged |
| **#14** | `feat/database-and-seed` | `lab2-staging` | **Issue 2:** Database Models, Prisma Schema & Idempotent Seed | Merged |
| **#16** | `feat/requester-context-ui` | `lab2-staging` | **Issue 3:** Simulated Requester Selection Context API & UI | Merged |
| **#18** | `feat/ticket-creation` | `lab2-staging` | **Issue 4:** App Layout & Create Ticket Form with Validations | Merged |
| **#20** | `feat/my-tickets` | `lab2-staging` | **Issue 5:** My Tickets List, Multi-Filter, Sorting & Pagination | Merged |
| **#22** | `feat/ticket-detail` | `lab2-staging` | **Issue 6:** Ticket Detail View & Cross-Requester 403 Forbidden | Merged |
| **#24** | `feat/attachment-lifecycle` | `lab2-staging` | **Issue 7:** Attachment Management Lifecycle & Soft Removal | Merged |
| **#26** | `feat/automated-tests` | `lab2-staging` | **Issue 8:** Unit, API Integration & E2E Test Suites Validation | Merged |
| **#28** | `feat/responsive-and-ui-evidence` | `lab2-staging` | **Issue 9:** Visual Inspection, Zen Green Palette & Responsive Checks | Merged |
| **#29** | `lab2-staging` | `main` | **Release:** Sprint 2 TokTickIT Requester Ticketing MVP Final Release | Merged |

---

## 3. Pull Request Review Details & Issue Logs

### Issue 1–3: Architecture, Data Models & Persona Switching
- **PR Links:** [PR #12](https://github.com/helloiamyok/TokTickIT/pull/12), [PR #14](https://github.com/helloiamyok/TokTickIT/pull/14), [PR #16](https://github.com/helloiamyok/TokTickIT/pull/16)
- **Reviewer Feedback (Panuwat):**
  - สเปกชัดเจน มีการแจกแจง Business Rules (BR-01 ถึง BR-12) และ Acceptance Criteria ครอบคลุม
  - ตรวจสอบ Prisma Schema พบว่าออกแบบ Relations และ Foreign keys เหมาะสม การใช้ `upsert` ใน `seed.ts` ป้องกันข้อมูลซ้ำซ้อนได้ดีมาก (Idempotent seed)
  - API `/api/requesters` และ `RequesterSelect.tsx` กรองเฉพาะ `isActive: true` เรียบร้อย จัดการ Clean-up effect (ignore flag), Loading/Error state และคุมโทนสี Zen Green ถูกต้อง
- **Author Response & Action Taken:**
  - เพิ่มเงื่อนไข Excluded Scope ชัดเจนใน `specification.md` (ไม่ทำ Login จริง และไม่ทำ Workflow เจ้าหน้าที่ IT ใน Sprint นี้)
  - ทดสอบรัน `npx prisma db seed` ซ้ำหลายรอบ ยืนยันว่าไม่มีข้อผิดพลาด Duplicate key
- **Status:** ✅ Approved & Merged

### Issue 4: Create Ticket Flow & Official Number Generation (BR-01, BR-02, BR-03)
- **PR Link:** [PR #18](https://github.com/helloiamyok/TokTickIT/pull/18)
- **Reviewer Feedback (Krittamate):**
  - การจัด Layout หน้าฟอร์มเรียบร้อย Form Validation แสดง Error message ชัดเจนเมื่อเว้นว่างฟิลด์บังคับ
  - แนะนำให้ล็อกช่อง Ticket Number ให้เป็น Read-only/Disabled อย่างเด็ดขาด และให้ Backend สร้างรหัสตามรูปแบบ `TKT-YYYY-XXXXXX` เสมอ ห้ามรับค่าจาก Client
- **Author Response & Action Taken:**
  - ปรับช่อง Ticket Number เป็น Disabled พร้อมคำอธิบายว่าจะถูกสร้างโดยระบบหลังกดส่งสำเร็จ
  - บันทึก Error state และ Form retention ให้ข้อมูลที่กรอกไม่สูญหายหากเกิด Network error
- **Status:** ✅ Approved & Merged

### Issue 5: My Tickets Search, Filtering, Pagination & Isolation (FR-09 / BR-04)
- **PR Link:** [PR #20](https://github.com/helloiamyok/TokTickIT/pull/20)
- **Reviewer Feedback (Krittamate):**
  - แนะนำให้เพิ่ม `useEffect` ที่ผูกกับ `[search, statusFilter, sortBy, page]` เพื่อให้ตารางโหลดใหม่ทันที
  - ให้เพิ่ม Query params ในการเรียก API `/api/tickets` เพื่อรองรับ Server-side pagination
  - ตรวจสอบ `onClick` handlers ในปุ่มเปลี่ยนหน้า และต้องแนบ `x-requester-id` header ในคำขอเสมอ เพื่อให้ระบบแยกตั๋วตามผู้ใช้จริง (Data Isolation)
- **Author Response & Action Taken:**
  - เพิ่ม Query parameters (`search`, `category`, `status`, `page`, `limit`) ใน Client service
  - ผูก Header `x-requester-id` ตาม Requester ปัจจุบัน และรีเซ็ตกลับเป็น Page 1 เสมอเมื่อผู้ใช้พิมพ์คำค้นหาใหม่
- **Status:** ✅ Approved & Merged

### Issue 6–7: Ticket Detail, Attachment Constraints & 403 Forbidden (BR-05 / BR-06 / BR-07)
- **PR Links:** [PR #22](https://github.com/helloiamyok/TokTickIT/pull/22), [PR #24](https://github.com/helloiamyok/TokTickIT/pull/24)
- **Reviewer Feedback (Panuwat):**
  - ตรวจสอบความปลอดภัย 403 Forbidden เมื่อ Requester พยายามเปิดดูตั๋วที่ไม่ใช่ของตนเองผ่าน URL โดยตรง
  - ให้ตรวจทานว่าการอัปโหลดจำกัดขนาดไฟล์ไม่เกิน 5 MB และไม่เกิน 5 ไฟล์ต่อตั๋วอย่างเคร่งครัด
  - ปุ่มลบไฟล์แนบต้องแสดง Modal บังคับกรอกเหตุผลก่อนทำการ Soft-delete และปิดกั้นไม่ให้ดาวน์โหลดไฟล์ที่ถูกลบแล้ว
- **Author Response & Action Taken:**
  - เพิ่ม Middleware ตรวจสอบความเป็นเจ้าของตั๋วใน backend `GET /api/tickets/:id` หากไม่ตรงจะส่ง 403 Forbidden ทันที
  - เพิ่ม Client-side validation ก่อนอัปโหลด และบันทึกข้อความเหตุผลลงฟิลด์ `removalReason` พร้อมสถานะ `isDeleted: true`
- **Status:** ✅ Approved & Merged

### Issue 8–9: Automated Testing, Multi-Viewport & Zen Green UI Tokens
- **PR Links:** [PR #26](https://github.com/helloiamyok/TokTickIT/pull/26), [PR #28](https://github.com/helloiamyok/TokTickIT/pull/28)
- **Reviewer Feedback (Panuwat & Krittamate):**
  - ตรวจสอบความสม่ำเสมอของชุดสี Zen Green: ปุ่มหลักและแท็บที่เลือกต้องใช้ `#006B3C` / `#0B7A46`, พื้นหลังใช้ `#F5F7F6`
  - ตรวจสอบ Responsive Layout บน Desktop (≥992px), Tablet (768–991px) และ Mobile (390px) ต้องไม่มี Horizontal scrollbar ล้นจอ
  - ชื่นชมผลการทดสอบ Automated Tests ครบทั้ง Unit, Integration และ E2E ผ่าน 100%
  - ตรวจสอบรูปหลักฐานใน `artifacts/lab-02/screenshots/` จัดเก็บครบถ้วนตามหมวดหมู่
- **Author Response & Action Taken:**
  - แปลงตารางในหน้า `MyTickets` ให้กลายเป็นโครงสร้าง Stacked Cards บนหน้าจอมือถือ (<768px)
  - ตรวจสอบและบันทึกภาพหน้าจอหลักฐานครบทั้ง 3 Viewports ลงในโฟลเดอร์ artifacts พร้อมสำหรับการจัดเล่มรายงาน
- **Status:** ✅ Approved & Merged

---

## 4. Final Verification & Sign-off
- [x] **Automated Tests**: ผ่าน 100% ทุกชุดทดสอบ ทั้ง Backend API tests และ Frontend UI components (11 passed).
- [x] **Definition of Done**: ปฏิบัติตามข้อกำหนดใน `specification.md` ครบถ้วนทุกข้อ.
- [x] **Git Workflow Conformance**: ทุกฟีเจอร์ผ่านการเปิด PR เข้าสู่ `lab2-staging` และรวมเข้าสู่ `main` อย่างเป็นทางการ.
- **Final Recommendation**: ผ่านการประเมินและอนุมัติให้ Release ขึ้นสู่ Production Branch (`main`) เรียบร้อยแล้ว.