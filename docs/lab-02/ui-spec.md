# Lab 2 UI Specification (Zen Green Theme)

## 1. Color Palette Tokens & Usage

| Token | Hex Value | Intended Usage |
|---|---|---|
| **Primary Green** | `#006B3C` | App header branding, primary CTA buttons, key action highlights |
| **Secondary Green** | `#0B7A46` | Active tab indicators, focus rings, interactive link hovers |
| **Pale Green** | `#EAF6EF` | Selected rows, soft card backgrounds, success badges (`#A7F3D0` border) |
| **Page Background** | `#F5F7F6` | Main content backdrop (quiet near-white) |
| **Surface / Cards** | `#FFFFFF` | Form cards, tables, modal dialogs with `1px solid #E5E7EB` |
| **Text Primary** | `#1F2937` | Dark charcoal-green for comfortable reading |
| **Text Muted** | `#6B7280` | Subtitles, helper text, timestamps |
| **Error / Destructive** | `#DC2626` | Field errors, delete buttons (`#FEE2E2` bg, `#B91C1C` text) |
| **Warning / Pending** | `#D97706` | Medium priority badge, pending status (`#FEF3C7` bg, `#92400E` text) |
| **Info / Progress** | `#1D4ED8` | In Progress badge (`#EFF6FF` bg, `#1D4ED8` text) |

---

## 2. Typography & Form Styling

- **Font Family**: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- **Input Fields**:
  - Consistent height (`padding: 0.5rem 0.75rem`), white background, neutral border (`#D1D5DB`), radius `6px`.
  - Focused state: `#006B3C` accent outline.
  - Required fields marked with a red asterisk `*`.
  - Field-level validation error messages appear immediately below the input.
- **Buttons Hierarchy**:
  - **Primary**: Background `#006B3C`, text `#FFFFFF`, font-weight 600.
  - **Secondary / Ghost**: Background `#F3F4F6` or transparent, border `#D1D5DB`.
  - **Destructive**: Background `#DC2626` or `#FEE2E2`, text `#B91C1C`.
  - **Disabled / Busy**: Background `#E5E7EB`, text `#9CA3AF`, cursor `not-allowed`.

---

## 3. Screen Layouts & States

### A. Development Requester Selector (Testing Context)
- Dropdown selector located in the top navbar and standalone modal/card.
- Displays active Requesters loaded from PostgreSQL.
- Changing requester dynamically reloads all ticket lists and enforces user isolation.

### B. Create Ticket Screen (Create Mode)
- Structured form: Category, Related System, Requested Priority dropdowns.
- Summary (max 100 chars) and Description (multiline text area).
- Drag-and-drop / file picker for attachments (JPG, PNG, WEBP, PDF <= 5MB, max 5 active files).
- Submitting state with disabled button and progress indicator.
- Success confirmation banner with the generated official `Ticket Number` (e.g. `TKT-2026-000001`).

### C. My Tickets Screen (List Mode)
- **Top Filter Bar**: Keyword Search (Ticket No / Summary), Status dropdown, Priority dropdown, Category dropdown, Date sort selector (Newest / Oldest).
- **Responsive Data Table**: 6 columns (`Ticket No`, `Summary`, `Category`, `Priority`, `Status`, `Created Date`).
- **Pagination**: Server-side pagination controls showing current page, total pages, and total count.
- **States**:
  - **Populated State**: Formatted table with status and priority badges.
  - **Empty State**: Friendly illustration and "+ Create Your First Ticket" button when requester has 0 tickets.
  - **No-Results State**: Filter adjustment suggestions and "Reset All Filters" button when search returns 0 items.
  - **Loading State**: Centered loading spinner/text.

### D. Ticket Detail Screen (View Mode & Attachments)
- **Read-Only Ticket Header**: Ticket No, Summary, Status Badge, Priority Badge, Requester Name, Category, Related System, Created Date, Description.
- **Attachment Section**:
  - List of active attachments with icon (📄 PDF / 🖼️ Image), file name, formatted file size (KB/MB), and upload date.
  - "+ Add Attachment" button with client-side format and 5MB / 5 files validation.
  - "Delete" button opening mandatory justification modal.
  - Soft-delete confirmation with audit reason textarea.
- **Cross-Requester 403 Forbidden State**: Muted banner explaining ticket belongs to another requester under isolation policy.

---

## 4. Responsive Breakpoints

| Viewport | Target Resolution | Layout Behavior |
|---|---|---|
| **Desktop** | `>= 992px` | Multi-column grid, full 6-column data table, side-by-side key details. Max width `1200px` centered. |
| **Tablet** | `768px - 991px` | 2-column form layout, horizontally scrollable data table, touch-friendly buttons. |
| **Mobile** | `< 768px` | 1-column vertically stacked form fields, responsive card list for tickets, collapsible navigation. |

---

## 5. Visual Inspection Checklist & Screenshot Artifacts

### A. Screenshot Artifacts

| Screen | Desktop (`≥992px`) | Tablet (`768-991px`) | Mobile (`<768px`) |
|---|---|---|---|
| **Create Ticket** | `artifacts/lab-02/screenshots/create-ticket/desktop.png` | `artifacts/lab-02/screenshots/create-ticket/tablet.png` | `artifacts/lab-02/screenshots/create-ticket/mobile.png` |
| **My Tickets** | `artifacts/lab-02/screenshots/my-tickets/desktop.png` | `artifacts/lab-02/screenshots/my-tickets/tablet.png` | `artifacts/lab-02/screenshots/my-tickets/mobile.png` |
| **Ticket Detail** | `artifacts/lab-02/screenshots/ticket-detail/desktop.png` | `artifacts/lab-02/screenshots/ticket-detail/tablet.png` | `artifacts/lab-02/screenshots/ticket-detail/mobile.png` |

### B. Completed Visual Inspection Checklist

- [x] **Colors & Contrast**: Zen Green tokens (`#006B3C`, `#0B7A46`, `#EAF6EF`, `#F5F7F6`) consistently applied across headers, badges, and backgrounds.
- [x] **Editable vs Read-Only Fields**: Editable inputs feature white backgrounds with clear `#D1D5DB` borders; read-only fields (Ticket No, Ticket Date, Requester) shaded `#F0F2F1`.
- [x] **Validation Placement**: Field-level validation messages appear immediately below the input with `#E02424` styling and red asterisks on required labels.
- [x] **Button Hierarchy**: Primary CTA buttons (`#006B3C`), secondary outline buttons, destructive delete buttons (`#DC2626`/`#FEE2E2`), and busy/disabled states (`#9CA3AF`/`#E5E7EB`).
- [x] **No Clipping / Overlap**: Typography, labels, and icons remain unobstructed across all viewports.
- [x] **No Horizontal Overflow**: Mobile layout (`<768px`) stacks columns vertically and maintains 100% viewport width without horizontal scrolling.
- [x] **Cross-Requester Security**: 403 Forbidden banner gracefully displays with return navigation when attempting to access unauthorized tickets.