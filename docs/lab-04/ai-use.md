# AI Use with Reflection (Part 4)

## 1. LLM Models Used
- **Model:** Gemini 2.5 Pro / Claude 3.7 Sonnet / Google Antigravity Agent
- **Platform:** Web Interface & Antigravity AI Coding Assistant
- **Purpose:** ช่วยออกแบบและจัดทำ Sprint 4 Engineering Contract, กำหนดสเปก Actions Taken Architecture, ออกแบบ Ticket Status Transition Matrix & Resolution Gate, วางโครงสร้าง Requester และ IT Staff Dashboards, วางแผนกลไกป้องกัน Concurrency Conflicts (Stale Updates), และจัดทำ Test Plan พร้อมทั้งเอกสารประกอบการประเมินตามมาตรฐานของ Lab 4

---

## 2. Key Prompts Table (ตาราง Prompts สำคัญ)

| No. | Category / Task | Prompt Used | Output / Result from AI |
|:---:|:---|:---|:---|
| 1 | Engineering Contract Setup | "แนวทางการจัดทำ Issue 1: Sprint 4 engineering contract อย่างละเอียดตามข้อกำหนดของ Lab 4 ซึ่งประกอบด้วยการสร้างเอกสารหลัก 4 ไฟล์ไว้ในโฟลเดอร์ docs/lab-04/" | วางแผนและร่างเอกสารครบ 4 ไฟล์หลัก (`specification.md`, `api-spec.md`, `ui-spec.md`, `tests.md`) พร้อมทั้งเตรียม Git Branch `lab4-staging` และ `feature/issue-1-engineering-contract` |
| 2 | Specification & Scope Definition | "โครงสร้างเนื้อหาต้องครอบคลุม 11 หัวข้อตามที่กำหนด: Sprint Goal, Stakeholder Request, Scope, Functional Requirements, Business Rules, UI Spec, Data Changes, API Contract, AC, DoD, Assumptions" | สรุปข้อกำหนดทางวิศวกรรม 11 หัวข้ออย่างครบถ้วน กำหนด In-Scope/Excluded, กฎธุรกิจ BR-01 ถึง BR-06, และ Acceptance Criteria AC-01 ถึง AC-04 โดยไม่มีการตกหล่น |
| 3 | Actions Taken Data Modeling | "เพิ่มตาราง ActionTaken เชื่อมโยงแบบ One-to-Many กับตาราง Ticket... Foreign Key ไปยัง User ผ่าน performedById และ followUpNote validation" | กำหนด Database Schema สำหรับ `ActionTaken` พร้อม Database Justifications ทั้งการเชื่อม Foreign Key กับผู้ใช้ล็อกอิน และการกำหนด Optional Column ร่วมกับ Application Validation Layer |
| 4 | Resolution Gate Architecture | "Requester สามารถส่งสัญญาณว่าปัญหาได้รับการแก้ไขแล้วได้ แต่ถือเป็น Advisory Note เท่านั้น โดยสถานะตั๋วจะเปลี่ยนเป็น Resolved ได้ต่อเมื่อ IT Staff หรือ Admin ยืนยัน" | ออกแบบ State Transition Matrix และกลไก Resolution Gate เพื่อแยกอำนาจการตัดสินใจปิดงาน (Formal Resolution) ของเจ้าหน้าที่ IT ออกจากการแสดงความคิดเห็นของผู้ใช้ Requester |
| 5 | Dashboard Endpoints & Aggregation | "GET /api/dashboards/requester และ GET /api/dashboards/staff... การคำนวณตัวเลขบน Dashboard ต้องประมวลผลจากฐานข้อมูลโดยตรงที่ฝั่ง Backend" | กำหนด REST API Endpoints `/api/dashboards/requester` และ `/api/dashboards/staff` พร้อม Request/Response Schemas และข้อกำหนดการ Query Aggregation จาก Database ฝั่ง Server |
| 6 | Concurrency & Stale Update Handling | "ทุกการอัปเดตสถานะ Ticket ต้องตรวจสอบเงื่อนไขผ่าน updatedAt หรือ Version token เพื่อป้องกันการเขียนทับแบบ Stale update" | ออกแบบ Optimistic Concurrency Control โดยใช้ `updatedAt` / Version token เพื่อตรวจจับการแก้ไขพร้อมกัน และส่งคืนรหัส HTTP `409 Conflict` เมื่อข้อมูลไม่ตรงกัน |
| 7 | Zen Green UI Dashboard & Form Spec | "การออกแบบอิงตามภาษา Zen Green... IT Staff Dashboard (5 Metric Cards, Recent Tickets, Quick Actions), Requester Dashboard (4 Cards), และ Actions Taken Form/Modal" | จัดทำ UI Specification ละเอียดตามแนวทาง Zen Green (`#1B4D3E`) กำหนดการทำงานของ Interactive Form, Dynamic Validation (ช่อง Follow-up Note แสดง Required เมื่อเลือก Follow-up Required), และ Responsive Layouts |
| 8 | Test Plan & Traceability Matrix | "กำหนดรายการแผนการทดสอบล่วงหน้าเพื่อเตรียมพร้อมก่อนเริ่มเขียนโค้ด: API Tests, Component Tests, E2E Tests" | จัดทำตาราง Test Plan & Traceability Matrix 8 รายการครอบคลุม AC-01 ถึง AC-04, ระบุพาธไฟล์ Automated Tests สำหรับ API, Component, และ Playwright E2E ล่วงหน้า |

---

## 3. My Reflection (การสะท้อนความคิดเห็นต่อการใช้ AI)

### 3.1 ประโยชน์และสิ่งที่ได้เรียนรู้จากการใช้ AI
การใช้ AI ในการจัดทำ Engineering Contract ของ Sprint 4 ช่วยยกระดับมาตรฐานการออกแบบระบบทางวิศวกรรมซอฟต์แวร์ได้อย่างมาก โดยเฉพาะในประเด็นต่อไปนี้:
1. **ความครบถ้วนและความสอดคล้องของเอกสาร (Specification Traceability):** AI ช่วยเชื่อมโยง Functional Requirements (FR) เข้ากับ Business Rules (BR), Acceptance Criteria (AC), API Endpoints และ Test Plan ได้อย่างเป็นระบบ ทำให้ทุกเงื่อนไขทางธุรกิจมีชุดการทดสอบรองรับอย่างชัดเจน
2. **การออกแบบสถาปัตยกรรมที่คำนึงถึง Edge Cases:** AI ช่วยระบุประเด็นเรื่อง Concurrency Control (การเกิด Stale Updates ระหว่างที่เจ้าหน้าที่หลายคนเปิดดูตั๋วใบเดียวกัน) และการออกแบบ **Resolution Gate** เพื่อป้องกันไม่ให้ Requester เปลี่ยนสถานะตั๋วข้ามขั้นตอนโดยไม่ผ่านการตรวจสอบของ IT Staff
3. **การประหยัดเวลาในการเตรียม Boilerplate และ Schema:** ช่วยลดเวลาในการร่าง REST API Spec, JSON Payload ตัวอย่าง, และ HTTP Status Codes ทำให้สามารถนำเวลานั้นไปโฟกัสที่การทบทวน Logic และ Business Constraint ของระบบ

### 3.2 ความท้าทายและข้อควรระวัง
1. **การควบคุมขอบเขตของข้อกำหนด (Scope Creep):** ในบางครั้ง AI อาจนำเสนอฟีเจอร์เสริม เช่น ระบบแจ้งเตือน Email/LINE หรือการคำนวณ SLA อัตโนมัติ ซึ่งอยู่นอกเหนือ Scope ของ Lab 4 จึงต้องระบุรายการ "Explicitly Excluded" ไว้อย่างชัดเจนเพื่อป้องกันความสับสน
2. **การคงความสอดคล้องกับโค้ดเบสเดิม (Regression Awareness):** ในการเพิ่มฟีเจอร์ Actions Taken และ Dashboards ต้องไม่กระทบต่อโครงสร้างตารางและ Endpoint เดิมของ Lab 1, 2 และ 3 (เช่น การยืนยันตัวตน, RBAC, และ Comments) การตรวจสอบ Schema และความเข้ากันได้ของระบบจึงเป็นสิ่งสำคัญที่ต้องตรวจสอบเสมอ
3. **ความถูกต้องของ Dynamic Validation:** การบังคับให้ช่อง `followUpNote` เป็น Required เฉพาะเมื่อ `followUpRequired == true` ต้องระบุให้ชัดเจนว่าเป็นการ Validate ในระดับ Application Layer เพื่อไม่ให้เกิดปัญหากับ Column Schema ในฐานข้อมูลจริง

### 3.3 แนวทางการนำไปปรับใช้ในอนาคต
1. **การใช้ Contract-First Development ในทุก Sprint:** การตกลง Spec ของ API และ Data Model ร่วมกับ AI ให้เสร็จสมบูรณ์ก่อนเริ่มเขียนโค้ดช่วยลดการรื้อโค้ดในภายหลัง และทำให้การพัฒนาฝั่ง Frontend กับ Backend สามารถทำควบคู่กันได้ทันที
2. **การเขียน Test Scenarios ล่วงหน้า (Test-Driven Mindset):** นำตาราง Test Plan ใน `tests.md` ไปใช้เป็นแนวทางในการเขียน Unit, API และ Playwright Tests ก่อนหรือควบคู่กับการเขียนฟีเจอร์ เพื่อให้มั่นใจว่าการพัฒนาจะผ่านเกณฑ์ Acceptance Criteria ตั้งแต่รอบแรก
3. **การรักษาประวัติการพัฒนาและการ Peer Review อย่างสม่ำเสมอ:** ใช้ `reviewer.md` ในการบันทึกฟีดแบ็กและปรับปรุงโค้ดอย่างต่อเนื่องในทุก Pull Request เพื่อยกระดับคุณภาพโค้ดและความปลอดภัยของระบบ
