import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FeedCard } from '@/components/feed/feed-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Check if user is in any group
  const { data: memberships } = await supabase
    .from('group_members')
    .select('group_id, groups(*)')
    .eq('user_id', user.id)
    .limit(1)

  if (!memberships || memberships.length === 0) {
    redirect('/onboarding')
  }

  const groupId = memberships[0].group_id
  const group = memberships[0].groups as any

  // Get user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch check-ins from the group (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: checkIns } = await supabase
    .from('daily_checkins')
    .select('*, profiles(*)')
    .eq('group_id', groupId)
    .gte('checkin_date', sevenDaysAgo.toISOString().split('T')[0])
    .order('checkin_date', { ascending: false })
    .order('created_at', { ascending: false })

  // Fetch reactions for all check-ins
  const checkInIds = checkIns?.map((c) => c.id) || []
  const { data: reactions } = await supabase
    .from('checkin_reactions')
    .select('*')
    .in('checkin_id', checkInIds)

  // Group reactions by check-in
  const reactionsByCheckIn = reactions?.reduce((acc, reaction) => {
    if (!acc[reaction.checkin_id]) {
      acc[reaction.checkin_id] = []
    }
    acc[reaction.checkin_id].push(reaction)
    return acc
  }, {} as Record<string, typeof reactions>)

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              {group.name}
            </h1>
            <p className="text-sm text-neutral-500">
              Welcome back, {profile?.display_name}!
            </p>
          </div>
        </div>

        {/* Invite Code Card */}
        <div className="bg-gradient-to-r from-pastel-yellow to-pastel-peach p-4 rounded-3xl">
          <p className="text-sm text-neutral-700">
            <strong>Invite Code:</strong>{' '}
            <code className="font-mono text-lg font-semibold">{group.invite_code}</code>
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            Share this code with friends to invite them to your group
          </p>
        </div>

        {/* Check-ins Feed */}
        {checkIns && checkIns.length > 0 ? (
          <div className="space-y-4">
            {checkIns.map((checkIn) => (
              <FeedCard
                key={checkIn.id}
                checkIn={checkIn as any}
                currentUserId={user.id}
                initialReactions={reactionsByCheckIn?.[checkIn.id] || []}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Squad&apos;s Feed 🔥</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 space-y-4">
                <div className="text-6xl mb-4">📸</div>
                <div>
                  <p className="text-neutral-600 mb-2">
                    No check-ins yet
                  </p>
                  <p className="text-sm text-neutral-500">
                    Be the first to check in and inspire your squad!
                  </p>
                </div>
                <Link href="/check-in">
                  <Button size="lg">
                    Complete Check-in
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
