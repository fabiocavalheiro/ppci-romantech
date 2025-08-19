-- Primeiro, vamos corrigir a função para retornar text temporariamente
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT role::text FROM public.profiles WHERE profiles.user_id = get_user_role.user_id;
$function$;

-- Verificar se conseguimos acessar as tabelas agora
-- Esta migração apenas corrige o tipo de retorno da função