
-- Adicionar coluna igreja na tabela interessados
ALTER TABLE public.interessados 
ADD COLUMN igreja TEXT;

-- Definir constraint para os valores válidos de igreja
ALTER TABLE public.interessados 
ADD CONSTRAINT interessados_igreja_check 
CHECK (igreja IN ('Armour', 'Dom Pedrito', 'Quaraí', 'Santana do Livramento', 'Argeni', 'Parque São José'));

-- Atualizar interessados existentes para ter uma igreja padrão (pode ser ajustado conforme necessário)
UPDATE public.interessados 
SET igreja = cidade 
WHERE igreja IS NULL;

-- Tornar a coluna obrigatória
ALTER TABLE public.interessados 
ALTER COLUMN igreja SET NOT NULL;

-- Remover as políticas existentes de interessados
DROP POLICY IF EXISTS "Usuários aprovados podem ver interessados" ON public.interessados;
DROP POLICY IF EXISTS "Usuários com permissão podem inserir interessados" ON public.interessados;
DROP POLICY IF EXISTS "Usuários com permissão podem atualizar interessados" ON public.interessados;
DROP POLICY IF EXISTS "Usuários com permissão podem deletar interessados" ON public.interessados;

-- Criar novas políticas que consideram a igreja do usuário
CREATE POLICY "Usuários podem ver interessados da sua igreja" 
ON public.interessados 
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.usuarios 
  WHERE id::text = auth.uid()::text 
  AND aprovado = true 
  AND igreja = interessados.igreja
));

CREATE POLICY "Usuários podem inserir interessados da sua igreja" 
ON public.interessados 
FOR INSERT 
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.usuarios u
  JOIN public.usuario_permissoes p ON p.usuario_id = u.id
  WHERE u.id::text = auth.uid()::text 
  AND u.aprovado = true 
  AND p.pode_cadastrar = true
  AND u.igreja = igreja
));

CREATE POLICY "Usuários podem atualizar interessados da sua igreja" 
ON public.interessados 
FOR UPDATE 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.usuarios u
  JOIN public.usuario_permissoes p ON p.usuario_id = u.id
  WHERE u.id::text = auth.uid()::text 
  AND u.aprovado = true 
  AND p.pode_editar = true
  AND u.igreja = interessados.igreja
));

CREATE POLICY "Usuários podem deletar interessados da sua igreja" 
ON public.interessados 
FOR DELETE 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.usuarios u
  JOIN public.usuario_permissoes p ON p.usuario_id = u.id
  WHERE u.id::text = auth.uid()::text 
  AND u.aprovado = true 
  AND p.pode_excluir = true
  AND u.igreja = interessados.igreja
));
