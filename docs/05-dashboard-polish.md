# Phase 5: Dashboard & Polish

## Goal
Build the dashboard overview page and polish the entire app with loading states, error handling, and responsive design.

## Steps

### 5.1 Dashboard Layout
- `app/(dashboard)/layout.tsx` — Persistent sidebar layout
  - Sidebar nav: Dashboard, Upload, Templates, Generate, Papers, Settings
  - Active route highlighting
  - Responsive: sidebar collapses on mobile
  - User avatar/name dropdown with logout
- Reuse layout across all dashboard pages

### 5.2 Dashboard Page
- `app/(dashboard)/dashboard/page.tsx` — Overview page
  - Stats cards:
    - Total papers generated
    - Total classes
    - Total templates
    - Total uploads
  - Recent papers list (last 5 generated)
  - Quick action buttons: Upload Books, Generate Paper
  - School info card (name, city, email)

### 5.3 Settings Page
- `app/(dashboard)/settings/page.tsx` — School profile settings
  - Edit school name, city, logo
  - Manage teachers (add/remove, assign role)
  - Theme preferences (if applicable)

### 5.4 Loading States
- Skeleton loaders for:
  - Dashboard stats cards
  - Paper preview
  - Upload grid
  - Template list
- Spinner/generating animation during paper generation
- Progress bar for OCR processing

### 5.5 Error Handling
- Toast notifications for:
  - Upload success/failure
  - Generation success/failure
  - Save success/failure
  - Auth errors
- Error boundary wrapping each page
- API error responses with proper HTTP status codes
- Form validation errors shown inline

### 5.6 Responsive Design
- All pages fully responsive (mobile, tablet, desktop)
- Sidebar becomes hamburger menu on mobile
- Upload grid adapts columns
- Paper preview scrolls horizontally on narrow screens
- Touch-friendly buttons and inputs

### 5.7 Deployment
- Push to GitHub
- Deploy on Vercel
- Connect Supabase production project
- Configure environment variables on Vercel
- Test auth flow, upload, generation, PDF export on production

## Deliverables
- Fully functional dashboard with stats
- Responsive sidebar layout
- Settings page for school management
- Loading skeletons and spinners throughout
- Toast notifications for all user actions
- Error boundaries preventing crashes
- Responsive design working on mobile/tablet/desktop
- Live deployment on Vercel

## Key Files Created
- `app/(dashboard)/layout.tsx`
- `app/(dashboard)/dashboard/page.tsx`
- `app/(dashboard)/settings/page.tsx`
