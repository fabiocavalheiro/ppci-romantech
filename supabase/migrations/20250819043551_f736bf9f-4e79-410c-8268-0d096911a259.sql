-- Create activities table for calendar events
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location_id UUID NOT NULL,
  scheduled_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  status TEXT DEFAULT 'scheduled',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage all activities" 
ON public.activities 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Tecnico can view and update activities" 
ON public.activities 
FOR SELECT 
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin', 'tecnico']));

CREATE POLICY "Tecnico can update activities" 
ON public.activities 
FOR UPDATE 
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin', 'tecnico']));

-- Add trigger for updated_at
CREATE TRIGGER update_activities_updated_at
BEFORE UPDATE ON public.activities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();