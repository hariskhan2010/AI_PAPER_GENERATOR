'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { GenerateProgress } from '@/components/animations/GenerateProgress'
import type { Class, PaperTemplate } from '@/types'

export default function GeneratePage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [templates, setTemplates] = useState<PaperTemplate[]>([])
  const [chapters, setChapters] = useState<number[]>([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [selectedChapters, setSelectedChapters] = useState<number[]>([])
  const [sourceType, setSourceType] = useState<'book' | 'copy' | 'both'>('both')
  const [difficulty, setDifficulty] = useState('mixed')
  const [versions, setVersions] = useState<string[]>(['A'])
  const [generateAnswerKey, setGenerateAnswerKey] = useState(true)
  const [customPrompt, setCustomPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedClassId) loadChapters()
  }, [selectedClassId])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single()

    if (!profile) return

    const [classesRes, templatesRes] = await Promise.all([
      supabase.from('classes').select('*').eq('school_id', profile.school_id).order('name'),
      supabase.from('paper_templates').select('*').eq('school_id', profile.school_id).order('name'),
    ])

    if (classesRes.data) setClasses(classesRes.data)
    if (templatesRes.data) setTemplates(templatesRes.data)

    if (templatesRes.data && templatesRes.data.length > 0) {
      const defaultTemplate = templatesRes.data.find((t) => t.is_default)
      setSelectedTemplateId(defaultTemplate?.id || templatesRes.data[0].id)
    }
  }

  const loadChapters = async () => {
    const { data } = await supabase
      .from('uploads')
      .select('chapter_number, chapter_name')
      .eq('class_id', selectedClassId)
      .not('chapter_number', 'is', null)
      .order('chapter_number')

    if (data) {
      const unique = [...new Map(data.map((u) => [u.chapter_number, u])).values()]
      setChapters(unique.map((u) => u.chapter_number!))
    }
  }

  const toggleChapter = (ch: number) => {
    setSelectedChapters((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    )
  }

  const toggleVersion = (v: string) => {
    setVersions((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    )
  }

  const handleGenerate = async () => {
    if (!selectedClassId || !selectedTemplateId || selectedChapters.length === 0) {
      toast.error('Please select class, template, and at least one chapter')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClassId,
          templateId: selectedTemplateId,
          chapters: selectedChapters,
          source: sourceType,
          difficulty,
          versions,
          generateAnswerKey,
          customPrompt,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast.success('Paper generated successfully!')
      router.push('/papers')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Generate Paper</h1>
        <p className="text-gray-600">Configure and generate exam papers with AI</p>
      </div>

      {loading ? (
        <GenerateProgress />
      ) : (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
      <Card>
        <CardContent className="space-y-6 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Class & Subject</Label>
              <Select value={selectedClassId} onValueChange={(v) => v && setSelectedClassId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} - {c.subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Template</Label>
              <Select value={selectedTemplateId} onValueChange={(v) => v && setSelectedTemplateId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Chapter Selection</Label>
            {chapters.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedChapters(chapters)}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedChapters([])}
                >
                  Clear
                </Button>
                {chapters.map((ch) => (
                  <Button
                    key={ch}
                    variant={selectedChapters.includes(ch) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleChapter(ch)}
                    className={
                      selectedChapters.includes(ch) ? 'bg-[#0F172A]' : ''
                    }
                  >
                    Ch.{ch}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No chapters found. Upload images with chapter numbers first.
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Source</Label>
              <Select value={sourceType} onValueChange={(v) => v && setSourceType(v as 'book' | 'copy' | 'both')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="book">Book only</SelectItem>
                  <SelectItem value="copy">Copy only</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={(v) => v && setDifficulty(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>

          <div className="space-y-3">
            <Label>Paper Versions</Label>
            <div className="flex gap-4">
              {['A', 'B', 'C'].map((v) => (
                <label key={v} className="flex items-center gap-2">
                  <Checkbox
                    checked={versions.includes(v)}
                    onCheckedChange={() => toggleVersion(v)}
                  />
                  <span className="text-sm">Version {v}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="answerKey"
              checked={generateAnswerKey}
              onCheckedChange={(c) => setGenerateAnswerKey(c as boolean)}
            />
            <Label htmlFor="answerKey">Generate Answer Key</Label>
          </div>

          <div className="space-y-2">
            <Label>Custom Instructions (optional)</Label>
            <textarea
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              rows={3}
              placeholder="e.g. Focus on grammar questions, include more Urdu meanings, make the paper suitable for slow learners..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
            />
          </div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-[#0F172A]"
            size="lg"
          >
            {loading ? 'Generating...' : '✨ Generate Paper'}
          </Button>
          </motion.div>
        </CardContent>
      </Card>
      </motion.div>
      )}
    </div>
  )
}
