
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own recovery codes" ON public.codigos_recuperacao;
DROP POLICY IF EXISTS "Anyone can insert recovery codes" ON public.codigos_recuperacao;
DROP POLICY IF EXISTS "Users can update their own recovery codes" ON public.codigos_recuperacao;

-- Drop any existing policies on other tables that might conflict
DROP POLICY IF EXISTS "Users can view their own data and admins can view all" ON public.usuarios;
DROP POLICY IF EXISTS "Admins can insert users" ON public.usuarios;
DROP POLICY IF EXISTS "Users can update their own data and admins can update all" ON public.usuarios;
DROP POLICY IF EXISTS "Admins can delete users" ON public.usuarios;

DROP POLICY IF EXISTS "Users can view their own permissions and admins can view all" ON public.usuario_permissoes;
DROP POLICY IF EXISTS "Admins can insert permissions" ON public.usuario_permissoes;
DROP POLICY IF EXISTS "Admins can update permissions" ON public.usuario_permissoes;
DROP POLICY IF EXISTS "Admins can delete permissions" ON public.usuario_permissoes;

DROP POLICY IF EXISTS "Users can view interessados from their church or admins can view all" ON public.interessados;
DROP POLICY IF EXISTS "Users can insert interessados for their church" ON public.interessados;
DROP POLICY IF EXISTS "Users can update interessados from their church" ON public.interessados;
DROP POLICY IF EXISTS "Users can delete interessados from their church" ON public.interessados;

-- Enable RLS on all tables
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario_permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interessados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.codigos_recuperacao ENABLE ROW LEVEL SECURITY;

-- Create policies for usuarios table
CREATE POLICY "Users can view their own data and admins can view all" ON public.usuarios
FOR SELECT USING (
  id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.usuarios u 
    WHERE u.id = auth.uid() AND u.tipo = 'administrador' AND u.aprovado = true
  )
);

CREATE POLICY "Admins can insert users" ON public.usuarios
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.usuarios u 
    WHERE u.id = auth.uid() AND u.tipo = 'administrador' AND u.aprovado = true
  )
);

CREATE POLICY "Users can update their own data and admins can update all" ON public.usuarios
FOR UPDATE USING (
  id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.usuarios u 
    WHERE u.id = auth.uid() AND u.tipo = 'administrador' AND u.aprovado = true
  )
);

CREATE POLICY "Admins can delete users" ON public.usuarios
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.usuarios u 
    WHERE u.id = auth.uid() AND u.tipo = 'administrador' AND u.aprovado = true
  )
);

-- Create policies for usuario_permissoes table
CREATE POLICY "Users can view their own permissions and admins can view all" ON public.usuario_permissoes
FOR SELECT USING (
  usuario_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.usuarios u 
    WHERE u.id = auth.uid() AND u.tipo = 'administrador' AND u.aprovado = true
  )
);

CREATE POLICY "Admins can insert permissions" ON public.usuario_permissoes
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.usuarios u 
    WHERE u.id = auth.uid() AND u.tipo = 'administrador' AND u.aprovado = true
  )
);

CREATE POLICY "Admins can update permissions" ON public.usuario_permissoes
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.usuarios u 
    WHERE u.id = auth.uid() AND u.tipo = 'administrador' AND u.aprovado = true
  )
);

CREATE POLICY "Admins can delete permissions" ON public.usuario_permissoes
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.usuarios u 
    WHERE u.id = auth.uid() AND u.tipo = 'administrador' AND u.aprovado = true
  )
);

-- Create policies for interessados table
CREATE POLICY "Users can view interessados from their church or admins can view all" ON public.interessados
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.usuarios u 
    WHERE u.id = auth.uid() AND u.aprovado = true AND 
    (u.tipo = 'administrador' OR u.igreja = interessados.igreja)
  )
);

CREATE POLICY "Users can insert interessados for their church" ON public.interessados
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.usuarios u, public.usuario_permissoes p
    WHERE u.id = auth.uid() AND u.aprovado = true AND 
    p.usuario_id = u.id AND p.pode_cadastrar = true AND
    (u.tipo = 'administrador' OR u.igreja = interessados.igreja)
  )
);

CREATE POLICY "Users can update interessados from their church" ON public.interessados
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.usuarios u, public.usuario_permissoes p
    WHERE u.id = auth.uid() AND u.aprovado = true AND 
    p.usuario_id = u.id AND p.pode_editar = true AND
    (u.tipo = 'administrador' OR u.igreja = interessados.igreja)
  )
);

CREATE POLICY "Users can delete interessados from their church" ON public.interessados
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.usuarios u, public.usuario_permissoes p
    WHERE u.id = auth.uid() AND u.aprovado = true AND 
    p.usuario_id = u.id AND p.pode_excluir = true AND
    (u.tipo = 'administrador' OR u.igreja = interessados.igreja)
  )
);

-- Create policies for codigos_recuperacao table
CREATE POLICY "Users can view their own recovery codes" ON public.codigos_recuperacao
FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Anyone can insert recovery codes" ON public.codigos_recuperacao
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own recovery codes" ON public.codigos_recuperacao
FOR UPDATE USING (usuario_id = auth.uid());

-- Give all permissions to admin user
UPDATE public.usuario_permissoes 
SET 
  pode_cadastrar = true,
  pode_editar = true,
  pode_excluir = true,
  pode_exportar = true,
  updated_at = now()
WHERE usuario_id IN (
  SELECT id FROM public.usuarios 
  WHERE apelido = 'admin' 
  AND tipo = 'administrador'
);
