/*
  # Corrigir dados iniciais do sistema

  1. Limpar dados existentes se necessário
  2. Inserir igrejas padrão
  3. Inserir usuário administrador padrão
  4. Verificar se os dados foram inseridos corretamente
*/

-- Primeiro, vamos garantir que as igrejas existam
INSERT INTO igrejas (nome, ativa) VALUES
  ('Matriz', true),
  ('Armour', true),
  ('Dom Pedrito', true),
  ('Quaraí', true),
  ('Santana do Livramento', true),
  ('Argeni', true),
  ('Parque São José', true)
ON CONFLICT (nome) DO UPDATE SET
  ativa = EXCLUDED.ativa,
  updated_at = now();

-- Agora vamos inserir o usuário administrador
DO $$
DECLARE
  matriz_id uuid;
  admin_exists boolean;
BEGIN
  -- Verificar se o usuário admin já existe
  SELECT EXISTS(SELECT 1 FROM usuarios WHERE apelido = 'admin') INTO admin_exists;
  
  IF NOT admin_exists THEN
    -- Pegar o ID da igreja Matriz
    SELECT id INTO matriz_id FROM igrejas WHERE nome = 'Matriz' LIMIT 1;
    
    -- Inserir o usuário administrador
    INSERT INTO usuarios (
      nome_completo,
      apelido,
      login_acesso,
      senha,
      email_pessoal,
      igreja_id,
      tipo,
      foto_perfil,
      aprovado,
      permissoes
    ) VALUES (
      'Administrador do Sistema',
      'admin',
      'admin@escola-biblica.app',
      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- senha: password
      'admin@exemplo.com',
      matriz_id,
      'administrador',
      null,
      true,
      '{"pode_cadastrar": true, "pode_editar": true, "pode_excluir": true, "pode_exportar": true}'::jsonb
    );
    
    RAISE NOTICE 'Usuário administrador criado com sucesso';
  ELSE
    RAISE NOTICE 'Usuário administrador já existe';
  END IF;
END $$;

-- Verificar se os dados foram inseridos
DO $$
DECLARE
  igreja_count integer;
  admin_count integer;
BEGIN
  SELECT COUNT(*) INTO igreja_count FROM igrejas;
  SELECT COUNT(*) INTO admin_count FROM usuarios WHERE apelido = 'admin';
  
  RAISE NOTICE 'Total de igrejas: %', igreja_count;
  RAISE NOTICE 'Usuários admin encontrados: %', admin_count;
  
  IF admin_count = 0 THEN
    RAISE EXCEPTION 'ERRO: Usuário administrador não foi criado!';
  END IF;
  
  IF igreja_count = 0 THEN
    RAISE EXCEPTION 'ERRO: Nenhuma igreja foi criada!';
  END IF;
END $$;