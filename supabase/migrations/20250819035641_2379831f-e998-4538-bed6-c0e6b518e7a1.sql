-- Inserir um usuário admin diretamente na tabela profiles
-- Como não podemos inserir diretamente na tabela auth.users, vamos criar um perfil admin
-- que será vinculado quando o usuário fizer signup

-- Primeiro, vamos criar um cliente para o admin (caso necessário)
INSERT INTO public.clients (id, name, email, active, created_at, updated_at)
VALUES (
  'admin-client-id-001',
  'RomanTech Administração',
  'admin@romantech.com',
  true,
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Inserir perfil admin (será vinculado quando o usuário se cadastrar)
-- Vamos usar um user_id temporário que será atualizado após o cadastro
INSERT INTO public.profiles (
  id,
  user_id, 
  full_name, 
  email, 
  role, 
  client_id,
  active, 
  created_at, 
  updated_at
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000', -- Será atualizado após signup
  'Administrador Sistema',
  'admin@romantech.com',
  'admin',
  NULL, -- Admin não está vinculado a um cliente específico
  true,
  now(),
  now()
)
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  client_id = NULL,
  full_name = 'Administrador Sistema',
  updated_at = now();