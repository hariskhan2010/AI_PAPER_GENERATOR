'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StaggerContainer, StaggerItem } from '@/components/animations/StaggerChildren'
import { Plus, Trash2, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { PaperTemplate } from '@/types'

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<PaperTemplate[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [name, setName] = useState('')
  const [examType, setExamType] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single()

    if (profile) {
      const { data } = await supabase
        .from('paper_templates')
        .select('*')
        .eq('school_id', profile.school_id)
        .order('created_at')

      if (data) setTemplates(data)
    }
  }

  const handleAddTemplate = async () => {
    if (!name || !examType || !file) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single()

    if (!profile) return

    const filePath = `${profile.school_id}/${crypto.randomUUID()}/${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('paper-templates')
      .upload(filePath, file)

    if (uploadError) {
      console.error(uploadError)
      setLoading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('paper-templates')
      .getPublicUrl(filePath)

    await supabase.from('paper_templates').insert({
      school_id: profile.school_id,
      name,
      exam_type: examType,
      format_url: publicUrl,
    })

    setName('')
    setExamType('')
    setFile(null)
    setShowAddForm(false)
    setLoading(false)
    loadTemplates()
  }

  const handleDelete = async (id: string) => {
    await supabase.from('paper_templates').delete().eq('id', id)
    loadTemplates()
  }

  const handleSetDefault = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single()

    if (!profile) return

    await supabase
      .from('paper_templates')
      .update({ is_default: false })
      .eq('school_id', profile.school_id)

    await supabase
      .from('paper_templates')
      .update({ is_default: true })
      .eq('id', id)

    loadTemplates()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Paper Templates</h1>
          <p className="text-gray-600">Manage multiple exam format templates</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-[#0F172A]">
          <Plus className="mr-2 h-4 w-4" /> Add Template
        </Button>
      </div>

      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input
                placeholder="e.g. Monthly Test"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Exam Type</Label>
              <Select value={examType} onValueChange={(v) => v && setExamType(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="midterm">Midterm</SelectItem>
                  <SelectItem value="final">Final Exam</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Format Image/PDF</Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            <Button onClick={handleAddTemplate} disabled={loading}>
              {loading ? 'Saving...' : 'Save Template'}
            </Button>
          </CardContent>
        </Card>
        </motion.div>
      )}

      <StaggerContainer>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <StaggerItem key={template.id}>
          <motion.div
            whileHover={{ y: -4, boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
          <Card key={template.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span>{template.name}</span>
                {template.is_default && (
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <Check className="h-3 w-3" /> Default
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm capitalize text-gray-600">
                {template.exam_type}
              </p>
              <div className="flex gap-2">
                {!template.is_default && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(template.id)}
                  >
                    Set Default
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(template.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
          </motion.div>
          </StaggerItem>
        ))}
        {templates.length === 0 && (
          <motion.p
            className="col-span-full text-center text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            No templates yet. Click "Add Template" to create one.
          </motion.p>
        )}
      </div>
      </StaggerContainer>
    </div>
  )
}
