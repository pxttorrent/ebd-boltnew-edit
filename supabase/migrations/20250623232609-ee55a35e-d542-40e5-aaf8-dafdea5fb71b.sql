
-- Remover políticas existentes que podem estar causando conflito
DROP POLICY IF EXISTS "Allow user registration" ON public.usuarios;
DROP POLICY IF EXISTS "Allow permissions insertion" ON public.usuario_permissoes;

-- Criar política mais específica para permitir cadastro público
CREATE POLICY "Enable public user registration" 
ON public.usuarios 
FOR INSERT 
TO public
WITH CHECK (true);

-- Política para permitir inserção de permissões durante cadastro
CREATE POLICY "Enable permissions creation on signup" 
ON public.usuario_permissoes 
FOR INSERT 
TO public
WITH CHECK (true);

-- Política para usuários autenticados visualizarem todos os usuários (necessário para admin)
CREATE POLICY "Authenticated users can view all users" 
ON public.usuarios 
FOR SELECT 
TO authenticated
USING (true);

-- Política para usuários autenticados atualizarem usuários
CREATE POLICY "Authenticated users can update users" 
ON public.usuarios 
FOR UPDATE 
TO authenticated
USING (true);

-- Política para usuários autenticados excluírem usuários
CREATE POLICY "Authenticated users can delete users" 
ON public.usuarios 
FOR DELETE 
TO authenticated
USING (true);

-- Políticas similares para permissões
CREATE POLICY "Authenticated users can view all permissions" 
ON public.usuario_permissoes 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can update permissions" 
ON public.usuario_permissoes 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete permissions" 
ON public.usuario_permissoes 
FOR DELETE 
TO authenticated
USING (true);
