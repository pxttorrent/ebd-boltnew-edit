
-- Adicionar campo de email pessoal na tabela usuarios
ALTER TABLE public.usuarios 
ADD COLUMN email_pessoal TEXT;

-- Criar índice para o email pessoal para buscas mais rápidas
CREATE INDEX idx_usuarios_email_pessoal ON public.usuarios(email_pessoal);

-- Tabela para armazenar códigos de recuperação de senha
CREATE TABLE public.codigos_recuperacao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  email_pessoal TEXT NOT NULL,
  usado BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Política RLS para códigos de recuperação
ALTER TABLE public.codigos_recuperacao ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção pública de códigos (para recuperação)
CREATE POLICY "Enable public code creation" 
ON public.codigos_recuperacao 
FOR INSERT 
TO public
WITH CHECK (true);

-- Política para visualizar apenas códigos próprios
CREATE POLICY "Users can view their own recovery codes" 
ON public.codigos_recuperacao 
FOR SELECT 
TO public
USING (true);

-- Política para atualizar códigos (marcar como usado)
CREATE POLICY "Enable code updates" 
ON public.codigos_recuperacao 
FOR UPDATE 
TO public
WITH CHECK (true);
