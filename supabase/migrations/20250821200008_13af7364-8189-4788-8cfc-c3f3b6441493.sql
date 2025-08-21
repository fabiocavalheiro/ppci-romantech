-- Fix the last function search_path security issue

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
SET search_path = public
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