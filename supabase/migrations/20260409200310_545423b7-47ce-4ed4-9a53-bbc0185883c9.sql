
-- Add team and favorite_meal to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS team text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS favorite_meal text;

-- Create login_attempts table
CREATE TABLE public.login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  attempt_count integer NOT NULL DEFAULT 0,
  locked boolean NOT NULL DEFAULT false,
  last_attempt_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view login attempts" ON public.login_attempts FOR SELECT USING (true);
CREATE POLICY "Anyone can insert login attempts" ON public.login_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update login attempts" ON public.login_attempts FOR UPDATE USING (true);

-- Drop the NHS email validation trigger if it exists
DROP TRIGGER IF EXISTS enforce_nhs_email ON public.profiles;
DROP FUNCTION IF EXISTS public.validate_nhs_email();

-- Update handle_new_user to store team and favorite_meal
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, team, favorite_meal)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'team',
    NEW.raw_user_meta_data->>'favorite_meal'
  );
  RETURN NEW;
END;
$$;
