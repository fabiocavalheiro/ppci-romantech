-- Simple and effective fix for CPF data exposure in brigade_members table

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

-- 2. Update the existing secure function to use masking
CREATE OR REPLACE FUNCTION public.get_brigade_members_with_security()
RETURNS TABLE(
  id uuid,
  location_id uuid,
  name text,
  role text,
  cpf text,  -- This will be masked for non-admin users
  status equipment_status,
  active boolean,
  last_training date,
  next_training date,
  training_frequency_months integer,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    bm.id,
    bm.location_id,
    bm.name,
    bm.role,
    get_masked_cpf(bm.cpf) as cpf,  -- CPF is automatically masked based on user role
    bm.status,
    bm.active,
    bm.last_training,
    bm.next_training,
    bm.training_frequency_months,
    bm.created_at,
    bm.updated_at
  FROM public.brigade_members bm
  INNER JOIN public.locations l ON l.id = bm.location_id
  WHERE 
    -- Admins and technicians can see all
    get_user_role_safe(auth.uid()) = ANY(ARRAY['admin', 'tecnico'])
    OR
    -- Clients can only see brigade members in their locations
    (get_user_role_safe(auth.uid()) = 'cliente' 
     AND l.client_id = ANY(get_user_client_ids_safe(auth.uid())));
$$;

-- 3. Fix the RLS policies on brigade_members table
-- Drop the existing client policy that allows direct access
DROP POLICY IF EXISTS "Clients view limited brigade data in owned locations" ON public.brigade_members;

-- Ensure only admin/tecnico can access the raw table data
-- Keep the existing admin/tecnico policies and make sure clients cannot access directly
CREATE POLICY "Block direct client access to brigade_members table" 
ON public.brigade_members 
FOR SELECT 
USING (
  -- Only admins and technicians can access raw table data
  get_user_role_safe(auth.uid()) = ANY(ARRAY['admin', 'tecnico'])
);

-- 4. Create a function for audit logging
CREATE OR REPLACE FUNCTION public.audit_brigade_member_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log access to sensitive brigade data
  PERFORM log_sensitive_data_access('brigade_members', TG_OP, auth.uid());
  
  -- Log if a client somehow accesses raw brigade data (security alert)
  IF get_user_role_safe(auth.uid()) = 'cliente' THEN
    RAISE LOG 'SECURITY ALERT: Client user % accessed raw brigade_members table', auth.uid();
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for data modifications only (not SELECT)
DROP TRIGGER IF EXISTS audit_brigade_member_trigger ON public.brigade_members;
CREATE TRIGGER audit_brigade_member_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.brigade_members
  FOR EACH ROW EXECUTE FUNCTION audit_brigade_member_access();

-- 5. Add documentation
COMMENT ON FUNCTION public.get_brigade_members_with_security() IS 
'Secure function for accessing brigade member data. Automatically masks CPF for client users while allowing full access for admin/tecnico roles. Use this instead of direct table access.';

COMMENT ON FUNCTION public.get_masked_cpf(text, text) IS 
'Security function that masks CPF (Brazilian tax ID) for unauthorized users. Only admin and tecnico roles can access unmasked CPF data for compliance with privacy regulations.';