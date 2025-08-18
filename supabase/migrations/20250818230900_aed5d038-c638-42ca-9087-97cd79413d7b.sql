-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('admin', 'cliente', 'tecnico');

-- Create enum for equipment status
CREATE TYPE public.equipment_status AS ENUM ('ok', 'warning', 'danger', 'expired');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'cliente',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clients table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  email TEXT,
  phone TEXT,
  address JSONB,
  contact_person TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create locations table
CREATE TABLE public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fire extinguishers table
CREATE TABLE public.fire_extinguishers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  capacity TEXT NOT NULL,
  serial_number TEXT UNIQUE NOT NULL,
  manufacture_date DATE NOT NULL,
  last_maintenance DATE,
  next_maintenance DATE,
  maintenance_frequency_months INTEGER NOT NULL DEFAULT 12,
  status equipment_status NOT NULL DEFAULT 'ok',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hydrants table
CREATE TABLE public.hydrants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  pressure_rating TEXT,
  serial_number TEXT UNIQUE NOT NULL,
  last_maintenance DATE,
  next_maintenance DATE,
  maintenance_frequency_months INTEGER NOT NULL DEFAULT 6,
  status equipment_status NOT NULL DEFAULT 'ok',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create brigade members table
CREATE TABLE public.brigade_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  cpf TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  last_training DATE,
  next_training DATE,
  training_frequency_months INTEGER NOT NULL DEFAULT 12,
  active BOOLEAN NOT NULL DEFAULT true,
  status equipment_status NOT NULL DEFAULT 'ok',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sprinklers table
CREATE TABLE public.sprinklers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE NOT NULL,
  zone TEXT NOT NULL,
  type TEXT NOT NULL,
  serial_number TEXT UNIQUE NOT NULL,
  last_maintenance DATE,
  next_maintenance DATE,
  maintenance_frequency_months INTEGER NOT NULL DEFAULT 6,
  status equipment_status NOT NULL DEFAULT 'ok',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create alarms table
CREATE TABLE public.alarms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  zone TEXT NOT NULL,
  serial_number TEXT UNIQUE NOT NULL,
  last_maintenance DATE,
  next_maintenance DATE,
  maintenance_frequency_months INTEGER NOT NULL DEFAULT 6,
  status equipment_status NOT NULL DEFAULT 'ok',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create emergency lighting table
CREATE TABLE public.emergency_lighting (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  zone TEXT NOT NULL,
  serial_number TEXT UNIQUE NOT NULL,
  last_maintenance DATE,
  next_maintenance DATE,
  maintenance_frequency_months INTEGER NOT NULL DEFAULT 6,
  status equipment_status NOT NULL DEFAULT 'ok',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fire_extinguishers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hydrants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brigade_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprinklers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alarms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_lighting ENABLE ROW LEVEL SECURITY;

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE profiles.user_id = get_user_role.user_id;
$$;

-- Create function to get user's client IDs (for cliente role)
CREATE OR REPLACE FUNCTION public.get_user_client_ids(user_id UUID)
RETURNS UUID[]
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT ARRAY[id] FROM public.clients 
  WHERE EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = get_user_client_ids.user_id 
    AND profiles.email = clients.email
  );
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for clients
CREATE POLICY "Admins can manage all clients" ON public.clients
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Clients can view their own data" ON public.clients
  FOR SELECT USING (
    public.get_user_role(auth.uid()) = 'cliente' 
    AND id = ANY(public.get_user_client_ids(auth.uid()))
  );

CREATE POLICY "Tecnico can view all clients" ON public.clients
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'tecnico');

-- RLS Policies for locations
CREATE POLICY "Admins can manage all locations" ON public.locations
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Clients can view their locations" ON public.locations
  FOR SELECT USING (
    public.get_user_role(auth.uid()) = 'cliente' 
    AND client_id = ANY(public.get_user_client_ids(auth.uid()))
  );

CREATE POLICY "Tecnico can view all locations" ON public.locations
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'tecnico');

CREATE POLICY "Tecnico can update locations" ON public.locations
  FOR UPDATE USING (public.get_user_role(auth.uid()) = 'tecnico');

-- RLS Policies for equipment (same pattern for all equipment tables)
CREATE POLICY "Admins can manage all fire_extinguishers" ON public.fire_extinguishers
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can view equipment in their locations" ON public.fire_extinguishers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.locations l
      WHERE l.id = fire_extinguishers.location_id
      AND (
        public.get_user_role(auth.uid()) = 'admin'
        OR (public.get_user_role(auth.uid()) = 'cliente' AND l.client_id = ANY(public.get_user_client_ids(auth.uid())))
        OR public.get_user_role(auth.uid()) = 'tecnico'
      )
    )
  );

CREATE POLICY "Tecnico can update fire_extinguishers" ON public.fire_extinguishers
  FOR UPDATE USING (public.get_user_role(auth.uid()) IN ('admin', 'tecnico'));

-- Apply same policies to other equipment tables
CREATE POLICY "Admins can manage all hydrants" ON public.hydrants
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can view hydrants in their locations" ON public.hydrants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.locations l
      WHERE l.id = hydrants.location_id
      AND (
        public.get_user_role(auth.uid()) = 'admin'
        OR (public.get_user_role(auth.uid()) = 'cliente' AND l.client_id = ANY(public.get_user_client_ids(auth.uid())))
        OR public.get_user_role(auth.uid()) = 'tecnico'
      )
    )
  );

CREATE POLICY "Tecnico can update hydrants" ON public.hydrants
  FOR UPDATE USING (public.get_user_role(auth.uid()) IN ('admin', 'tecnico'));

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fire_extinguishers_updated_at
  BEFORE UPDATE ON public.fire_extinguishers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'cliente')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();