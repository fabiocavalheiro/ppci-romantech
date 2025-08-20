-- Create empresas table
CREATE TABLE public.empresas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  cnpj TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on empresas
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

-- Add empresa_id to profiles table
ALTER TABLE public.profiles ADD COLUMN empresa_id UUID REFERENCES public.empresas(id);

-- Update profiles table role constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'cliente'));

-- RLS Policies for empresas
CREATE POLICY "Admin can manage all empresas" 
ON public.empresas 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can view empresas from their own company" 
ON public.empresas 
FOR SELECT 
USING (
  get_user_role(auth.uid()) = 'admin' OR 
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.empresa_id = empresas.id
  )
);

CREATE POLICY "Public can view active empresas for signup" 
ON public.empresas 
FOR SELECT 
USING (status = 'ativo');

-- Update profiles RLS policies to include empresa_id checks
DROP POLICY IF EXISTS "Clients can view their own data" ON public.profiles;
CREATE POLICY "Users can view profiles from same empresa" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  get_user_role(auth.uid()) = 'admin' OR
  (get_user_role(auth.uid()) = 'cliente' AND empresa_id = (
    SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid()
  ))
);

-- Insert some sample empresas for testing
INSERT INTO public.empresas (nome, cnpj, status) VALUES 
('RomanTech Ltda', '12.345.678/0001-90', 'ativo'),
('Empresa Teste', '98.765.432/0001-10', 'ativo'),
('Empresa Inativa', '11.111.111/0001-11', 'inativo');

-- Update existing profiles to have empresa_id (assign to first active empresa)
UPDATE public.profiles 
SET empresa_id = (SELECT id FROM public.empresas WHERE status = 'ativo' LIMIT 1)
WHERE empresa_id IS NULL;