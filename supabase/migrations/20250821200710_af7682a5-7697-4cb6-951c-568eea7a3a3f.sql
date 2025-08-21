-- Comprehensive fix for CPF data exposure in brigade_members table

-- 1. Create a function to mask CPF data for non-authorized roles
CREATE OR REPLACE FUNCTION public.get_masked_cpf(
  original_cpf text,
  user_role text DEFAULT get_user_role_safe(auth.uid())
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- Only admins and technicians can see real CPF
  IF user_role = ANY(ARRAY['admin', 'tecnico']) THEN
    RETURN original_cpf;
  ELSE
    -- Return masked CPF for other roles (clients)
    RETURN CASE 
      WHEN original_cpf IS NOT NULL AND length(original_cpf) >= 4
      THEN '***.' || right(original_cpf, 4) 
      ELSE '***-**-***'
    END;
  END IF;
END;
$$;

-- 2. Create a secure view that automatically masks CPF for non-authorized users
CREATE OR REPLACE VIEW public.brigade_members_secure AS
SELECT 
  id,
  location_id,
  name,
  role,
  get_masked_cpf(cpf) as cpf,  -- CPF is automatically masked based on user role
  status,
  active,
  last_training,
  next_training,
  training_frequency_months,
  created_at,
  updated_at
FROM public.brigade_members;

-- 3. Enable RLS on the view
ALTER VIEW public.brigade_members_secure SET (security_barrier = true);

-- 4. Update existing RLS policies on brigade_members to be more restrictive
-- Drop and recreate policies to ensure clean state
DROP POLICY IF EXISTS "Clients view limited brigade data in owned locations" ON public.brigade_members;
DROP POLICY IF EXISTS "Admins and technicians view all brigade data" ON public.brigade_members;

-- Create new restrictive policies
CREATE POLICY "Only admins and technicians can access raw brigade data" 
ON public.brigade_members 
FOR SELECT 
USING (get_user_role_safe(auth.uid()) = ANY(ARRAY['admin', 'tecnico']));

CREATE POLICY "Only admins and technicians can modify brigade data" 
ON public.brigade_members 
FOR ALL 
USING (get_user_role_safe(auth.uid()) = ANY(ARRAY['admin', 'tecnico']))
WITH CHECK (get_user_role_safe(auth.uid()) = ANY(ARRAY['admin', 'tecnico']));

-- 5. Create RLS policies for the secure view
CREATE POLICY "Users can view brigade data through secure view" 
ON public.brigade_members_secure 
FOR SELECT 
USING (
  -- Admins and technicians see all
  get_user_role_safe(auth.uid()) = ANY(ARRAY['admin', 'tecnico'])
  OR 
  -- Clients can only see brigade members in their locations (with masked CPF)
  (get_user_role_safe(auth.uid()) = 'cliente' 
   AND EXISTS (
     SELECT 1 FROM public.locations l 
     WHERE l.id = brigade_members_secure.location_id 
     AND l.client_id = ANY(get_user_client_ids_safe(auth.uid()))
   ))
);

-- 6. Create audit trigger for CPF access attempts
CREATE OR REPLACE FUNCTION public.audit_brigade_cpf_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log access to CPF data
  PERFORM log_sensitive_data_access('brigade_members', TG_OP, auth.uid());
  
  -- For client users, log potential unauthorized access attempts
  IF get_user_role_safe(auth.uid()) = 'cliente' THEN
    RAISE LOG 'SECURITY ALERT: Client user % attempted to access CPF data in brigade_members', auth.uid();
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS audit_brigade_cpf_access_trigger ON public.brigade_members;
CREATE TRIGGER audit_brigade_cpf_access_trigger
  AFTER SELECT OR UPDATE OR INSERT OR DELETE ON public.brigade_members
  FOR EACH ROW EXECUTE FUNCTION audit_brigade_cpf_access();

-- 7. Add documentation
COMMENT ON VIEW public.brigade_members_secure IS 
'Secure view of brigade_members with automatic CPF masking for non-admin users. Use this view instead of direct table access to ensure compliance with privacy regulations.';

COMMENT ON FUNCTION public.get_masked_cpf(text, text) IS 
'Security function that masks CPF data for unauthorized users. Only admin and tecnico roles can access unmasked CPF data.';