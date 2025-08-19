-- Criar uma função temporária
CREATE OR REPLACE FUNCTION public.get_user_role_temp(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT role::text FROM public.profiles WHERE profiles.user_id = get_user_role_temp.user_id;
$function$;

-- Recriar todas as políticas usando a função temporária
-- Policies para clients
DROP POLICY IF EXISTS "Admins can manage all clients" ON public.clients;
DROP POLICY IF EXISTS "Clients can view their own data" ON public.clients;
DROP POLICY IF EXISTS "Tecnico can view all clients" ON public.clients;

CREATE POLICY "Admins can manage all clients" ON public.clients
FOR ALL USING (get_user_role_temp(auth.uid()) = 'admin');

CREATE POLICY "Clients can view their own data" ON public.clients
FOR SELECT USING ((get_user_role_temp(auth.uid()) = 'cliente') AND (id = ANY (get_user_client_ids(auth.uid()))));

CREATE POLICY "Tecnico can view all clients" ON public.clients
FOR SELECT USING (get_user_role_temp(auth.uid()) = 'tecnico');