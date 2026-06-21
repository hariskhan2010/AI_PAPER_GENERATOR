'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ChapterSelectorProps {
  chapterNumber: number
  chapterName: string
  onChapterNumberChange: (n: number) => void
  onChapterNameChange: (name: string) => void
}

export function ChapterSelector({
  chapterNumber,
  chapterName,
  onChapterNumberChange,
  onChapterNameChange,
}: ChapterSelectorProps) {
  return (
    <div className="flex gap-4">
      <div className="w-32 space-y-2">
        <Label>Chapter #</Label>
        <Input
          type="number"
          min={1}
          value={chapterNumber}
          onChange={(e) => onChapterNumberChange(parseInt(e.target.value) || 1)}
        />
      </div>
      <div className="flex-1 space-y-2">
        <Label>Chapter Name</Label>
        <Input
          placeholder="e.g. Chapter 1 - The Brave Boy"
          value={chapterName}
          onChange={(e) => onChapterNameChange(e.target.value)}
        />
      </div>
    </div>
  )
}
