'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
      } else {
        setSent(true)
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pastel-pink via-pastel-peach to-pastel-yellow p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-4xl font-bold">
              M
            </div>
          </div>
          <CardTitle className="text-3xl">Welcome to MAKFitness</CardTitle>
          <CardDescription className="text-base mt-2">
            Your cozy fitness journey with friends starts here
          </CardDescription>
        </CardHeader>

        <CardContent>
          {sent ? (
            <div className="text-center space-y-4 animate-fade-in">
              <div className="text-6xl">📧</div>
              <div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  Check your email!
                </h3>
                <p className="text-neutral-600">
                  We sent a magic link to <strong>{email}</strong>
                </p>
                <p className="text-sm text-neutral-500 mt-2">
                  Click the link in the email to sign in
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={() => {
                  setSent(false)
                  setEmail('')
                }}
                className="mt-4"
              >
                Use a different email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-neutral-700">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                fullWidth
                size="lg"
                disabled={loading || !email}
              >
                {loading ? 'Sending magic link...' : 'Send magic link'}
              </Button>

              <p className="text-xs text-neutral-500 text-center mt-4">
                We&apos;ll send you a secure link to sign in.
                <br />
                No passwords needed!
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
