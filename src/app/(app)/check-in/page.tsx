'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useMetrics } from '@/lib/hooks/use-metrics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { MetricInput } from '@/components/check-in/metric-input'
import { PhotoUpload } from '@/components/check-in/photo-upload'
import { MetricValue } from '@/types/metrics'

export default function CheckInPage() {
  const router = useRouter()
  const { metrics, loading: metricsLoading } = useMetrics()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [groupId, setGroupId] = useState<string | null>(null)

  // Form state
  const [photoUrl, setPhotoUrl] = useState<string>('')
  const [caption, setCaption] = useState('')
  const [song, setSong] = useState('')
  const [timeOfDay, setTimeOfDay] = useState<string>('')
  const [metricValues, setMetricValues] = useState<MetricValue>({})

  const supabase = createClient()

  useEffect(() => {
    // Get user's group
    async function getUserGroup() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: memberships } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id)
        .limit(1)

      if (memberships && memberships.length > 0) {
        setGroupId(memberships[0].group_id)
      }
    }

    getUserGroup()
  }, [supabase])

  const handleMetricChange = (key: string, value: any) => {
    setMetricValues((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !groupId) throw new Error('Not authenticated or no group')

      const today = new Date().toISOString().split('T')[0]

      // Check if check-in already exists for today
      const { data: existing } = await supabase
        .from('daily_checkins')
        .select('id')
        .eq('user_id', user.id)
        .eq('group_id', groupId)
        .eq('checkin_date', today)
        .single()

      if (existing) {
        // Update existing check-in
        const { error: updateError } = await supabase
          .from('daily_checkins')
          .update({
            photo_url: photoUrl || null,
            caption: caption || null,
            song: song || null,
            time_of_day: timeOfDay || null,
            metrics: metricValues,
            completed_at: new Date().toISOString(),
          })
          .eq('id', existing.id)

        if (updateError) throw updateError
      } else {
        // Create new check-in
        const { error: insertError } = await supabase
          .from('daily_checkins')
          .insert({
            user_id: user.id,
            group_id: groupId,
            checkin_date: today,
            photo_url: photoUrl || null,
            caption: caption || null,
            song: song || null,
            time_of_day: timeOfDay || null,
            metrics: metricValues,
          })

        if (insertError) throw insertError
      }

      // Success! Redirect to feed
      router.push('/feed')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to save check-in')
    } finally {
      setLoading(false)
    }
  }

  // Group metrics by category
  const metricsByCategory = metrics.reduce((acc, metric) => {
    if (!acc[metric.category]) {
      acc[metric.category] = []
    }
    acc[metric.category].push(metric)
    return acc
  }, {} as Record<string, typeof metrics>)

  const categoryLabels: Record<string, string> = {
    movement: '🏃 Movement & Fitness',
    soft_health: '💆 How You Feel',
    food: '🍎 Food & Hydration',
    lifestyle: '✨ Lifestyle & Habits',
  }

  if (metricsLoading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-neutral-900">Daily Check-in</h1>
          <p className="text-neutral-600 mt-1">You showed up today ✨</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Capture the Moment 📸</CardTitle>
            </CardHeader>
            <CardContent>
              <PhotoUpload
                existingUrl={photoUrl}
                onUpload={setPhotoUrl}
                onRemove={() => setPhotoUrl('')}
              />
            </CardContent>
          </Card>

          {/* Caption */}
          <Card>
            <CardHeader>
              <CardTitle>Share Your Vibe 💭</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">
                  Caption (optional)
                </label>
                <Input
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="How was today?"
                  maxLength={200}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">
                  Song you trained to (optional)
                </label>
                <Input
                  value={song}
                  onChange={(e) => setSong(e.target.value)}
                  placeholder="Artist - Song Name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">
                  Time of day
                </label>
                <Select
                  value={timeOfDay}
                  onChange={setTimeOfDay}
                  options={['Morning', 'Afternoon', 'Evening', 'Night']}
                  placeholder="When did you move?"
                />
              </div>
            </CardContent>
          </Card>

          {/* Metrics by Category */}
          {Object.entries(metricsByCategory).map(([category, categoryMetrics]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{categoryLabels[category] || category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categoryMetrics.map((metric) => (
                  <MetricInput
                    key={metric.key}
                    metric={metric}
                    value={metricValues[metric.key]}
                    onChange={(value) => handleMetricChange(metric.key, value)}
                    disabled={loading}
                  />
                ))}
              </CardContent>
            </Card>
          ))}

          {error && (
            <div className="p-4 rounded-3xl bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            size="lg"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Complete Check-in'}
          </Button>
        </form>
      </div>
    </div>
  )
}
