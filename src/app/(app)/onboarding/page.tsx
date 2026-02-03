'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { nanoid } from 'nanoid'

export default function OnboardingPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create group state
  const [groupName, setGroupName] = useState('')

  // Join group state
  const [inviteCode, setInviteCode] = useState('')

  const supabase = createClient()

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Generate invite code
      const code = nanoid(8).toUpperCase()

      // Create group
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: groupName,
          invite_code: code,
          created_by: user.id,
        })
        .select()
        .single()

      if (groupError) throw groupError

      // Add user as admin member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
          role: 'admin',
        })

      if (memberError) throw memberError

      router.push('/feed')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to create group')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Find group by invite code
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .single()

      if (groupError || !group) {
        throw new Error('Invalid invite code')
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .single()

      if (existingMember) {
        // Already a member, just redirect
        router.push('/feed')
        router.refresh()
        return
      }

      // Add user as member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
          role: 'member',
        })

      if (memberError) throw memberError

      router.push('/feed')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to join group')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pastel-mint via-pastel-blue to-pastel-lavender p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl">
              👥
            </div>
          </div>
          <CardTitle className="text-2xl">Join Your Squad</CardTitle>
          <CardDescription>
            {mode === 'choose' && 'Create a new group or join an existing one'}
            {mode === 'create' && 'Name your fitness squad'}
            {mode === 'join' && 'Enter your invite code'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {mode === 'choose' && (
            <div className="space-y-3">
              <Button
                fullWidth
                size="lg"
                onClick={() => setMode('create')}
              >
                Create a Group
              </Button>
              <Button
                fullWidth
                size="lg"
                variant="outline"
                onClick={() => setMode('join')}
              >
                Join with Code
              </Button>
            </div>
          )}

          {mode === 'create' && (
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="groupName" className="text-sm font-medium text-neutral-700">
                  Group Name
                </label>
                <Input
                  id="groupName"
                  placeholder="e.g., Morning Warriors, Gym Besties"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMode('choose')}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  fullWidth
                  disabled={loading || !groupName}
                >
                  {loading ? 'Creating...' : 'Create Group'}
                </Button>
              </div>
            </form>
          )}

          {mode === 'join' && (
            <form onSubmit={handleJoinGroup} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="inviteCode" className="text-sm font-medium text-neutral-700">
                  Invite Code
                </label>
                <Input
                  id="inviteCode"
                  placeholder="XXXXXXXX"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  required
                  disabled={loading}
                  maxLength={8}
                  className="font-mono uppercase tracking-wider"
                />
              </div>

              {error && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMode('choose')}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  fullWidth
                  disabled={loading || inviteCode.length !== 8}
                >
                  {loading ? 'Joining...' : 'Join Group'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
