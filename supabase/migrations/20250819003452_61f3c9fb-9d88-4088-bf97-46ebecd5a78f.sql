-- Profiles
DROP POLICY "Admins can view all profiles" ON public.profiles;
DROP POLICY "Admins can manage all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can manage all profiles" ON public.profiles
FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Extintores
DROP POLICY "Admins can manage all extintores" ON public.extintores;
DROP POLICY "Tecnico can update extintores" ON public.extintores;
DROP POLICY "Users can view extintores in their locations" ON public.extintores;
DROP POLICY "Users can insert extintores in their locations" ON public.extintores;
DROP POLICY "Users can delete extintores in their locations" ON public.extintores;

CREATE POLICY "Admins can manage all extintores" ON public.extintores
FOR ALL USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Tecnico can update extintores" ON public.extintores
FOR UPDATE USING (get_user_role(auth.uid()) = ANY (ARRAY['admin', 'tecnico']));

CREATE POLICY "Users can view extintores in their locations" ON public.extintores
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM locations l 
        WHERE l.id = extintores.local_id 
        AND (
            get_user_role(auth.uid()) = 'admin'
            OR (get_user_role(auth.uid()) = 'cliente' AND l.client_id = ANY (get_user_client_ids(auth.uid())))
            OR get_user_role(auth.uid()) = 'tecnico'
        )
    )
);

CREATE POLICY "Users can insert extintores in their locations" ON public.extintores
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM locations l 
        WHERE l.id = extintores.local_id 
        AND (
            get_user_role(auth.uid()) = 'admin'
            OR (get_user_role(auth.uid()) = 'cliente' AND l.client_id = ANY (get_user_client_ids(auth.uid())))
            OR get_user_role(auth.uid()) = 'tecnico'
        )
    )
);

CREATE POLICY "Users can delete extintores in their locations" ON public.extintores
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM locations l 
        WHERE l.id = extintores.local_id 
        AND (
            get_user_role(auth.uid()) = 'admin'
            OR (get_user_role(auth.uid()) = 'cliente' AND l.client_id = ANY (get_user_client_ids(auth.uid())))
            OR get_user_role(auth.uid()) = 'tecnico'
        )
    )
);