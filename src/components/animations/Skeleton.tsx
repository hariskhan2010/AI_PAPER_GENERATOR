'use client'

import { motion } from 'framer-motion'

function shimmer() {
  return {
    initial: { backgroundPosition: '-200% 0' },
    animate: {
      backgroundPosition: '200% 0',
      transition: { repeat: Infinity, duration: 1.5, ease: 'linear' as const },
    },
  }
}

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] ${className}`}
      variants={shimmer()}
      initial="initial"
      animate="animate"
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-white p-6">
      <Skeleton className="mb-3 h-4 w-24" />
      <Skeleton className="h-8 w-16" />
    </div>
  )
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}
