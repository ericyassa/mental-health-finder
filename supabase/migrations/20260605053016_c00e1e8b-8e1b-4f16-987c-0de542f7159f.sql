
-- 1. Lock down login_attempts (client never reads/writes it; only service_role via edge functions should)
DROP POLICY IF EXISTS "Anyone can view login attempts" ON public.login_attempts;
DROP POLICY IF EXISTS "Service can insert login attempts" ON public.login_attempts;
DROP POLICY IF EXISTS "Service can update login attempts" ON public.login_attempts;
REVOKE ALL ON public.login_attempts FROM anon, authenticated;
-- service_role bypasses RLS; no policies = no client access.

-- 2. directory_ratings: stop exposing user_id publicly. Users can read their own ratings only.
DROP POLICY IF EXISTS "Anyone can view ratings" ON public.directory_ratings;
CREATE POLICY "Users can view own ratings"
  ON public.directory_ratings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
REVOKE SELECT ON public.directory_ratings FROM anon;

-- 3. SECURITY DEFINER functions: tighten EXECUTE
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
