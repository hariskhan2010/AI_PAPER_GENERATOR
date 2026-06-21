-- Schools table
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT,
  admin_email TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  school_id UUID REFERENCES schools(id),
  full_name TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Paper templates (multiple per school)
CREATE TABLE paper_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id),
  name TEXT NOT NULL,
  exam_type TEXT NOT NULL,
  format_url TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Uploads (book/copy images with OCR text)
CREATE TABLE uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id),
  class_id UUID REFERENCES classes(id),
  type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  chapter_number INT,
  chapter_name TEXT,
  ocr_text TEXT,
  page_number INT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated papers
CREATE TABLE generated_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id),
  class_id UUID REFERENCES classes(id),
  template_id UUID REFERENCES paper_templates(id),
  source_type TEXT,
  chapter_numbers INT[],
  difficulty TEXT DEFAULT 'mixed',
  version TEXT DEFAULT 'A',
  paper_data JSONB NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  pdf_url TEXT,
  answer_key_pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create school + profile on signup
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

-- Enable RLS
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_papers ENABLE ROW LEVEL SECURITY;

-- Helper function
CREATE OR REPLACE FUNCTION get_my_school_id()
RETURNS UUID AS $$
  SELECT school_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS policies
CREATE POLICY "school_isolation" ON uploads
  USING (school_id = get_my_school_id());

CREATE POLICY "school_isolation" ON classes
  USING (school_id = get_my_school_id());

CREATE POLICY "school_isolation" ON paper_templates
  USING (school_id = get_my_school_id());

CREATE POLICY "school_isolation" ON generated_papers
  USING (school_id = get_my_school_id());

-- Storage bucket RLS
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
