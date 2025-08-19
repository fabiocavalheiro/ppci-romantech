-- Atualizar políticas para extintores
DROP POLICY IF EXISTS "Admins can manage all extintores" ON public.extintores;
DROP POLICY IF EXISTS "Tecnico can update extintores" ON public.extintores;
DROP POLICY IF EXISTS "Users can view extintores in their locations" ON public.extintores;
DROP POLICY IF EXISTS "Users can insert extintores in their locations" ON public.extintores;
DROP POLICY IF EXISTS "Users can delete extintores in their locations" ON public.extintores;

CREATE POLICY "Admins can manage all extintores" ON public.extintores
FOR ALL USING (get_user_role_temp(auth.uid()) = 'admin');

CREATE POLICY "Tecnico can update extintores" ON public.extintores
FOR UPDATE USING (get_user_role_temp(auth.uid()) = ANY (ARRAY['admin', 'tecnico']));

CREATE POLICY "Users can view extintores in their locations" ON public.extintores
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM locations l 
        WHERE l.id = extintores.local_id 
        AND (
            get_user_role_temp(auth.uid()) = 'admin'
            OR (get_user_role_temp(auth.uid()) = 'cliente' AND l.client_id = ANY (get_user_client_ids(auth.uid())))
            OR get_user_role_temp(auth.uid()) = 'tecnico'
        )
    )
);

CREATE POLICY "Users can insert extintores in their locations" ON public.extintores
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM locations l 
        WHERE l.id = extintores.local_id 
        AND (
            get_user_role_temp(auth.uid()) = 'admin'
            OR (get_user_role_temp(auth.uid()) = 'cliente' AND l.client_id = ANY (get_user_client_ids(auth.uid())))
            OR get_user_role_temp(auth.uid()) = 'tecnico'
        )
    )
);

CREATE POLICY "Users can delete extintores in their locations" ON public.extintores
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM locations l 
        WHERE l.id = extintores.local_id 
        AND (
            get_user_role_temp(auth.uid()) = 'admin'
            OR (get_user_role_temp(auth.uid()) = 'cliente' AND l.client_id = ANY (get_user_client_ids(auth.uid())))
            OR get_user_role_temp(auth.uid()) = 'tecnico'
        )
    )
);