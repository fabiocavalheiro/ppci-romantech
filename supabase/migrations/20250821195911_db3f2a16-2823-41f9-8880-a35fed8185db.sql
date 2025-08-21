-- Fix the remaining security issues from the migration

-- 1. Add RLS policies for tables that are missing them
CREATE POLICY "Admins and technicians can manage alarms"
ON public.alarms
FOR ALL
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'tecnico'::text]));

CREATE POLICY "Users can view alarms in their locations"
ON public.alarms  
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM locations l
    WHERE l.id = alarms.location_id 
    AND ((get_user_role(auth.uid()) = 'admin'::text) OR 
         ((get_user_role(auth.uid()) = 'cliente'::text) AND (l.client_id = ANY (get_user_client_ids(auth.uid())))) OR 
         (get_user_role(auth.uid()) = 'tecnico'::text))
  )
);

CREATE POLICY "Admins and technicians can manage emergency lighting"
ON public.emergency_lighting
FOR ALL
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'tecnico'::text]));

CREATE POLICY "Users can view emergency lighting in their locations"  
ON public.emergency_lighting
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM locations l
    WHERE l.id = emergency_lighting.location_id 
    AND ((get_user_role(auth.uid()) = 'admin'::text) OR 
         ((get_user_role(auth.uid()) = 'cliente'::text) AND (l.client_id = ANY (get_user_client_ids(auth.uid())))) OR 
         (get_user_role(auth.uid()) = 'tecnico'::text))
  )
);

CREATE POLICY "Admins and technicians can manage sprinklers"
ON public.sprinklers
FOR ALL  
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'tecnico'::text]));

CREATE POLICY "Users can view sprinklers in their locations"
ON public.sprinklers
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM locations l  
    WHERE l.id = sprinklers.location_id 
    AND ((get_user_role(auth.uid()) = 'admin'::text) OR 
         ((get_user_role(auth.uid()) = 'cliente'::text) AND (l.client_id = ANY (get_user_client_ids(auth.uid())))) OR 
         (get_user_role(auth.uid()) = 'tecnico'::text))
  )
);

-- 2. Fix search_path for security definer functions
CREATE OR REPLACE FUNCTION public.get_user_empresa_id(user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT empresa_id FROM public.profiles WHERE profiles.user_id = get_user_empresa_id.user_id;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role_temp(user_id uuid)  
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT role::text FROM public.profiles WHERE profiles.user_id = get_user_role_temp.user_id;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_profile_empresa_id(user_id uuid)
RETURNS uuid
LANGUAGE sql  
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT empresa_id FROM public.profiles WHERE profiles.user_id = get_user_profile_empresa_id.user_id;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER  
SET search_path = public
AS $function$
  SELECT role::text FROM public.profiles WHERE profiles.user_id = get_user_role.user_id;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_client_ids(user_id uuid)
RETURNS uuid[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public  
AS $function$
  SELECT ARRAY[c.id] 
  FROM public.clients c
  INNER JOIN public.profiles p ON p.email = c.email
  WHERE p.user_id = get_user_client_ids.user_id
  UNION
  SELECT ARRAY[c.id] 
  FROM public.clients c
  WHERE get_user_role(user_id) = ANY (ARRAY['admin', 'tecnico']);
$function$;

CREATE OR REPLACE FUNCTION public.get_user_client_id(user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT client_id FROM public.profiles WHERE profiles.user_id = get_user_client_id.user_id;  
$function$;