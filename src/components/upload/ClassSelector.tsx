'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'

interface ClassSelectorProps {
  classes: { id: string; name: string; subject: string }[]
  selectedClassId: string
  onSelect: (id: string, name: string, subject: string) => void
}

export function ClassSelector({ classes, selectedClassId, onSelect }: ClassSelectorProps) {
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newSubject, setNewSubject] = useState('')
  const supabase = createClient()

  const handleAdd = async () => {
    if (!newName || !newSubject) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single()

    if (!profile) return

    const { data } = await supabase
      .from('classes')
      .insert({
        school_id: profile.school_id,
        name: newName,
        subject: newSubject,
      })
      .select()
      .single()

    if (data) {
      onSelect(data.id, data.name, data.subject)
      setNewName('')
      setNewSubject('')
      setShowAdd(false)
      window.location.reload()
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-3">
        <div className="flex-1 space-y-2">
          <Label>Select Class</Label>
          <Select
            value={selectedClassId}
            onValueChange={(id) => {
              const cls = classes.find((c) => c.id === id)
              if (cls) onSelect(cls.id, cls.name, cls.subject)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a class" />
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
        <Button variant="outline" size="icon" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {showAdd && (
        <div className="flex gap-2">
          <Input
            placeholder="Class name (e.g. Class 5)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Input
            placeholder="Subject (e.g. English)"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
          />
          <Button onClick={handleAdd} size="sm">
            Add
          </Button>
        </div>
      )}
    </div>
  )
}
