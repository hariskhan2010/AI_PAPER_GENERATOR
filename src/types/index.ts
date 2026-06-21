export interface School {
  id: string
  name: string
  city?: string
  admin_email: string
  logo_url?: string
  created_at: string
}

export interface Profile {
  id: string
  school_id: string
  full_name?: string
  role: 'admin' | 'teacher'
  created_at: string
}

export interface PaperTemplate {
  id: string
  school_id: string
  name: string
  exam_type: 'monthly' | 'midterm' | 'final' | 'custom'
  format_url: string
  description?: string
  is_default: boolean
  created_at: string
}

export interface Class {
  id: string
  school_id: string
  name: string
  subject: string
  created_at: string
}

export interface Upload {
  id: string
  school_id: string
  class_id: string
  type: 'book' | 'copy'
  file_url: string
  file_name?: string
  chapter_number?: number
  chapter_name?: string
  ocr_text?: string
  page_number?: number
  uploaded_at: string
}

export interface LongQuestion {
  number: number
  question: string
  marks: number
  difficulty: string
}

export interface WordMeaning {
  word: string
  urdu: string
  meaning: string
}

export interface FillBlank {
  sentence: string
  blank: string
  answer: string
}

export interface TrueFalse {
  statement: string
  answer: boolean
}

export interface MCQ {
  question: string
  options: string[]
  answer: string
}

export interface ShortQuestions {
  word_meanings: WordMeaning[]
  sentences: string[]
  fill_blanks: FillBlank[]
  true_false: TrueFalse[]
  mcqs: MCQ[]
}

export interface LongAnswer {
  number: number
  answer: string
}

export interface AnswerKey {
  long_answers: LongAnswer[]
  short_answers: {
    word_meanings: WordMeaning[]
    fill_blanks: string[]
    true_false: boolean[]
    mcqs: string[]
  }
}

export interface PaperData {
  paper_title: string
  class: string
  subject: string
  exam_type: string
  total_marks: number
  time: string
  difficulty: string
  long_questions: LongQuestion[]
  short_questions: ShortQuestions
  answer_key?: AnswerKey
}

export interface GeneratedPaper {
  id: string
  school_id: string
  class_id: string
  template_id: string
  source_type: 'book' | 'copy' | 'both'
  chapter_numbers: number[]
  difficulty: string
  version: 'A' | 'B' | 'C'
  paper_data: PaperData
  is_edited: boolean
  pdf_url?: string
  answer_key_pdf_url?: string
  created_at: string
}

export interface GenerationConfig {
  classId: string
  className: string
  subject: string
  templateId: string
  examType: string
  chapters: number[]
  source: 'book' | 'copy' | 'both'
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed'
  versions: string[]
  longQCount: number
  wordMeaningCount: number
  sentenceCount: number
  fillCount: number
  trueFalseCount: number
  mcqCount: number
  totalMarks: number
  duration: string
  generateAnswerKey: boolean
}
