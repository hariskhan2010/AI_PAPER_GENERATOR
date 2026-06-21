'use client'

import { Check } from 'lucide-react'

interface UploadGridProps {
  items: { id: string; file_name: string; file_url: string; ocr_text?: string }[]
}

export function UploadGrid({ items }: UploadGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.id} className="relative rounded-lg border p-2">
          <img
            src={item.file_url}
            alt={item.file_name || 'Upload'}
            className="h-24 w-full rounded object-cover"
          />
          <p className="mt-1 truncate text-xs text-gray-600">{item.file_name}</p>
          <div className="mt-1 flex items-center gap-1">
            {item.ocr_text ? (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <Check className="h-3 w-3" /> OCR: Extracted
              </span>
            ) : (
              <span className="text-xs text-gray-400">OCR: Pending</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
