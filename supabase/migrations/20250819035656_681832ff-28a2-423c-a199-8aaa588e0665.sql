-- Inserir perfil admin que será vinculado quando o usuário se cadastrar
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