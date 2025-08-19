-- Simplificar as políticas para garantir que funcionem
-- Permitir visualização de locais para usuários autenticados
DROP POLICY IF EXISTS "Authenticated users can view locations" ON public.locations;
CREATE POLICY "Authenticated users can view locations" ON public.locations
FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir visualização de extintores para usuários autenticados  
DROP POLICY IF EXISTS "Authenticated users can view extintores" ON public.extintores;
CREATE POLICY "Authenticated users can view extintores" ON public.extintores
FOR SELECT USING (auth.role() = 'authenticated');