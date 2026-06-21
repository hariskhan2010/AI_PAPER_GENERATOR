export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from './DashboardClient'
import { CardSkeleton, ListSkeleton } from '@/components/animations/Skeleton'

async function DashboardContent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id, full_name')
    .eq('id', user?.id)
    .single()

  const schoolId = profile?.school_id

  const [{ count: papersCount }, { count: classesCount }, { count: uploadsCount }, { count: templatesCount }] = await Promise.all([
    supabase.from('generated_papers').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
    supabase.from('classes').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
    supabase.from('uploads').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
    supabase.from('paper_templates').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
  ])

  const { data: recentPapers } = await supabase
    .from('generated_papers')
    .select('id, paper_data, created_at, version')
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = [
    { label: 'Papers Generated', value: papersCount ?? 0, icon: 'FileText' as const, gradient: 'from-[#22C55E] to-[#16A34A]', shadow: 'shadow-[#22C55E]/20' },
    { label: 'Classes', value: classesCount ?? 0, icon: 'School' as const, gradient: 'from-[#4F46E5] to-[#4338CA]', shadow: 'shadow-[#4F46E5]/20' },
    { label: 'Uploads', value: uploadsCount ?? 0, icon: 'Upload' as const, gradient: 'from-[#059669] to-[#047857]', shadow: 'shadow-[#059669]/20' },
    { label: 'Templates', value: templatesCount ?? 0, icon: 'Layers' as const, gradient: 'from-[#7C3AED] to-[#6D28D9]', shadow: 'shadow-[#7C3AED]/20' },
  ]

  return (
    <DashboardClient
      fullName={profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || null}
      stats={stats}
      recentPapers={recentPapers as DashboardClientProps['recentPapers']}
    />
  )
}

import type { DashboardClientProps } from './DashboardClient'

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
          </div>
          <CardSkeleton />
          <ListSkeleton count={3} />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  )
}
