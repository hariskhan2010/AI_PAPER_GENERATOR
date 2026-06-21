# Phase 2: Content Management

## Goal
Build the Templates section (paper format uploads) and the Upload section (book/copy images with OCR).

## Steps

### 2.1 Templates Section
- `app/(dashboard)/templates/page.tsx` — Template listing page
  - Display template cards for Monthly/Midterm/Final/Custom
  - Add new template form (name, exam type, format image upload)
  - Set default template, edit, delete
- `components/templates/TemplateCard.tsx` — Card component showing template preview
- `components/templates/TemplateUploader.tsx` — File upload component for format images
- API: Upload template image to Supabase Storage → `paper-templates/{school_id}/{template_id}/`
- Store metadata in `paper_templates` table

### 2.2 Upload Section — Class & Subject Management
- `app/(dashboard)/upload/page.tsx` — Main upload page layout
  - Class selector dropdown + subject selector
  - Chapter tagging UI
  - Two columns: Book images | Copy images
- `components/upload/ClassSelector.tsx` — Select class + subject
- `components/upload/ChapterSelector.tsx` — Tag chapter number/name per upload batch
- `components/upload/UploadGrid.tsx` — Grid display of uploaded images with status

### 2.3 Book & Copy Image Upload
- `app/(dashboard)/upload/books/page.tsx` — Book image upload (chapter-wise)
- `app/(dashboard)/upload/copies/page.tsx` — Copy/notes image upload
- `components/upload/ImageUploader.tsx` — Drag-and-drop image upload using react-dropzone
- Upload images to Supabase Storage → `uploads/{school_id}/{class_id}/book/ch{N}/` or `uploads/{school_id}/{class_id}/copy/`
- Store record in `uploads` table

### 2.4 OCR Text Extraction
- `lib/ocr.ts` — Tesseract.js helper
  - `extractText(imageUrl)` — runs OCR, falls back to Gemini Vision if confidence < 70%
- `app/api/ocr/route.ts` — API endpoint
  - Receives image → runs OCR → stores extracted text in `uploads.ocr_text`
- On upload completion, trigger OCR processing
- Show OCR status per image (pending/extracting/done/failed)

### 2.5 Upload API
- `app/api/upload/route.ts` — Handle image upload + OCR trigger
  - Accept image file + metadata (class_id, type, chapter_number, chapter_name)
  - Upload to Supabase Storage
  - Insert record in `uploads` table
  - Trigger OCR extraction asynchronously

## Deliverables
- Teachers can upload multiple paper format templates (Monthly, Midterm, Final, etc.)
- Teachers can select class/subject, tag chapters, and upload book/copy images
- Images are stored in Supabase Storage with proper folder structure
- OCR text is extracted from all uploaded images and stored in the database
- Upload status indicators (progress, OCR status)

## Key Files Created
- `app/(dashboard)/templates/page.tsx`
- `components/templates/TemplateCard.tsx`
- `components/templates/TemplateUploader.tsx`
- `app/(dashboard)/upload/page.tsx`
- `app/(dashboard)/upload/books/page.tsx`
- `app/(dashboard)/upload/copies/page.tsx`
- `components/upload/ImageUploader.tsx`
- `components/upload/ClassSelector.tsx`
- `components/upload/ChapterSelector.tsx`
- `components/upload/UploadGrid.tsx`
- `lib/ocr.ts`
- `app/api/upload/route.ts`
- `app/api/ocr/route.ts`
