'use client'

import type { PaperTemplate } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Check } from 'lucide-react'

interface TemplateCardProps {
  template: PaperTemplate
  onSetDefault: (id: string) => void
  onDelete: (id: string) => void
}

export function TemplateCard({ template, onSetDefault, onDelete }: TemplateCardProps) {
  return (
    <Card>
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
        <p className="mb-3 text-sm capitalize text-gray-600">{template.exam_type}</p>
        <div className="flex gap-2">
          {!template.is_default && (
            <Button variant="outline" size="sm" onClick={() => onSetDefault(template.id)}>
              Set Default
            </Button>
          )}
          <Button variant="destructive" size="sm" onClick={() => onDelete(template.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
