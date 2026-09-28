# AI Use with Reflection (Part 4)

## 1. LLM Models Used
- **Model:** Gemini 2.5 Pro / Claude 3.7 Sonnet / Google Antigravity Agent
- **Platform:** Web Interface & Antigravity AI Coding Assistant
- **Purpose:** ช่วยออกแบบและ Implement ระบบ Authentication & Role-Based Authorization, หน้าจอ IT Staff Queue, Admin User Management, การแก้ปัญหา Merge Conflicts, การเขียน Playwright E2E Test Suite และการสร้าง Screenshot Automation สำหรับ Checklist Part 5 – 9

---

## 2. Key Prompts Table (ตาราง Prompts สำคัญ)

| No. | Category / Task | Prompt Used | Output / Result from AI |
|:---:|:---|:---|:---|
| 1 | UI Theme Alignment | "ในเว้บขาดอะไรเพิ่มเติมให้หน่อยแล้วหน้าlog in แก้ให้ตรงตรีม" | วิเคราะห์โครงสร้างหน้า Login และปรับแต่ง UI ด้วยโทนสี Zen Green (`#006B3C`), ปรับปรุงการจัดวาง Layout, Input validation, และเพิ่ม Feedback ข้อความแจ้งเตือนที่ชัดเจน |
| 2 | Authentication Enforcement | "เอาปุ่ม 'QUICK DEMO LOGIN' ออก: ในรูปมีกล่อง ⚡ QUICK DEMO LOGIN: พร้อมปุ่ม Administrator... ซึ่งต้องถอดออกให้หมด เพราะโจทย์ระบุว่ารอบนี้ต้องใช้ระบบ Authentication จริงเท่านั้น" | ถอด Quick Demo Login Selector ชั่วคราวของ Lab 2 ออกทั้งหมด เพื่อบังคับใช้งานระบบยืนยันตัวตนจริงผ่าน JWT HTTP-Only Cookies ตามข้อกำหนดของ Lab 3 |
| 3 | Mandatory Password Change Flow | "ทำไมไม่เจอหน้าchange passwordขอปุ่มchange password ไปอยู๋ตรงหน้าlog in g]p" / "คุณต้องทำยังไงถึงจะแก้รหัสได้" | อธิบายหลักการทำงานของ First-login Mandatory Change Password เมื่อล็อกอินด้วยบัญชีที่กำหนด flag `mustChangePassword: true` (เช่น `emily.davis@tiktockit.com`) และปรับ Route Guard ให้นำทางถูกต้อง |
| 4 | Change Password UI Redesign | "C:\Users\User\Desktop\CPE334\TokTickIT\artifacts\lab-03\screenshots\authentication\04-first-login-change-password.png แก้ยูไอให้หน่อยพร้อมแคป" | ออกแบบหน้าจอ Choose a new password ใหม่ในสไตล์ Zen Green พร้อม Live Checklist ตรวจสอบกฎความปลอดภัย (ความยาว, ตัวพิมพ์, ตัวเลข), ปุ่ม Show/Hide รหัสผ่าน (👁️) และแคปภาพหน้าจอใหม่อัตโนมัติ |
| 5 | Mobile Responsive UI | "หน้า login mobile แก้ui ทีเอาเหมือนเพื่อน" | ปรับแต่ง CSS แบบ Inline/Pure CSS สำหรับมุมมอง Mobile Viewport (375x667) ให้ Card, Header Banner, และ Form Controls มีขนาดพอดี ไม่เกิด Overflow หรือตกขอบหน้าจอ |
| 6 | Screenshot Automation (Part 5 – 9) | "Step 2: รายการแคปเจอร์ภาพหน้าจอ (Checklist สำหรับ Part 5 – 9) ... ช่วยแคปเจอร์ภาพหน้าจอให้ครบทุกส่วน" | พัฒนาและรันสคริปต์ Playwright `e2e/capture-screenshots.spec.ts` เพื่อบันทึกภาพหน้าจอหลักฐาน 22 ภาพ ครอบคลุม Authentication, Staff Queue, Staff Operations, User Management และ Responsive Views |
| 7 | Merge Conflict & Branch Synchronization | "git checkout main ... needs merge ... error: you need to resolve your current index first ... แก้ให้หน่อย" | วิเคราะห์และแก้ไขปัญหา Merge Conflict Markers (`<<<<<<< HEAD`, `=======`, `>>>>>>>`), กู้คืนโค้ดเวอร์ชันเสถียร, รวมและซิงก์สาขา `main` และ `lab3-staging` ให้ตรงกันและพุชขึ้น GitHub Remote สำเร็จ |
| 8 | Server Environment Management | "รันให้หน่อย" | ตรวจสอบและเคลียร์ Process พื้นหลังที่ค้าง, เริ่มต้นการทำงานของ Backend API Server (Port 3000) และ Vite Frontend (Port 5173) พร้อมทำ Health Check ยืนยันความพร้อมของระบบ |

---

## 3. My Reflection (การสะท้อนความคิดเห็นต่อการใช้ AI)

### 3.1 ประโยชน์และสิ่งที่ได้เรียนรู้จากการใช้ AI
การใช้ AI ในโปรเจกต์ Sprint 3 (Lab 3) ช่วยเพิ่มประสิทธิภาพในการพัฒนาฟังก์ชันที่ซับซ้อนได้อย่างมาก โดยเฉพาะระบบความปลอดภัย (Authentication & Role-Based Authorization), การจัดการสิทธิ์หลายระดับ (Requester, IT Staff, Administrator), และการเขียน Automated End-to-End Tests ด้วย Playwright

AI มีบทบาทสำคัญอย่างยิ่งในการช่วยแก้ปัญหาทางเทคนิคระดับลึก เช่น:
1. **การแก้ปัญหา Git Conflict ที่ซับซ้อน:** ช่วยตรวจสอบและล้าง Conflict markers ที่ถูก commit ปนเปื้อนเข้าไปในหลายๆ ไฟล์ พร้อมทั้งช่วยผสานประวัติของสาขา `main` และ `lab3-staging` ให้ตรงกันโดยไม่สูญเสียการเปลี่ยนแปลงสำคัญ
2. **การทำ Screenshot Automation:** ช่วยแปลงข้อกำหนด Checklist ภาพหน้าจอ 22 รายการให้กลายเป็นสคริปต์ Playwright อัตโนมัติ ทำให้สามารถทดสอบและบันทึกภาพหน้าจอทุก Viewport (Desktop, Tablet, Mobile) ซ้ำได้สะดวกรวดเร็วและได้ภาพที่มีคุณภาพสูง
3. **การออกแบบและขัดเกลา UI:** ช่วยวางโครงสร้าง CSS ตามระบบสี Zen Green Theme (`#006B3C`, `#0B7A46`, `#EAF6EF`, `#F5F7F6`) ให้มีความสม่ำเสมอและ Responsive ในทุกหน้าจอ

### 3.2 ความท้าทายและข้อควรระวัง
1. **บริบทของสถานะข้อมูล (Database State Dependency):** ในการรัน End-to-End Tests หรือการทดสอบเปลี่ยนรหัสผ่าน ข้อมูลในฐานข้อมูลจะถูกเปลี่ยนแปลงตาม Flow การทำงาน หากไม่มีการ re-seed ข้อมูลเริ่มต้นใหม่ การรัน Test ในรอบถัดไปอาจล้มเหลวได้ จึงต้องกำกับให้ AI ตรวจสอบและ seed ข้อมูลก่อนรันการทดสอบเสมอ
2. **การตรวจสอบผลลัพธ์ของ Git อย่างละเอียด:** การสั่งคำสั่ง Git รวมไฟล์โดยไม่ตรวจสอบสถานะไฟล์ที่มีความขัดแย้งอาจนำไปสู่การ commit สัญลักษณ์ diff (`<<<<<<<`) เข้าไปใน Repository ได้ จึงต้องคอยสังเกต Output ใน Terminal และตรวจสอบ `git status` อย่างสม่ำเสมอ
3. **การปรับแต่ง UI ให้ตรงกับ Spec:** AI อาจใช้ Library ภายนอกหรือคลาสที่ไม่ได้คอมไพล์ (เช่น Tailwind) หากเราไม่ระบุให้ชัดเจน การกำชับให้ใช้ Pure/Inline CSS และยึดตาม Color Palette ของ Zen Green จึงช่วยให้งานออกมาถูกต้องและแสดงผลได้คงที่ในทุกสภาพแวดล้อม

### 3.3 แนวทางการนำไปปรับใช้ในอนาคต
1. **การวางแผน Automate Testing & CI/CD:** นำ Playwright E2E Scripts และ Vitest Suites ที่พัฒนาขึ้นไปผสานเข้ากับ GitHub Actions เพื่อให้การทดสอบและตรวจจับข้อผิดพลาดเกิดขึ้นโดยอัตโนมัติทุกครั้งที่มีการเปิด Pull Request
2. **การจัดการ Clean Branching:** นำบทเรียนเรื่อง Git Flow จากแล็บนี้ไปใช้ในการแยก branch ฟีเจอร์ย่อยอย่างชัดเจน และทำ Fast-forward / Rebase ให้เรียบร้อยก่อนทำการเปิด PR เข้าสู่ staging หรือ main branch เพื่อลดโอกาสการเกิด Merge Conflicts
3. **การสั่ง Prompt อย่างเป็นระบบ:** สื่อสารกับ AI โดยระบุเป้าหมาย, ข้อจำกัดทางสถาปัตยกรรม (เช่น Theme Palette, ข้อกำหนดด้านความปลอดภัย), และแนบ Log หรือข้อผิดพลาดที่ชัดเจน เพื่อให้ได้รับผลลัพธ์ที่ตรงตามความต้องการตั้งแต่รอบแรก