-- Fix infinite recursion in profiles RLS policies

-- Drop ALL existing policies on profiles first
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles from same empresa" ON public.profiles;

-- Create security definer functions to avoid recursion
CREATE OR REPLACE FUNCTION public.get_user_profile_empresa_id(user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT empresa_id FROM public.profiles WHERE profiles.user_id = get_user_profile_empresa_id.user_id;
$function$;

-- Recreate simple, non-recursive profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

-- Fix the empresas policy that also had recursion
DROP POLICY IF EXISTS "Users can view empresas from their own company" ON public.empresas;

CREATE POLICY "Users can view empresas from their own company" 
ON public.empresas 
FOR SELECT 
USING (
  get_user_role(auth.uid()) = 'admin' OR 
  id = get_user_profile_empresa_id(auth.uid())
);