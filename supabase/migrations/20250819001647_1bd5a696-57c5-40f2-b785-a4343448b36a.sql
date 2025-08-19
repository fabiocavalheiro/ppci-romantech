-- Criar enum para tipos de extintor
CREATE TYPE extintor_type AS ENUM ('BC', 'ABC', 'CO2');

-- Criar tabela de extintores usando o enum equipment_status existente
CREATE TABLE public.extintores (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    local_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
    numero integer NOT NULL,
    tipo extintor_type NOT NULL DEFAULT 'ABC',
    status equipment_status NOT NULL DEFAULT 'ok',
    localizacao_texto text,
    responsavel_manutencao text,
    ultima_inspecao date,
    proxima_inspecao date,
    observacoes text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar índice único para garantir numeração sequencial por local
CREATE UNIQUE INDEX idx_extintores_local_numero ON public.extintores(local_id, numero);

-- Criar índice para performance em consultas por local
CREATE INDEX idx_extintores_local_id ON public.extintores(local_id);

-- Enable Row Level Security
ALTER TABLE public.extintores ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para extintores
CREATE POLICY "Admins can manage all extintores" 
ON public.extintores 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Tecnico can update extintores" 
ON public.extintores 
FOR UPDATE 
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'tecnico'::user_role]));

CREATE POLICY "Users can view extintores in their locations" 
ON public.extintores 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM locations l 
        WHERE l.id = extintores.local_id 
        AND (
            get_user_role(auth.uid()) = 'admin'::user_role
            OR (get_user_role(auth.uid()) = 'cliente'::user_role AND l.client_id = ANY (get_user_client_ids(auth.uid())))
            OR get_user_role(auth.uid()) = 'tecnico'::user_role
        )
    )
);

CREATE POLICY "Users can insert extintores in their locations" 
ON public.extintores 
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM locations l 
        WHERE l.id = extintores.local_id 
        AND (
            get_user_role(auth.uid()) = 'admin'::user_role
            OR (get_user_role(auth.uid()) = 'cliente'::user_role AND l.client_id = ANY (get_user_client_ids(auth.uid())))
            OR get_user_role(auth.uid()) = 'tecnico'::user_role
        )
    )
);

CREATE POLICY "Users can delete extintores in their locations" 
ON public.extintores 
FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM locations l 
        WHERE l.id = extintores.local_id 
        AND (
            get_user_role(auth.uid()) = 'admin'::user_role
            OR (get_user_role(auth.uid()) = 'cliente'::user_role AND l.client_id = ANY (get_user_client_ids(auth.uid())))
            OR get_user_role(auth.uid()) = 'tecnico'::user_role
        )
    )
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_extintores_updated_at
    BEFORE UPDATE ON public.extintores
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();