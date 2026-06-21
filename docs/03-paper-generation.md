# Phase 3: Paper Generation

## Goal
Build the AI-powered paper generation pipeline and preview UI with Version A/B/C tabs.

## Steps

### 3.1 Gemini AI Integration
- `lib/gemini.ts` — Google Gemini 1.5 Flash client
  - Initialize with API key
  - `generatePaper(content, config)` — sends OCR text + format image + prompt
  - Parse structured JSON response
- Prompt design (embedded in `api/generate/route.ts`)
  - System prompt: expert Pakistani school exam paper generator
  - Parameters: class, subject, chapters, difficulty, source type, question counts, answer key flag
  - Instructs AI to return strict JSON matching the `paper_data` schema

### 3.2 Generate Form
- `app/(dashboard)/generate/page.tsx` — Multi-step generation form
  - Step 1: Class & Subject selection
  - Step 2: Template selection (from saved templates)
  - Step 3: Chapter selection (checkboxes from uploaded chapters)
  - Step 4: Source type (Book only / Copy only / Both)
  - Step 5: Difficulty level (Easy / Medium / Hard / Mixed)
  - Step 6: Paper versions (A / B / C checkboxes)
  - Step 7: Question counts (long questions, short per type) + answer key toggle
- `components/generate/GenerateForm.tsx` — The form component
- Validate all inputs before submission

### 3.3 Generate API
- `app/api/generate/route.ts` — Core paper generation endpoint
  1. Fetch template format image from `paper_templates`
  2. Fetch OCR text from `uploads.ocr_text` for selected class + chapters + source
  3. Call Gemini with text content + format image + configurable prompt
  4. Parse JSON response into `PaperData` structure
  5. If Version B requested: shuffle question order (Node.js, no extra API call)
  6. If Version C requested: shuffle MCQ options (Node.js, no extra API call)
  7. Save each version as a separate row in `generated_papers` with `paper_data` JSONB
  8. Return structured paper data to frontend

### 3.4 Paper Preview
- `app/(dashboard)/papers/page.tsx` — History of generated papers with search/filter
- `components/generate/PaperPreview.tsx` — Preview component
  - Version A/B/C tab switcher
  - Shows school name, class, subject, marks, time
  - Renders all long questions + short questions sections
  - Action buttons: Edit, Download PDF, Download Answer Key
- Loading state during generation with progress indicators

### 3.5 Data Types
- `types/index.ts` — TypeScript interfaces
  - `PaperData`, `LongQuestion`, `ShortQuestions`, `WordMeaning`, `FillBlank`, `TrueFalse`, `MCQ`
  - `GenerationConfig`, `GenerationResult`

## Deliverables
- Multi-step generation form with all options
- AI generates exam papers from OCR text via Gemini
- Version A/B/C support (B = shuffled questions, C = shuffled MCQ options)
- Preview UI with tab switching between versions
- Papers saved to database with full JSONB data
- Generation happens using text (not raw images) → cheaper Gemini calls

## Key Files Created
- `lib/gemini.ts`
- `app/api/generate/route.ts`
- `app/(dashboard)/generate/page.tsx`
- `components/generate/GenerateForm.tsx`
- `app/(dashboard)/papers/page.tsx`
- `components/generate/PaperPreview.tsx`
