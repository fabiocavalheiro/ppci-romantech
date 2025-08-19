-- Criar cliente de exemplo se não existir
INSERT INTO public.clients (name, cnpj, email, phone, contact_person, address) VALUES 
  ('Empresa Exemplo Ltda', '12.345.678/0001-90', 'contato@empresaexemplo.com', '(11) 98765-4321', 'José Silva', '{"street": "Rua das Flores, 123", "city": "São Paulo", "state": "SP", "zipCode": "01234-567"}')
ON CONFLICT DO NOTHING;

-- Inserir alguns locais de exemplo para teste
INSERT INTO public.locations (name, address, description, client_id) VALUES 
  ('Matriz - São Paulo', 'Av. Paulista, 1000 - São Paulo, SP', 'Sede principal da empresa', (SELECT id FROM public.clients WHERE name = 'Empresa Exemplo Ltda' LIMIT 1)),
  ('Filial - Rio de Janeiro', 'Av. Copacabana, 500 - Rio de Janeiro, RJ', 'Filial regional Rio de Janeiro', (SELECT id FROM public.clients WHERE name = 'Empresa Exemplo Ltda' LIMIT 1)),
  ('Centro de Distribuição', 'Rodovia Anhanguera, km 25 - Jundiaí, SP', 'Centro de distribuição e logística', (SELECT id FROM public.clients WHERE name = 'Empresa Exemplo Ltda' LIMIT 1))
ON CONFLICT DO NOTHING;

-- Inserir alguns extintores de exemplo
INSERT INTO public.extintores (local_id, numero, tipo, status, localizacao_texto, responsavel_manutencao, ultima_inspecao, proxima_inspecao, observacoes) VALUES 
  -- Matriz - São Paulo
  ((SELECT id FROM public.locations WHERE name = 'Matriz - São Paulo' LIMIT 1), 1, 'ABC', 'ok', 'Recepção - Hall de entrada', 'João Silva', '2024-01-15', '2024-04-15', 'Extintor em perfeito estado'),
  ((SELECT id FROM public.locations WHERE name = 'Matriz - São Paulo' LIMIT 1), 2, 'BC', 'warning', 'Subsolo - Garagem', 'João Silva', '2024-01-15', '2024-04-15', 'Próximo ao vencimento'),
  ((SELECT id FROM public.locations WHERE name = 'Matriz - São Paulo' LIMIT 1), 3, 'CO2', 'danger', 'Sala de servidores', 'Maria Santos', '2023-10-15', '2024-01-15', 'Vencido - necessita recarga'),
  ((SELECT id FROM public.locations WHERE name = 'Matriz - São Paulo' LIMIT 1), 4, 'ABC', 'ok', 'Andar 1 - Corredor A', 'João Silva', '2024-02-01', '2024-05-01', ''),
  ((SELECT id FROM public.locations WHERE name = 'Matriz - São Paulo' LIMIT 1), 5, 'ABC', 'ok', 'Andar 2 - Próximo elevador', 'João Silva', '2024-02-01', '2024-05-01', ''),
  
  -- Filial - Rio de Janeiro  
  ((SELECT id FROM public.locations WHERE name = 'Filial - Rio de Janeiro' LIMIT 1), 1, 'ABC', 'ok', 'Entrada principal', 'Carlos Lima', '2024-01-20', '2024-04-20', ''),
  ((SELECT id FROM public.locations WHERE name = 'Filial - Rio de Janeiro' LIMIT 1), 2, 'BC', 'ok', 'Cozinha', 'Carlos Lima', '2024-01-20', '2024-04-20', ''),
  ((SELECT id FROM public.locations WHERE name = 'Filial - Rio de Janeiro' LIMIT 1), 3, 'ABC', 'warning', 'Corredor principal', 'Carlos Lima', '2024-01-20', '2024-04-20', 'Verificar pressão'),
  
  -- Centro de Distribuição
  ((SELECT id FROM public.locations WHERE name = 'Centro de Distribuição' LIMIT 1), 1, 'ABC', 'ok', 'Área de carga', 'Pedro Costa', '2024-02-05', '2024-05-05', ''),
  ((SELECT id FROM public.locations WHERE name = 'Centro de Distribuição' LIMIT 1), 2, 'ABC', 'ok', 'Estoque - Setor A', 'Pedro Costa', '2024-02-05', '2024-05-05', ''),
  ((SELECT id FROM public.locations WHERE name = 'Centro de Distribuição' LIMIT 1), 3, 'CO2', 'danger', 'Escritório administrativo', 'Pedro Costa', '2023-11-05', '2024-02-05', 'Vencido'),
  ((SELECT id FROM public.locations WHERE name = 'Centro de Distribuição' LIMIT 1), 4, 'BC', 'warning', 'Área de manutenção', 'Pedro Costa', '2024-02-05', '2024-05-05', 'Próximo à manutenção')
ON CONFLICT DO NOTHING;