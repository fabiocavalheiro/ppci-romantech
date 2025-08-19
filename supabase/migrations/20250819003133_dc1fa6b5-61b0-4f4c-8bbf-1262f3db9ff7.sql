-- Atualizar políticas para hydrants
DROP POLICY IF EXISTS "Admins can manage all hydrants" ON public.hydrants;
DROP POLICY IF EXISTS "Users can view hydrants in their locations" ON public.hydrants;
DROP POLICY IF EXISTS "Tecnico can update hydrants" ON public.hydrants;

CREATE POLICY "Admins can manage all hydrants" ON public.hydrants
FOR ALL USING (get_user_role_temp(auth.uid()) = 'admin');

CREATE POLICY "Users can view hydrants in their locations" ON public.hydrants
FOR SELECT USING (EXISTS ( SELECT 1
   FROM locations l
  WHERE ((l.id = hydrants.location_id) AND ((get_user_role_temp(auth.uid()) = 'admin') OR ((get_user_role_temp(auth.uid()) = 'cliente') AND (l.client_id = ANY (get_user_client_ids(auth.uid())))) OR (get_user_role_temp(auth.uid()) = 'tecnico')))));

CREATE POLICY "Tecnico can update hydrants" ON public.hydrants
FOR UPDATE USING (get_user_role_temp(auth.uid()) = ANY (ARRAY['admin', 'tecnico']));

-- Atualizar políticas para profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (get_user_role_temp(auth.uid()) = 'admin');

CREATE POLICY "Admins can manage all profiles" ON public.profiles
FOR ALL USING (get_user_role_temp(auth.uid()) = 'admin');

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);