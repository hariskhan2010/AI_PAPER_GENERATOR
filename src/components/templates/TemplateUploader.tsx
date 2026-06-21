'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'

interface TemplateUploaderProps {
  onUpload: (file: File) => void
}

export function TemplateUploader({ onUpload }: TemplateUploaderProps) {
  const [file, setFile] = useState<File | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      onUpload(f)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} />
      {file && (
        <Button variant="outline" size="sm">
          <Upload className="mr-2 h-4 w-4" /> Upload
        </Button>
      )}
    </div>
  )
}
