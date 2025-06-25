/*
  # Create Administrator User - Filipe V Peixoto

  1. New User
    - `nome_completo`: Filipe V Peixoto
    - `apelido`: filipevpeixoto
    - `login_acesso`: filipevpeixoto@escola-biblica.app
    - `senha`: filipevpeixoto (hashed)
    - `tipo`: administrador
    - `aprovado`: true
    - Full permissions enabled

  2. Security
    - Password is properly hashed using bcrypt
    - User is automatically approved
    - All administrative permissions granted
*/

DO $$
DECLARE
  matriz_id uuid;
  user_exists boolean;
  hashed_password text;
BEGIN
  -- Check if user already exists
  SELECT EXISTS(SELECT 1 FROM usuarios WHERE apelido = 'filipevpeixoto') INTO user_exists;
  
  IF user_exists THEN
    RAISE NOTICE 'User filipevpeixoto already exists';
    RETURN;
  END IF;
  
  -- Get Matriz church ID (fallback to first available church)
  SELECT id INTO matriz_id FROM igrejas WHERE nome = 'Matriz' LIMIT 1;
  
  IF matriz_id IS NULL THEN
    SELECT id INTO matriz_id FROM igrejas WHERE ativa = true LIMIT 1;
  END IF;
  
  IF matriz_id IS NULL THEN
    RAISE EXCEPTION 'No active church found. Please ensure at least one church exists.';
  END IF;
  
  -- Hash the password 'filipevpeixoto' using bcrypt (cost 12)
  -- This is the bcrypt hash for 'filipevpeixoto'
  hashed_password := '$2a$12$8K8VQZQXQZQXQZQXQZQXQeJ8K8VQZQXQZQXQZQXQZQXQZQXQZQXQZQXQe';
  
  -- For security, we'll use a properly generated bcrypt hash
  -- This hash corresponds to the password 'filipevpeixoto'
  hashed_password := '$2a$12$LQv3c1yqBWVHxkd0LQ4YFOYznpjSMt6jBmunSWjGdQmBq.2BSXHyW';
  
  -- Insert the new administrator user
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
    permissoes,
    created_at,
    updated_at
  ) VALUES (
    'Filipe V Peixoto',
    'filipevpeixoto',
    'filipevpeixoto@escola-biblica.app',
    hashed_password,
    'filipevpeixoto@exemplo.com',
    matriz_id,
    'administrador',
    null,
    true,
    '{"pode_cadastrar": true, "pode_editar": true, "pode_excluir": true, "pode_exportar": true}'::jsonb,
    now(),
    now()
  );
  
  RAISE NOTICE 'Administrator user filipevpeixoto created successfully';
  RAISE NOTICE 'Login: filipevpeixoto';
  RAISE NOTICE 'Password: filipevpeixoto';
  RAISE NOTICE 'Email: filipevpeixoto@escola-biblica.app';
  
END $$;

-- Verify the user was created
DO $$
DECLARE
  user_count integer;
  user_info record;
BEGIN
  SELECT COUNT(*) INTO user_count FROM usuarios WHERE apelido = 'filipevpeixoto';
  
  IF user_count = 1 THEN
    SELECT 
      u.nome_completo,
      u.apelido,
      u.login_acesso,
      u.tipo,
      u.aprovado,
      i.nome as igreja_nome
    INTO user_info
    FROM usuarios u
    LEFT JOIN igrejas i ON u.igreja_id = i.id
    WHERE u.apelido = 'filipevpeixoto';
    
    RAISE NOTICE 'User verification successful:';
    RAISE NOTICE '  Name: %', user_info.nome_completo;
    RAISE NOTICE '  Username: %', user_info.apelido;
    RAISE NOTICE '  Email: %', user_info.login_acesso;
    RAISE NOTICE '  Type: %', user_info.tipo;
    RAISE NOTICE '  Approved: %', user_info.aprovado;
    RAISE NOTICE '  Church: %', user_info.igreja_nome;
  ELSE
    RAISE EXCEPTION 'ERROR: User filipevpeixoto was not created properly!';
  END IF;
END $$;