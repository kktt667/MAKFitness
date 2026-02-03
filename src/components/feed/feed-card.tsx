'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { ReactionBar } from './reaction-bar'
import { DailyCheckIn, Profile, Reaction } from '@/types/app'
import { createClient } from '@/lib/supabase/client'
import { Music, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface FeedCardProps {
  checkIn: DailyCheckIn & { profiles: Profile }
  currentUserId: string
  initialReactions: Reaction[]
}

export function FeedCard({ checkIn, currentUserId, initialReactions }: FeedCardProps) {
  const [reactions, setReactions] = useState(initialReactions)
  const [showMetrics, setShowMetrics] = useState(false)
  const [loading, setLoading] = useState(false)

  const supabase = createClient()
  const profile = checkIn.profiles

  // Group reactions by emoji with counts
  const groupedReactions = reactions.reduce((acc, reaction) => {
    const existing = acc.find((r) => r.emoji === reaction.emoji)
    if (existing) {
      existing.count++
      if (reaction.user_id === currentUserId) {
        existing.userReacted = true
      }
    } else {
      acc.push({
        emoji: reaction.emoji,
        count: 1,
        userReacted: reaction.user_id === currentUserId,
      })
    }
    return acc
  }, [] as Array<{ emoji: string; count: number; userReacted: boolean }>)

  const handleReact = async (emoji: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('checkin_reactions')
        .insert({
          checkin_id: checkIn.id,
          user_id: currentUserId,
          emoji,
        })
        .select()
        .single()

      if (error) throw error

      setReactions([...reactions, data])
    } catch (err) {
      console.error('Failed to add reaction:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveReaction = async (emoji: string) => {
    setLoading(true)
    try {
      const reactionToRemove = reactions.find(
        (r) => r.emoji === emoji && r.user_id === currentUserId
      )

      if (!reactionToRemove) return

      const { error } = await supabase
        .from('checkin_reactions')
        .delete()
        .eq('id', reactionToRemove.id)

      if (error) throw error

      setReactions(reactions.filter((r) => r.id !== reactionToRemove.id))
    } catch (err) {
      console.error('Failed to remove reaction:', err)
    } finally {
      setLoading(false)
    }
  }

  const timeOfDayEmoji = {
    morning: '🌅',
    afternoon: '☀️',
    evening: '🌆',
    night: '🌙',
  }[checkIn.time_of_day || ''] || '⏰'

  // Count completed metrics
  const completedMetrics = Object.keys(checkIn.metrics).length

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 flex items-center gap-3">
          <Avatar
            src={profile.avatar_url}
            alt={profile.display_name || profile.email}
            size="md"
          />
          <div className="flex-1">
            <p className="font-semibold text-neutral-900">
              {profile.display_name || profile.email?.split('@')[0]}
            </p>
            <p className="text-sm text-neutral-500">
              {new Date(checkIn.checkin_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Photo */}
        {checkIn.photo_url && (
          <div className="w-full aspect-square bg-neutral-100">
            <img
              src={checkIn.photo_url}
              alt="Check-in"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Caption */}
          {checkIn.caption && (
            <p className="text-neutral-900">{checkIn.caption}</p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap gap-2 text-sm text-neutral-600">
            {checkIn.time_of_day && (
              <span className="flex items-center gap-1 bg-neutral-100 px-2 py-1 rounded-full">
                <span>{timeOfDayEmoji}</span>
                {checkIn.time_of_day}
              </span>
            )}
            {checkIn.song && (
              <span className="flex items-center gap-1 bg-neutral-100 px-2 py-1 rounded-full">
                <Music className="h-3 w-3" />
                {checkIn.song}
              </span>
            )}
            {completedMetrics > 0 && (
              <span className="flex items-center gap-1 bg-pastel-mint px-2 py-1 rounded-full">
                <span>📊</span>
                {completedMetrics} metrics tracked
              </span>
            )}
          </div>

          {/* Metrics Toggle */}
          {completedMetrics > 0 && (
            <button
              type="button"
              onClick={() => setShowMetrics(!showMetrics)}
              className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {showMetrics ? (
                <>
                  Hide details
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Show details
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          )}

          {/* Expanded Metrics */}
          {showMetrics && (
            <div className="bg-neutral-50 rounded-2xl p-3 space-y-2 animate-slide-up">
              {Object.entries(checkIn.metrics).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-neutral-600 capitalize">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span className="font-medium text-neutral-900">
                    {typeof value === 'boolean'
                      ? value
                        ? '✅'
                        : '❌'
                      : value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Reactions */}
          <ReactionBar
            reactions={groupedReactions}
            onReact={handleReact}
            onRemove={handleRemoveReaction}
            disabled={loading}
          />
        </div>
      </CardContent>
    </Card>
  )
}
