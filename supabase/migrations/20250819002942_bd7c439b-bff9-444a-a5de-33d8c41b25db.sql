-- Remover o default, alterar o tipo e recriar o default
ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;

-- Alterar a coluna para o enum correto
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE user_role 
USING role::user_role;

-- Recriar o default
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'cliente'::user_role;

-- Agora recriar a função get_user_role com o tipo correto
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT role FROM public.profiles WHERE profiles.user_id = get_user_role.user_id;
$function$;