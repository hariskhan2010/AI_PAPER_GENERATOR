import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractText } from '@/lib/ocr'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { uploadId } = await request.json()
    if (!uploadId) {
      return NextResponse.json({ error: 'uploadId required' }, { status: 400 })
    }

    const { data: upload } = await supabase
      .from('uploads')
      .select('*')
      .eq('id', uploadId)
      .single()

    if (!upload) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 })
    }

    const ocrText = await extractText(upload.file_url)

    await supabase
      .from('uploads')
      .update({ ocr_text: ocrText })
      .eq('id', uploadId)

    return NextResponse.json({ text: ocrText })
  } catch (error) {
    return NextResponse.json({ error: 'OCR extraction failed' }, { status: 500 })
  }
}
