-- Verificar e corrigir as políticas RLS para locations
-- Permitir que clientes possam atualizar (desativar) seus próprios locais

-- Remover política existente se houver
DROP POLICY IF EXISTS "Clients can update their locations" ON public.locations;

-- Criar nova política que permite clientes atualizarem seus locais
CREATE POLICY "Clients can update their locations" 
ON public.locations 
FOR UPDATE 
USING ((get_user_role(auth.uid()) = 'cliente'::text) AND (client_id = ANY (get_user_client_ids(auth.uid()))));