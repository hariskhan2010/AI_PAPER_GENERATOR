# AI Paper Generator — Implementation Roadmap

A multi-tenant SaaS platform for Pakistani schools to generate AI-powered exam papers.

## Phases Overview

| Phase | Name | Duration | Focus |
|-------|------|----------|-------|
| 1 | Foundation | Setup | Project init, Supabase, Auth, Database |
| 2 | Content Management | Build | Templates, Upload, OCR |
| 3 | Paper Generation | Core | Gemini API, Generate form, Preview |
| 4 | Refinement & Export | Polish | Editor, PDF generation |
| 5 | Dashboard & Deploy | Finish | Dashboard, Responsive, Deploy |

## Phase Details

| File | Phase | Description |
|------|-------|-------------|
| [01-foundation.md](./01-foundation.md) | 1 | Next.js setup, Supabase, Auth, DB schema |
| [02-content-management.md](./02-content-management.md) | 2 | Templates, Upload, OCR pipeline |
| [03-paper-generation.md](./03-paper-generation.md) | 3 | Gemini AI, Generation form, Preview |
| [04-refinement-export.md](./04-refinement-export.md) | 4 | Manual editor, PDF export (exam + answer key) |
| [05-dashboard-polish.md](./05-dashboard-polish.md) | 5 | Dashboard, Settings, Polish, Deployment |

## Tech Stack

- **Frontend:** Next.js 14 (App Router), Tailwind CSS, shadcn/ui
- **Auth & DB:** Supabase (Auth, PostgreSQL, Storage)
- **AI:** Google Gemini 1.5 Flash
- **OCR:** Tesseract.js + Gemini Vision fallback
- **PDF:** @react-pdf/renderer
- **Deployment:** Vercel

## Key Features (9 Improvements)

1. **OCR pre-processing** — Extract text before Gemini (cheaper, faster)
2. **Multiple templates** — Monthly/Midterm/Final format support
3. **Chapter-wise tagging** — Select specific chapters for paper
4. **Difficulty levels** — Easy/Medium/Hard/Mixed
5. **Answer key generation** — Separate PDF with model answers
6. **A/B/C paper versions** — Shuffle questions/options
7. **Single JSONB field** — Flexible `paper_data` storage
8. **Storage RLS** — Secure school isolation
9. **Manual editor** — Edit before PDF download
