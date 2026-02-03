-- Update workout_type to be a text input instead of select
UPDATE public.metric_definitions
SET
  input_type = 'text',
  config = '{"placeholder": "e.g., Cardio, Yoga, Strength"}'
WHERE key = 'workout_type';

-- Update steps to have max of 60000
UPDATE public.metric_definitions
SET config = '{"unit": "steps", "placeholder": "e.g., 8000", "max": 60000}'
WHERE key = 'steps';

-- Update active_minutes to have max of 1000
UPDATE public.metric_definitions
SET config = '{"unit": "min", "placeholder": "e.g., 30", "max": 1000}'
WHERE key = 'active_minutes';
