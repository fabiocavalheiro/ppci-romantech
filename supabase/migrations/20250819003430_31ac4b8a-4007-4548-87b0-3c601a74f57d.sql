-- Continuar atualizando as demais políticas

-- Fire extinguishers
DROP POLICY "Admins can manage all fire_extinguishers" ON public.fire_extinguishers;
DROP POLICY "Users can view equipment in their locations" ON public.fire_extinguishers;
DROP POLICY "Tecnico can update fire_extinguishers" ON public.fire_extinguishers;

CREATE POLICY "Admins can manage all fire_extinguishers" ON public.fire_extinguishers
FOR ALL USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can view equipment in their locations" ON public.fire_extinguishers
FOR SELECT USING (EXISTS ( SELECT 1
   FROM locations l
  WHERE ((l.id = fire_extinguishers.location_id) AND ((get_user_role(auth.uid()) = 'admin') OR ((get_user_role(auth.uid()) = 'cliente') AND (l.client_id = ANY (get_user_client_ids(auth.uid())))) OR (get_user_role(auth.uid()) = 'tecnico')))));

CREATE POLICY "Tecnico can update fire_extinguishers" ON public.fire_extinguishers
FOR UPDATE USING (get_user_role(auth.uid()) = ANY (ARRAY['admin', 'tecnico']));

-- Hydrants
DROP POLICY "Admins can manage all hydrants" ON public.hydrants;
DROP POLICY "Users can view hydrants in their locations" ON public.hydrants;
DROP POLICY "Tecnico can update hydrants" ON public.hydrants;

CREATE POLICY "Admins can manage all hydrants" ON public.hydrants
FOR ALL USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can view hydrants in their locations" ON public.hydrants
FOR SELECT USING (EXISTS ( SELECT 1
   FROM locations l
  WHERE ((l.id = hydrants.location_id) AND ((get_user_role(auth.uid()) = 'admin') OR ((get_user_role(auth.uid()) = 'cliente') AND (l.client_id = ANY (get_user_client_ids(auth.uid())))) OR (get_user_role(auth.uid()) = 'tecnico')))));

CREATE POLICY "Tecnico can update hydrants" ON public.hydrants
FOR UPDATE USING (get_user_role(auth.uid()) = ANY (ARRAY['admin', 'tecnico']));