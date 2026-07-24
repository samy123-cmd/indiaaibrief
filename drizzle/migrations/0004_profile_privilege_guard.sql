-- Prevent authenticated users from self-escalating role / subscription_tier.
-- Service role (admin scripts, webhooks) still updates freely.

CREATE OR REPLACE FUNCTION public.protect_profile_privileges()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND current_user = 'authenticated' THEN
    NEW.role := OLD.role;
    NEW.subscription_tier := OLD.subscription_tier;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_protect_privileges ON profiles;
CREATE TRIGGER profiles_protect_privileges
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_privileges();
