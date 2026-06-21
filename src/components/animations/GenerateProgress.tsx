'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const stages = [
  'Reading chapter content...',
  'Analyzing curriculum topics...',
  'Generating long questions...',
  'Creating short questions...',
  'Building answer key...',
  'Formatting paper layout...',
]

export function GenerateProgress() {
  const [stage, setStage] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 100
        return p + 1
      })
    }, 120)

    const stageInterval = setInterval(() => {
      setStage((s) => {
        if (s >= stages.length - 1) return s
        return s + 1
      })
    }, 2500)

    return () => {
      clearInterval(interval)
      clearInterval(stageInterval)
    }
  }, [])

  return (
    <div className="space-y-4 rounded-xl border bg-white p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[#0F172A]">Generating Paper</h3>
        <span className="text-sm font-medium text-gray-500">{progress}%</span>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#0F172A] to-[#059669]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="h-12">
        <AnimatePresence mode="wait">
          <motion.p
            key={stage}
            className="text-sm text-gray-600"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {stages[stage]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-1.5">
        {stages.map((_, i) => (
          <motion.div
            key={i}
            className={`h-2 w-2 rounded-full ${
              i <= stage ? 'bg-[#4F46E5]' : 'bg-gray-200'
            }`}
            animate={{ scale: i === stage ? 1.3 : 1 }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  )
}
