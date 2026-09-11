# Sprint 3 Zen Green UI Specification

## 1. Design Tokens & Visual Hierarchy
- **Primary Brand:** `#1B4D3E` (Deep Zen Green)
- **Primary Hover:** `#14382D`
- **Secondary / Focus:** `#2E7D32`
- **Background Canvas:** `#F8FAF9`
- **Card & Table Surface:** `#FFFFFF` with border `#E2E8F0`
- **Typography:** Inter or system sans-serif; High Contrast `#1A202C`, Secondary `#718096`.

## 2. Badges & Indicators
- **Status Badges:**
  - `New`: Subtle Blue
  - `Open` / `In Progress`: Amber / Orange
  - `Waiting for Requester`: Purple tint
  - `Resolved`: Zen Green `#2E7D32`
  - `Closed` / `Cancelled`: Slate Gray
- **Priority Badges:**
  - `Low`: Light Green / Muted Slate
  - `Medium`: Amber
  - `High`: Crimson Orange
  - `Urgent`: Deep Red
- **Role Badges:**
  - `Requester`: Neutral Gray
  - `IT Staff`: Zen Green `#1B4D3E`
  - `Administrator`: Indigo / Navy

## 3. Screen Specifications & States

### 3.1 Login Screen (`/login`)
- Centered card on background `#F8FAF9`.
- Input fields: Email, Password (with toggle visibility icon).
- Submission state: Disabled button with spinner during request.
- Failure feedback: Non-specific banner *"Invalid email or password"*.

### 3.2 Mandatory Password Change Screen (`/change-password`)
- Displayed immediately upon login when `mustChangePassword` is true.
- Navigation away from this screen is blocked.
- Real-time password requirement checklist:
  - At least 8 characters
  - At least one uppercase & lowercase letter
  - At least one number & special character

### 3.3 IT Staff Ticket Queue (`/it/queue`)
- Top Bar: Search field by ticket number or summary; filter dropdowns for Category, IT Priority, Status.
- Data Table: Columns for Ticket No, Created Date, Summary, Category, Req Priority, IT Priority, Status, Owner.
- Empty State: Clean illustration with text *"No tickets found matching your filter"*.
- Pagination: Footer displaying `Showing X to Y of Z tickets` with Previous/Next controls.

### 3.4 IT Staff Ticket Detail (`/it/tickets/:id`)
- Information layout: Read-only requester metadata at top.
- Operational controls: Dropdowns for Ticket Owner, IT Priority, and Status transition buttons.
- Tabs section:
  - **Public Comments:** Conversation stream visible to requester and staff.
  - **Internal Notes:** Visually distinct container with warning indicator *"Internal Only - Hidden from Requester"*.
  - **Attachments:** Inherited from Lab 2.

### 3.5 Administrator User Management (`/admin/users`)
- Master table showing Name, Email, Role, Status, and Action buttons.
- Slide-over drawer or modal for Create User and Edit User.
- Self-protection: Active Admin viewing their own row cannot toggle their own active switch to disabled.
- Set New Initial Password action triggers prompt with confirmation.

## 4. Responsive & Accessibility Rules
- Desktop (>= 1024px): Multi-column layouts, full data tables.
- Tablet (768px - 1023px): Collapsible filter drawer, horizontal table scroll or card conversion.
- Mobile (< 768px): Single-column cards for queue items and user management rows.
- Minimum tap target size 44x44px. All form inputs include explicit `<label>` tags and ARIA descriptions.