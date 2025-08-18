-- Remover apenas o trigger temporariamente para permitir cadastro
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Simplificar a tabela profiles para usar texto simples
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE text,
ALTER COLUMN role SET DEFAULT 'cliente';

-- Adicionar constraint check se não existir
DO $$ 
BEGIN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('admin', 'cliente', 'tecnico'));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;