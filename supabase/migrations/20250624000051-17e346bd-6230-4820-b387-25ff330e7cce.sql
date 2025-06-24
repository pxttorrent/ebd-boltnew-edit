
-- Criar enum para tipos de usuário
CREATE TYPE public.tipo_usuario AS ENUM ('administrador', 'missionario');

-- Adicionar coluna tipo na tabela usuarios
ALTER TABLE public.usuarios 
ADD COLUMN tipo public.tipo_usuario DEFAULT 'missionario' NOT NULL;

-- Atualizar políticas RLS para interessados considerando administradores
DROP POLICY IF EXISTS "Usuários podem ver interessados da sua igreja" ON public.interessados;
DROP POLICY IF EXISTS "Usuários podem inserir interessados da sua igreja" ON public.interessados;
DROP POLICY IF EXISTS "Usuários podem atualizar interessados da sua igreja" ON public.interessados;
DROP POLICY IF EXISTS "Usuários podem deletar interessados da sua igreja" ON public.interessados;

-- Política SELECT: Administradores veem tudo, missionários só da sua igreja
CREATE POLICY "Usuários podem ver interessados baseado no tipo" 
ON public.interessados 
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.usuarios 
  WHERE id::text = auth.uid()::text 
  AND aprovado = true 
  AND (tipo = 'administrador' OR igreja = interessados.igreja)
));

-- Política INSERT: Administradores podem inserir em qualquer igreja, missionários só na sua
CREATE POLICY "Usuários podem inserir interessados baseado no tipo" 
ON public.interessados 
FOR INSERT 
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.usuarios u
  JOIN public.usuario_permissoes p ON p.usuario_id = u.id
  WHERE u.id::text = auth.uid()::text 
  AND u.aprovado = true 
  AND p.pode_cadastrar = true
  AND (u.tipo = 'administrador' OR u.igreja = igreja)
));

-- Política UPDATE: Administradores podem editar de qualquer igreja, missionários só da sua
CREATE POLICY "Usuários podem atualizar interessados baseado no tipo" 
ON public.interessados 
FOR UPDATE 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.usuarios u
  JOIN public.usuario_permissoes p ON p.usuario_id = u.id
  WHERE u.id::text = auth.uid()::text 
  AND u.aprovado = true 
  AND p.pode_editar = true
  AND (u.tipo = 'administrador' OR u.igreja = interessados.igreja)
));

-- Política DELETE: Administradores podem deletar de qualquer igreja, missionários só da sua
CREATE POLICY "Usuários podem deletar interessados baseado no tipo" 
ON public.interessados 
FOR DELETE 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.usuarios u
  JOIN public.usuario_permissoes p ON p.usuario_id = u.id
  WHERE u.id::text = auth.uid()::text 
  AND u.aprovado = true 
  AND p.pode_excluir = true
  AND (u.tipo = 'administrador' OR u.igreja = interessados.igreja)
));
