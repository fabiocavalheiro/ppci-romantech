-- Agora posso remover a função antiga e renomear a temporária
DROP FUNCTION public.get_user_role(uuid);

-- Renomear a função temporária para o nome original
ALTER FUNCTION public.get_user_role_temp(uuid) RENAME TO get_user_role;