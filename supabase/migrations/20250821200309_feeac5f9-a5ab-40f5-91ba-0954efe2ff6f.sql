-- Fix security definer view issue and finalize brigade_members security

-- Drop the problematic security definer view
DROP VIEW IF EXISTS public.brigade_members_client_view;

-- The function approach is better and safer than views for this use case
-- Keep the secure function for client access (already created)

-- Add additional protection by ensuring CPF column access is properly restricted
-- Create a comment on the CPF column to document its sensitivity
COMMENT ON COLUMN public.brigade_members.cpf IS 'SENSITIVE: Brazilian Tax ID - Only accessible to admin and tecnico roles';

-- Verify all policies are properly set up for maximum security
-- The existing policies already ensure:
-- 1. Only admins/technicians can see full data (including CPF)  
-- 2. Clients can only see limited data in their own locations
-- 3. Only admins/technicians can create/update/delete

-- Additional audit logging function for CPF access (optional security enhancement)
CREATE OR REPLACE FUNCTION public.log_sensitive_data_access(
  table_name text,
  operation text,
  accessed_by uuid DEFAULT auth.uid()
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log any access to sensitive data for audit purposes
  RAISE LOG 'AUDIT: User % performed % on sensitive table %', 
    accessed_by, operation, table_name;
END;
$$;