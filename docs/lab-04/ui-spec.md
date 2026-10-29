# Tok TickIT - UI Specification (Sprint 4)

## 1. Visual Theme (Zen Green)
* **โทนสีหลักและ Design Tokens:** ใช้โครงร่างสีหลักและส่วนประกอบเดิมจาก Lab 2 และ 3 อย่างเคร่งครัด
  * Primary Green: `#1B4D3E` (Zen Forest Green)
  * Primary Hover: `#14382D`
  * Secondary / Accent: `#2E7D32`
  * Background Canvas: `#F8FAF9`
  * Surface / Card: `#FFFFFF` (พร้อม Border `#E2E8F0` และเงาละมุน `box-shadow`)
  * Text Colors: Primary `#1A202C`, Muted/Secondary `#718096`
* **ป้ายสถานะ (Badges):**
  * มีสีและสัญลักษณ์ (Icon/Label) กำกับชัดเจน ไม่พึ่งพาการสื่อสารด้วยสีเพียงอย่างเดียว เพื่อรองรับ Accessibility (WCAG AA)
  * `New`: Blue badge
  * `Open` / `In Progress`: Amber / Orange badge
  * `Waiting for Requester`: Purple badge
  * `Resolved`: Zen Green badge (`#2E7D32`)
  * `Closed` / `Cancelled`: Slate Gray badge
* **Navigation Bar:** เมนูนำทางด้านบนแสดงแท็บสถานะ Active ชัดเจน (เช่น "Dashboard", "Queue", "Tickets", "Users") พร้อมแสดง Role Badge ของผู้ใช้งานปัจจุบัน

---

## 2. IT Staff Dashboard (`/staff/dashboard`)

* **Header:**
  * แสดงข้อความต้อนรับเจ้าหน้าที่ (เช่น "Welcome back, [Staff Name]")
  * แสดงเวลาอัปเดตล่าสุด และปุ่ม "Refresh" ข้อมูล
* **Metric Cards:**
  * วางเรียงเป็นแถวแนวนอน 5 การ์ด:
    1. **New:** จำนวนตั๋วสถานะ New ทั้งหมด
    2. **Open:** จำนวนตั๋วสถานะ Open ทั้งหมด
    3. **In Progress:** จำนวนตั๋วที่กำลังดำเนินการ
    4. **Waiting for Requester:** ตั๋วที่รอข้อมูลเพิ่มเติมจากผู้ใช้
    5. **My Assigned:** ตั๋วที่มอบหมายให้เจ้าหน้าที่ล็อกอินคนนี้โดยเฉพาะ
  * **Interactive Behavior:** ทุกการ์ดสามารถกด (Clickable) เพื่อ Drill-down ไปยังหน้ารายการตั๋ว IT Queue พร้อมใส่ Filter กรองตามสถานะนั้นโดยอัตโนมัติ
* **Lower Section (2 คอลัมน์บน Desktop):**
  * **คอลัมน์ซ้าย (My Recent Tickets):**
    * แสดงรายการตั๋วล่าสุดที่เจ้าหน้าที่รับผิดชอบ (Title, Status Badge, Updated Time)
    * มีปุ่ม/ลิงก์ "View all" เพื่อไปยังคิวงานเต็ม
    * หากไม่มีรายการ ให้แสดง Empty State: "No recent tickets assigned to you."
  * **คอลัมน์ขวา (Quick Actions):**
    * ประกอบด้วยปุ่ม Action หลัก:
      * **Create Ticket:** เปิดฟอร์มสร้างตั๋ว
      * **Search Tickets:** โฟกัสไปยังการค้นหา
      * **My Queue:** ไปยังคิวงานของฉันโดยตรง

---

## 3. Requester Dashboard (`/requester/dashboard`)

* **Header:**
  * แสดงข้อความต้อนรับผู้ใช้งาน (เช่น "Hello, [Requester Name] - TokTickIT Helpdesk")
* **Metric Cards:**
  * จัดวาง 4 การ์ดสรุป:
    1. **My Open Tickets:** จำนวนตั๋วสถานะ Open / New
    2. **In Progress:** จำนวนตั๋วที่เจ้าหน้าที่กำลังดำเนินการ
    3. **Resolved:** จำนวนตั๋วที่ได้รับการแก้ไขแล้ว
    4. **Closed:** จำนวนตั๋วที่ปิดเสร็จสมบูรณ์
  * แต่ละการ์ดมีปุ่มหรือลิงก์ "View all" นำทางไปยังหน้ารายการตั๋วที่กรองสถานะนั้น
* **Lower Section:**
  * **My Recent Tickets:**
    * รายการตั๋วล่าสุดเฉพาะของ Requester คนดังกล่าว
    * แสดงเลขที่ตั๋ว, หัวข้อ, หมวดหมู่, วันที่อัปเดตล่าสุด, และสถานะปัจจุบัน
  * **Quick Actions:**
    * ปุ่ม "Create Ticket" (Zen Green Button โดดเด่น)
    * ปุ่ม "View My Tickets" เพื่อดูประวัติตั๋วทั้งหมด

---

## 4. Actions Taken Section (Ticket Detail Screen)

* **ตำแหน่งหน้าจอ:** วางต่อจากส่วน Ticket Information และก่อนหรือแยกแท็บร่วมกับส่วน Public Comments / Internal Notes
* **List View (ประวัติการดำเนินการ):**
  * แสดงรายการหรือตาราง Actions Taken เรียงจากเก่าไปใหม่
  * คอลัมน์/รายละเอียดที่แสดง:
    * **Action Date/Time:** วันที่และเวลาปฏิบัติงาน
    * **Performed By:** ชื่อเจ้าหน้าที่ผู้ปฏิบัติงานพร้อม Role badge
    * **Description:** รายละเอียดการดำเนินการ
    * **Result:** ผลลัพธ์ที่ได้จากการลงมือ
    * **Follow-up Indicator:** สัญลักษณ์แจ้งเตือนกรณีต้องมี Follow-up พร้อมแสดง **Follow-up Note**
    * **Attachment Notes:** บันทึกอ้างอิงเอกสารหรือรูปภาพแนบ
  * **Empty State:** หากยังไม่มีบันทึกการปฏิบัติงาน ให้แสดงกล่องข้อความสะอาดตา: "No actions taken recorded yet."
* **Create/Edit Action Modal/Form:**
  * **สิทธิ์การมองเห็น:** เฉพาะ IT Staff และ Admin เท่านั้นที่จะมองเห็นปุ่ม "Add Action" (ซ่อนสำหรับ Requester อย่างปลอดภัย)
  * **ช่องกรอกข้อมูล:**
    1. **Action Date/Time:** ค่าเริ่มต้นเป็นวันเวลาปัจจุบัน (สามารถแก้ไขได้)
    2. **Performed By:** แสดงชื่อและบทบาทของเจ้าหน้าที่ที่ล็อกอินอยู่แบบ Read-only
    3. **Action Description:** Textarea สำหรับระบุรายละเอียดสิ่งที่ได้ทำลงไป (Required)
    4. **Result:** Textarea สำหรับระบุผลลัพธ์ที่เกิดขึ้น (Optional)
    5. **Follow-Up Required:** สวิตช์/เช็กบ็อกซ์เปิด-ปิด
       * **Interactive Dynamic Validation:** หากเลือกเปิด (Checked) -> ช่อง **Follow-up Note** จะต้องแสดงสถานะ **Required** ทันที พร้อมแสดงเครื่องหมายดอกจันสีแดง `*`
       * หากผู้ใช้กดบันทึกโดยไม่กรอก Follow-up Note ระบบต้องแสดง Error Message ใต้ช่องดังกล่าวทันที
    6. **Attachment Notes:** ช่องระบุชื่อไฟล์หรือบันทึกไฟล์อ้างอิง

---

## 5. Responsive Design & Accessibility

* **Desktop ($\ge$ 1024px):** แสดงผลแบบ Multi-column (Metric cards เรียง 4-5 คอลัมน์, Lower section แบ่งเป็น 2 คอลัมน์ซ้ายขวา)
* **Tablet (768px - 1023px):** Metric cards ปรับเป็น Grid 2-3 คอลัมน์, Lower section เรียงต่อกันในแนวตั้ง
* **Mobile (< 768px):** Metric cards และรายการต่างๆ ปรับเป็น Single-column Vertical Stack พร้อมปุ่มที่แตะได้สะดวก (ขนาดพื้นที่กด $\ge 44 \times 44$px)
* **Accessibility:** คอนทราสต์ของสีตัวอักษรและพื้นหลังได้มาตรฐาน WCAG AA, มี ARIA labels สำหรับปุ่มและไอคอนต่างๆ
