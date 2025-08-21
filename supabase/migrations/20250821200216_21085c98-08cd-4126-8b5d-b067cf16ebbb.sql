-- Fix infinite recursion in profiles table policies by using simpler, non-recursive approaches

-- Drop existing problematic policies
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;  
DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;

-- Create simple, non-recursive policies for profiles table
-- Users can only see their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles  
FOR SELECT
USING (user_id = auth.uid());

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE  
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can only insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Admins can view all profiles (separate policy to avoid recursion)
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  -- Check if current user has admin role by direct query (avoid function call)
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role = 'admin'
  )
);

-- Admins can update all profiles  
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (
  -- Check if current user has admin role by direct query (avoid function call)
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role = 'admin'
  )
)
WITH CHECK (
  -- Check if current user has admin role by direct query (avoid function call)
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role = 'admin'
  )
);

-- Now fix the get_user_role function to avoid recursion by using a simpler approach
CREATE OR REPLACE FUNCTION public.get_user_role_safe(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  -- Use a more direct query that won't trigger RLS recursion
  SELECT role::text FROM public.profiles 
  WHERE profiles.user_id = $1 
  LIMIT 1;
$$;

-- Update all function calls to use the safe version
CREATE OR REPLACE FUNCTION public.get_user_client_ids_safe(user_id uuid)
RETURNS uuid[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ARRAY[c.id] 
  FROM public.clients c
  INNER JOIN public.profiles p ON p.email = c.email
  WHERE p.user_id = $1
  UNION
  SELECT ARRAY[c.id] 
  FROM public.clients c
  WHERE get_user_role_safe($1) = ANY (ARRAY['admin', 'tecnico']);
$$;