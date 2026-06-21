'use client'

import { useEffect, useRef } from 'react'
import { motion, useInView, useSpring, useTransform } from 'framer-motion'

export function AnimatedCounter({
  value,
  className = '',
}: {
  value: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  const spring = useSpring(0, { stiffness: 60, damping: 15 })
  const display = useTransform(spring, (v) => Math.floor(v).toLocaleString())

  useEffect(() => {
    if (isInView) spring.set(value)
  }, [isInView, value, spring])

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  )
}
