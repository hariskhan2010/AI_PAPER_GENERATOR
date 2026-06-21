# Phase 1: Foundation

## Goal
Set up the Next.js project, Supabase backend, authentication, and database schema.

## Steps

### 1.1 Project Initialization
- `npx create-next-app@latest ai-paper-generator --typescript --tailwind --app`
- Install dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `@google/generative-ai`, `tesseract.js`, `@react-pdf/renderer`, `react-dropzone`, `lucide-react`, `clsx`, `tailwind-merge`
- Init shadcn/ui: `npx shadcn@latest init`
- Add shadcn components: `button`, `card`, `input`, `label`, `select`, `tabs`, `toast`, `textarea`, `badge`

### 1.2 Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 1.3 Supabase Client Setup
- `lib/supabase/client.ts` — browser client via `createBrowserClient`
- `lib/supabase/server.ts` — server client via `createServerClient`
- `lib/supabase/middleware.ts` — middleware client for session refresh

### 1.4 Auth Pages
- `app/(auth)/login/page.tsx` — Email/password login form
- `app/(auth)/signup/page.tsx` — Signup form (name, email, password, school name, city)
- `middleware.ts` — Protect all `/dashboard` routes, redirect unauthenticated users

### 1.5 Database Schema
Run the following SQL in Supabase SQL Editor:

#### Tables
- `schools` — id, name, city, admin_email, logo_url, created_at
- `profiles` — id (FK auth.users), school_id, full_name, role ('admin'|'teacher')
- `classes` — id, school_id, name, subject
- `uploads` — id, school_id, class_id, type ('book'|'copy'), file_url, file_name, chapter_number, chapter_name, ocr_text, page_number
- `paper_templates` — id, school_id, name, exam_type ('monthly'|'midterm'|'final'|'custom'), format_url, description, is_default
- `generated_papers` — id, school_id, class_id, template_id, source_type, chapter_numbers[], difficulty, version, paper_data (JSONB), is_edited, pdf_url, answer_key_pdf_url

#### Auth Trigger
- `handle_new_user()` function — auto-creates school + profile on signup
- `on_auth_user_created` trigger on `auth.users`

### 1.6 RLS Policies
Enable Row Level Security on all tables:
- Helper function `get_my_school_id()`
- School isolation policy on every table
- Storage bucket RLS for `paper-templates` and `uploads` buckets

## Deliverables
- Running Next.js app on `localhost:3000`
- Supabase project linked with a working connection
- Signup/Login flow working (creates school + profile automatically)
- All database tables created with RLS enforced
- Users can register and get redirected to `/dashboard`

## Key Files Created
- `middleware.ts`
- `app/(auth)/login/page.tsx`
- `app/(auth)/signup/page.tsx`
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/supabase/middleware.ts`
- `types/index.ts`
