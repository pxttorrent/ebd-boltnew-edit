
-- Criar tabela de usuários/missionários
CREATE TABLE public.usuarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_completo TEXT NOT NULL,
  apelido TEXT NOT NULL UNIQUE,
  login_acesso TEXT NOT NULL UNIQUE,
  senha TEXT NOT NULL,
  igreja TEXT NOT NULL CHECK (igreja IN ('Armour', 'Dom Pedrito', 'Quaraí', 'Santana do Livramento', 'Argeni', 'Parque São José')),
  aprovado BOOLEAN NOT NULL DEFAULT false,
  foto_perfil TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de permissões dos usuários
CREATE TABLE public.usuario_permissoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  pode_cadastrar BOOLEAN NOT NULL DEFAULT false,
  pode_editar BOOLEAN NOT NULL DEFAULT false,
  pode_excluir BOOLEAN NOT NULL DEFAULT false,
  pode_exportar BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(usuario_id)
);

-- Criar tabela de interessados
CREATE TABLE public.interessados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_completo TEXT NOT NULL,
  telefone TEXT NOT NULL,
  endereco TEXT,
  cidade TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('A', 'B', 'C', 'D', 'E')),
  instrutor_biblico TEXT NOT NULL,
  data_contato DATE NOT NULL,
  observacoes TEXT,
  frequenta_cultos TEXT,
  estudo_biblico TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario_permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interessados ENABLE ROW LEVEL SECURITY;

-- Políticas para tabela usuarios
CREATE POLICY "Usuários podem ver todos os usuários aprovados" 
  ON public.usuarios 
  FOR SELECT 
  USING (aprovado = true);

CREATE POLICY "Usuários podem ver suas próprias informações" 
  ON public.usuarios 
  FOR SELECT 
  USING (auth.uid()::text = id::text);

CREATE POLICY "Usuários podem atualizar suas próprias informações" 
  ON public.usuarios 
  FOR UPDATE 
  USING (auth.uid()::text = id::text);

CREATE POLICY "Permitir inserção de novos usuários (cadastro público)" 
  ON public.usuarios 
  FOR INSERT 
  WITH CHECK (true);

-- Políticas para tabela usuario_permissoes
CREATE POLICY "Usuários podem ver permissões de todos" 
  ON public.usuario_permissoes 
  FOR SELECT 
  USING (true);

CREATE POLICY "Permitir inserção de permissões" 
  ON public.usuario_permissoes 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Permitir atualização de permissões" 
  ON public.usuario_permissoes 
  FOR UPDATE 
  USING (true);

-- Políticas para tabela interessados
CREATE POLICY "Usuários aprovados podem ver interessados" 
  ON public.interessados 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id::text = auth.uid()::text AND aprovado = true
  ));

CREATE POLICY "Usuários com permissão podem inserir interessados" 
  ON public.interessados 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.usuarios u
    JOIN public.usuario_permissoes p ON p.usuario_id = u.id
    WHERE u.id::text = auth.uid()::text AND u.aprovado = true AND p.pode_cadastrar = true
  ));

CREATE POLICY "Usuários com permissão podem atualizar interessados" 
  ON public.interessados 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.usuarios u
    JOIN public.usuario_permissoes p ON p.usuario_id = u.id
    WHERE u.id::text = auth.uid()::text AND u.aprovado = true AND p.pode_editar = true
  ));

CREATE POLICY "Usuários com permissão podem deletar interessados" 
  ON public.interessados 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.usuarios u
    JOIN public.usuario_permissoes p ON p.usuario_id = u.id
    WHERE u.id::text = auth.uid()::text AND u.aprovado = true AND p.pode_excluir = true
  ));

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON public.usuarios 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuario_permissoes_updated_at BEFORE UPDATE ON public.usuario_permissoes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interessados_updated_at BEFORE UPDATE ON public.interessados 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir usuário administrador inicial
INSERT INTO public.usuarios (id, nome_completo, apelido, login_acesso, senha, igreja, aprovado)
VALUES (
  gen_random_uuid(),
  'Administrador do Sistema',
  'admin',
  'admin',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- hash de "password"
  'Armour',
  true
);

-- Inserir permissões do administrador
INSERT INTO public.usuario_permissoes (usuario_id, pode_cadastrar, pode_editar, pode_excluir, pode_exportar)
SELECT id, true, true, true, true 
FROM public.usuarios 
WHERE apelido = 'admin';

-- Inserir alguns dados de exemplo
INSERT INTO public.usuarios (nome_completo, apelido, login_acesso, senha, igreja, aprovado) VALUES
('João Silva', 'joao.silva', 'joao.silva@escola-biblica.app', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Armour', true),
('Maria Costa', 'maria.costa', 'maria.costa@escola-biblica.app', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dom Pedrito', true);

-- Inserir permissões para os usuários de exemplo
INSERT INTO public.usuario_permissoes (usuario_id, pode_cadastrar, pode_editar, pode_excluir, pode_exportar)
SELECT id, true, true, false, true 
FROM public.usuarios 
WHERE apelido IN ('joao.silva', 'maria.costa');

-- Inserir alguns interessados de exemplo
INSERT INTO public.interessados (nome_completo, telefone, endereco, cidade, status, instrutor_biblico, data_contato, observacoes, frequenta_cultos, estudo_biblico) VALUES
('Ana Santos', '(53) 99999-9999', 'Rua das Flores, 123', 'Santana do Livramento', 'D', 'João Silva', '2024-06-01', 'Muito interessada nos estudos bíblicos', 'frequentemente', 'Estudo sobre a Criação'),
('Pedro Oliveira', '(53) 88888-8888', 'Av. Principal, 456', 'Dom Pedrito', 'B', 'Maria Costa', '2024-05-15', 'Decidido pelo batismo, aguardando resolver questões familiares', 'raramente', 'Estudo sobre o Batismo');
