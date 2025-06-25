/*
  # Remover todas as políticas RLS

  1. Políticas removidas
    - Remove todas as políticas RLS das tabelas usuarios, interessados e igrejas
    - Desabilita RLS em todas as tabelas para evitar conflitos
    
  2. Motivo
    - As políticas RLS estavam causando conflitos de acesso
    - Sistema funcionará sem restrições de linha por enquanto
    
  3. Segurança
    - A segurança será gerenciada pela aplicação
    - Controle de acesso via lógica de negócio
*/

-- Remover todas as políticas da tabela usuarios
DROP POLICY IF EXISTS "Administradores podem gerenciar usuários" ON usuarios;
DROP POLICY IF EXISTS "Administradores podem ver todos os usuários" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem atualizar próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON usuarios;

-- Remover todas as políticas da tabela interessados
DROP POLICY IF EXISTS "Administradores podem gerenciar todos os interessados" ON interessados;
DROP POLICY IF EXISTS "Administradores podem ver todos os interessados" ON interessados;
DROP POLICY IF EXISTS "Missionários podem gerenciar interessados que instruem" ON interessados;
DROP POLICY IF EXISTS "Missionários podem ver interessados que instruem" ON interessados;

-- Remover todas as políticas da tabela igrejas
DROP POLICY IF EXISTS "Administradores podem gerenciar igrejas" ON igrejas;
DROP POLICY IF EXISTS "Administradores podem ver todas as igrejas" ON igrejas;
DROP POLICY IF EXISTS "Missionários podem ver sua igreja" ON igrejas;

-- Desabilitar RLS em todas as tabelas
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE interessados DISABLE ROW LEVEL SECURITY;
ALTER TABLE igrejas DISABLE ROW LEVEL SECURITY;

-- Verificar se RLS foi desabilitado
DO $$
DECLARE
    table_name TEXT;
    rls_enabled BOOLEAN;
BEGIN
    FOR table_name IN VALUES ('usuarios'), ('interessados'), ('igrejas')
    LOOP
        SELECT relrowsecurity INTO rls_enabled 
        FROM pg_class 
        WHERE relname = table_name;
        
        RAISE NOTICE 'Tabela %: RLS habilitado = %', table_name, rls_enabled;
    END LOOP;
END $$;