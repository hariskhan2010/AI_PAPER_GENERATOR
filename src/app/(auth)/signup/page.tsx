'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.3 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [city, setCity] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data?.user?.id) {
      await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: data.user.id,
          email,
          fullName,
          schoolName,
          city,
        }),
      })
    }

    router.push('/login?message=Check your email to confirm your account')
    router.refresh()
  }

  const handleGoogleSignup = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#0A0A0A] via-[#0A1A0F] to-[#0A0A0A]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.06)_0%,transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />

      <motion.div
        className="w-full max-w-2xl px-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <Card className="relative overflow-hidden border-[#0D2818] bg-[#0A0A0A] shadow-2xl shadow-black/40">

          <CardHeader className="pb-1 pt-4 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
            >
              <img src="/logo.png" alt="PaperAI" className="mx-auto mb-2 w-full max-w-sm object-contain" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <CardTitle className="text-2xl font-semibold tracking-tight text-white">
                Create your account
              </CardTitle>
              <p className="mt-1 text-sm text-white/50">Register your school</p>
            </motion.div>
          </CardHeader>

          <CardContent className="px-8 pb-6">
            <motion.div
              className="space-y-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <Button
                  variant="outline"
                  className="w-full border-[#0A1A0F] bg-[#0A1A0F] text-white/80 transition-all hover:border-[#22C55E]/30 hover:bg-[#22C55E]/10 hover:text-white"
                  onClick={handleGoogleSignup}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </Button>
              </motion.div>

              <motion.div variants={itemVariants} className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#0A0A0A] px-3 text-white/30">Or continue with email</span>
                </div>
              </motion.div>

              <form onSubmit={handleSignup} className="space-y-3" autoComplete="off">
                {/* dummy fields to confuse Chrome autofill */}
                <input type="text" name="fakename" className="hidden" aria-hidden="true" tabIndex={-1} />
                <input type="email" name="fakeemail" className="hidden" aria-hidden="true" tabIndex={-1} />
                <input type="password" name="fakepassword" className="hidden" aria-hidden="true" tabIndex={-1} />

                <motion.div variants={itemVariants} className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-xs font-medium text-white/60">Full Name</Label>
                  <Input
                    id="fullName"
                    autoComplete="off"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="border-[#0A1A0F] bg-[#0A1A0F] text-white placeholder:text-white/20 focus:border-[#22C55E]/50 focus:ring-[#22C55E]/20"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-1.5">
                  <Label htmlFor="schoolName" className="text-xs font-medium text-white/60">School Name</Label>
                  <Input
                    id="schoolName"
                    autoComplete="off"
                    placeholder="Happyday School System"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    required
                    className="border-[#0A1A0F] bg-[#0A1A0F] text-white placeholder:text-white/20 focus:border-[#22C55E]/50 focus:ring-[#22C55E]/20"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-1.5">
                  <Label htmlFor="city" className="text-xs font-medium text-white/60">City</Label>
                  <Input
                    id="city"
                    autoComplete="off"
                    placeholder="Peshawar"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="border-[#0A1A0F] bg-[#0A1A0F] text-white placeholder:text-white/20 focus:border-[#22C55E]/50 focus:ring-[#22C55E]/20"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-1.5">
                  <Label htmlFor="signup-email" className="text-xs font-medium text-white/60">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    autoComplete="off"
                    placeholder="admin@school.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-[#0A1A0F] bg-[#0A1A0F] text-white placeholder:text-white/20 focus:border-[#22C55E]/50 focus:ring-[#22C55E]/20"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-1.5">
                  <Label htmlFor="signup-password" className="text-xs font-medium text-white/60">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-[#0A1A0F] bg-[#0A1A0F] text-white placeholder:text-white/20 focus:border-[#22C55E]/50 focus:ring-[#22C55E]/20"
                  />
                </motion.div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs text-red-400"
                  >
                    {error}
                  </motion.p>
                )}

                <motion.div variants={itemVariants}>
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-[#0A0A0A] font-medium shadow-lg shadow-[#22C55E]/20 hover:shadow-xl hover:shadow-[#22C55E]/30"
                      disabled={loading}
                    >
                      {loading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </motion.div>
                </motion.div>
              </form>

              <motion.p variants={itemVariants} className="text-center text-xs text-white/40">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-[#22C55E] transition-colors hover:text-[#4ADE80]">
                  Sign In
                </Link>
              </motion.p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
