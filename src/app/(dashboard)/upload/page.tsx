'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ClassSelector } from '@/components/upload/ClassSelector'
import { ChapterSelector } from '@/components/upload/ChapterSelector'
import { ImageUploader } from '@/components/upload/ImageUploader'
import { useRouter } from 'next/navigation'

export default function UploadPage() {
  const [classId, setClassId] = useState('')
  const [className, setClassName] = useState('')
  const [subject, setSubject] = useState('')
  const [chapterNumber, setChapterNumber] = useState(1)
  const [chapterName, setChapterName] = useState('')
  const [bookFiles, setBookFiles] = useState<File[]>([])
  const [copyFiles, setCopyFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [classes, setClasses] = useState<{ id: string; name: string; subject: string }[]>([])
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadClasses()
  }, [])

  const loadClasses = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single()

    if (profile) {
      const { data } = await supabase
        .from('classes')
        .select('*')
        .eq('school_id', profile.school_id)
        .order('name')

      if (data) setClasses(data)
    }
  }

  const handleUpload = async () => {
    if (!classId) return
    setUploading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single()

    if (!profile) return

    const allFiles = [
      ...bookFiles.map((f) => ({ file: f, type: 'book' as const })),
      ...copyFiles.map((f) => ({ file: f, type: 'copy' as const })),
    ]

    for (const { file, type } of allFiles) {
      const filePath = `${profile.school_id}/${classId}/${type}/ch${chapterNumber}/${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        continue
      }

      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath)

      await supabase.from('uploads').insert({
        school_id: profile.school_id,
        class_id: classId,
        type,
        file_url: publicUrl,
        file_name: file.name,
        chapter_number: chapterNumber,
        chapter_name: chapterName || `Chapter ${chapterNumber}`,
        page_number: parseInt(file.name.replace(/\D/g, '') || '1'),
      })
    }

    setBookFiles([])
    setCopyFiles([])
    setUploading(false)
    router.refresh()
  }

  const handleClassChange = (id: string, name: string, subj: string) => {
    setClassId(id)
    setClassName(name)
    setSubject(subj)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Upload Section</h1>
        <p className="text-gray-600">Upload book and copy images for chapter-wise OCR extraction</p>
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          <ClassSelector
            classes={classes}
            selectedClassId={classId}
            onSelect={handleClassChange}
          />

          <ChapterSelector
            chapterNumber={chapterNumber}
            chapterName={chapterName}
            onChapterNumberChange={setChapterNumber}
            onChapterNameChange={setChapterName}
          />

          <Tabs defaultValue="books" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="books">Book Images</TabsTrigger>
              <TabsTrigger value="copies">Copy Images</TabsTrigger>
            </TabsList>
            <TabsContent value="books" className="space-y-4">
              <ImageUploader files={bookFiles} onFilesChange={setBookFiles} type="book" />
            </TabsContent>
            <TabsContent value="copies" className="space-y-4">
              <ImageUploader files={copyFiles} onFilesChange={setCopyFiles} type="copy" />
            </TabsContent>
          </Tabs>

          <Button
            onClick={handleUpload}
            disabled={uploading || (!bookFiles.length && !copyFiles.length) || !classId}
            className="w-full bg-[#0F172A]"
          >
            {uploading ? 'Uploading...' : 'Upload All + Extract Text'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
