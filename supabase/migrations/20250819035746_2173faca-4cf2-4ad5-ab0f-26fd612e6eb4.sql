-- Atualizar a função handle_new_user para definir admin automaticamente para email específico
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Log para debug
  RAISE LOG 'Creating profile for user %', NEW.id;
  
  -- Determinar o papel baseado no email
  DECLARE
    user_role text := 'cliente';
  BEGIN
    -- Se for o email do admin, definir como admin
    IF NEW.email = 'admin@romantech.com' THEN
      user_role := 'admin';
    END IF;
    
    INSERT INTO public.profiles (user_id, full_name, email, role, client_id)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      NEW.email,
      user_role,
      -- Se for admin, client_id fica NULL; se for cliente, pode ser definido depois
      CASE WHEN user_role = 'admin' THEN NULL ELSE NULL END
    )
    ON CONFLICT (user_id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      email = EXCLUDED.email,
      role = EXCLUDED.role,
      updated_at = now();
  END;
  
  RAISE LOG 'Profile created successfully for user % with role %', NEW.id, user_role;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
  RAISE;
END;
$$;