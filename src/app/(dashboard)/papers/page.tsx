'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StaggerContainer, StaggerItem } from '@/components/animations/StaggerChildren'
import { ListSkeleton } from '@/components/animations/Skeleton'
import type { GeneratedPaper } from '@/types'

export default function PapersPage() {
  const [papers, setPapers] = useState<GeneratedPaper[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadPapers()
  }, [])

  const loadPapers = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single()

    if (profile) {
      const { data } = await supabase
        .from('generated_papers')
        .select('*')
        .eq('school_id', profile.school_id)
        .order('created_at', { ascending: false })

      if (data) setPapers(data as GeneratedPaper[])
    }
    setLoading(false)
  }

  const handleDownloadPDF = async (paperId: string) => {
    window.open(`/api/pdf?id=${paperId}&type=paper`, '_blank')
  }

  const handleDownloadAnswerKey = async (paperId: string) => {
    window.open(`/api/pdf?id=${paperId}&type=answer_key`, '_blank')
  }

  if (loading) {
    return <p className="text-gray-500">Loading papers...</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Generated Papers</h1>
        <p className="text-gray-600">View and manage your generated exam papers</p>
      </div>

      {loading ? (
        <ListSkeleton count={4} />
      ) : papers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              No papers generated yet. Go to the Generate section to create one.
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <StaggerContainer>
        <div className="space-y-4">
          {papers.map((paper) => (
            <StaggerItem key={paper.id}>
            <motion.div
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.99 }}
            >
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <p className="font-medium">
                    {paper.paper_data?.paper_title || 'Untitled Paper'}
                  </p>
                  <div className="flex gap-2 text-sm text-gray-600">
                    <span>Class {paper.paper_data?.class}</span>
                    <span>&middot;</span>
                    <span>{paper.paper_data?.subject}</span>
                    <span>&middot;</span>
                    <span>Version {paper.version}</span>
                    {paper.is_edited && (
                      <>
                        <span>&middot;</span>
                        <Badge variant="outline" className="text-yellow-600">Edited</Badge>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(paper.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/papers/${paper.id}/edit`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadPDF(paper.id)}
                  >
                    PDF
                  </Button>
                  {paper.paper_data?.answer_key && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadAnswerKey(paper.id)}
                    >
                      Answer Key
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            </motion.div>
            </StaggerItem>
          ))}
        </div>
        </StaggerContainer>
      )}
    </div>
  )
}
