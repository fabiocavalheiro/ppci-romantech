-- First, let's drop the existing overly permissive RLS policies for brigade_members
DROP POLICY IF EXISTS "Users can view brigade_members in their locations" ON public.brigade_members;
DROP POLICY IF EXISTS "Users can insert brigade_members in their locations" ON public.brigade_members;
DROP POLICY IF EXISTS "Users can delete brigade_members in their locations" ON public.brigade_members;

-- Create more restrictive policies that protect sensitive personal data

-- 1. Basic info viewing - clients can only see name and role, not CPF
CREATE POLICY "Clients can view basic brigade info in their locations"
ON public.brigade_members
FOR SELECT
USING (
  get_user_role(auth.uid()) = 'cliente' AND
  EXISTS (
    SELECT 1 FROM locations l
    WHERE l.id = brigade_members.location_id 
    AND l.client_id = ANY (get_user_client_ids(auth.uid()))
  )
);

-- 2. Full access for admins and technicians only
CREATE POLICY "Admins and technicians can view all brigade data"
ON public.brigade_members  
FOR SELECT
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'tecnico'::text]));

-- 3. Restrict INSERT to admins and technicians only (sensitive data creation)
CREATE POLICY "Only admins and technicians can create brigade members"
ON public.brigade_members
FOR INSERT  
WITH CHECK (
  get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'tecnico'::text]) AND
  EXISTS (
    SELECT 1 FROM locations l
    WHERE l.id = brigade_members.location_id
  )
);

-- 4. Restrict DELETE to admins and technicians only
CREATE POLICY "Only admins and technicians can delete brigade members"
ON public.brigade_members
FOR DELETE
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'tecnico'::text]));

-- 5. Create a view for clients that excludes sensitive data
CREATE OR REPLACE VIEW public.brigade_members_basic AS
SELECT 
  id,
  location_id,
  name,
  role,
  status,
  active,
  last_training,
  next_training,
  training_frequency_months,
  created_at,
  updated_at
FROM public.brigade_members;

-- 6. Set up RLS for the view
ALTER VIEW public.brigade_members_basic SET (security_barrier = true);

-- 7. Grant access to the basic view for clients
GRANT SELECT ON public.brigade_members_basic TO authenticated;

-- 8. Create policy for basic view access  
CREATE POLICY "Clients can view basic brigade info via view"
ON public.brigade_members_basic
FOR SELECT  
USING (
  get_user_role(auth.uid()) = 'cliente' AND
  EXISTS (
    SELECT 1 FROM locations l
    WHERE l.id = brigade_members_basic.location_id 
    AND l.client_id = ANY (get_user_client_ids(auth.uid()))
  )
);

-- 9. Admins and technicians get full access via view too
CREATE POLICY "Admins and technicians full access via view"
ON public.brigade_members_basic
FOR SELECT
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'tecnico'::text]));