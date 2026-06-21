import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const classId = formData.get('classId') as string
    const type = formData.get('type') as string
    const chapterNumber = formData.get('chapterNumber') as string
    const chapterName = formData.get('chapterName') as string

    if (!file || !classId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const filePath = `${profile.school_id}/${classId}/${type}/ch${chapterNumber}/${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filePath, file)

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath)

    const { data, error } = await supabase
      .from('uploads')
      .insert({
        school_id: profile.school_id,
        class_id: classId,
        type,
        file_url: publicUrl,
        file_name: file.name,
        chapter_number: chapterNumber ? parseInt(chapterNumber) : null,
        chapter_name: chapterName || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ upload: data })
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
