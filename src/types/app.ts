import { MetricValue } from './metrics'

export interface Profile {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Group {
  id: string
  name: string
  invite_code: string
  created_by: string | null
  created_at: string
  max_members: number
}

export interface GroupMember {
  id: string
  group_id: string
  user_id: string
  joined_at: string
  role: 'admin' | 'member'
}

export interface DailyCheckIn {
  id: string
  user_id: string
  group_id: string
  checkin_date: string
  photo_url?: string
  caption?: string
  song?: string
  time_of_day?: 'morning' | 'afternoon' | 'evening' | 'night'
  metrics: MetricValue
  completed_at: string
  created_at: string
  updated_at: string
}

export interface Reaction {
  id: string
  checkin_id: string
  user_id: string
  emoji: string
  created_at: string
}

export interface UserStreak {
  id: string
  user_id: string
  group_id: string
  current_streak: number
  longest_streak: number
  last_checkin_date: string
  total_checkins: number
  updated_at: string
}

export interface WeeklyChallenge {
  id: string
  group_id: string
  week_start_date: string
  week_end_date: string
  challenge_type: string
  winner_id?: string
  completed: boolean
  created_at: string
}

export interface ChallengeParticipant {
  user: Profile
  progress: number
  rank: number
}
