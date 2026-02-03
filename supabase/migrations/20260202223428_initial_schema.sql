-- ============================================
-- MAKFITNESS DATABASE SCHEMA
-- ============================================

-- ============================================
-- USERS & GROUPS
-- ============================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  max_members INTEGER DEFAULT 10,
  CONSTRAINT valid_invite_code CHECK (LENGTH(invite_code) >= 8)
);

CREATE TABLE public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  UNIQUE(group_id, user_id)
);

CREATE INDEX idx_group_members_group ON public.group_members(group_id);
CREATE INDEX idx_group_members_user ON public.group_members(user_id);

-- ============================================
-- METRIC CONFIGURATION (Modular System)
-- ============================================

CREATE TABLE public.metric_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  input_type TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  default_enabled BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.user_metric_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  metric_key TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  UNIQUE(user_id, group_id, metric_key)
);

CREATE INDEX idx_user_prefs ON public.user_metric_preferences(user_id, group_id);

-- ============================================
-- DAILY CHECK-INS
-- ============================================

CREATE TABLE public.daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL,

  photo_url TEXT,
  caption TEXT,
  song TEXT,
  time_of_day TEXT,

  metrics JSONB DEFAULT '{}',

  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, group_id, checkin_date)
);

CREATE INDEX idx_checkins_user_date ON public.daily_checkins(user_id, checkin_date DESC);
CREATE INDEX idx_checkins_group_date ON public.daily_checkins(group_id, checkin_date DESC);
CREATE INDEX idx_checkins_metrics ON public.daily_checkins USING GIN (metrics);

-- ============================================
-- STREAKS & STATS
-- ============================================

CREATE TABLE public.user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_checkin_date DATE,
  total_checkins INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, group_id)
);

CREATE INDEX idx_streaks_user_group ON public.user_streaks(user_id, group_id);

-- ============================================
-- REACTIONS & SOCIAL
-- ============================================

CREATE TABLE public.checkin_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkin_id UUID REFERENCES public.daily_checkins(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(checkin_id, user_id, emoji)
);

CREATE INDEX idx_reactions_checkin ON public.checkin_reactions(checkin_id);
CREATE INDEX idx_reactions_user ON public.checkin_reactions(user_id);

-- ============================================
-- WEEKLY CHALLENGES
-- ============================================

CREATE TABLE public.weekly_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  challenge_type TEXT NOT NULL,
  winner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, week_start_date, challenge_type)
);

CREATE INDEX idx_challenges_group_week ON public.weekly_challenges(group_id, week_start_date DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metric_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_metric_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkin_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles in their groups, update only their own
CREATE POLICY "Users can view profiles in their groups"
  ON public.profiles FOR SELECT
  USING (
    id IN (
      SELECT gm.user_id FROM public.group_members gm
      WHERE gm.group_id IN (
        SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- Groups: Users can view their own groups
CREATE POLICY "Users can view their groups"
  ON public.groups FOR SELECT
  USING (
    id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create groups"
  ON public.groups FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Group members: Users can view members in their groups
CREATE POLICY "Users can view group members"
  ON public.group_members FOR SELECT
  USING (
    group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can join groups"
  ON public.group_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Metric definitions: Everyone can read
CREATE POLICY "Anyone can view metric definitions"
  ON public.metric_definitions FOR SELECT
  USING (true);

-- User metric preferences: Users can manage their own
CREATE POLICY "Users can manage own metric preferences"
  ON public.user_metric_preferences FOR ALL
  USING (user_id = auth.uid());

-- Daily check-ins: Users can view check-ins in their groups
CREATE POLICY "Users can view group check-ins"
  ON public.daily_checkins FOR SELECT
  USING (
    group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create own check-ins"
  ON public.daily_checkins FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own check-ins"
  ON public.daily_checkins FOR UPDATE
  USING (user_id = auth.uid());

-- User streaks: Readable by group members
CREATE POLICY "Users can view group streaks"
  ON public.user_streaks FOR SELECT
  USING (
    group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
  );

-- Reactions: Users can react to check-ins in their groups
CREATE POLICY "Users can view reactions in their groups"
  ON public.checkin_reactions FOR SELECT
  USING (
    checkin_id IN (
      SELECT id FROM public.daily_checkins
      WHERE group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can create reactions"
  ON public.checkin_reactions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own reactions"
  ON public.checkin_reactions FOR DELETE
  USING (user_id = auth.uid());

-- Weekly challenges: Readable by group members
CREATE POLICY "Users can view group challenges"
  ON public.weekly_challenges FOR SELECT
  USING (
    group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checkins_updated_at BEFORE UPDATE ON public.daily_checkins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update streaks on check-in
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
  last_date DATE;
  current_count INTEGER;
BEGIN
  -- Get last check-in date
  SELECT last_checkin_date, current_streak INTO last_date, current_count
  FROM public.user_streaks
  WHERE user_id = NEW.user_id AND group_id = NEW.group_id;

  IF NOT FOUND THEN
    -- First check-in
    INSERT INTO public.user_streaks (user_id, group_id, current_streak, longest_streak, last_checkin_date, total_checkins)
    VALUES (NEW.user_id, NEW.group_id, 1, 1, NEW.checkin_date, 1);
  ELSE
    -- Check if consecutive
    IF NEW.checkin_date = last_date + INTERVAL '1 day' THEN
      current_count := current_count + 1;
    ELSIF NEW.checkin_date > last_date + INTERVAL '1 day' THEN
      current_count := 1; -- Streak broken
    END IF;

    -- Update streak
    UPDATE public.user_streaks
    SET
      current_streak = current_count,
      longest_streak = GREATEST(longest_streak, current_count),
      last_checkin_date = NEW.checkin_date,
      total_checkins = total_checkins + 1,
      updated_at = NOW()
    WHERE user_id = NEW.user_id AND group_id = NEW.group_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_streak_on_checkin
AFTER INSERT ON public.daily_checkins
FOR EACH ROW EXECUTE FUNCTION update_user_streak();

-- Function to generate unique invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  characters TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(characters, floor(random() * length(characters) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public) VALUES ('checkin-photos', 'checkin-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for check-in photos
CREATE POLICY "Users can upload own photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'checkin-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Photos are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'checkin-photos');

CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'checkin-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- SEED DATA: DEFAULT METRICS
-- ============================================

INSERT INTO public.metric_definitions (key, category, display_name, description, input_type, config, sort_order) VALUES
-- Movement & Fitness
('workout_completed', 'movement', 'Worked Out', 'Did you complete a workout today?', 'boolean', '{}', 1),
('workout_type', 'movement', 'Workout Type', 'What kind of workout?', 'select', '{"options": ["Cardio", "Strength", "Yoga", "Sports", "Walk/Run", "Dance", "Other"]}', 2),
('steps', 'movement', 'Steps', 'How many steps?', 'number', '{"unit": "steps", "placeholder": "e.g., 8000"}', 3),
('active_minutes', 'movement', 'Active Minutes', 'Minutes of movement', 'number', '{"unit": "min", "placeholder": "e.g., 30"}', 4),
('stretch_session', 'movement', 'Stretched', 'Did you stretch or do mobility work?', 'boolean', '{}', 5),
('went_outside', 'movement', 'Went Outside', 'Did you go outside today?', 'boolean', '{}', 6),

-- Soft Health
('mood', 'soft_health', 'Mood', 'How are you feeling?', 'emoji', '{"options": ["😊", "😌", "😐", "😔", "😤", "🥳", "🥺", "😴"]}', 10),
('energy_level', 'soft_health', 'Energy Level', 'Energy check', 'slider', '{"min": 1, "max": 5, "labels": ["Drained", "Low", "Okay", "Good", "Energized"]}', 11),
('stress_level', 'soft_health', 'Stress Level', 'Stress check', 'slider', '{"min": 1, "max": 5, "labels": ["Zen", "Calm", "Okay", "Stressed", "Overwhelmed"]}', 12),
('sleep_quality', 'soft_health', 'Sleep Quality', 'How did you sleep?', 'slider', '{"min": 1, "max": 5, "labels": ["Terrible", "Poor", "Okay", "Good", "Amazing"]}', 13),
('body_feels_good', 'soft_health', 'Body Feels Good', 'Feeling physically good?', 'boolean', '{}', 14),

-- Food & Hydration
('water_cups', 'food', 'Water', 'Cups of water', 'number', '{"unit": "cups", "min": 0, "max": 20}', 20),
('fruit_veg_servings', 'food', 'Fruits & Veggies', 'Servings today', 'number', '{"unit": "servings", "min": 0, "max": 15}', 21),
('balanced_meal', 'food', 'Balanced Meal', 'Ate a balanced meal?', 'boolean', '{}', 22),
('home_cooked', 'food', 'Home-Cooked', 'Made food at home?', 'boolean', '{}', 23),
('sugar_binge', 'food', 'Sweet Treat Day', 'Had sweets (no judgment!)', 'boolean', '{}', 24),

-- Lifestyle & Habits
('read', 'lifestyle', 'Read', 'Did some reading?', 'boolean', '{}', 30),
('meditated', 'lifestyle', 'Meditated', 'Meditation or mindfulness?', 'boolean', '{}', 31),
('journaled', 'lifestyle', 'Journaled', 'Wrote in journal?', 'boolean', '{}', 32),
('cleaned_room', 'lifestyle', 'Cleaned Space', 'Tidied up your space?', 'boolean', '{}', 33),
('no_phone_first_30', 'lifestyle', 'No Phone Morning', 'No phone first 30 minutes?', 'boolean', '{}', 34),
('future_me_task', 'lifestyle', 'Future Me Task', 'Did something for future you?', 'boolean', '{}', 35)
ON CONFLICT (key) DO NOTHING;
