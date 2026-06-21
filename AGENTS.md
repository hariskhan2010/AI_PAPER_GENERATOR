AI Paper Generator SaaS — plan.md (v2 — Improved)
For OpenCode implementation. Full-stack web app for Pakistani schools to generate exam papers using AI. Updated with 9 improvements suggested after review.

🎯 Project Overview
A multi-tenant SaaS platform where schools sign up, upload their books/copy images and multiple paper format templates, then generate AI-powered exam papers with OCR pre-processing, chapter-wise selection, difficulty levels, answer keys, and A/B/C paper versions — with full manual editing before PDF download.

🏗️ Tech Stack
Layer	Technology
Frontend	Next.js 14 (App Router)
Styling	Tailwind CSS + shadcn/ui
Auth	Supabase Auth
Database	Supabase PostgreSQL
File Storage	Supabase Storage
OCR	Tesseract.js (client-side) + Gemini Vision fallback
AI	Google Gemini 1.5 Flash (text generation)
PDF Generation	@react-pdf/renderer
Deployment	Vercel
📁 Project Structure
ai-paper-generator/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                      # Sidebar layout
│   │   ├── dashboard/page.tsx              # Overview/stats
│   │   ├── upload/
│   │   │   ├── page.tsx                    # Upload section main
│   │   │   ├── books/page.tsx              # Book images upload (chapter-wise)
│   │   │   └── copies/page.tsx             # Copy/notes images upload
│   │   ├── templates/page.tsx              # Multiple paper templates (Monthly/Midterm/Final)
│   │   ├── generate/page.tsx               # Paper generation section
│   │   ├── papers/
│   │   │   ├── page.tsx                    # Generated papers history
│   │   │   └── [id]/edit/page.tsx          # Manual paper editor
│   │   └── settings/page.tsx               # School settings
│   └── api/
│       ├── auth/[...supabase]/route.ts
│       ├── upload/route.ts                 # Handle image uploads + OCR
│       ├── ocr/route.ts                    # OCR text extraction endpoint
│       ├── generate/route.ts               # AI paper generation
│       └── pdf/route.ts                    # PDF generation
├── components/
│   ├── ui/                                 # shadcn components
│   ├── upload/
│   │   ├── ImageUploader.tsx
│   │   ├── ClassSelector.tsx
│   │   ├── ChapterSelector.tsx             # NEW: chapter tagging on upload
│   │   └── UploadGrid.tsx
│   ├── templates/
│   │   ├── TemplateCard.tsx                # NEW: template cards (Monthly/Midterm/Final)
│   │   └── TemplateUploader.tsx
│   ├── generate/
│   │   ├── GenerateForm.tsx
│   │   ├── PaperPreview.tsx
│   │   ├── PaperEditor.tsx                 # NEW: manual editing UI
│   │   └── QuestionSection.tsx
│   └── pdf/
│       ├── PaperPDF.tsx                    # Exam paper PDF
│       └── AnswerKeyPDF.tsx                # NEW: Answer Key PDF
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── ocr.ts                              # NEW: Tesseract OCR helpers
│   ├── gemini.ts                           # Gemini AI client
│   └── pdf.ts                              # PDF generation helpers
├── types/
│   └── index.ts
└── middleware.ts                            # Auth protection
🗄️ Database Schema (Supabase)
Table: schools
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT,
  admin_email TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
Table: profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  school_id UUID REFERENCES schools(id),
  full_name TEXT,
  role TEXT DEFAULT 'admin',    -- 'admin' | 'teacher'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
Table: paper_templates ← IMPROVEMENT #2
-- Multiple templates per school (Monthly, Midterm, Final, etc.)
CREATE TABLE paper_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id),
  name TEXT NOT NULL,           -- e.g. "Monthly Test", "Midterm", "Final Exam"
  exam_type TEXT NOT NULL,      -- 'monthly' | 'midterm' | 'final' | 'custom'
  format_url TEXT NOT NULL,     -- uploaded template image/PDF
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
Table: classes
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id),
  name TEXT NOT NULL,           -- e.g. "Class 5", "Class 8"
  subject TEXT NOT NULL,        -- e.g. "English", "Urdu", "Math"
  created_at TIMESTAMPTZ DEFAULT NOW()
);
Table: uploads
CREATE TABLE uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id),
  class_id UUID REFERENCES classes(id),
  type TEXT NOT NULL,           -- 'book' | 'copy'
  file_url TEXT NOT NULL,
  file_name TEXT,
  chapter_number INT,           -- IMPROVEMENT #3: chapter-wise tagging
  chapter_name TEXT,            -- e.g. "Chapter 1 - The Brave Boy"
  ocr_text TEXT,                -- IMPROVEMENT #1: extracted OCR text stored here
  page_number INT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
Table: generated_papers ← IMPROVEMENT #7 (single JSONB field)
CREATE TABLE generated_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id),
  class_id UUID REFERENCES classes(id),
  template_id UUID REFERENCES paper_templates(id),
  source_type TEXT,             -- 'book' | 'copy' | 'both'
  chapter_numbers INT[],        -- IMPROVEMENT #3: which chapters were selected
  difficulty TEXT DEFAULT 'mixed', -- IMPROVEMENT #4: 'easy'|'medium'|'hard'|'mixed'
  version TEXT DEFAULT 'A',     -- IMPROVEMENT #6: 'A' | 'B' | 'C'
  paper_data JSONB NOT NULL,    -- IMPROVEMENT #7: all paper content in one field
  -- paper_data structure:
  -- {
  --   title, class, subject, total_marks, time, exam_type,
  --   long_questions: [...],
  --   short_questions: { word_meanings, sentences, fill_blanks, true_false, mcqs },
  --   answer_key: { long_answers: [...], short_answers: {...} }  -- IMPROVEMENT #5
  -- }
  is_edited BOOLEAN DEFAULT FALSE,  -- IMPROVEMENT #9: was it manually edited?
  pdf_url TEXT,
  answer_key_pdf_url TEXT,      -- IMPROVEMENT #5: separate answer key PDF
  created_at TIMESTAMPTZ DEFAULT NOW()
);
🔐 Auth Flow
Signup Flow:
User visits /signup
Fills: Full Name, Email, Password, School Name, City
Supabase creates auth user
Trigger auto-creates schools record and profiles record
Redirect to /dashboard
Supabase Trigger:
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_school_id UUID;
BEGIN
  INSERT INTO schools (name, admin_email)
  VALUES (NEW.raw_user_meta_data->>'school_name', NEW.email)
  RETURNING id INTO new_school_id;

  INSERT INTO profiles (id, full_name, school_id)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', new_school_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();
📤 Upload Section (with OCR — IMPROVEMENT #1)
UI Layout:
┌──────────────────────────────────────────────────┐
│  UPLOAD SECTION                                   │
│  ┌──────────────┐  ┌──────────┐  ┌────────────┐ │
│  │ Select Class │  │ Subject  │  │ Chapter    │ │
│  └──────────────┘  └──────────┘  └────────────┘ │
│                                                  │
│  ┌───────────────────┐  ┌──────────────────────┐ │
│  │  📚 BOOK IMAGES   │  │  📝 COPY IMAGES      │ │
│  │  [+ Add Images]   │  │  [+ Add Images]      │ │
│  │  Ch1-page1.jpg ✓  │  │  notes1.jpg ✓        │ │
│  │  [OCR: Extracted] │  │  [OCR: Extracted]    │ │
│  └───────────────────┘  └──────────────────────┘ │
│                                                  │
│  [Upload All + Extract Text]                     │
└──────────────────────────────────────────────────┘
OCR Flow (/api/ocr/route.ts):
// IMPROVEMENT #1: OCR before Gemini to reduce cost
// Step 1: Receive image
// Step 2: Run Tesseract.js OCR → extract text
// Step 3: If OCR confidence < 70% → fallback to Gemini Vision for extraction
// Step 4: Store extracted text in uploads.ocr_text
// Step 5: Later, generation uses TEXT not images → saves Gemini vision tokens

import Tesseract from 'tesseract.js';

export async function extractText(imageUrl: string): Promise<string> {
  const { data } = await Tesseract.recognize(imageUrl, 'eng+urd', {
    logger: m => console.log(m)
  });
  
  if (data.confidence < 70) {
    // Fallback: use Gemini Vision to extract text
    return await extractWithGemini(imageUrl);
  }
  
  return data.text;
}
Storage Bucket Structure + RLS:
supabase-storage/
├── paper-templates/
│   └── {school_id}/{template_id}/format.pdf
└── uploads/
    └── {school_id}/
        └── {class_id}/
            ├── book/ch{N}/page1.jpg
            └── copy/notes1.jpg
-- IMPROVEMENT #8: Storage RLS policies
CREATE POLICY "school_storage_access"
ON storage.objects FOR ALL
USING (
  bucket_id IN ('paper-templates', 'uploads')
  AND (storage.foldername(name))[1] = (
    SELECT school_id::TEXT FROM profiles WHERE id = auth.uid()
  )
);
📋 Templates Section (IMPROVEMENT #2)
Purpose:
Schools can have MULTIPLE paper format templates — Monthly Test, Midterm, Final Exam, etc. Each has its own layout.

UI:
┌────────────────────────────────────────────────┐
│  PAPER TEMPLATES                               │
│                                                │
│  ┌──────────────┐ ┌──────────────┐ ┌────────┐ │
│  │ 📄 Monthly   │ │ 📄 Midterm   │ │ + Add  │ │
│  │ Test Format  │ │ Format       │ │ New    │ │
│  │ [Default ✓]  │ │              │ │ Format │ │
│  │ [Edit][Del]  │ │ [Edit][Del]  │ │        │ │
│  └──────────────┘ └──────────────┘ └────────┘ │
│                                                │
│  + Add Template                                │
│    Name: [Monthly Test]                        │
│    Type: [Monthly ▼]                           │
│    Upload format image: [Choose File]          │
│    [Save Template]                             │
└────────────────────────────────────────────────┘
⚙️ Generation Section (All Improvements Combined)
UI Layout:
┌────────────────────────────────────────────────────┐
│  GENERATE PAPER                                    │
│                                                    │
│  Step 1: Class & Subject                          │
│  [Class 5 ▼]  [English ▼]                        │
│                                                    │
│  Step 2: Select Template                          │
│  ○ Monthly Test  ● Midterm  ○ Final Exam          │
│                                                    │
│  Step 3: Chapter Selection  (IMPROVEMENT #3)      │
│  ☑ Ch.1 - The Brave Boy                          │
│  ☑ Ch.2 - A Gift of Nature                       │
│  ☐ Ch.3 - My Country Pakistan                    │
│  [Select All] [Clear]                             │
│                                                    │
│  Step 4: Source                                   │
│  ○ Book only  ○ Copy only  ● Both                │
│                                                    │
│  Step 5: Difficulty  (IMPROVEMENT #4)            │
│  ○ Easy  ○ Medium  ○ Hard  ● Mixed               │
│                                                    │
│  Step 6: Paper Versions  (IMPROVEMENT #6)        │
│  ☑ Version A  ☑ Version B  ☐ Version C          │
│                                                    │
│  Step 7: Paper Settings                          │
│  Long Questions: [5 ▼]  Short Q per type: [5 ▼] │
│                                                    │
│  ☑ Generate Answer Key  (IMPROVEMENT #5)         │
│                                                    │
│  [✨ Generate Paper]                               │
└────────────────────────────────────────────────────┘
Generation API (/api/generate/route.ts):
// IMPROVEMENT #1: Use OCR text instead of images → cheaper + faster
// Step 1: Fetch template format image from paper_templates table
// Step 2: Fetch OCR text from uploads.ocr_text for selected class + chapters + source
// Step 3: Call Gemini with TEXT content + format image + prompt
// Step 4: If versions requested, call Gemini again per version with "rearrange questions" instruction
// Step 5: Parse JSON response
// Step 6: Save to generated_papers with full paper_data JSONB
// Step 7: Return structured paper data

const basePrompt = (content: string, config: GenerationConfig) => `
You are an expert Pakistani school exam paper generator.

CONTENT EXTRACTED FROM ${config.source.toUpperCase()} (Class ${config.className} ${config.subject}):
${content}

CHAPTERS COVERED: ${config.chapters.join(', ')}

DIFFICULTY LEVEL: ${config.difficulty}
- easy: recall-based, definition, single-word answer questions
- medium: comprehension, short explanation questions  
- hard: analytical, critical thinking, application questions
- mixed: balanced combination of all levels

Generate an exam paper with these sections:

LONG QUESTIONS (${config.longQCount} questions):
- Detailed answer questions, paragraph level
- Include difficulty tag per question

SHORT QUESTIONS:
- Word Meanings: ${config.wordMeaningCount} words (include Urdu meanings)
- Make Sentences: ${config.sentenceCount} words
- Fill in the Blanks: ${config.fillCount} sentences
- True/False: ${config.trueFalseCount} statements
- MCQs: ${config.mcqCount} questions with 4 options

${config.generateAnswerKey ? `
ANSWER KEY:
- Provide model answers for all long questions
- Provide all correct answers for short questions
` : ''}

Return ONLY valid JSON:
{
  "paper_title": "...",
  "class": "${config.className}",
  "subject": "${config.subject}",
  "exam_type": "${config.examType}",
  "total_marks": 100,
  "time": "3 Hours",
  "difficulty": "${config.difficulty}",
  "long_questions": [
    { "number": 1, "question": "...", "marks": 10, "difficulty": "medium" }
  ],
  "short_questions": {
    "word_meanings": [{ "word": "...", "urdu": "...", "meaning": "..." }],
    "sentences": ["..."],
    "fill_blanks": [{ "sentence": "...", "blank": "___", "answer": "..." }],
    "true_false": [{ "statement": "...", "answer": true }],
    "mcqs": [{ "question": "...", "options": ["A","B","C","D"], "answer": "A" }]
  },
  "answer_key": {
    "long_answers": [{ "number": 1, "answer": "..." }],
    "short_answers": {
      "word_meanings": [...],
      "fill_blanks": ["..."],
      "true_false": [true, false],
      "mcqs": ["A", "C", "B"]
    }
  }
}
`;

// For Paper Versions A/B/C (IMPROVEMENT #6)
// Version A = original generated paper
// Version B = same questions, different order (shuffle long + short separately)
// Version C = same content, MCQ options reshuffled
async function generateVersions(baseData: PaperData, versions: string[]) {
  const result: Record<string, PaperData> = { A: baseData };
  
  if (versions.includes('B')) {
    result.B = shuffleQuestions(baseData, 'questions');
  }
  if (versions.includes('C')) {
    result.C = shuffleQuestions(baseData, 'options');
  }
  
  return result;
}
✏️ Manual Paper Editor (IMPROVEMENT #9)
Purpose:
After generation, teacher can edit any question before downloading PDF.

UI:
┌──────────────────────────────────────────────────┐
│  ✏️ EDIT PAPER — Class 5 English Midterm         │
│                                                  │
│  LONG QUESTIONS                                  │
│  ┌────────────────────────────────────────────┐  │
│  │ Q.1 [Edit question text here...]           │  │
│  │ Marks: [10]  Difficulty: [Medium ▼]        │  │
│  │ [Delete] [Move Up ↑] [Move Down ↓]         │  │
│  └────────────────────────────────────────────┘  │
│  [+ Add Long Question]                          │
│                                                  │
│  SHORT QUESTIONS — WORD MEANINGS                 │
│  ┌────────────────────────────────────────────┐  │
│  │ Word: [beautiful]  Meaning: [خوبصورت]      │  │
│  │ [Delete]                                   │  │
│  └────────────────────────────────────────────┘  │
│  [+ Add Word]                                   │
│                                                  │
│  [💾 Save Changes]  [📥 Download PDF]           │
└──────────────────────────────────────────────────┘
Editor Logic:
// Load paper_data JSONB from generated_papers
// Allow inline editing of all fields
// On save: UPDATE generated_papers SET paper_data = $1, is_edited = TRUE WHERE id = $2
// Mark paper as edited so teacher knows it was modified
📄 Paper Preview + PDF Export
Two PDF Downloads:
Exam Paper PDF — questions only, no answers
Answer Key PDF — all answers formatted neatly (IMPROVEMENT #5)
Preview UI:
┌─────────────────────────────────────────────────────┐
│  [Version A] [Version B] [Version C]  ← tabs       │
│                                                     │
│         HAPPYDAY SCHOOL SYSTEM                      │
│              Peshawar Cantt                         │
│  ───────────────────────────────────────────────    │
│  Class: 5    Subject: English    Marks: 100         │
│  Date: ______    Time: 3 Hours                      │
│  ───────────────────────────────────────────────    │
│                                                     │
│  Q.1 LONG QUESTIONS                  (50 Marks)    │
│  1. [question...]                                   │
│  2. [question...]                                   │
│                                                     │
│  Q.2 SHORT QUESTIONS                 (50 Marks)    │
│  i.  Word Meanings: ...                            │
│                                                     │
│  ─────────────────────────────────────────────────  │
│  [✏️ Edit Paper]                                    │
│  [📥 Download Paper PDF]  [📥 Download Answer Key] │
│  [🖨️ Print]                                        │
└─────────────────────────────────────────────────────┘
🎨 UI Design
Color Palette:
Primary: #1B4F72 (deep blue — academic/trustworthy)
Accent: #2ECC71 (green — Pakistani flag inspired)
Background: #F8F9FA
Card: #FFFFFF
Text: #1A1A2E
Warning/Edit: #F39C12
Sidebar Navigation:
┌──────────────────┐
│  📋 PaperAI      │
├──────────────────┤
│ 🏠 Dashboard     │
│ 📤 Upload        │
│ 📋 Templates     │
│ ✨ Generate      │
│ 📄 Papers        │
│ ⚙️  Settings     │
└──────────────────┘
🔒 Security (Supabase RLS)
-- Table-level RLS
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_papers ENABLE ROW LEVEL SECURITY;

-- Helper function
CREATE OR REPLACE FUNCTION get_my_school_id()
RETURNS UUID AS $$
  SELECT school_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Policies
CREATE POLICY "school_isolation" ON uploads
  USING (school_id = get_my_school_id());

CREATE POLICY "school_isolation" ON classes
  USING (school_id = get_my_school_id());

CREATE POLICY "school_isolation" ON paper_templates
  USING (school_id = get_my_school_id());

CREATE POLICY "school_isolation" ON generated_papers
  USING (school_id = get_my_school_id());

-- IMPROVEMENT #8: Storage bucket RLS
CREATE POLICY "school_storage_upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id IN ('paper-templates', 'uploads')
  AND (storage.foldername(name))[1] = get_my_school_id()::TEXT
);

CREATE POLICY "school_storage_read"
ON storage.objects FOR SELECT
USING (
  bucket_id IN ('paper-templates', 'uploads')
  AND (storage.foldername(name))[1] = get_my_school_id()::TEXT
);
🌍 Environment Variables
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
📦 Package Installation
npx create-next-app@latest ai-paper-generator --typescript --tailwind --app
cd ai-paper-generator

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# UI
npx shadcn@latest init
npx shadcn@latest add button card input label select tabs toast textarea badge

# AI
npm install @google/generative-ai

# OCR (IMPROVEMENT #1)
npm install tesseract.js

# PDF
npm install @react-pdf/renderer

# Utilities
npm install react-dropzone lucide-react clsx tailwind-merge
🚀 Implementation Order
Setup: Next.js project + Supabase project + env vars
Auth: Signup/Login pages + Supabase middleware + trigger
Database: Run all SQL schemas + RLS policies (tables + storage)
Templates Section: Multiple paper format upload (Monthly/Midterm/Final)
Upload Section: Class + chapter management + image uploads + OCR extraction
Generate API: OCR text → Gemini prompt → structured JSON with difficulty + versions + answer key
Paper Preview: Screen display with Version A/B/C tabs
Paper Editor: Manual editing of all questions before download
PDF Export: Exam paper PDF + Answer Key PDF
Dashboard: Stats (papers generated, classes, templates), recent papers
Polish: Loading states, error handling, responsive design
✅ Key Notes for OpenCode
Use App Router (not Pages Router)
All API routes use Route Handlers (route.ts)
OCR first, Gemini second — extract text on upload, pass text to Gemini (not raw images) during generation → cheaper API calls
Supabase client: createServerClient in server components, createBrowserClient in client components
paper_data JSONB stores everything — easy to edit and flexible for future changes
For versions B/C: shuffle logic runs in Node.js (no extra Gemini call needed)
Answer key is embedded in paper_data.answer_key — render separately for Answer Key PDF
is_edited: true flag lets teachers track which papers were manually changed
Paper format template image is passed to Gemini FIRST so AI sees layout before generating
Chapter numbers stored in uploads.chapter_number — filter by IN (selected_chapters) when fetching OCR text