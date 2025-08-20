-- Simplify empresas policies to avoid any recursion issues

-- Drop all existing empresas policies
DROP POLICY IF EXISTS "Admin can manage all empresas" ON public.empresas;
DROP POLICY IF EXISTS "Public can view active empresas for signup" ON public.empresas;
DROP POLICY IF EXISTS "Users can view empresas from their own company" ON public.empresas;

-- Create simple, clear policies for empresas
CREATE POLICY "Admin can manage all empresas" 
ON public.empresas 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

-- Allow anyone to see active empresas for signup (unauthenticated users need this)
CREATE POLICY "Anyone can view active empresas for signup" 
ON public.empresas 
FOR SELECT 
USING (status = 'ativo');

-- Allow authenticated users to see their own empresa
CREATE POLICY "Users can view their own empresa" 
ON public.empresas 
FOR SELECT 
USING (
  auth.role() = 'authenticated' AND (
    get_user_role(auth.uid()) = 'admin' OR 
    id = get_user_profile_empresa_id(auth.uid())
  )
);