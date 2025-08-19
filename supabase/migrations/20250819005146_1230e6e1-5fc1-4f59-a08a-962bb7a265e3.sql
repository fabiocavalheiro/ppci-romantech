-- Adicionar política para permitir inserção de locais
DROP POLICY IF EXISTS "Users can insert locations" ON public.locations;

CREATE POLICY "Users can insert locations" ON public.locations
FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) = ANY (ARRAY['admin', 'tecnico'])
    OR (
        get_user_role(auth.uid()) = 'cliente' 
        AND client_id = ANY (get_user_client_ids(auth.uid()))
    )
);

-- Verificar se a função get_user_client_ids funciona corretamente
-- Vamos criar uma versão mais robusta
CREATE OR REPLACE FUNCTION public.get_user_client_ids(user_id uuid)
RETURNS uuid[]
LANGUAGE sql
STABLE SECURITY DEFINER
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