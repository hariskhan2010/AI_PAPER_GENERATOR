'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { PageTransition } from '@/components/animations/PageTransition'
import {
  LayoutDashboard,
  Upload,
  FileText,
  Sparkles,
  ClipboardList,
  Settings,
  Menu,
  X,
  LogOut,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/upload', label: 'Upload', icon: Upload },
  { href: '/templates', label: 'Templates', icon: FileText },
  { href: '/generate', label: 'Generate', icon: Sparkles },
  { href: '/papers', label: 'Papers', icon: ClipboardList },
  { href: '/settings', label: 'Settings', icon: Settings },
]

const navItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.3, ease: 'easeOut' as const },
  }),
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-[#0A0A0A] to-[#0F2E1A] text-white transition-transform duration-300 lg:relative lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-4 pb-2">
              <div className="flex items-center gap-1">
                <img src="/logo.png" alt="PaperAI" className="h-[200px] w-[200px] object-contain" />
                <motion.h1
                  className="text-lg font-semibold tracking-tight"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  PaperAI
                </motion.h1>
              </div>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mx-4 my-2 h-px bg-gradient-to-r from-[#22C55E]/30 via-[#22C55E]/10 to-transparent" />
          <nav className="space-y-1 px-2">
            {navItems.map((item, i) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <motion.div
                  key={item.href}
                  variants={navItemVariants}
                  initial="hidden"
                  animate="visible"
                  custom={i}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#22C55E]/15 to-transparent font-medium text-[#22C55E] shadow-sm'
                        : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.4 }}
                    >
                      <Icon className="h-4 w-4" />
                    </motion.div>
                    {item.label}
                    {isActive && (
                      <motion.div
                        className="ml-auto h-1.5 w-1.5 rounded-full bg-[#22C55E] shadow-sm shadow-[#22C55E]/50"
                        layoutId="activeDot"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              )
            })}
          </nav>

          <motion.div
            className="absolute bottom-0 left-0 right-0 border-t border-white/5 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-white/40 hover:bg-white/5 hover:text-white/70"
                onClick={handleLogout}
              >
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#22C55E]/20 flex items-center justify-center text-[10px] font-medium text-[#22C55E] overflow-hidden">
                  {user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
                    <img
                      src={user.user_metadata.avatar_url || user.user_metadata.picture}
                      alt=""
                      className="h-full w-full rounded-full ring-1 ring-[#22C55E]/30 object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  ) : (
                    (user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <span className="flex-1 truncate text-left text-sm text-white/60">{user?.email}</span>
                <LogOut className="h-4 w-4 shrink-0 text-white/40" />
              </Button>
            </div>
          </motion.div>
        </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex-1">
        <motion.header
          className="flex items-center gap-4 border-b bg-white px-6 py-3 lg:hidden"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </motion.button>
          <h1 className="text-lg font-semibold text-[#0A0A0A]">PaperAI</h1>
        </motion.header>
        <main className="p-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  )
}
