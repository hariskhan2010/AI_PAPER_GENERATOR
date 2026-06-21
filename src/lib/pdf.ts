import React from 'react'
import ReactPDF, { Document } from '@react-pdf/renderer'
import type { PaperData } from '@/types'

export async function generatePaperPDF(paper: PaperData): Promise<Blob> {
  const { PaperPDF } = await import('@/components/pdf/PaperPDF')
  const element = React.createElement(PaperPDF, { paper })
  return ReactPDF.pdf(element as React.ReactElement<React.ComponentProps<typeof Document>>).toBlob()
}

export async function generateAnswerKeyPDF(paper: PaperData): Promise<Blob> {
  const { AnswerKeyPDF } = await import('@/components/pdf/AnswerKeyPDF')
  const element = React.createElement(AnswerKeyPDF, { paper })
  return ReactPDF.pdf(element as React.ReactElement<React.ComponentProps<typeof Document>>).toBlob()
}
