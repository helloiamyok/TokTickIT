---

### 📄 ไฟล์ที่ 3: `docs/lab-02/ui-spec.md`
```markdown
# Lab 2 UI Specification (Zen Green Theme)

## 1. Color Palette Tokens
- **Primary Green**: `#006B3C` (Header background, primary CTA buttons)
- **Secondary Green**: `#0B7A46` (Active tabs, focus rings, hover states)
- **Pale Green**: `#EAF6EF` (Selected row highlighting, success badges)
- **Page Background**: `#F5F7F6`
- **Surface / Cards**: `#FFFFFF` with `1px solid #E5E7EB`
- **Text Color**: `#1F2937` (Dark charcoal-green)
- **Error**: Text and border `#DC2626`
- **Warning**: Amber `#D97706`
- **Success**: Green `#16A34A`

## 2. Screen Layouts & States
### A. Development Requester Selector
- Centered card container on `#F5F7F6` background.
- Dropdown showing active Requesters fetched from backend.
- Banner stating testing nature (Authentication coming in Lab 3).

### B. Create Ticket Mode
- Grid form with Category, Related System, Priority selection.
- Required fields marked with red asterisk `*`.
- Inline error messages appearing directly below invalid controls.
- Submit button enters disabled/busy state with spinner during requests.

### C. My Tickets List
- Filter bar (Search box, Category, Priority, Status dropdowns, Clear Filters).
- Table view on Desktop / Card layout on Mobile.
- Pagination controls with total count display.
- Empty states for "No tickets found" and "No matching filter results".

### D. Ticket Detail View
- Read-only fields with muted ivory/gray-green background.
- Attachment list showing active attachments (with Download/Delete actions) and soft-removed metadata (Download disabled).

## 3. Responsive Breakpoints
- **Desktop (>= 992px)**: Multi-column grid, full data table.
- **Tablet (768px - 991px)**: 2-column layout, scrollable/condensed table.
- **Mobile (< 768px)**: 1-column vertical stack, card list for tickets, touch-friendly buttons.