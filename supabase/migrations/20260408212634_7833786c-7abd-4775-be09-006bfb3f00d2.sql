
CREATE OR REPLACE FUNCTION public.validate_nhs_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS NOT NULL AND NEW.email NOT LIKE '%@nhs.net' THEN
    RAISE EXCEPTION 'Only NHS email addresses (@nhs.net) are allowed to register';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_nhs_email
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.validate_nhs_email();
