'use client'

interface QuestionSectionProps {
  title: string
  children: React.ReactNode
}

export function QuestionSection({ title, children }: QuestionSectionProps) {
  return (
    <div className="mb-4">
      <h3 className="mb-2 text-sm font-semibold text-[#4F46E5]">{title}</h3>
      {children}
    </div>
  )
}
