/*
  # Add Initial Data for Escola Bíblica System

  1. Initial Churches
    - Add all the churches that the system expects
    - Includes Matriz, Armour, Dom Pedrito, etc.
  
  2. Admin User
    - Create default admin user with username 'admin' and password 'password'
    - Set all permissions to true
    - Link to Matriz church
  
  3. Security
    - Ensure RLS is properly configured
    - Admin user is pre-approved
*/

-- Insert initial churches
INSERT INTO igrejas (id, nome, ativa, created_at, updated_at) VALUES
  (gen_random_uuid(), 'Matriz', true, now(), now()),
  (gen_random_uuid(), 'Armour', true, now(), now()),
  (gen_random_uuid(), 'Dom Pedrito', true, now(), now()),
  (gen_random_uuid(), 'Hulha Negra', true, now(), now()),
  (gen_random_uuid(), 'Lavras do Sul', true, now(), now()),
  (gen_random_uuid(), 'Rosário do Sul', true, now(), now()),
  (gen_random_uuid(), 'Santa Margarida do Sul', true, now(), now()),
  (gen_random_uuid(), 'Santana do Livramento', true, now(), now()),
  (gen_random_uuid(), 'São Gabriel', true, now(), now())
ON CONFLICT (nome) DO NOTHING;

-- Insert admin user
DO $$
DECLARE
  matriz_id uuid;
BEGIN
  -- Get the Matriz church ID
  SELECT id INTO matriz_id FROM igrejas WHERE nome = 'Matriz' LIMIT 1;
  
  -- Insert admin user if it doesn't exist
  INSERT INTO usuarios (
    id,
    nome_completo,
    apelido,
    login_acesso,
    senha,
    email_pessoal,
    igreja_id,
    tipo,
    foto_perfil,
    aprovado,
    permissoes,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    'Administrador do Sistema',
    'admin',
    'admin@escola-biblica.app',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- hashed 'password'
    'admin@exemplo.com',
    matriz_id,
    'administrador',
    null,
    true,
    '{"pode_cadastrar": true, "pode_editar": true, "pode_excluir": true, "pode_exportar": true}'::jsonb,
    now(),
    now()
  ) ON CONFLICT (apelido) DO NOTHING;
END $$;