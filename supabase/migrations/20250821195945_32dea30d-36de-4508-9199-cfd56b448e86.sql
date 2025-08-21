-- Fix the remaining function search_path security issues

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql  
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Log para debug
  RAISE LOG 'Creating profile for user %', NEW.id;
  
  -- Determinar o papel baseado no email
  DECLARE
    user_role text := 'cliente';
    user_empresa_id uuid := NULL;
  BEGIN
    -- Se for o email do admin, definir como admin
    IF NEW.email = 'fcv1987fcv@gmail.com' THEN
      user_role := 'admin';
      -- Para admin, empresa_id pode ser NULL
      user_empresa_id := NULL;
    ELSE
      -- Para outros usuários, o empresa_id deve ser definido no momento do cadastro
      -- através do app (não via trigger)
      user_role := 'cliente';
    END IF;
    
    -- Inserir apenas se não existir um profile com upsert desabilitado para esse trigger
    INSERT INTO public.profiles (user_id, full_name, email, role, empresa_id)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      NEW.email,
      user_role,
      user_empresa_id
    )
    ON CONFLICT (user_id) DO UPDATE SET
      full_name = CASE 
        WHEN EXCLUDED.full_name IS NOT NULL AND EXCLUDED.full_name != '' 
        THEN EXCLUDED.full_name 
        ELSE profiles.full_name 
      END,
      email = EXCLUDED.email,
      role = CASE 
        WHEN profiles.role = 'admin' THEN profiles.role -- Não alterar admin
        ELSE EXCLUDED.role 
      END,
      empresa_id = CASE 
        WHEN profiles.role = 'admin' THEN profiles.empresa_id -- Não alterar empresa do admin
        WHEN EXCLUDED.empresa_id IS NOT NULL THEN EXCLUDED.empresa_id
        ELSE profiles.empresa_id 
      END,
      updated_at = now();
  END;
  
  RAISE LOG 'Profile created/updated successfully for user % with role %', NEW.id, user_role;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
  RAISE;
END;
$function$;