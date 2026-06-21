'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X } from 'lucide-react'

interface ImageUploaderProps {
  files: File[]
  onFilesChange: (files: File[]) => void
  type: 'book' | 'copy'
}

export function ImageUploader({ files, onFilesChange, type }: ImageUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesChange([...files, ...acceptedFiles])
    },
    [files, onFilesChange]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
  })

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragActive ? 'border-[#4F46E5] bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
        <p className="text-sm text-gray-600">
          {isDragActive
            ? 'Drop files here...'
            : `Drag & drop ${type} images here, or click to select`}
        </p>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {files.map((file, i) => (
            <div key={i} className="relative rounded-lg border p-2">
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="h-20 w-full rounded object-cover"
              />
              <p className="mt-1 truncate text-xs text-gray-600">{file.name}</p>
              <button
                onClick={() => removeFile(i)}
                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-0.5 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
