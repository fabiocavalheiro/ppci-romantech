-- Enable Row Level Security on brigade_members table
ALTER TABLE public.brigade_members ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage all brigade members
CREATE POLICY "Admins can manage all brigade_members" 
ON public.brigade_members 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

-- Create policy for users to view brigade members in their locations
CREATE POLICY "Users can view brigade_members in their locations" 
ON public.brigade_members 
FOR SELECT 
USING (EXISTS (
  SELECT 1 
  FROM locations l 
  WHERE l.id = brigade_members.location_id 
  AND (
    get_user_role(auth.uid()) = 'admin' 
    OR (get_user_role(auth.uid()) = 'cliente' AND l.client_id = ANY(get_user_client_ids(auth.uid())))
    OR get_user_role(auth.uid()) = 'tecnico'
  )
));

-- Create policy for admins and technicians to update brigade members
CREATE POLICY "Tecnico can update brigade_members" 
ON public.brigade_members 
FOR UPDATE 
USING (get_user_role(auth.uid()) = ANY(ARRAY['admin', 'tecnico']));

-- Create policy for admins and technicians to insert brigade members
CREATE POLICY "Users can insert brigade_members in their locations" 
ON public.brigade_members 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 
  FROM locations l 
  WHERE l.id = brigade_members.location_id 
  AND (
    get_user_role(auth.uid()) = 'admin' 
    OR (get_user_role(auth.uid()) = 'cliente' AND l.client_id = ANY(get_user_client_ids(auth.uid())))
    OR get_user_role(auth.uid()) = 'tecnico'
  )
));

-- Create policy for admins and technicians to delete brigade members
CREATE POLICY "Users can delete brigade_members in their locations" 
ON public.brigade_members 
FOR DELETE 
USING (EXISTS (
  SELECT 1 
  FROM locations l 
  WHERE l.id = brigade_members.location_id 
  AND (
    get_user_role(auth.uid()) = 'admin' 
    OR (get_user_role(auth.uid()) = 'cliente' AND l.client_id = ANY(get_user_client_ids(auth.uid())))
    OR get_user_role(auth.uid()) = 'tecnico'
  )
));