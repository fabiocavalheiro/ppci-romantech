-- Adicionar client_id à tabela profiles para vincular usuários aos clientes
ALTER TABLE public.profiles 
ADD COLUMN client_id UUID REFERENCES public.clients(id);

-- Criar função para obter client_id do usuário atual
CREATE OR REPLACE FUNCTION public.get_user_client_id(user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT client_id FROM public.profiles WHERE profiles.user_id = get_user_client_id.user_id;
$$;

-- Atualizar função get_user_role para ser mais segura
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM public.profiles WHERE profiles.user_id = get_user_role.user_id;
$$;