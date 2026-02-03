-- Add missing INSERT and UPDATE policies for user_streaks table
-- These are needed for the update_user_streak() trigger to work

CREATE POLICY "Users can insert their own streaks"
  ON public.user_streaks FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own streaks"
  ON public.user_streaks FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
