import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StreakDisplay } from '@/components/progress/streak-display'
import { Avatar } from '@/components/ui/avatar'

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Get user's group
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

  // Get user's streak
  const { data: userStreak } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', user.id)
    .eq('group_id', groupId)
    .single()

  // Get all group members' streaks
  const { data: groupStreaks } = await supabase
    .from('user_streaks')
    .select('*, profiles(*)')
    .eq('group_id', groupId)
    .order('current_streak', { ascending: false })

  // Get current week's check-ins for the group
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay()) // Sunday

  const { data: weekCheckIns, count: weekCheckInsCount } = await supabase
    .from('daily_checkins')
    .select('*', { count: 'exact' })
    .eq('group_id', groupId)
    .gte('checkin_date', startOfWeek.toISOString().split('T')[0])

  return (
    <div className="p-4 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Your Progress</h1>
          <p className="text-neutral-600 mt-1">Keep that streak alive! 🔥</p>
        </div>

        {/* User's Streaks */}
        <StreakDisplay
          currentStreak={userStreak?.current_streak || 0}
          longestStreak={userStreak?.longest_streak || 0}
          totalCheckIns={userStreak?.total_checkins || 0}
        />

        {/* Motivational Message */}
        {userStreak && userStreak.current_streak > 0 && (
          <div className="bg-gradient-to-r from-pastel-pink to-pastel-peach p-6 rounded-4xl text-center">
            <p className="text-2xl font-bold text-neutral-900 mb-2">
              {userStreak.current_streak === 1 && "You showed up today! ✨"}
              {userStreak.current_streak > 1 && userStreak.current_streak < 7 && "You're on a roll! 💪"}
              {userStreak.current_streak >= 7 && userStreak.current_streak < 14 && "A whole week! Incredible! 🎉"}
              {userStreak.current_streak >= 14 && userStreak.current_streak < 30 && "Two weeks strong! Legend! 👑"}
              {userStreak.current_streak >= 30 && "30+ days! You're unstoppable! 🚀"}
            </p>
            <p className="text-sm text-neutral-600">
              Keep going to beat your record of {userStreak.longest_streak} days!
            </p>
          </div>
        )}

        {/* Week Summary */}
        <Card>
          <CardHeader>
            <CardTitle>This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Total check-ins</span>
                <span className="text-2xl font-bold text-neutral-900">{weekCheckInsCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Group members</span>
                <span className="text-2xl font-bold text-neutral-900">{groupStreaks?.length || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Squad Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>{group.name} Leaderboard 🏆</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {groupStreaks && groupStreaks.length > 0 ? (
                groupStreaks.map((streak: any, index) => {
                  const profile = streak.profiles
                  const isCurrentUser = streak.user_id === user.id

                  return (
                    <div
                      key={streak.id}
                      className={`flex items-center gap-3 p-3 rounded-3xl transition-colors ${
                        isCurrentUser ? 'bg-primary-50 ring-2 ring-primary-200' : 'bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-sm font-bold text-neutral-700">
                        {index + 1}
                      </div>
                      <Avatar
                        src={profile?.avatar_url}
                        alt={profile?.display_name || profile?.email}
                        size="sm"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-neutral-900">
                          {profile?.display_name || profile?.email?.split('@')[0]}
                          {isCurrentUser && (
                            <span className="text-primary-500 ml-1">(You)</span>
                          )}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {streak.total_checkins} total check-ins
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-neutral-900">
                          {streak.current_streak}
                        </p>
                        <p className="text-xs text-neutral-500">day streak</p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <p>No activity yet in your squad</p>
                  <p className="text-sm mt-1">Complete your first check-in to appear here!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
