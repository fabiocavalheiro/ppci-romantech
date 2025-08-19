-- Verificar os valores atuais na coluna role
-- Primeiro, vamos ver se existem dados na tabela profiles
DO $$
BEGIN
    -- Alterar a coluna role para usar o enum user_role
    ALTER TABLE public.profiles 
    ALTER COLUMN role TYPE user_role 
    USING role::user_role;
    
    RAISE NOTICE 'Coluna role alterada com sucesso para usar o enum user_role';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao alterar coluna: %', SQLERRM;
    
    -- Se falhar, vamos primeiro verificar/corrigir os dados
    UPDATE public.profiles 
    SET role = CASE 
        WHEN role = 'cliente' THEN 'cliente'
        WHEN role = 'admin' THEN 'admin' 
        WHEN role = 'tecnico' THEN 'tecnico'
        ELSE 'cliente'
    END;
    
    -- Tentar novamente
    ALTER TABLE public.profiles 
    ALTER COLUMN role TYPE user_role 
    USING role::user_role;
    
    RAISE NOTICE 'Coluna role corrigida e alterada com sucesso';
END $$;