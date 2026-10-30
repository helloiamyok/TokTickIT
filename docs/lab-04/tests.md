# Tok TickIT - Test Plan (Sprint 4)

| Test ID | Type | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| API-01 | API | AC-01 | สร้าง Action Taken สำเร็จโดย IT Staff | ข้อมูลถูกบันทึกพร้อม Performed By อัตโนมัติ (Status 201) | `server/tests/lab-04/actions-taken.api.test.ts` | Pass |
| API-02 | API | AC-01 | Requester พยายามสร้าง Action Taken | ระบบปฏิเสธการทำงานด้วยรหัส 403 Forbidden | `server/tests/lab-04/actions-taken.api.test.ts` | Pass |
| API-03 | API | AC-03 | สร้าง Action Taken โดยเลือก Follow-up Required แต่ไม่กรอก Note | ระบบปฏิเสธด้วยรหัส 400 Bad Request | `server/tests/lab-04/actions-taken.api.test.ts` | Pass |
| API-04 | API | AC-02 | ดึงข้อมูล Requester Dashboard | คืนเฉพาะตัวเลขและข้อมูลตั๋วที่เป็นของตนเอง | `server/tests/lab-04/requester-dashboard.api.test.ts` | Planned |
| API-05 | API | AC-04 | Requester พยายามเปลี่ยนสถานะ Ticket เป็น Resolved โดยตรง | ระบบไม่อนุญาตและไม่เปลี่ยนสถานะ | `server/tests/lab-04/ticket-workflow.api.test.ts` | Planned |
| UI-01 | Component | AC-01 | การแสดงผลและการตรวจสอบ Validation ของฟอร์ม Action Taken | แจ้งเตือนเมื่อช่อง Follow-up Note ว่างเปล่า | `client/src/components/__tests__/ActionsTaken.test.tsx` | Planned |
| UI-02 | Component | AC-02 | การ Drill-down จากการ์ดบน IT Staff Dashboard | นำทางไปยังรายการตั๋วพร้อมพารามิเตอร์กรองสถานะถูกต้อง | `client/src/components/__tests__/StaffDashboard.test.tsx` | Planned |
| E2E-01 | E2E | AC-01, AC-04 | โฟลว์การเปิดตั๋ว บันทึก Action Taken และตรวจยืนยันปิดงาน | สามารถบันทึก Action และอัปเดตสถานะสำเร็จครบวงจร | `e2e/lab-04/actions-taken-flow.spec.ts` | Planned |
