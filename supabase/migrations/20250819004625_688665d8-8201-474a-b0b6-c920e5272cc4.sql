-- Permitir que clientes vejam clientes também (para poder criar locais)
DROP POLICY IF EXISTS "Clients can view all clients" ON public.clients;

CREATE POLICY "Clients can view all clients" ON public.clients
FOR SELECT USING (get_user_role(auth.uid()) = ANY (ARRAY['admin', 'tecnico', 'cliente']));