-- Adicionar coluna client_type na tabela locations
ALTER TABLE public.locations 
ADD COLUMN client_type TEXT;

-- Criar um enum para os tipos de cliente
CREATE TYPE public.client_type_enum AS ENUM ('residencial', 'comercial', 'industria');

-- Alterar a coluna para usar o enum
ALTER TABLE public.locations 
ALTER COLUMN client_type TYPE client_type_enum USING client_type::client_type_enum;

-- Definir um valor padrão
ALTER TABLE public.locations 
ALTER COLUMN client_type SET DEFAULT 'residencial'::client_type_enum;

-- Atualizar registros existentes com um valor padrão
UPDATE public.locations 
SET client_type = 'comercial'::client_type_enum 
WHERE client_type IS NULL;