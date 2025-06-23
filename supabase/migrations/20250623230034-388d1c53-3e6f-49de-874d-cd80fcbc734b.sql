
-- Remover a política atual que só permite inserção anônima
DROP POLICY IF EXISTS "Allow public user registration" ON public.usuarios;

-- Criar nova política que permite inserção anônima (cadastro público) 
-- E inserção por usuários autenticados (administradores)
CREATE POLICY "Allow user registration" 
ON public.usuarios 
FOR INSERT 
WITH CHECK (true);

-- Remover a política atual de permissões que só permite inserção anônima
DROP POLICY IF EXISTS "Allow default permissions on signup" ON public.usuario_permissoes;

-- Criar nova política que permite inserção de permissões tanto para anônimos quanto autenticados
CREATE POLICY "Allow permissions insertion" 
ON public.usuario_permissoes 
FOR INSERT 
WITH CHECK (true);
