-- Inserir perfil para o usuário admin
INSERT INTO public.profiles (user_id, full_name, email, role, active)
VALUES (
  '1217eacf-3420-4698-9020-26358e0426a6',
  'Administrador do Sistema',
  'fcv1987fcv@gmail.com',
  'admin',
  true
)
ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  active = EXCLUDED.active,
  updated_at = now();