import { Flame, Trophy, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface StreakDisplayProps {
  currentStreak: number
  longestStreak: number
  totalCheckIns: number
  animated?: boolean
}

export function StreakDisplay({
  currentStreak,
  longestStreak,
  totalCheckIns,
  animated = true,
}: StreakDisplayProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Current Streak */}
      <div
        className={cn(
          'bg-gradient-to-br from-primary-400 to-primary-600 rounded-4xl p-6 text-white',
          animated && 'animate-scale-in'
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <Flame className="h-8 w-8" />
          <span className="text-sm font-medium opacity-90">Current</span>
        </div>
        <div className="text-5xl font-bold mb-1">{currentStreak}</div>
        <div className="text-sm opacity-90">day streak</div>
      </div>

      {/* Longest Streak */}
      <div
        className={cn(
          'bg-gradient-to-br from-accent-400 to-accent-600 rounded-4xl p-6 text-white',
          animated && 'animate-scale-in'
        )}
        style={{ animationDelay: animated ? '0.1s' : '0s' }}
      >
        <div className="flex items-center justify-between mb-4">
          <Trophy className="h-8 w-8" />
          <span className="text-sm font-medium opacity-90">Record</span>
        </div>
        <div className="text-5xl font-bold mb-1">{longestStreak}</div>
        <div className="text-sm opacity-90">best streak</div>
      </div>

      {/* Total Check-ins */}
      <div
        className={cn(
          'bg-gradient-to-br from-pastel-lavender to-pastel-blue rounded-4xl p-6',
          animated && 'animate-scale-in'
        )}
        style={{ animationDelay: animated ? '0.2s' : '0s' }}
      >
        <div className="flex items-center justify-between mb-4">
          <Calendar className="h-8 w-8 text-neutral-700" />
          <span className="text-sm font-medium text-neutral-600">Total</span>
        </div>
        <div className="text-5xl font-bold text-neutral-900 mb-1">{totalCheckIns}</div>
        <div className="text-sm text-neutral-600">check-ins</div>
      </div>
    </div>
  )
}
