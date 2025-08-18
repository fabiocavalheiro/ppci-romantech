-- Criar o perfil para o usuário existente
INSERT INTO public.profiles (user_id, full_name, email, role)
VALUES (
  '21f78766-a123-42c8-a360-f29ab1da88cc',
  'Fabio Cavalheiro Vieira',
  'fabio1987cavalheiro@gmail.com',
  'cliente'
)
ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  updated_at = now();