-- Forçar a desativação dos 3 locais Unimed que o usuário tentou excluir
UPDATE public.locations 
SET active = false, updated_at = now()
WHERE name = 'Unimed' 
AND address = 'Av Farrapos' 
AND id IN (
  'c51fbf10-cf4c-467a-bb63-8abb7059340d',
  'fa8eef47-d10a-47ad-a59f-0528a7461f38', 
  '1c8ce024-2966-4e08-9df1-e206a2ff616a'
);