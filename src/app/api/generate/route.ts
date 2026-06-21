import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateWithGemini } from '@/lib/gemini'
import type { PaperData } from '@/types'

interface GenerateRequest {
  classId: string
  templateId: string
  chapters: number[]
  source: 'book' | 'copy' | 'both'
  difficulty: string
  versions: string[]
  generateAnswerKey: boolean
  customPrompt?: string
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function shuffleMCQOptions(data: PaperData): PaperData {
  const updated = { ...data, short_questions: { ...data.short_questions } }
  updated.short_questions.mcqs = data.short_questions.mcqs.map((mcq) => {
    const optionKeys = mcq.options.map((_, i) => String.fromCharCode(65 + i))
    const shuffledKeys = shuffleArray(optionKeys)
    const shuffledOptions = shuffledKeys.map((k) => mcq.options[k.charCodeAt(0) - 65])
    const answerKey = String.fromCharCode(65 + shuffledKeys.indexOf(mcq.answer))
    return { ...mcq, options: shuffledOptions, answer: answerKey }
  })
  return updated
}

function generateVersion(base: PaperData, version: string): PaperData {
  if (version === 'B') {
    return {
      ...base,
      long_questions: shuffleArray(base.long_questions).map((q, i) => ({ ...q, number: i + 1 })),
      short_questions: {
        ...base.short_questions,
        word_meanings: shuffleArray(base.short_questions.word_meanings),
        sentences: shuffleArray(base.short_questions.sentences),
        fill_blanks: shuffleArray(base.short_questions.fill_blanks),
        true_false: shuffleArray(base.short_questions.true_false),
        mcqs: shuffleArray(base.short_questions.mcqs),
      },
    }
  }
  if (version === 'C') {
    return shuffleMCQOptions(base)
  }
  return base
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: GenerateRequest = await request.json()
    const { classId, templateId, chapters, source, difficulty, versions, generateAnswerKey, customPrompt } = body

    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const { data: classData } = await supabase
      .from('classes')
      .select('name, subject')
      .eq('id', classId)
      .single()

    const { data: templateData } = await supabase
      .from('paper_templates')
      .select('name, exam_type')
      .eq('id', templateId)
      .single()

    const { data: uploads } = await supabase
      .from('uploads')
      .select('ocr_text, chapter_number')
      .eq('class_id', classId)
      .in('chapter_number', chapters)
      .not('ocr_text', 'is', null)

    const contentText = uploads
      ?.map((u) => `[Chapter ${u.chapter_number}]: ${u.ocr_text}`)
      .join('\n\n')

    if (!contentText) {
      return NextResponse.json({ error: 'No OCR content found for selected chapters' }, { status: 400 })
    }

    const teacherInstruction = customPrompt?.trim()
      ? customPrompt
      : `Generate an exam paper for Class ${classData?.name} ${classData?.subject} based on the content below. Include long questions, short questions (word meanings, sentences, fill in blanks, true/false, MCQs).${generateAnswerKey ? ' Include an answer key.' : ''}`

    const prompt = `You are an expert Pakistani school exam paper generator. Follow the teacher's instructions EXACTLY.

CONTENT (Class ${classData?.name} ${classData?.subject}, Chapters ${chapters.join(', ')}):
${contentText}

DIFFICULTY: ${difficulty}

TEACHER'S INSTRUCTIONS:
${teacherInstruction}

${generateAnswerKey ? 'IMPORTANT: Include a complete answer key in the response.\n' : ''}

Return ONLY valid JSON following this structure:
{
  "paper_title": "...",
  "class": "${classData?.name || ''}",
  "subject": "${classData?.subject || ''}",
  "exam_type": "${templateData?.exam_type || ''}",
  "total_marks": 100,
  "time": "3 Hours",
  "difficulty": "${difficulty}",
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
}`

    const responseText = await generateWithGemini(prompt)
    let paperData: PaperData

    try {
      const cleaned = responseText.replace(/```(?:json)?\n?/g, '').trim()
      paperData = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }

    const versionData: Record<string, PaperData> = { A: paperData }
    for (const version of versions) {
      if (version !== 'A') {
        versionData[version] = generateVersion(paperData, version)
      }
    }

    for (const [version, data] of Object.entries(versionData)) {
      await supabase.from('generated_papers').insert({
        school_id: profile.school_id,
        class_id: classId,
        template_id: templateId,
        source_type: source,
        chapter_numbers: chapters,
        difficulty,
        version,
        paper_data: data as never,
      })
    }

    return NextResponse.json({ papers: versionData })
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
