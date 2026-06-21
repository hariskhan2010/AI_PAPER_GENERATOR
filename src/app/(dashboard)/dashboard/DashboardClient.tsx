'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Upload, Layers, School } from 'lucide-react'
import { StaggerContainer, StaggerItem } from '@/components/animations/StaggerChildren'
import { AnimatedCounter } from '@/components/animations/AnimatedCounter'

const iconMap = {
  FileText,
  School,
  Upload,
  Layers,
} as const

type IconName = keyof typeof iconMap

export interface DashboardClientProps {
  fullName: string | null
  stats: Array<{
    label: string
    value: number
    icon: IconName
    gradient: string
    shadow: string
  }>
  recentPapers: Array<{
    id: string
    paper_data: { paper_title?: string } | null
    created_at: string
    version: string
  }> | null
}

export function DashboardClient({ fullName, stats, recentPapers }: DashboardClientProps) {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#0A0A0A]">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Welcome back, {fullName || 'User'}</p>
        </div>
        <div className="hidden items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs text-gray-500 shadow-sm sm:flex">
          <div className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
          All systems operational
        </div>
      </motion.div>

      <StaggerContainer>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = iconMap[stat.icon]
            return (
              <StaggerItem key={stat.label}>
                <motion.div
                  whileHover={{ y: -5, scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <Card className="overflow-hidden border-0 bg-white shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-lg">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className={`inline-flex rounded-xl bg-gradient-to-br ${stat.gradient} p-2.5 shadow-lg ${stat.shadow}`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <AnimatedCounter value={stat.value} className="text-3xl font-bold tracking-tight text-[#0A0A0A]" />
                        <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
                      </div>
                      <div className="mt-4 h-px w-full bg-gradient-to-r from-gray-100 to-transparent" />
                    </CardContent>
                  </Card>
                </motion.div>
              </StaggerItem>
            )
          })}
        </div>
      </StaggerContainer>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-0 bg-white shadow-sm ring-1 ring-gray-100">
          <CardHeader className="border-b border-gray-50 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-[#0A0A0A]">Recent Papers</CardTitle>
              <span className="text-xs text-gray-400">{recentPapers?.length ?? 0} papers</span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {recentPapers && recentPapers.length > 0 ? (
              <StaggerContainer>
                <div className="space-y-2">
                  {recentPapers.map((paper) => (
                    <StaggerItem key={paper.id}>
                      <motion.div
                        className="flex items-center justify-between rounded-lg border border-gray-100 p-3.5 transition-all hover:border-gray-200 hover:bg-gray-50/50"
                        whileHover={{ x: 3 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
                            <FileText className="h-4 w-4 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#0A0A0A]">
                              {paper.paper_data?.paper_title || 'Untitled Paper'}
                            </p>
                            <p className="text-xs text-gray-400">
                              Version {paper.version} &middot;{' '}
                              {new Date(paper.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-500">
                          v{paper.version}
                        </div>
                      </motion.div>
                    </StaggerItem>
                  ))}
                </div>
              </StaggerContainer>
            ) : (
              <motion.div
                className="rounded-lg border border-dashed border-gray-200 p-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <FileText className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-2 text-sm text-gray-400">No papers generated yet</p>
                <p className="text-xs text-gray-300">Generate your first paper to see it here</p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
