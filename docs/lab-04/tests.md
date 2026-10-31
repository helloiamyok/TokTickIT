# Tok TickIT - Test Plan (Sprint 4)

| Test ID | Type | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| API-01 | API | AC-01 | สร้าง Action Taken สำเร็จโดย IT Staff | ข้อมูลถูกบันทึกพร้อม Performed By อัตโนมัติ (Status 201) | `server/tests/lab-04/actions-taken.api.test.ts` | Pass |
| API-02 | API | AC-01 | Requester พยายามสร้าง Action Taken | ระบบปฏิเสธการทำงานด้วยรหัส 403 Forbidden | `server/tests/lab-04/actions-taken.api.test.ts` | Pass |
| API-03 | API | AC-03 | สร้าง Action Taken โดยเลือก Follow-up Required แต่ไม่กรอก Note | ระบบปฏิเสธด้วยรหัส 400 Bad Request | `server/tests/lab-04/actions-taken.api.test.ts` | Pass |
| API-04 | API | AC-02 | ดึงข้อมูล Requester Dashboard | คืนเฉพาะตัวเลขและข้อมูลตั๋วที่เป็นของตนเอง | `server/tests/lab-04/requester-dashboard.api.test.ts` | Pass |
| API-05 | API | AC-04 | Requester พยายามเปลี่ยนสถานะ Ticket เป็น Resolved โดยตรง | ระบบไม่อนุญาตและไม่เปลี่ยนสถานะ | `server/tests/lab-04/ticket-workflow.api.test.ts` | Pass |
| API-06 | API | AC-02 | ดึงข้อมูล IT Staff Dashboard | คำนวณสรุปสถิติตั๋ว (New, Open, In Progress, Waiting, Assigned) พร้อม recent tickets และกั้นสิทธิ์ตามบทบาท | `server/tests/lab-04/staff-dashboard.api.test.ts` | Pass |
| API-07 | API | AC-02 | Dashboard Smoke Tests สำหรับ Auth & Role Enforcement | 401 unauth, 403 requester on staff, 200 staff on staff, 200 requester on requester | `server/tests/lab-04/dashboard-smoke.test.ts` | Pass |
| UI-01 | Component | AC-01 | การแสดงผลและการตรวจสอบ Validation ของฟอร์ม Action Taken | แจ้งเตือนเมื่อช่อง Follow-up Note ว่างเปล่า | `client/src/components/__tests__/ActionsTaken.test.tsx` | Pass |
| UI-02 | Component | AC-02 | การ Drill-down จากการ์ดบน IT Staff Dashboard | นำทางไปยังรายการตั๋วพร้อมพารามิเตอร์กรองสถานะถูกต้อง | `client/src/components/__tests__/StaffDashboard.test.tsx` | Pass |
| UI-03 | Component | AC-04 | การควบคุมสิทธิ์ตาม Transition Matrix และ Resolution Gate บน UI | ไม่แสดงตัวเลือก Resolved ให้ Requester และแสดงสถานะถัดไปตาม Matrix สำหรับ Staff | `client/src/components/__tests__/TicketWorkflow.test.tsx` | Pass |
| UI-04 | Component | AC-02 | การแสดงผลและการ Drill-down บน Requester Dashboard | แสดงการ์ดสถิติ 4 ใบและตารางตั๋วพร้อมคลิกดูรายละเอียด | `client/src/__tests__/lab-04/RequesterDashboard.test.tsx` | Pass |
| E2E-01 | E2E | AC-01, AC-04 | โฟลว์การเปิดตั๋ว บันทึก Action Taken และตรวจยืนยันปิดงาน | สามารถบันทึก Action และอัปเดตสถานะสำเร็จครบวงจร | `e2e/lab-04/actions-taken-flow.spec.ts` | Planned |
