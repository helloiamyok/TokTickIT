# AI Use with Reflection (Part 4)

## 1. LLM Models Used
- **Model:** Gemini 2.5 Pro / Claude 3.7 Sonnet / Google Antigravity Agent
- **Platform:** Web Interface & Development Assistant
- **Purpose:** ช่วยแก้ไขปัญหา Git lock, Git conflicts, Diff bloat (ไฟล์ขยะ 3,000+ files), การจัดการ Branching, และการ Implement ฟีเจอร์ตาม Spec DD / Test DD

---

## 2. Key Prompts Table (ตาราง Prompts สำคัญ 6-10 ข้อ)

| No. | Category / Task | Prompt Used | Output / Result from AI |
|:---:|:---|:---|:---|
| 1 | Git Lock Resolution | "fatal: Unable to create '.git/index.lock': File exists. แก้ยังไง" | อธิบายสาเหตุของ index.lock และวิธีลบไฟล์ล็อคผ่าน Terminal ด้วยคำสั่ง `del .git\index.lock` |
| 2 | Git Checkout & Dirty Working Tree | "error: Your local changes to .gitignore would be overwritten by checkout แก้ยังไง" | แนะนำการใช้ `git checkout -- .gitignore` เพื่อรีเซ็ตไฟล์ก่อนทำการ `git switch` ไปยัง branch อื่น |
| 3 | Diff Bloat / Clean Branch | "ทำไม PR มี file changes แปลกปลอมขึ้นมาเยอะมาก จะล้างเริ่มใหม่ยังไง" | วิเคราะห์ปัญหา build artifacts/temp files และแนะนำขั้นตอนการแตก branch ใหม่ที่สะอาดจาก `lab2-staging` |
| 4 | State Verification | "เช็กว่าตอนนี้โค้ดที่ทำไว้ขึ้น GitHub หรือยัง และดู Files changed อย่างไร" | แนะนำการตรวจสอบแท็บ Commits และ Files changed บน GitHub Web Interface พร้อมวิธีเช็ก diff สีเขียว/แดง |
| 5 | Branch Management | "ถ้าเริ่ม issue ใหม่ file change จะมีตัวเลขเดิมติดไปด้วยไหม" | อธิบายหลักการแตก branch จากฐานที่ถูก merge แล้วเพื่อป้องกันการสืบทอด diff เก่า |
| 6 | Rollback Strategy | "ต้องการย้อนกลับไปที่จุดที่เพิ่ง merge PR ก่อนหน้าล่าสุดอย่างสะอาด" | แนะนำคำสั่ง `git reset --hard HEAD` และ `git clean -fd` ร่วมกับ `git pull origin lab2-staging` |
| 7 | Pull Request Linking | "ต้องสร้าง Issue ใหม่ใน GitHub ไหมถ้าจะเปิด PR ใหม่อีกรอบ" | อธิบายความต่างของ Issue กับ PR และวิธีใช้คีย์เวิร์ด `Closes #...` เพื่อเชื่อมโยง PR ใหม่เข้ากับ Issue เดิม |
| 8 | Feature Implementation | "ช่วยแนะนำการออกแบบและสร้าง Ticket Creation Form พร้อม Validation" | ช่วยวางโครงสร้าง Form Component และการจัดการ State ฝั่ง Client/Server |
| 9 | My Tickets & Data Isolation | "ช่วยเขียนโค้ด My Tickets ให้กรองข้อมูลตาม Requester ที่เลือก และทำค้นหา/จัดเรียง/แบ่งหน้า" | ออกแบบ MyTickets.tsx ด้วยธีม Zen Green และเชื่อม API `/api/tickets` ที่แยกข้อมูลตาม Requester ID |
| 10 | Ticket Detail & Soft Delete | "เขียนหน้า Ticket Detail แสดงข้อมูลแบบ Read-only และรองรับการอัปโหลด/ลบไฟล์แนบแบบ Soft-delete" | พัฒนา TicketDetail.tsx พร้อม Modal ระบุเหตุผลการลบไฟล์แนบและจัดการสถานะ 403 Forbidden |

---

## 3. My Reflection (การสะท้อนความคิดเห็นต่อการใช้ AI)

### 3.1 ประโยชน์และสิ่งที่ได้เรียนรู้จากการใช้ AI
การใช้ AI ในโปรเจกต์นี้ช่วยลดเวลาในการแก้ปัญหาทางเทคนิคที่ไม่คาดคิดได้เป็นอย่างดี โดยเฉพาะปัญหาด้าน Git เช่น ปัญหา `index.lock` ค้าง หรือการเกิด Diff Bloat (ไฟล์ขยะและ build artifacts ปนเข้าไปใน Pull Request) AI ช่วยวิเคราะห์สาเหตุและให้คำสั่ง CLI ที่ตรงจุด ทำให้สามารถกู้คืนพื้นที่ทำงาน (Working Directory) ให้กลับมาสะอาดได้โดยไม่ต้องโคลน repository ใหม่ทั้งหมด

นอกจากนี้ AI ยังช่วยทำหน้าที่เป็น Thought Partner ในการทบทวนแนวคิดเรื่อง Git Flow เช่น การแยก Branch ที่ถูกต้อง, ความสัมพันธ์ระหว่าง Issue กับ PR, และการ pull โค้ดล่าสุดหลังจากการ merge เพื่อไม่ให้เกิดปัญหางานซ้อนทับกัน

### 3.2 ความท้าทายและข้อควรระวัง
ความท้าทายหลักคือ AI มักจะคาดเดาบริบทจากคำถามสั้นๆ ได้ไม่ครบ 100% หากเราไม่ระบุสถานะปัจจุบันให้ชัดเจน เช่น การที่ AI อาจเข้าใจผิดว่าเรากำลังจะเขียนโค้ด UI ในขณะที่เราต้องการทำไฟล์เอกสารหรือแก้ปัญหาประวัติ Git ดังนั้น การสื่อสารคำสั่งพร้อมแนบ Log ข้อผิดพลาด (Terminal Output) หรือภาพหน้าจอ จึงมีความสำคัญอย่างยิ่งเพื่อให้ AI แนะนำแนวทางที่แม่นยำ

### 3.3 แนวทางการนำไปปรับใช้ในอนาคต
ในงานต่อๆ ไป จะเน้นการตั้งค่า `.gitignore` ตั้งแต่เริ่มต้นโปรเจกต์ เพื่อดักจับโฟลเดอร์ build artifacts (เช่น `.vite`, `dist`, `build`, `*.tsbuildinfo`) ก่อนที่จะมีการ commit ใดๆ เพื่อตัดปัญหา Diff ปนเปื้อนตั้งแต่ต้นทาง รวมถึงการตรวจสอบ `git status` อย่างสม่ำเสมอก่อนการสร้าง commit ใหม่ทุกครั้ง
