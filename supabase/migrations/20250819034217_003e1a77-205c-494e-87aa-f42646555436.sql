-- Criar um cliente para o usuário atual
INSERT INTO public.clients (id, name, email, active, created_at, updated_at)
VALUES (
  'f6718dd5-4d51-4ca7-9d0a-2aa65e87ed89',
  'Fabio Cavalheiro Vieira',
  'fabio1987cavalheiro@gmail.com',
  true,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = now();