-- Atualizar todas as políticas para usar get_user_role ao invés de get_user_role_temp

-- Clients
DROP POLICY "Admins can manage all clients" ON public.clients;
DROP POLICY "Clients can view their own data" ON public.clients;
DROP POLICY "Tecnico can view all clients" ON public.clients;

CREATE POLICY "Admins can manage all clients" ON public.clients
FOR ALL USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Clients can view their own data" ON public.clients
FOR SELECT USING ((get_user_role(auth.uid()) = 'cliente') AND (id = ANY (get_user_client_ids(auth.uid()))));

CREATE POLICY "Tecnico can view all clients" ON public.clients
FOR SELECT USING (get_user_role(auth.uid()) = 'tecnico');

-- Locations
DROP POLICY "Admins can manage all locations" ON public.locations;
DROP POLICY "Clients can view their locations" ON public.locations;
DROP POLICY "Tecnico can view all locations" ON public.locations;
DROP POLICY "Tecnico can update locations" ON public.locations;

CREATE POLICY "Admins can manage all locations" ON public.locations
FOR ALL USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Clients can view their locations" ON public.locations
FOR SELECT USING ((get_user_role(auth.uid()) = 'cliente') AND (client_id = ANY (get_user_client_ids(auth.uid()))));

CREATE POLICY "Tecnico can view all locations" ON public.locations
FOR SELECT USING (get_user_role(auth.uid()) = 'tecnico');

CREATE POLICY "Tecnico can update locations" ON public.locations
FOR UPDATE USING (get_user_role(auth.uid()) = 'tecnico');