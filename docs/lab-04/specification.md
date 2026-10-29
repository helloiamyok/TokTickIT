# Tok TickIT - Sprint 4 Specification

## 1. Sprint Goal
ขยายขีดความสามารถของระบบ Tok TickIT โดยเพิ่มระบบ Actions Taken ให้เจ้าหน้าที่ IT บันทึกการปฏิบัติงาน, กำหนดเงื่อนไขการเปลี่ยนสถานะตั๋ว (Ticket Status Transition Matrix) และ Resolution Gate ให้รัดกุม, เพิ่มหน้ารวมสรุปข้อมูล (Dashboards) สำหรับ Requester และ IT Staff, พร้อมทั้งควบคุมการถดถอยของระบบ (Regression) จากสปรินต์ก่อนหน้าทั้งหมด

## 2. Stakeholder Request
ระบบต้องการให้สามารถวางแผนและบันทึกการทำงานจริงของเจ้าหน้าที่ IT ผ่าน Actions Taken ภายใต้ Ticket แต่ละใบ โดยผู้สร้าง Ticket ยังคงมี Ticket Owner หลักรับผิดชอบภาพรวม ขณะที่เจ้าหน้าที่ IT ท่านอื่นสามารถร่วมบันทึก Action ได้ การเปลี่ยนสถานะตั๋วเป็น Resolved ต้องได้รับการตรวจสอบและยืนยันโดยเจ้าหน้าที่ IT เท่านั้น (ความเห็นของ Requester เป็นเพียงข้อแนะนำ) นอกจากนี้ต้องมี Dashboard แสดงตัวเลขสรุปและเชื่อมโยงไปยังหน้ารายการอย่างกระชับ

## 3. Scope
* **In-Scope:**
  * การบันทึกและแก้ไข Actions Taken
  * ตารางจำกัดสิทธิ์และการเปลี่ยนสถานะ Ticket อย่างสมบูรณ์
  * IT Staff Dashboard และ Requester Dashboard (สรุปเมทริกซ์และ Drill-down)
  * การป้องกัน Stale Update / Concurrency
  * Regression behavior จาก Lab 1-3
* **Explicitly Excluded:**
  * SLA clocks, Escalation engine, On-call scheduling อัตโนมัติ
  * บริการส่งแจ้งเตือนภายนอก (Email, SMS, LINE, Push)
  * การตัดสต็อกอะไหล่ จัดซื้อ หรือคิดต้นทุนค่าบริการ
  * การคำนวณเงินเดือนหรือ Time-sheet billing
  * ระบบอนุมัติหลายระดับ (Multi-level approvals) และ E-signatures

## 4. Functional Requirements
* **FR-01:** IT Staff และ Administrator สามารถสร้างและแก้ไข Action Taken ใน Ticket ได้
* **FR-02:** Requester สามารถดูรายการ Actions Taken ใน Ticket ของตนเองได้ แต่ไม่สามารถสร้างหรือแก้ไขได้
* **FR-03:** ระบบต้องบันทึก Performed By อัตโนมัติจากข้อมูลผู้ใช้ที่เข้าสู่ระบบ
* **FR-04:** ระบบต้องบังคับระบุ Follow-up Note เมื่อมีการเลือก Follow-Up Required เป็นจริง
* **FR-05:** ระบบต้องมี Endpoint สำหรับดึงข้อมูลสรุป Dashboard แยกตามบทบาทของผู้ใช้

## 5. Business Rules
* **BR-01:** Action Taken แต่ละรายการต้องขึ้นตรงต่อ Ticket เพียง 1 ใบเท่านั้น
* **BR-02:** Ticket Owner มีหน้าที่ประสานงานตั๋ว แต่เจ้าหน้าที่ IT คนอื่นสามารถลงมือทำและบันทึก Action Taken ได้
* **BR-03:** สถานะของ Ticket ได้แก่ New, Open, In Progress, Waiting for Requester, Resolved, Closed, Reopened, และ Cancelled
* **BR-04 (Resolution Gate):** Requester สามารถส่งสัญญาณว่าปัญหาได้รับการแก้ไขแล้วได้ แต่ถือเป็น Advisory Note เท่านั้น โดยสถานะตั๋วจะเปลี่ยนเป็น Resolved ได้ต่อเมื่อ IT Staff หรือ Admin ดำเนินการ formally update ผ่านระบบเท่านั้น
* **BR-05:** เฉพาะ Ticket ที่เป็นเจ้าของเท่านั้นที่จะถูกนำมาคำนวณและแสดงผลบน Requester Dashboard
* **BR-06:** การคำนวณตัวเลขบน Dashboard ต้องประมวลผลจากฐานข้อมูลโดยตรงที่ฝั่ง Backend

## 6. UI Specification Summary
การออกแบบอิงตามภาษา Zen Green โดยเพิ่มส่วน Actions Taken เป็นตาราง/รายการใต้ Ticket Detail มีโหมด View และ Create/Edit สำหรับเจ้าหน้าที่ พร้อมจัดทำ IT Staff Dashboard และ Requester Dashboard ซึ่งประกอบด้วย Summary Metric Cards, Recent Tickets List, และ Quick Action Shortcuts พร้อมรองรับ Responsive Design (รายละเอียดเพิ่มเติมใน `docs/lab-04/ui-spec.md`)

## 7. Data Changes
* เพิ่มตาราง `ActionTaken` เชื่อมโยงแบบ One-to-Many กับตาราง `Ticket`
* ฟิลด์ใน `ActionTaken`: `id`, `ticketId`, `actionDateTime`, `actionDescription`, `result`, `performedById`, `followUpRequired`, `followUpNote`, `attachmentNotes`, `createdAt`, `updatedAt`
* **Database Justification 1:** เชื่อมความสัมพันธ์แบบ Foreign Key ไปยังตาราง User ผ่าน `performedById` เพื่อรองรับการตรวจสอบสิทธิ์และดึงข้อมูลเจ้าหน้าที่ผู้ดำเนินการโดยอัตโนมัติอย่างถูกต้อง
* **Database Justification 2:** ตั้งค่าให้ `followUpNote` เป็น Optional ในระดับคอลัมน์ฐานข้อมูล แต่บังคับความถูกต้อง (Validation) ผ่าน Application layer ร่วมกับค่า `followUpRequired` เพื่อรองรับความยืดหยุ่นในการบันทึกข้อมูล

## 8. API Contract Summary
(รายละเอียดฉบับเต็มระบุใน `docs/lab-04/api-spec.md`)
* `POST /api/tickets/:id/actions`: สร้าง Action Taken ใหม่ (เฉพาะ IT Staff / Admin)
* `GET /api/tickets/:id/actions`: ดูรายการ Actions Taken (Requester เฉพาะตั๋วตนเอง, IT Staff / Admin ทั้งหมด)
* `GET /api/dashboards/requester`: เมทริกซ์และรายการ Recent Tickets สำหรับ Requester
* `GET /api/dashboards/staff`: เมทริกซ์และรายการ Recent Tickets สำหรับ IT Staff / Admin
* Concurrency handling รองรับ `updatedAt` / `version` ป้องกัน Stale updates (409 Conflict)

## 9. Acceptance Criteria
* **AC-01:** Given เป็นผู้ใช้บทบาท IT Staff เมื่อส่งข้อมูล Action Taken ที่ถูกต้อง ระบบต้องบันทึกข้อมูลลงฐานข้อมูลโดยผูกกับ Ticket ดังกล่าว และระบุ Performed By ตามข้อมูล Token ผู้ใช้โดยอัตโนมัติ
* **AC-02:** Given ผู้ใช้ล็อกอินเป็น Requester เมื่อเรียกดู Dashboard ข้อมูลสรุปและรายการ Recent Tickets จะต้องแสดงเฉพาะตั๋วที่เป็นของตนเองเท่านั้น
* **AC-03:** Given ผู้ใช้เลือก Follow-Up Required เป็น True เมื่อไม่ได้กรอก Follow-up Note ระบบต้องแจ้งเตือนความผิดพลาดและไม่อนุญาตให้บันทึก
* **AC-04:** Given Requester แจ้งว่าปัญหาได้รับการแก้ไขแล้ว สถานะของ Ticket จะต้องยังไม่เปลี่ยนเป็น Resolved จนกว่าเจ้าหน้าที่ IT จะกดยืนยันการเปลี่ยนสถานะ

## 10. Definition of Done
* ผ่านการตรวจสอบโค้ด (Peer Review) พร้อมกรอก `docs/lab-04/reviewer.md`
* Migration และ Seed รันได้ซ้ำโดยไม่เกิดข้อผิดพลาด (Idempotent) และไม่สูญเสียข้อมูลเดิม
* มีชุดการทดสอบครอบคลุมทุกระดับ (Unit, API, Component, E2E) และผลการรันผ่านทั้งหมด
* การแสดงผลรองรับการใช้งานบน Desktop, Tablet และ Mobile

## 11. Assumptions and Decisions
* หาก Ticket ไม่มี Action Taken ใดๆ บันทึกอยู่ ให้แสดง Empty State ที่เหมาะสมโดยไม่ขัดข้อง
* การคำนวณสรุปผลบน Dashboard ดำเนินการผ่าน Aggregation query บนฐานข้อมูลโดยตรงเพื่อความถูกต้อง
