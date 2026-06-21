# Phase 4: Refinement & Export

## Goal
Build the manual paper editor and PDF export (exam paper + answer key).

## Steps

### 4.1 Paper Editor
- `app/(dashboard)/papers/[id]/edit/page.tsx` — Manual editing page
  - Load `paper_data` JSONB from `generated_papers`
  - Editable fields for all content:
    - Long questions: text, marks, difficulty, reorder, delete, add new
    - Word meanings: word, Urdu meaning
    - Sentences: text
    - Fill in blanks: sentence, answer
    - True/False: statement, answer
    - MCQs: question, 4 options, correct answer
  - Move up/down controls for questions
  - Add/delete buttons per section
- `components/generate/PaperEditor.tsx` — Inline editing UI
  - Mark paper as `is_edited = true` on save
  - Save via API: `PUT /api/papers/[id]` → update `generated_papers`

### 4.2 PDF Generation — Exam Paper
- `components/pdf/PaperPDF.tsx` — @react-pdf/renderer document
  - School header (name, logo)
  - Paper title, class, subject, marks, time, date field
  - All long questions with mark allocation
  - All short question sections (word meanings, sentences, fill blanks, true/false, MCQs)
  - Clean print layout
- `app/api/pdf/route.ts` — Generate exam paper PDF
  - Accept paper_id and version
  - Render PaperPDF component to PDF stream
  - Upload to Supabase Storage → store URL in `generated_papers.pdf_url`
  - Return download link

### 4.3 PDF Generation — Answer Key
- `components/pdf/AnswerKeyPDF.tsx` — Answer key document
  - Model answers for all long questions
  - Correct answers for word meanings, fill blanks, true/false, MCQs
  - Separate layout from exam paper
- Answer key generation uses `paper_data.answer_key` from JSONB
- API endpoint: `app/api/pdf/route.ts?type=answerkey` — returns answer key PDF
- Store URL in `generated_papers.answer_key_pdf_url`

### 4.4 PDF API
- `app/api/pdf/route.ts` — Unified PDF endpoint
  - Query param: `type=paper` or `type=answerkey`
  - Query param: `paper_id` and `version`
  - Generate PDF, upload to storage, return download URL

### 4.5 Preview Page Enhancements
- Download buttons trigger PDF generation
- Print button for browser printing
- Download Answer Key button (separate from exam paper)

## Deliverables
- Full manual editor for all question types
- Drag-to-reorder or move up/down question management
- PDF export of exam paper (clean, printable format)
- PDF export of answer key (separate document)
- Papers marked as `is_edited` after manual changes
- PDFs stored in Supabase Storage

## Key Files Created
- `app/(dashboard)/papers/[id]/edit/page.tsx`
- `components/generate/PaperEditor.tsx`
- `components/pdf/PaperPDF.tsx`
- `components/pdf/AnswerKeyPDF.tsx`
- `app/api/pdf/route.ts`
