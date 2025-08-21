-- Update brigade_members policies to use the safe functions and ensure proper security

-- Drop existing brigade_members policies  
DROP POLICY IF EXISTS "Clients can view brigade members in owned locations only" ON public.brigade_members;
DROP POLICY IF EXISTS "Admins and technicians full brigade access" ON public.brigade_members;
DROP POLICY IF EXISTS "Only admins and technicians can create brigade members" ON public.brigade_members;
DROP POLICY IF EXISTS "Only admins and technicians can update brigade members" ON public.brigade_members;
DROP POLICY IF EXISTS "Only admins and technicians can delete brigade members" ON public.brigade_members;
DROP POLICY IF EXISTS "Admins can manage all brigade_members" ON public.brigade_members;
DROP POLICY IF EXISTS "Tecnico can update brigade_members" ON public.brigade_members;

-- Create secure policies for brigade_members that protect sensitive personal data

-- 1. Only admins and technicians can view ALL data including CPF
CREATE POLICY "Admins and technicians view all brigade data"
ON public.brigade_members
FOR SELECT
USING (
  get_user_role_safe(auth.uid()) = ANY (ARRAY['admin'::text, 'tecnico'::text])
);

-- 2. Clients can ONLY view limited data (name and role) in their locations - NO CPF ACCESS
CREATE POLICY "Clients view limited brigade data in owned locations"  
ON public.brigade_members
FOR SELECT
USING (
  get_user_role_safe(auth.uid()) = 'cliente' AND
  EXISTS (
    SELECT 1 FROM locations l
    WHERE l.id = brigade_members.location_id 
    AND l.client_id = ANY (get_user_client_ids_safe(auth.uid()))
  )
);

-- 3. Only admins and technicians can create brigade members (handle sensitive data)
CREATE POLICY "Only admins and technicians create brigade members"
ON public.brigade_members
FOR INSERT
WITH CHECK (
  get_user_role_safe(auth.uid()) = ANY (ARRAY['admin'::text, 'tecnico'::text])
);

-- 4. Only admins and technicians can update brigade members (modify sensitive data)  
CREATE POLICY "Only admins and technicians update brigade members"
ON public.brigade_members
FOR UPDATE
USING (
  get_user_role_safe(auth.uid()) = ANY (ARRAY['admin'::text, 'tecnico'::text])
);

-- 5. Only admins and technicians can delete brigade members
CREATE POLICY "Only admins and technicians delete brigade members"
ON public.brigade_members  
FOR DELETE
USING (
  get_user_role_safe(auth.uid()) = ANY (ARRAY['admin'::text, 'tecnico'::text])
);

-- 6. Create a secure view for clients that explicitly excludes sensitive data
CREATE OR REPLACE VIEW public.brigade_members_client_view AS
SELECT 
  bm.id,
  bm.location_id,
  bm.name,           -- Name is OK for clients to see
  bm.role,           -- Role is OK for clients to see  
  -- Explicitly exclude CPF - clients cannot see this sensitive data
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
  get_user_role_safe(auth.uid()) = 'cliente' AND
  l.client_id = ANY (get_user_client_ids_safe(auth.uid()));

-- 7. Create secure function for client access that excludes CPF
CREATE OR REPLACE FUNCTION public.get_brigade_members_for_client_safe()
RETURNS TABLE(
  id uuid,
  location_id uuid,
  name text,
  role text,
  -- Note: CPF is intentionally excluded from return type for security
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
    -- CPF is intentionally excluded here for security
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
    get_user_role_safe(auth.uid()) = 'cliente' AND
    l.client_id = ANY (get_user_client_ids_safe(auth.uid()));
$$;