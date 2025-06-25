/*
  # Criar usuário administrador funcional

  1. Novo usuário administrador
    - `admin` com senha `admin123`
    - Tipo administrador com todas as permissões
    - Aprovado e ativo
    - Vinculado à igreja Armour

  2. Segurança
    - Senha hasheada com bcrypt
    - Todas as permissões habilitadas
*/

-- Inserir usuário administrador funcional
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
  'Administrador do Sistema',
  'admin',
  'admin@escola-biblica.app',
  '$2a$12$LQv3c1yqBwlVHpPjrCeyAuVFqNjKEEFXvQbgGVJ2NCWWINged.huC', -- admin123
  'admin@escola-biblica.app',
  (SELECT id FROM igrejas WHERE nome = 'Armour' LIMIT 1),
  'administrador',
  true,
  '{"pode_cadastrar": true, "pode_editar": true, "pode_excluir": true, "pode_exportar": true}'
) ON CONFLICT (apelido) DO UPDATE SET
  nome_completo = EXCLUDED.nome_completo,
  login_acesso = EXCLUDED.login_acesso,
  senha = EXCLUDED.senha,
  email_pessoal = EXCLUDED.email_pessoal,
  igreja_id = EXCLUDED.igreja_id,
  tipo = EXCLUDED.tipo,
  aprovado = EXCLUDED.aprovado,
  permissoes = EXCLUDED.permissoes;

-- Criar outro usuário administrador como backup
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
  'Super Administrador',
  'superadmin',
  'superadmin@escola-biblica.app',
  '$2a$12$LQv3c1yqBwlVHpPjrCeyAuVFqNjKEEFXvQbgGVJ2NCWWINged.huC', -- admin123
  'superadmin@escola-biblica.app',
  (SELECT id FROM igrejas WHERE nome = 'Armour' LIMIT 1),
  'administrador',
  true,
  '{"pode_cadastrar": true, "pode_editar": true, "pode_excluir": true, "pode_exportar": true}'
) ON CONFLICT (apelido) DO NOTHING;