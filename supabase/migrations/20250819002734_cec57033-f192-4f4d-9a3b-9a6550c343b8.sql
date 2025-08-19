-- Verificar e corrigir a função get_user_role
DROP FUNCTION IF EXISTS public.get_user_role(uuid);

-- Recriar a função com o tipo correto
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT role FROM public.profiles WHERE profiles.user_id = get_user_role.user_id;
$function$;