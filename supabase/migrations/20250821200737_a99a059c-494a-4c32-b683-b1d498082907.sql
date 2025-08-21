-- Fixed comprehensive solution for CPF data exposure in brigade_members table

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

-- 3. Update existing RLS policies on brigade_members to be more restrictive
-- Drop existing client policy and recreate with stricter rules
DROP POLICY IF EXISTS "Clients view limited brigade data in owned locations" ON public.brigade_members;

-- Create new restrictive policy - only allow admin/tecnico direct access
CREATE POLICY "Only admins and technicians can access raw brigade data" 
ON public.brigade_members 
FOR SELECT 
USING (get_user_role_safe(auth.uid()) = ANY(ARRAY['admin', 'tecnico']));

-- 4. Enable RLS on the secure view and create policies
ALTER VIEW public.brigade_members_secure SET (security_barrier = true);

CREATE POLICY "Users can view brigade data through secure view" 
ON public.brigade_members_secure 
FOR SELECT 
USING (
  -- Admins and technicians see all (with real CPF)
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

-- 5. Create function to check CPF access and log attempts
CREATE OR REPLACE FUNCTION public.check_brigade_cpf_access()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log CPF access attempts by non-admin users
  IF get_user_role_safe(auth.uid()) = 'cliente' THEN
    PERFORM log_sensitive_data_access('brigade_members_cpf', 'ACCESS_ATTEMPT', auth.uid());
    RAISE LOG 'SECURITY: Client user % attempted CPF access - redirected to secure view', auth.uid();
  END IF;
END;
$$;

-- 6. Add documentation
COMMENT ON VIEW public.brigade_members_secure IS 
'Secure view of brigade_members with automatic CPF masking for non-admin users. Clients should use this view to access brigade data with privacy protection.';

COMMENT ON FUNCTION public.get_masked_cpf(text, text) IS 
'Security function that masks CPF data for unauthorized users. Only admin and tecnico roles can access unmasked CPF data.';

-- 7. Grant appropriate permissions
GRANT SELECT ON public.brigade_members_secure TO authenticated;