'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react'
import type { GeneratedPaper, PaperData, LongQuestion, WordMeaning, FillBlank, TrueFalse, MCQ } from '@/types'

export default function EditPaperPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [paper, setPaper] = useState<GeneratedPaper | null>(null)
  const [paperData, setPaperData] = useState<PaperData | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadPaper()
  }, [])

  const loadPaper = async () => {
    const { data } = await supabase
      .from('generated_papers')
      .select('*')
      .eq('id', id)
      .single()

    if (data) {
      setPaper(data as GeneratedPaper)
      setPaperData(data.paper_data as PaperData)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!paperData) return
    setSaving(true)

    const { error } = await supabase
      .from('generated_papers')
      .update({
        paper_data: paperData as never,
        is_edited: true,
      })
      .eq('id', id)

    if (error) {
      toast.error('Failed to save')
    } else {
      toast.success('Changes saved!')
    }
    setSaving(false)
  }

  const updateLongQuestion = (index: number, field: keyof LongQuestion, value: string | number) => {
    if (!paperData) return
    const updated = { ...paperData }
    updated.long_questions[index] = { ...updated.long_questions[index], [field]: value }
    setPaperData(updated)
  }

  const addLongQuestion = () => {
    if (!paperData) return
    const updated = { ...paperData }
    updated.long_questions.push({
      number: updated.long_questions.length + 1,
      question: '',
      marks: 10,
      difficulty: 'medium',
    })
    setPaperData(updated)
  }

  const removeLongQuestion = (index: number) => {
    if (!paperData) return
    const updated = { ...paperData }
    updated.long_questions = updated.long_questions.filter((_, i) => i !== index)
    setPaperData(updated)
  }

  const moveLongQuestion = (index: number, direction: 'up' | 'down') => {
    if (!paperData) return
    const items = [...paperData.long_questions]
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= items.length) return
    ;[items[index], items[target]] = [items[target], items[index]]
    const updated = { ...paperData, long_questions: items }
    setPaperData(updated)
  }

  const handleDownloadPDF = () => {
    window.open(`/api/pdf?id=${id}&type=paper`, '_blank')
  }

  if (loading) {
    return <p className="text-gray-500">Loading...</p>
  }

  if (!paper || !paperData) {
    return <p className="text-gray-500">Paper not found.</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">
            Edit Paper — {paperData.class} {paperData.subject}
          </h1>
          <p className="text-gray-600">{paperData.exam_type}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving} className="bg-[#0F172A]">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF}>
            Download PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Long Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {paperData.long_questions.map((q, i) => (
            <div key={i} className="space-y-2 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Q.{i + 1}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => moveLongQuestion(i, 'up')} disabled={i === 0}>
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => moveLongQuestion(i, 'down')} disabled={i === paperData.long_questions.length - 1}>
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => removeLongQuestion(i)}>
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              </div>
              <Textarea
                value={q.question}
                onChange={(e) => updateLongQuestion(i, 'question', e.target.value)}
                placeholder="Question text..."
              />
              <div className="flex gap-4">
                <div className="w-32">
                  <Label>Marks</Label>
                  <Input
                    type="number"
                    value={q.marks}
                    onChange={(e) => updateLongQuestion(i, 'marks', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="w-40">
                  <Label>Difficulty</Label>
                  <Select
                    value={q.difficulty}
                    onValueChange={(v) => v && updateLongQuestion(i, 'difficulty', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={addLongQuestion} className="w-full">
            <Plus className="mr-2 h-4 w-4" /> Add Long Question
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
