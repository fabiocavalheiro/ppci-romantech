-- Create settings table for app configuration
CREATE TABLE IF NOT EXISTS public.settings (
  id INT PRIMARY KEY DEFAULT 1,
  company_name TEXT DEFAULT 'RomanTech',
  logo_url TEXT,
  primary_color TEXT DEFAULT '#E3703A',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default row
INSERT INTO public.settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create policies for settings
CREATE POLICY "Everyone can read settings" 
ON public.settings 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can update settings" 
ON public.settings 
FOR UPDATE 
USING (get_user_role(auth.uid()) = 'admin');

-- Create storage bucket for assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for assets bucket
CREATE POLICY "Public can view assets" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'assets');

CREATE POLICY "Admins can upload to assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'assets' AND get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update assets" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'assets' AND get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can delete assets" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'assets' AND get_user_role(auth.uid()) = 'admin');

-- Create trigger for updated_at
CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();