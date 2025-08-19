-- Atualizar políticas para locations
DROP POLICY IF EXISTS "Admins can manage all locations" ON public.locations;
DROP POLICY IF EXISTS "Clients can view their locations" ON public.locations;
DROP POLICY IF EXISTS "Tecnico can view all locations" ON public.locations;
DROP POLICY IF EXISTS "Tecnico can update locations" ON public.locations;

CREATE POLICY "Admins can manage all locations" ON public.locations
FOR ALL USING (get_user_role_temp(auth.uid()) = 'admin');

CREATE POLICY "Clients can view their locations" ON public.locations
FOR SELECT USING ((get_user_role_temp(auth.uid()) = 'cliente') AND (client_id = ANY (get_user_client_ids(auth.uid()))));

CREATE POLICY "Tecnico can view all locations" ON public.locations
FOR SELECT USING (get_user_role_temp(auth.uid()) = 'tecnico');

CREATE POLICY "Tecnico can update locations" ON public.locations
FOR UPDATE USING (get_user_role_temp(auth.uid()) = 'tecnico');

-- Atualizar políticas para fire_extinguishers
DROP POLICY IF EXISTS "Admins can manage all fire_extinguishers" ON public.fire_extinguishers;
DROP POLICY IF EXISTS "Users can view equipment in their locations" ON public.fire_extinguishers;
DROP POLICY IF EXISTS "Tecnico can update fire_extinguishers" ON public.fire_extinguishers;

CREATE POLICY "Admins can manage all fire_extinguishers" ON public.fire_extinguishers
FOR ALL USING (get_user_role_temp(auth.uid()) = 'admin');

CREATE POLICY "Users can view equipment in their locations" ON public.fire_extinguishers
FOR SELECT USING (EXISTS ( SELECT 1
   FROM locations l
  WHERE ((l.id = fire_extinguishers.location_id) AND ((get_user_role_temp(auth.uid()) = 'admin') OR ((get_user_role_temp(auth.uid()) = 'cliente') AND (l.client_id = ANY (get_user_client_ids(auth.uid())))) OR (get_user_role_temp(auth.uid()) = 'tecnico')))));

CREATE POLICY "Tecnico can update fire_extinguishers" ON public.fire_extinguishers
FOR UPDATE USING (get_user_role_temp(auth.uid()) = ANY (ARRAY['admin', 'tecnico']));