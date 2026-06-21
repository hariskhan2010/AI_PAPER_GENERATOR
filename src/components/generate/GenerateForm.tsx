'use client'

import type { PaperData, GenerationConfig } from '@/types'

interface GenerateFormProps {
  config: GenerationConfig
  onConfigChange: (config: GenerationConfig) => void
  onGenerate: () => void
  loading: boolean
}

export function GenerateForm({ config, onConfigChange, onGenerate, loading }: GenerateFormProps) {
  return null
}
