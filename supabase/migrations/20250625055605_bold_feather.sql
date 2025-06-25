/*
  # Adicionar campo cadastrado_por_id na tabela interessados

  1. Alterações
    - Adicionar coluna `cadastrado_por_id` na tabela `interessados`
    - Criar foreign key para a tabela `usuarios`
    - Inserir dados de exemplo para demonstrar a funcionalidade

  2. Dados de Exemplo
    - Criar usuários de exemplo (admin e missionário)
    - Criar interessados de exemplo vinculados a diferentes usuários
*/

-- Adicionar coluna cadastrado_por_id na tabela interessados
ALTER TABLE interessados 
ADD COLUMN IF NOT EXISTS cadastrado_por_id uuid REFERENCES usuarios(id);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_interessados_cadastrado_por_id 
ON interessados(cadastrado_por_id);

-- Inserir usuários de exemplo se não existirem
DO $$
DECLARE
    admin_id uuid;
    missionario_id uuid;
    igreja_armour_id uuid;
    igreja_dom_pedrito_id uuid;
BEGIN
    -- Buscar ID da igreja Armour
    SELECT id INTO igreja_armour_id FROM igrejas WHERE nome = 'Armour' LIMIT 1;
    
    -- Buscar ID da igreja Dom Pedrito
    SELECT id INTO igreja_dom_pedrito_id FROM igrejas WHERE nome = 'Dom Pedrito' LIMIT 1;
    
    -- Se as igrejas não existirem, criar
    IF igreja_armour_id IS NULL THEN
        INSERT INTO igrejas (nome, ativa) VALUES ('Armour', true) RETURNING id INTO igreja_armour_id;
    END IF;
    
    IF igreja_dom_pedrito_id IS NULL THEN
        INSERT INTO igrejas (nome, ativa) VALUES ('Dom Pedrito', true) RETURNING id INTO igreja_dom_pedrito_id;
    END IF;
    
    -- Verificar se já existe um administrador
    SELECT id INTO admin_id FROM usuarios WHERE tipo = 'administrador' AND apelido = 'admin' LIMIT 1;
    
    -- Se não existir, criar administrador
    IF admin_id IS NULL THEN
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
            'Administrador Sistema',
            'admin',
            'admin@escola-biblica.app',
            '$2a$12$LQv3c1yqBwEHxPiNW4EyUOyB.VGbfeqxPaocMvF2kqjHkRg.vfm/u', -- senha: password
            'admin@exemplo.com',
            igreja_armour_id,
            'administrador',
            true,
            '{"pode_cadastrar": true, "pode_editar": true, "pode_excluir": true, "pode_exportar": true}'::jsonb
        ) RETURNING id INTO admin_id;
        
        RAISE NOTICE 'Administrador criado com ID: %', admin_id;
    END IF;
    
    -- Verificar se já existe um missionário de exemplo
    SELECT id INTO missionario_id FROM usuarios WHERE tipo = 'missionario' AND apelido = 'joao.silva' LIMIT 1;
    
    -- Se não existir, criar missionário
    IF missionario_id IS NULL THEN
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
            'João Silva',
            'joao.silva',
            'joao.silva@escola-biblica.app',
            '$2a$12$LQv3c1yqBwEHxPiNW4EyUOyB.VGbfeqxPaocMvF2kqjHkRg.vfm/u', -- senha: password
            'joao.silva@exemplo.com',
            igreja_dom_pedrito_id,
            'missionario',
            true,
            '{"pode_cadastrar": true, "pode_editar": true, "pode_excluir": false, "pode_exportar": true}'::jsonb
        ) RETURNING id INTO missionario_id;
        
        RAISE NOTICE 'Missionário criado com ID: %', missionario_id;
    END IF;
    
    -- Inserir interessados de exemplo se não existirem
    
    -- Interessado cadastrado pelo administrador
    IF NOT EXISTS (SELECT 1 FROM interessados WHERE nome_completo = 'Maria Santos') THEN
        INSERT INTO interessados (
            nome_completo,
            telefone,
            endereco,
            igreja_id,
            status,
            instrutor_biblico_id,
            data_contato,
            observacoes,
            frequenta_cultos,
            estudo_biblico,
            cadastrado_por_id
        ) VALUES (
            'Maria Santos',
            '(55)99999-1111',
            'Rua das Flores, 123',
            igreja_armour_id,
            'D',
            admin_id,
            CURRENT_DATE - INTERVAL '30 days',
            'Interessada muito dedicada aos estudos',
            'frequentemente',
            'Estudo sobre Daniel e Apocalipse',
            admin_id
        );
        
        RAISE NOTICE 'Interessado Maria Santos criado (cadastrado pelo admin)';
    END IF;
    
    -- Interessado cadastrado pelo missionário João Silva
    IF NOT EXISTS (SELECT 1 FROM interessados WHERE nome_completo = 'Carlos Oliveira') THEN
        INSERT INTO interessados (
            nome_completo,
            telefone,
            endereco,
            igreja_id,
            status,
            instrutor_biblico_id,
            data_contato,
            observacoes,
            frequenta_cultos,
            estudo_biblico,
            cadastrado_por_id
        ) VALUES (
            'Carlos Oliveira',
            '(55)99999-2222',
            'Avenida Central, 456',
            igreja_dom_pedrito_id,
            'C',
            missionario_id,
            CURRENT_DATE - INTERVAL '15 days',
            'Tem muitas dúvidas mas está progredindo',
            'algumas_vezes',
            'Estudo sobre a Criação',
            missionario_id
        );
        
        RAISE NOTICE 'Interessado Carlos Oliveira criado (cadastrado pelo missionário)';
    END IF;
    
    -- Outro interessado cadastrado pelo administrador
    IF NOT EXISTS (SELECT 1 FROM interessados WHERE nome_completo = 'Ana Costa') THEN
        INSERT INTO interessados (
            nome_completo,
            telefone,
            endereco,
            igreja_id,
            status,
            instrutor_biblico_id,
            data_contato,
            observacoes,
            frequenta_cultos,
            estudo_biblico,
            cadastrado_por_id
        ) VALUES (
            'Ana Costa',
            '(55)99999-3333',
            'Rua da Paz, 789',
            igreja_armour_id,
            'B',
            admin_id,
            CURRENT_DATE - INTERVAL '45 days',
            'Já decidida, aguardando batismo',
            'frequentemente',
            'Preparação para o batismo',
            admin_id
        );
        
        RAISE NOTICE 'Interessado Ana Costa criado (cadastrado pelo admin)';
    END IF;
    
    RAISE NOTICE 'Dados de exemplo inseridos com sucesso!';
    RAISE NOTICE 'Login do Admin: admin / password';
    RAISE NOTICE 'Login do Missionário: joao.silva / password';
    
END $$;