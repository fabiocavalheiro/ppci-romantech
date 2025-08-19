-- Add foreign key constraint for activities table
ALTER TABLE public.activities 
ADD CONSTRAINT fk_activities_location 
FOREIGN KEY (location_id) 
REFERENCES public.locations(id);