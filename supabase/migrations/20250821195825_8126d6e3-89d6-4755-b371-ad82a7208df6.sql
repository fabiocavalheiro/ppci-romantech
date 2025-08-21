-- First, let's drop the existing overly permissive RLS policies for brigade_members
DROP POLICY IF EXISTS "Users can view brigade_members in their locations" ON public.brigade_members;
DROP POLICY IF EXISTS "Users can insert brigade_members in their locations" ON public.brigade_members; 
DROP POLICY IF EXISTS "Users can delete brigade_members in their locations" ON public.brigade_members;

-- Create more restrictive policies that protect sensitive personal data

-- 1. Clients can only view brigade members in locations they own, but this is now more restricted
CREATE POLICY "Clients can view brigade members in owned locations only"
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
CREATE POLICY "Admins and technicians full brigade access"
ON public.brigade_members  
FOR SELECT
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'tecnico'::text]));

-- 3. Restrict INSERT to admins and technicians only (no more client creation)
CREATE POLICY "Only admins and technicians can create brigade members"
ON public.brigade_members
FOR INSERT  
WITH CHECK (
  get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'tecnico'::text])
);

-- 4. Restrict UPDATE to admins and technicians only 
CREATE POLICY "Only admins and technicians can update brigade members"
ON public.brigade_members
FOR UPDATE
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'tecnico'::text]));

-- 5. Restrict DELETE to admins and technicians only
CREATE POLICY "Only admins and technicians can delete brigade members"
ON public.brigade_members
FOR DELETE
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'tecnico'::text]));

-- 6. Create a security definer function to get sanitized brigade data for clients
CREATE OR REPLACE FUNCTION public.get_brigade_members_for_client()
RETURNS TABLE(
  id uuid,
  location_id uuid,
  name text,
  role text, 
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
AS $$
  SELECT 
    bm.id,
    bm.location_id,
    bm.name,
    bm.role,
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
    get_user_role(auth.uid()) = 'cliente' AND
    l.client_id = ANY (get_user_client_ids(auth.uid()));
$$;