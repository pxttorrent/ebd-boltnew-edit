
-- Remover todas as políticas existentes da tabela usuarios
DROP POLICY IF EXISTS "Enable public user registration" ON public.usuarios;
DROP POLICY IF EXISTS "Authenticated users can view all users" ON public.usuarios;
DROP POLICY IF EXISTS "Authenticated users can update users" ON public.usuarios;
DROP POLICY IF EXISTS "Authenticated users can delete users" ON public.usuarios;
DROP POLICY IF EXISTS "Users can view own data" ON public.usuarios;
DROP POLICY IF EXISTS "Users can update own data" ON public.usuarios;
DROP POLICY IF EXISTS "Allow public user registration" ON public.usuarios;

-- Remover todas as políticas existentes da tabela usuario_permissoes
DROP POLICY IF EXISTS "Enable permissions creation on signup" ON public.usuario_permissoes;
DROP POLICY IF EXISTS "Authenticated users can view all permissions" ON public.usuario_permissoes;
DROP POLICY IF EXISTS "Authenticated users can update permissions" ON public.usuario_permissoes;
DROP POLICY IF EXISTS "Authenticated users can delete permissions" ON public.usuario_permissoes;
DROP POLICY IF EXISTS "Users can view own permissions" ON public.usuario_permissoes;
DROP POLICY IF EXISTS "Allow default permissions on signup" ON public.usuario_permissoes;

-- Recriar políticas para usuarios
CREATE POLICY "Enable public user registration" 
ON public.usuarios 
FOR INSERT 
TO public
WITH CHECK (true);

CREATE POLICY "Authenticated users can view all users" 
ON public.usuarios 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can update users" 
ON public.usuarios 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete users" 
ON public.usuarios 
FOR DELETE 
TO authenticated
USING (true);

-- Recriar políticas para usuario_permissoes
CREATE POLICY "Enable permissions creation on signup" 
ON public.usuario_permissoes 
FOR INSERT 
TO public
WITH CHECK (true);

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
