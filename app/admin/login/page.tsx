'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PageTitle } from '@/components/page-title'

import { adminLoginSchema } from '@/lib/validations'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [errors, setErrors] = useState<{ email?: string, password?: string }>({})
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(false)
    setErrorMsg(null)
    setErrors({})

    const parsed = adminLoginSchema.safeParse({ email, password })
    if (!parsed.success) {
      const fieldErrors: Record<string, string | undefined> = {}
      parsed.error.issues.forEach((err) => {
        const path = err.path[0] as string
        if (!fieldErrors[path]) {
          fieldErrors[path] = err.message
        }
      })
      setErrors(fieldErrors)
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    })

    if (error) {
      setErrorMsg(error.message || 'Invalid credentials')
      setLoading(false)
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center font-inter px-4">
      <PageTitle title="Staff Login" />
      <div className="w-full max-w-md border border-gray-800 p-8 md:p-12 bg-neutral-950">
        <div className="text-center mb-10">
          <h1 className="font-bebas-neue text-6xl tracking-widest text-white">
            ONYX<span className="text-red-500">.</span>
          </h1>
          <p className="text-xs text-gray-400 mt-2 font-inter tracking-widest uppercase">
            Admin Portal
          </p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-6">
          {errorMsg && (
            <div className="bg-red-950/50 border border-red-800 text-red-200 p-4 text-sm font-inter">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs uppercase tracking-widest font-bold mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors(prev => ({ ...prev, email: undefined }))
              }}
              className={`w-full bg-black border p-3 text-sm font-inter text-white focus:border-white focus:outline-none transition-colors ${errors.email ? 'border-red-600' : 'border-gray-800'}`}
              placeholder="onyxmensofficial@gmail.com"
            />
            {errors.email && <p className="text-xs text-red-600 mt-1 font-inter">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors(prev => ({ ...prev, password: undefined }))
              }}
              className={`w-full bg-black border p-3 text-sm font-inter text-white focus:border-white focus:outline-none transition-colors ${errors.password ? 'border-red-600' : 'border-gray-800'}`}
              placeholder="••••••••"
            />
            {errors.password && <p className="text-xs text-red-600 mt-1 font-inter">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-white text-black hover:bg-black hover:text-white border border-white transition-all font-bebas-neue text-xl tracking-widest font-bold disabled:opacity-50"
          >
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>
      </div>
    </div>
  )
}
