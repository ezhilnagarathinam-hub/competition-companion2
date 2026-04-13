

## Plan: Add End Date to Competitions + Results History with Collapsible Sections

### 1. Add `end_date` column to competitions table

**Database migration** to add an `end_date` column (date, nullable, defaults to `date` value). If `end_date` is null or same as `date`, the competition ends at `end_time` on that day. If different, the competition window spans multiple days but duration limit still applies per student.

### 2. Update Competition form and display

**File: `src/pages/admin/Competitions.tsx`**
- Rename current "Date" field to "Start Date"
- Add "End Date" field below it, defaulting to start date
- Update `formData` to include `end_date`
- Update `openEdit` to populate `end_date`
- Display date range on competition cards (e.g., "Apr 13 – Apr 15, 2026" or just "Apr 13, 2026" if same day)

**File: `src/types/database.ts`**
- Add `end_date: string | null` to `Competition` interface

### 3. Update student dashboard date logic

**File: `src/pages/student/StudentDashboard.tsx`**
- Use `end_date` (or fallback to `date`) + `end_time` to determine when competition window closes
- Countdown timer uses `end_date` for "Ends in" calculation

### 4. Redesign Results page with history and collapsible sections

**File: `src/pages/admin/Results.tsx`**
- Remove the competition dropdown selector
- Group competitions by date (most recent first)
- Show the most recent competition's results expanded by default
- Older competitions shown as collapsible accordion items using the existing `Accordion` component
- Each section header shows: competition name, date, participant count
- Expanding reveals the leaderboard table and top-3 cards
- Each competition section is self-contained with its own data fetching

### Technical Details

- Migration SQL: `ALTER TABLE competitions ADD COLUMN end_date date;`
- The `end_date` defaults to `date` in the form when not explicitly set
- Duration limit enforcement remains unchanged (per-student timer)
- Results page fetches all competitions with submissions, lazy-loads leaderboard data on accordion expand

