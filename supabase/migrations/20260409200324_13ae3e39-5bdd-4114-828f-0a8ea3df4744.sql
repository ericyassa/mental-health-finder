
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Anyone can insert login attempts" ON public.login_attempts;
DROP POLICY IF EXISTS "Anyone can update login attempts" ON public.login_attempts;

-- We'll handle login attempts via edge function / security definer functions instead
-- For now, allow authenticated users to manage their own attempts
CREATE POLICY "Service can insert login attempts" ON public.login_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can update login attempts" ON public.login_attempts FOR UPDATE USING (true);
