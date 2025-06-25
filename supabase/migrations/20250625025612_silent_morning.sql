/*
  # Criação do Schema Inicial da Escola Bíblica Distrital

  1. Novas Tabelas
    - `igrejas`
      - `id` (uuid, primary key)
      - `nome` (text, unique)
      - `ativa` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `usuarios`
      - `id` (uuid, primary key)
      - `nome_completo` (text)
      - `apelido` (text, unique)
      - `login_acesso` (text, unique)
      - `senha` (text)
      - `email_pessoal` (text)
      - `igreja_id` (uuid, foreign key)
      - `tipo` (enum: administrador, missionario)
      - `foto_perfil` (text)
      - `aprovado` (boolean)
      - `permissoes` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `interessados`
      - `id` (uuid, primary key)
      - `nome_completo` (text)
      - `telefone` (text)
      - `endereco` (text)
      - `igreja_id` (uuid, foreign key)
      - `status` (enum: A, B, C, D, E)
      - `instrutor_biblico_id` (uuid, foreign key)
      - `data_contato` (date)
      - `observacoes` (text)
      - `frequenta_cultos` (text)
      - `estudo_biblico` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Segurança
    - Habilitar RLS em todas as tabelas
    - Políticas baseadas no tipo de usuário
    - Administradores podem ver tudo
    - Missionários só veem dados da sua igreja
*/

-- Criar enum para tipo de usuário
CREATE TYPE user_type AS ENUM ('administrador', 'missionario');

-- Criar enum para status do interessado
CREATE TYPE interessado_status AS ENUM ('A', 'B', 'C', 'D', 'E');

-- Tabela de igrejas
CREATE TABLE IF NOT EXISTS igrejas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text UNIQUE NOT NULL,
  ativa boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo text NOT NULL,
  apelido text UNIQUE NOT NULL,
  login_acesso text UNIQUE NOT NULL,
  senha text NOT NULL,
  email_pessoal text,
  igreja_id uuid REFERENCES igrejas(id),
  tipo user_type DEFAULT 'missionario',
  foto_perfil text,
  aprovado boolean DEFAULT false,
  permissoes jsonb DEFAULT '{"pode_cadastrar": false, "pode_editar": false, "pode_excluir": false, "pode_exportar": false}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de interessados
CREATE TABLE IF NOT EXISTS interessados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo text NOT NULL,
  telefone text DEFAULT '',
  endereco text DEFAULT '',
  igreja_id uuid REFERENCES igrejas(id),
  status interessado_status DEFAULT 'E',
  instrutor_biblico_id uuid REFERENCES usuarios(id),
  data_contato date DEFAULT CURRENT_DATE,
  observacoes text DEFAULT '',
  frequenta_cultos text,
  estudo_biblico text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE igrejas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE interessados ENABLE ROW LEVEL SECURITY;

-- Políticas para igrejas
CREATE POLICY "Administradores podem ver todas as igrejas"
  ON igrejas FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.tipo = 'administrador'
      AND usuarios.aprovado = true
    )
  );

CREATE POLICY "Missionários podem ver sua igreja"
  ON igrejas FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.igreja_id = igrejas.id
      AND usuarios.aprovado = true
    )
  );

CREATE POLICY "Administradores podem gerenciar igrejas"
  ON igrejas FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.tipo = 'administrador'
      AND usuarios.aprovado = true
    )
  );

-- Políticas para usuários
CREATE POLICY "Administradores podem ver todos os usuários"
  ON usuarios FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u2
      WHERE u2.id = auth.uid() 
      AND u2.tipo = 'administrador'
      AND u2.aprovado = true
    )
  );

CREATE POLICY "Usuários podem ver próprio perfil"
  ON usuarios FOR SELECT
  TO authenticated
  USING (usuarios.id = auth.uid());

CREATE POLICY "Administradores podem gerenciar usuários"
  ON usuarios FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u2
      WHERE u2.id = auth.uid() 
      AND u2.tipo = 'administrador'
      AND u2.aprovado = true
    )
  );

CREATE POLICY "Usuários podem atualizar próprio perfil"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (usuarios.id = auth.uid());

-- Políticas para interessados
CREATE POLICY "Administradores podem ver todos os interessados"
  ON interessados FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.tipo = 'administrador'
      AND usuarios.aprovado = true
    )
  );

CREATE POLICY "Missionários podem ver interessados que instruem"
  ON interessados FOR SELECT
  TO authenticated
  USING (
    interessados.instrutor_biblico_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.aprovado = true
    )
  );

CREATE POLICY "Administradores podem gerenciar todos os interessados"
  ON interessados FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.tipo = 'administrador'
      AND usuarios.aprovado = true
    )
  );

CREATE POLICY "Missionários podem gerenciar interessados que instruem"
  ON interessados FOR ALL
  TO authenticated
  USING (
    interessados.instrutor_biblico_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.aprovado = true
      AND usuarios.permissoes->>'pode_cadastrar' = 'true'
    )
  );

-- Inserir dados iniciais
INSERT INTO igrejas (nome, ativa) VALUES
  ('Armour', true),
  ('Dom Pedrito', true),
  ('Quaraí', true),
  ('Santana do Livramento', true),
  ('Argeni', true),
  ('Parque São José', true)
ON CONFLICT (nome) DO NOTHING;

-- Inserir usuário administrador padrão
INSERT INTO usuarios (
  nome_completo, 
  apelido, 
  login_acesso, 
  senha, 
  email_pessoal, 
  igreja_id, 
  tipo, 
  aprovado, 
  permissoes
) VALUES (
  'Administrador',
  'admin',
  'admin@escola-biblica.app',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
  'admin@exemplo.com',
  (SELECT id FROM igrejas WHERE nome = 'Armour' LIMIT 1),
  'administrador',
  true,
  '{"pode_cadastrar": true, "pode_editar": true, "pode_excluir": true, "pode_exportar": true}'
) ON CONFLICT (apelido) DO NOTHING;

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_igrejas_updated_at BEFORE UPDATE ON igrejas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_interessados_updated_at BEFORE UPDATE ON interessados FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();