
-- Habilitar RLS na tabela usuarios
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção de novos usuários (cadastro público)
-- Qualquer pessoa pode inserir um novo usuário (cadastro público)
CREATE POLICY "Allow public user registration" 
ON public.usuarios 
FOR INSERT 
TO anon
WITH CHECK (true);

-- Política para usuários autenticados visualizarem seus próprios dados
CREATE POLICY "Users can view own data" 
ON public.usuarios 
FOR SELECT 
TO authenticated
USING (id = auth.uid());

-- Política para usuários autenticados atualizarem seus próprios dados
CREATE POLICY "Users can update own data" 
ON public.usuarios 
FOR UPDATE 
TO authenticated
USING (id = auth.uid());

-- Habilitar RLS na tabela usuario_permissoes
ALTER TABLE public.usuario_permissoes ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção de permissões padrão durante cadastro
CREATE POLICY "Allow default permissions on signup" 
ON public.usuario_permissoes 
FOR INSERT 
TO anon
WITH CHECK (true);

-- Política para usuários autenticados visualizarem suas próprias permissões
CREATE POLICY "Users can view own permissions" 
ON public.usuario_permissoes 
FOR SELECT 
TO authenticated
USING (usuario_id = auth.uid());
