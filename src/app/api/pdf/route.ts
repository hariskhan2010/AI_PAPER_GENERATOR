import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const type = searchParams.get('type') || 'paper'

    if (!id) {
      return NextResponse.json({ error: 'id parameter required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: paper } = await supabase
      .from('generated_papers')
      .select('*')
      .eq('id', id)
      .single()

    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 })
    }

    const { generatePaperPDF, generateAnswerKeyPDF } = await import('@/lib/pdf')
    const paperData = paper.paper_data as Record<string, unknown>

    const blob =
      type === 'answer_key' && paperData?.answer_key
        ? await generateAnswerKeyPDF(paperData as never)
        : await generatePaperPDF(paperData as never)

    const fileName =
      type === 'answer_key'
        ? `answer_key_${paper.id}.pdf`
        : `paper_${paper.id}.pdf`

    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 })
  }
}
