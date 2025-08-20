-- Update RLS policies to filter by empresa_id

-- Update locations policies to consider empresa_id
DROP POLICY IF EXISTS "Clients can view their locations" ON public.locations;
DROP POLICY IF EXISTS "Clients can update their locations" ON public.locations;

CREATE POLICY "Clients can view locations from their empresa" 
ON public.locations 
FOR SELECT 
USING (
  get_user_role(auth.uid()) = 'admin' OR 
  get_user_role(auth.uid()) = 'tecnico' OR
  (get_user_role(auth.uid()) = 'cliente' AND client_id IN (
    SELECT c.id FROM public.clients c 
    INNER JOIN public.profiles p ON p.empresa_id = (
      SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid()
    )
  ))
);

CREATE POLICY "Clients can update locations from their empresa" 
ON public.locations 
FOR UPDATE 
USING (
  get_user_role(auth.uid()) = 'admin' OR 
  get_user_role(auth.uid()) = 'tecnico' OR
  (get_user_role(auth.uid()) = 'cliente' AND client_id IN (
    SELECT c.id FROM public.clients c 
    INNER JOIN public.profiles p ON p.empresa_id = (
      SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid()
    )
  ))
);

-- Update extintores policies to consider empresa_id through location
DROP POLICY IF EXISTS "Users can view extintores in their locations" ON public.extintores;
DROP POLICY IF EXISTS "Users can insert extintores in their locations" ON public.extintores;
DROP POLICY IF EXISTS "Users can delete extintores in their locations" ON public.extintores;

CREATE POLICY "Users can view extintores in their empresa locations" 
ON public.extintores 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.locations l 
    INNER JOIN public.clients c ON l.client_id = c.id
    WHERE l.id = extintores.local_id AND (
      get_user_role(auth.uid()) = 'admin' OR 
      get_user_role(auth.uid()) = 'tecnico' OR
      (get_user_role(auth.uid()) = 'cliente' AND EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.user_id = auth.uid() AND p.empresa_id IS NOT NULL
      ))
    )
  )
);

CREATE POLICY "Users can insert extintores in their empresa locations" 
ON public.extintores 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.locations l 
    INNER JOIN public.clients c ON l.client_id = c.id
    WHERE l.id = extintores.local_id AND (
      get_user_role(auth.uid()) = 'admin' OR 
      get_user_role(auth.uid()) = 'tecnico' OR
      (get_user_role(auth.uid()) = 'cliente' AND EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.user_id = auth.uid() AND p.empresa_id IS NOT NULL
      ))
    )
  )
);

CREATE POLICY "Users can delete extintores in their empresa locations" 
ON public.extintores 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.locations l 
    INNER JOIN public.clients c ON l.client_id = c.id
    WHERE l.id = extintores.local_id AND (
      get_user_role(auth.uid()) = 'admin' OR 
      get_user_role(auth.uid()) = 'tecnico' OR
      (get_user_role(auth.uid()) = 'cliente' AND EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.user_id = auth.uid() AND p.empresa_id IS NOT NULL
      ))
    )
  )
);

-- Create function to get user's empresa_id
CREATE OR REPLACE FUNCTION public.get_user_empresa_id(user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT empresa_id FROM public.profiles WHERE profiles.user_id = get_user_empresa_id.user_id;
$function$;

-- Update canAccessRoute function in useAuth to validate empresa blocking
-- Also update profiles trigger to prevent login for inactive empresas