-- Corrigir a função get_user_role que ainda referencia get_user_role_temp
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT role::text FROM public.profiles WHERE profiles.user_id = get_user_role.user_id;
$function$;