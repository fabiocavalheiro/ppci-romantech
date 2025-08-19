-- Remover política que permite clientes verem todos os clientes
DROP POLICY IF EXISTS "Clients can view all clients" ON public.clients;

-- Atualizar políticas para clients - clientes só podem ver seu próprio registro
DROP POLICY IF EXISTS "Clients can view their own data" ON public.clients;

CREATE POLICY "Clients can view their own data" 
ON public.clients 
FOR SELECT 
USING (
  (get_user_role(auth.uid()) = 'cliente' AND id = get_user_client_id(auth.uid())) OR
  (get_user_role(auth.uid()) = ANY (ARRAY['admin', 'tecnico']))
);

-- Atualizar políticas para locations - garantir que clientes só vejam seus locais
DROP POLICY IF EXISTS "Authenticated users can view locations" ON public.locations;

-- Manter as políticas existentes que já estão corretas
-- A política "Clients can view their locations" já está correta