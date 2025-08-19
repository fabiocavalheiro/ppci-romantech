-- Simplificar a política para permitir inserção mais ampla
DROP POLICY IF EXISTS "Users can insert locations" ON public.locations;

CREATE POLICY "Users can insert locations" ON public.locations
FOR INSERT WITH CHECK (
    -- Admins e técnicos podem inserir qualquer local
    get_user_role(auth.uid()) = ANY (ARRAY['admin', 'tecnico'])
    OR
    -- Clientes podem inserir locais (vamos verificar o client_id depois)
    get_user_role(auth.uid()) = 'cliente'
);

-- Vamos também verificar se há algum problema com o client_id específico
-- Testar inserção direta
DO $$
BEGIN
    RAISE NOTICE 'Testando inserção de local...';
    
    -- Verificar se o client_id existe
    IF EXISTS (SELECT 1 FROM public.clients WHERE id = 'f6718dd5-4d51-4ca7-9d0a-2aa65e87ed89') THEN
        RAISE NOTICE 'Cliente existe na base de dados';
    ELSE
        RAISE NOTICE 'Cliente NÃO existe na base de dados';
    END IF;
    
END $$;